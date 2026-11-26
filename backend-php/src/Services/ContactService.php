<?php
namespace App\Services;

use PDO;
use PDOException;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class ContactService
{
  public function __construct(private PDO $db)
  {
    $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  }

  // Optional: falls du wie im ResumeService userid/loginid brauchst
  private function resolveUserIds(int $id): ?array
  {
    $st = $this->db->prepare(
      'SELECT userid, loginid FROM users WHERE userid=:id OR loginid=:id LIMIT 1',
    );
    $st->execute(['id' => $id]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    return $row ? ['userid' => (int) $row['userid'], 'loginid' => (int) $row['loginid']] : null;
  }

  /**
   * GET /getContacts?companyId=...&q=...
   * Filtert standardmäßig auf ref = loginid aus JWT.
   * PK in DB: contacts.contactid
   */
  public function getContacts(Request $request, Response $response): Response
  {
    $loginid = \App\Services\AuthService::getUserIdFromToken($request);
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
    $loginid = $ids['loginid']; // contacts.ref = loginid

    $params = $request->getQueryParams();
    $companyId = isset($params['companyId']) ? (int) $params['companyId'] : null;
    $q = isset($params['q']) ? trim((string) $params['q']) : '';

    $where = ['c.ref = :ref'];
    $bind = ['ref' => $loginid];

    if ($companyId) {
      $where[] = 'c.company = :companyId';
      $bind['companyId'] = $companyId;
    }
    if ($q !== '') {
      // Suche über Name/Email/Phone
      $where[] = '(c.name LIKE :q OR c.email LIKE :q OR c.phone LIKE :q OR c.vorname LIKE :q)';
      $bind['q'] = '%' . $q . '%';
    }

    $sql =
      "SELECT 
                    c.contactid, c.anrede, c.title, c.vorname, c.zusatzname,
                    c.name, c.email, c.phone, c.mobile, c.company, c.ref
                FROM contacts c
                " .
      (count($where) ? 'WHERE ' . implode(' AND ', $where) : '') .
      "
                ORDER BY c.contactid DESC";

    $st = $this->db->prepare($sql);
    $st->execute($bind);
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);

    $response->getBody()->write(json_encode($rows));
    return $response->withHeader('Content-Type', 'application/json');
  }

  /**
   * POST /addContact|/contact|/createOrUpdateContact
   * Legt einen Kontakt an (contactid = 0/fehlt) oder aktualisiert ihn.
   * ref = loginid aus JWT (über users aufgelöst).
   */
  public function createOrUpdateContact(Request $request, Response $response): Response
  {
    $loginid = \App\Services\AuthService::getUserIdFromToken($request);
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
    $ref = $ids['loginid']; // contacts.ref = loginid

    $data = (array) $request->getParsedBody();
    $contactid = isset($data['contactid']) ? (int) $data['contactid'] : 0;
    $vorname = $data['vorname'] ?? null;
    $name = $data['name'] ?? null;
    $email = $data['email'] ?? null;
    $company = isset($data['company']) ? (int) $data['company'] : 0;

    if (!$vorname || !$name || !$email || !isset($data['anrede']) || !$company) {
      $response
        ->getBody()
        ->write(
          json_encode(['success' => false, 'error' => 'backend.error.validation.missingFields']),
        );
      return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $fields = [
      'vorname' => $vorname,
      'name' => $name,
      'email' => $email,
      'anrede' => (int) $data['anrede'],
      'title' => $data['title'] ?? null,
      'zusatzname' => $data['zusatzname'] ?? null,
      'phone' => $data['phone'] ?? null,
      'mobile' => $data['mobile'] ?? null,
      'company' => $company,
      'ref' => $ref,
    ];

    if ($contactid > 0) {
      $st = $this->db->prepare(
        'UPDATE contacts
            SET vorname=:vorname, name=:name, email=:email, anrede=:anrede,
                title=:title, zusatzname=:zusatzname, phone=:phone, mobile=:mobile,
                company=:company, ref=:ref
          WHERE contactid=:contactid',
      );
      $fields['contactid'] = $contactid;
      $st->execute($fields);

      $response->getBody()->write(
        json_encode([
          'success' => true,
          'message' => 'backend.success.contact.updated',
          'contactid' => $contactid,
        ]),
      );
      return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    }

    $st = $this->db->prepare(
      'INSERT INTO contacts (vorname, name, email, anrede, title, zusatzname, phone, mobile, company, ref)
       VALUES (:vorname, :name, :email, :anrede, :title, :zusatzname, :phone, :mobile, :company, :ref)',
    );
    $st->execute($fields);
    $contactid = (int) $this->db->lastInsertId();

    $response->getBody()->write(
      json_encode([
        'success' => true,
        'message' => 'backend.success.contact.added',
        'contactid' => $contactid,
      ]),
    );
    return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
  }
}
