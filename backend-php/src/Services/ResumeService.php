<?php
namespace App\Services;

use PDO;
use PDOException;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class ResumeService
{
  public function __construct(private PDO $db)
  {
    $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  }

  /* ----------------------------------------------------------------------
   * Helpers
   * -------------------------------------------------------------------- */

  /** Liefert ['userid'=>..., 'loginid'=>...] für gegebene userid ODER loginid */
  private function resolveUserIds(int $id): ?array
  {
    $st = $this->db->prepare(
      'SELECT userid, loginid FROM users WHERE userid=:id OR loginid=:id LIMIT 1',
    );
    $st->execute(['id' => $id]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    return $row ? ['userid' => (int) $row['userid'], 'loginid' => (int) $row['loginid']] : null;
  }

  /** INSERT/UPDATE companies (companies.ref = loginid). Rückgabe companyId|null */
  private function upsertCompany(?array $company, int $loginid): ?int
  {
    if (!$company) {
      return null;
    }

    $companyId = isset($company['companyId']) ? (int) $company['companyId'] : 0;
    $name = $company['name'] ?? null;
    $city = $company['city'] ?? null;
    $street = $company['street'] ?? null;
    $houseNumber = $company['houseNumber'] ?? null;
    $postalCode = $company['postalCode'] ?? null;
    $isrecruter = isset($company['isRecruter']) ? (int) !!$company['isRecruter'] : 0; // DB: isrecruter

    if ($companyId > 0) {
      $sql = "UPDATE companies
                    SET name=:name, city=:city, street=:street, houseNumber=:houseNumber,
                        postalCode=:postalCode, isrecruter=:isrecruter
                    WHERE companyId=:companyId";
      $st = $this->db->prepare($sql);
      $st->execute(
        compact('name', 'city', 'street', 'houseNumber', 'postalCode', 'isrecruter', 'companyId'),
      );
      return $companyId;
    }

    if (!$name) {
      return null;
    }

    $sql = "INSERT INTO companies (name, city, street, houseNumber, postalCode, isrecruter, ref)
                VALUES (:name,:city,:street,:houseNumber,:postalCode,:isrecruter,:ref)";
    $st = $this->db->prepare($sql);
    $st->execute([
      'name' => $name,
      'city' => $city,
      'street' => $street,
      'houseNumber' => $houseNumber,
      'postalCode' => $postalCode,
      'isrecruter' => $isrecruter,
      'ref' => $loginid,
    ]);
    return (int) $this->db->lastInsertId();
  }

  /**
   * INSERT/UPDATE contacts (PK: contacts.contactid, contacts.ref = loginid).
   * anrede ist NOT NULL → Default 0.
   */
  private function upsertContact(?array $contact, ?int $companyId, int $loginid): ?int
  {
    if (!$contact || !$companyId) {
      return null;
    }

    $contactid = isset($contact['contactid'])
      ? (int) $contact['contactid']
      : (isset($contact['contactId'])
        ? (int) $contact['contactId']
        : 0);

    $anrede = isset($contact['anrede']) ? (int) $contact['anrede'] : 0; // Default 0
    $title = $contact['title'] ?? null;
    $vorname = $contact['vorname'] ?? null;
    $zusatz = $contact['zusatzname'] ?? null;
    $name = $contact['name'] ?? null;
    $email = $contact['email'] ?? null;
    $phone = $contact['phone'] ?? null;
    $mobile = $contact['mobile'] ?? null;

    if ($contactid > 0) {
      $sql = "UPDATE contacts
                    SET anrede=:anrede, title=:title, vorname=:vorname, zusatzname=:zusatzname,
                        name=:name, email=:email, phone=:phone, mobile=:mobile,
                        company=:company, ref=:ref
                    WHERE contactid=:contactid";
      $st = $this->db->prepare($sql);
      $st->execute([
        'anrede' => $anrede,
        'title' => $title,
        'vorname' => $vorname,
        'zusatzname' => $zusatz,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'mobile' => $mobile,
        'company' => $companyId,
        'ref' => $loginid,
        'contactid' => $contactid,
      ]);
      return $contactid;
    }

    if (!$name && !$email) {
      return null;
    }

    $sql = "INSERT INTO contacts (anrede,title,vorname,zusatzname,name,email,phone,mobile,company,ref)
                VALUES (:anrede,:title,:vorname,:zusatzname,:name,:email,:phone,:mobile,:company,:ref)";
    $st = $this->db->prepare($sql);
    $st->execute([
      'anrede' => $anrede,
      'title' => $title,
      'vorname' => $vorname,
      'zusatzname' => $zusatz,
      'name' => $name,
      'email' => $email,
      'phone' => $phone,
      'mobile' => $mobile,
      'company' => $companyId,
      'ref' => $loginid,
    ]);
    return (int) $this->db->lastInsertId();
  }

  private function insertHistory(int $resumeId, int $stateId, string $date): void
  {
    $st = $this->db->prepare(
      'INSERT INTO history (resumeid, stateid, date) VALUES (:rid,:sid,:dt)',
    );
    $st->execute(['rid' => $resumeId, 'sid' => $stateId, 'dt' => $date]);
  }

  /* ----------------------------------------------------------------------
   * Queries
   * -------------------------------------------------------------------- */

  /** GET /getResumesWithUsers */
  public function getResumesWithUsers(Request $request, Response $response): Response
  {
    $loginid = AuthService::getUserIdFromToken($request);
    if ($loginid === null) {
      $response
        ->getBody()
        ->write(json_encode(['success' => false, 'error' => 'backend.error.auth.unauthorized']));
      return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
    $ids = $this->resolveUserIds((int) $loginid);
    if (!$ids) {
      $response
        ->getBody()
        ->write(json_encode(['success' => false, 'error' => 'backend.error.auth.unauthorized']));
      return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
    $userid = $ids['userid'];

    $sql = <<<'SQL'
    SELECT
        r.resumeId,
        r.ref,
        r.position,
        hs.stateId,
        s.text      AS stateText,
        r.link,
        r.comment,
        r.created,
        c1.companyId              AS companyId,
        c1.name                   AS companyName,
        c1.city                   AS companyCity,
        c1.street                 AS companyStreet,
        c1.houseNumber            AS companyHouseNumber,
        c1.postalCode             AS companyPostalCode,
        c1.isrecruter             AS companyIsRecruter,
        c1.ref                    AS companyRef,
        c2.companyId              AS parentCompanyId,
        c2.name                   AS parentCompanyName,
        c2.city                   AS parentCompanyCity,
        c2.street                 AS parentCompanyStreet,
        c2.houseNumber            AS parentCompanyHouseNumber,
        c2.postalCode             AS parentCompanyPostalCode,
        c2.isrecruter             AS parentCompanyIsRecruter,
        c2.ref                    AS parentCompanyRef,

        -- Firmenkontakt (cc)
        cc.contactid              AS contactCompanyId,
        cc.anrede                 AS contactCompanyAnrede,
        cc.title                  AS contactCompanyTitle,
        cc.vorname                AS contactCompanyVorname,
        cc.zusatzname             AS contactCompanyZusatzname,
        cc.name                   AS contactCompanyName,
        cc.email                  AS contactCompanyEmail,
        cc.phone                  AS contactCompanyPhone,
        cc.mobile                 AS contactCompanyMobile,

        -- Recruiting-Kontakt (cp)
        cp.contactid              AS contactParentCompanyId,
        cp.anrede                 AS contactParentCompanyAnrede,
        cp.title                  AS contactParentCompanyTitle,
        cp.vorname                AS contactParentCompanyVorname,
        cp.zusatzname             AS contactParentCompanyZusatzname,
        cp.name                   AS contactParentCompanyName,
        cp.email                  AS contactParentCompanyEmail,
        cp.phone                  AS contactParentCompanyPhone,
        cp.mobile                 AS contactParentCompanyMobile

    FROM resumes r
    LEFT JOIN (
        SELECT h1.resumeId, h1.stateId
        FROM history h1
        INNER JOIN (
            SELECT resumeId, MAX(historyid) AS maxHistoryId
            FROM history
            GROUP BY resumeId
        ) h2 ON h1.resumeId = h2.resumeId AND h1.historyid = h2.maxHistoryId
    ) hs ON r.resumeId = hs.resumeId
    LEFT JOIN states    s  ON hs.stateId = s.stateid
    LEFT JOIN companies c1 ON r.companyId             = c1.companyId
    LEFT JOIN companies c2 ON r.parentCompanyId       = c2.companyId
    LEFT JOIN contacts  cc ON r.contactCompanyId      = cc.contactid
    LEFT JOIN contacts  cp ON r.contactParentCompanyId= cp.contactid
    WHERE r.ref = :userid
    SQL;

    $st = $this->db->prepare($sql);
    $st->execute(['userid' => $userid]);
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);

    $map = [];
    foreach ($rows as $row) {
      $id = (int) $row['resumeId'];
      if (!isset($map[$id])) {
        $map[$id] = [
          'resumeId' => $id,
          'ref' => (int) $row['ref'],
          'position' => $row['position'],
          'stateId' => isset($row['stateId']) ? (int) $row['stateId'] : 0,
          'stateText' => $row['stateText'] ?? null,
          'link' => $row['link'],
          'comment' => $row['comment'],
          'created' => $row['created'],
          'company' => $row['companyId']
            ? [
              'companyId' => (int) $row['companyId'],
              'name' => $row['companyName'],
              'city' => $row['companyCity'],
              'street' => $row['companyStreet'],
              'houseNumber' => $row['companyHouseNumber'],
              'postalCode' => $row['companyPostalCode'],
              'isRecruter' => (bool) $row['companyIsRecruter'],
              'ref' => (int) $row['companyRef'],
            ]
            : null,
          'recrutingCompany' => $row['parentCompanyId']
            ? [
              'companyId' => (int) $row['parentCompanyId'],
              'name' => $row['parentCompanyName'],
              'city' => $row['parentCompanyCity'],
              'street' => $row['parentCompanyStreet'],
              'houseNumber' => $row['parentCompanyHouseNumber'],
              'postalCode' => $row['parentCompanyPostalCode'],
              'isRecruter' => (bool) $row['parentCompanyIsRecruter'],
              'ref' => (int) $row['parentCompanyRef'],
            ]
            : null,
          'contactCompany' => null,
          'contactRecrutingCompany' => null,
        ];
      }
      if (!empty($row['contactCompanyId'])) {
        $map[$id]['contactCompany'] = [
          'contactid' => (int) $row['contactCompanyId'],
          'anrede' => (int) $row['contactCompanyAnrede'],
          'title' => $row['contactCompanyTitle'],
          'vorname' => $row['contactCompanyVorname'],
          'zusatzname' => $row['contactCompanyZusatzname'],
          'name' => $row['contactCompanyName'],
          'email' => $row['contactCompanyEmail'],
          'phone' => $row['contactCompanyPhone'],
          'mobile' => $row['contactCompanyMobile'],
        ];
      }
      if (!empty($row['contactParentCompanyId'])) {
        $map[$id]['contactRecrutingCompany'] = [
          'contactid' => (int) $row['contactParentCompanyId'],
          'anrede' => (int) $row['contactParentCompanyAnrede'],
          'title' => $row['contactParentCompanyTitle'],
          'vorname' => $row['contactParentCompanyVorname'],
          'zusatzname' => $row['contactParentCompanyZusatzname'],
          'name' => $row['contactParentCompanyName'],
          'email' => $row['contactParentCompanyEmail'],
          'phone' => $row['contactParentCompanyPhone'],
          'mobile' => $row['contactParentCompanyMobile'],
        ];
      }
    }

    $response->getBody()->write(json_encode(array_values($map)));
    return $response->withHeader('Content-Type', 'application/json');
  }

  /** Ein einzelnes Resume */
  public function getResumeById(int $resumeId): ?array
  {
    $sql = <<<'SQL'
    SELECT
        r.resumeId,
        r.ref,
        r.position,
        hs.stateId,
        s.text      AS stateText,
        r.link,
        r.comment,
        r.created,
        c1.companyId              AS companyId,
        c1.name                   AS companyName,
        c1.city                   AS companyCity,
        c1.street                 AS companyStreet,
        c1.houseNumber            AS companyHouseNumber,
        c1.postalCode             AS companyPostalCode,
        c1.isrecruter             AS companyIsRecruter,
        c1.ref                    AS companyRef,
        c2.companyId              AS parentCompanyId,
        c2.name                   AS parentCompanyName,
        c2.city                   AS parentCompanyCity,
        c2.street                 AS parentCompanyStreet,
        c2.houseNumber            AS parentCompanyHouseNumber,
        c2.postalCode             AS parentCompanyPostalCode,
        c2.isrecruter             AS parentCompanyIsRecruter,
        c2.ref                    AS parentCompanyRef,

        cc.contactid              AS contactCompanyId,
        cc.anrede                 AS contactCompanyAnrede,
        cc.title                  AS contactCompanyTitle,
        cc.vorname                AS contactCompanyVorname,
        cc.zusatzname             AS contactCompanyZusatzname,
        cc.name                   AS contactCompanyName,
        cc.email                  AS contactCompanyEmail,
        cc.phone                  AS contactCompanyPhone,
        cc.mobile                 AS contactCompanyMobile,

        cp.contactid              AS contactParentCompanyId,
        cp.anrede                 AS contactParentCompanyAnrede,
        cp.title                  AS contactParentCompanyTitle,
        cp.vorname                AS contactParentCompanyVorname,
        cp.zusatzname             AS contactParentCompanyZusatzname,
        cp.name                   AS contactParentCompanyName,
        cp.email                  AS contactParentCompanyEmail,
        cp.phone                  AS contactParentCompanyPhone,
        cp.mobile                 AS contactParentCompanyMobile

    FROM resumes r
    LEFT JOIN (
        SELECT h1.resumeId, h1.stateId
        FROM history h1
        INNER JOIN (
            SELECT resumeId, MAX(historyid) AS maxHistoryId
            FROM history
            GROUP BY resumeId
        ) h2 ON h1.resumeId = h2.resumeId AND h1.historyid = h2.maxHistoryId
    ) hs ON r.resumeId = hs.resumeId
    LEFT JOIN states    s  ON hs.stateId = s.stateid
    LEFT JOIN companies c1 ON r.companyId             = c1.companyId
    LEFT JOIN companies c2 ON r.parentCompanyId       = c2.companyId
    LEFT JOIN contacts  cc ON r.contactCompanyId      = cc.contactid
    LEFT JOIN contacts  cp ON r.contactParentCompanyId= cp.contactid
    WHERE r.resumeId = :resumeId
    LIMIT 1
    SQL;

    $st = $this->db->prepare($sql);
    $st->execute(['resumeId' => $resumeId]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
      return null;
    }

    return [
      'resumeId' => (int) $row['resumeId'],
      'ref' => (int) $row['ref'],
      'position' => $row['position'],
      'stateId' => isset($row['stateId']) ? (int) $row['stateId'] : 0,
      'stateText' => $row['stateText'] ?? null,
      'link' => $row['link'],
      'comment' => $row['comment'],
      'created' => $row['created'],
      'company' => $row['companyId']
        ? [
          'companyId' => (int) $row['companyId'],
          'name' => $row['companyName'],
          'city' => $row['companyCity'],
          'street' => $row['companyStreet'],
          'houseNumber' => $row['companyHouseNumber'],
          'postalCode' => $row['companyPostalCode'],
          'isRecruter' => (bool) $row['companyIsRecruter'],
          'ref' => (int) $row['companyRef'],
        ]
        : null,
      'recrutingCompany' => $row['parentCompanyId']
        ? [
          'companyId' => (int) $row['parentCompanyId'],
          'name' => $row['parentCompanyName'],
          'city' => $row['parentCompanyCity'],
          'street' => $row['parentCompanyStreet'],
          'houseNumber' => $row['parentCompanyHouseNumber'],
          'postalCode' => $row['parentCompanyPostalCode'],
          'isRecruter' => (bool) $row['parentCompanyIsRecruter'],
          'ref' => (int) $row['parentCompanyRef'],
        ]
        : null,
      'contactCompany' => !empty($row['contactCompanyId'])
        ? [
          'contactid' => (int) $row['contactCompanyId'],
          'anrede' => (int) $row['contactCompanyAnrede'],
          'title' => $row['contactCompanyTitle'],
          'vorname' => $row['contactCompanyVorname'],
          'zusatzname' => $row['contactCompanyZusatzname'],
          'name' => $row['contactCompanyName'],
          'email' => $row['contactCompanyEmail'],
          'phone' => $row['contactCompanyPhone'],
          'mobile' => $row['contactCompanyMobile'],
        ]
        : null,
      'contactRecrutingCompany' => !empty($row['contactParentCompanyId'])
        ? [
          'contactid' => (int) $row['contactParentCompanyId'],
          'anrede' => (int) $row['contactParentCompanyAnrede'],
          'title' => $row['contactParentCompanyTitle'],
          'vorname' => $row['contactParentCompanyVorname'],
          'zusatzname' => $row['contactParentCompanyZusatzname'],
          'name' => $row['contactParentCompanyName'],
          'email' => $row['contactParentCompanyEmail'],
          'phone' => $row['contactParentCompanyPhone'],
          'mobile' => $row['contactParentCompanyMobile'],
        ]
        : null,
    ];
  }

  /** States-Liste */
  public function getStates(Request $request, Response $response): Response
  {
    $st = $this->db->query('SELECT stateid, text FROM states ORDER BY stateid ASC');
    $response->getBody()->write(json_encode($st->fetchAll(PDO::FETCH_ASSOC)));
    return $response->withHeader('Content-Type', 'application/json');
  }

  /* ----------------------------------------------------------------------
   * Mutations
   * -------------------------------------------------------------------- */

  /**
   * Speichern/Update eines Resumes (inkl. Companies/Contacts).
   * ref kommt NUR aus JWT.
   */
  /*
   * Speichern/Update eines Resumes (inkl. Companies/Contacts).
   * ref kommt NUR aus JWT.
   */
  public function updateOrCreateResume(Request $request, Response $response): Response
  {
    $loginid = AuthService::getUserIdFromToken($request);
    if ($loginid === null) {
      $response->getBody()->write(json_encode([
        'success' => false,
        'error' => 'backend.error.auth.unauthorized'
      ]));
      return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
    $ids = $this->resolveUserIds((int) $loginid);
    if (!$ids) {
      $response->getBody()->write(json_encode([
        'success' => false,
        'error' => 'backend.error.auth.unauthorized'
      ]));
      return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
    $userid = $ids['userid'];   // resumes.ref
    $loginid = $ids['loginid'];  // companies.ref / contacts.ref

    $data = (array) $request->getParsedBody();

    $company = $data['company'] ?? null;
    $recrutingCompany = $data['recrutingCompany'] ?? null;
    $contactCompany = $data['contactCompany'] ?? null;
    $contactRecrutingCompany = $data['contactRecrutingCompany'] ?? null;

    $position = $data['position'] ?? null;
    $stateId = isset($data['stateId']) ? (int) $data['stateId'] : 0;
    $link = $data['link'] ?? null;
    $comment = $data['comment'] ?? null;

    $resumeId = isset($data['resumeId']) ? (int) $data['resumeId'] : 0;

    $this->db->beginTransaction();
    try {
      // Firmen + Kontakte aktualisieren / anlegen
      $companyId = $this->upsertCompany($company, $loginid);
      $recrutingCompanyId = $this->upsertCompany($recrutingCompany, $loginid);

      $contactCompanyId = $this->upsertContact($contactCompany, $companyId, $loginid);
      $contactRecrutingId = $this->upsertContact($contactRecrutingCompany, $recrutingCompanyId, $loginid);

      if ($resumeId > 0) {
        // Update
        $sql = "UPDATE resumes
                       SET position=:position,
                           link=:link,
                           comment=:comment,
                           companyId=:companyId,
                           parentCompanyId=:recrutingCompanyId,
                           contactCompanyId=:contactCompanyId,
                           contactParentCompanyId=:contactRecrutingId
                     WHERE resumeId=:resumeId AND ref=:userid";
        $st = $this->db->prepare($sql);
        $st->execute([
          'position' => $position,
          'link' => $link,
          'comment' => $comment,
          'companyId' => $companyId,
          'recrutingCompanyId' => $recrutingCompanyId,
          'contactCompanyId' => $contactCompanyId,
          'contactRecrutingId' => $contactRecrutingId,
          'resumeId' => $resumeId,
          'userid' => $userid,
        ]);
      } else {
        // Insert
        $sql = "INSERT INTO resumes (ref, position, link, comment, companyId, parentCompanyId, contactCompanyId, contactParentCompanyId, created)
                         VALUES (:userid, :position, :link, :comment, :companyId, :recrutingCompanyId, :contactCompanyId, :contactRecrutingId, NOW())";
        $st = $this->db->prepare($sql);
        $st->execute([
          'userid' => $userid,
          'position' => $position,
          'link' => $link,
          'comment' => $comment,
          'companyId' => $companyId,
          'recrutingCompanyId' => $recrutingCompanyId,
          'contactCompanyId' => $contactCompanyId,
          'contactRecrutingId' => $contactRecrutingId,
        ]);
        $resumeId = (int) $this->db->lastInsertId();
      }

      // History nur speichern, wenn stateId gesetzt
      if ($stateId > 0) {
        $this->insertHistory($resumeId, $stateId, date('Y-m-d H:i:s'));
      }

      $this->db->commit();

      $response->getBody()->write(json_encode([
        'success' => true,
        'resumeId' => $resumeId
      ]));
      return $response->withHeader('Content-Type', 'application/json');

    } catch (PDOException $e) {
      $this->db->rollBack();
      $response->getBody()->write(json_encode([
        'success' => false,
        'error' => $e->getMessage()
      ]));
      return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
  }

  /**
   * Statuswechsel – History schreiben auch für stateId=0.
   * Eigentümerprüfung: resumes.ref (userid) gegen loginid->userid aus JWT.
   */
  public function changeResumeStatus(Request $request, Response $response): Response
  {
    $data = (array) $request->getParsedBody();
    $resumeId = isset($data['resumeId']) ? (int) $data['resumeId'] : null;
    $stateId = isset($data['stateId']) ? (int) $data['stateId'] : null;
    $date = $data['date'] ?? null;

    $loginid = AuthService::getUserIdFromToken($request);
    if (!$resumeId || $stateId === null || !$date || $loginid === null) {
      $response->getBody()->write('backend.error.validation.missingData');
      return $response->withStatus(400)->withHeader('Content-Type', 'text/plain');
    }

    $ids = $this->resolveUserIds((int) $loginid);
    if (!$ids) {
      $response->getBody()->write('backend.error.auth.unauthorized');
      return $response->withStatus(401)->withHeader('Content-Type', 'text/plain');
    }
    $userid = $ids['userid'];

    $st = $this->db->prepare('SELECT ref, stateid FROM resumes WHERE resumeId = :id');
    $st->execute(['id' => $resumeId]);
    $resume = $st->fetch(PDO::FETCH_ASSOC);
    if (!$resume) {
      $response->getBody()->write('backend.error.notFound.applicationNotFound');
      return $response->withStatus(404)->withHeader('Content-Type', 'text/plain');
    }
    if ((int) $resume['ref'] !== $userid) {
      $response->getBody()->write('backend.error.auth.noPermission');
      return $response->withStatus(403)->withHeader('Content-Type', 'text/plain');
    }
    if ((int) $resume['stateid'] === (int) $stateId) {
      $response->getBody()->write('backend.error.conflict.statusAlreadySet');
      return $response->withStatus(400)->withHeader('Content-Type', 'text/plain');
    }

    $upd = $this->db->prepare('UPDATE resumes SET stateid = :sid WHERE resumeId = :id');
    $upd->execute(['sid' => $stateId, 'id' => $resumeId]);

    $ins = $this->db->prepare(
      'INSERT INTO history (resumeid, stateid, date) VALUES (:rid,:sid,:dt)',
    );
    $ins->execute(['rid' => $resumeId, 'sid' => $stateId, 'dt' => $date]);

    $response->getBody()->write('backend.success.status.changed');
    return $response->withHeader('Content-Type', 'text/plain');
  }
}
