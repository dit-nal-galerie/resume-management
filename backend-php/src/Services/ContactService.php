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
}
