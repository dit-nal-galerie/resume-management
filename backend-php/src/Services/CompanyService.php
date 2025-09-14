<?php
namespace App\Services;

use PDO;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class CompanyService
{
  public function __construct(private PDO $db)
  {
    $this->db->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
  }

  /**
   * GET /companies?isRecruter=true|false&limit=100&q=...
   * Filter: companies.ref = loginid (aus JWT)
   */
  public function getCompanies(Request $request, Response $response): Response
  {
    $loginid = AuthService::getUserIdFromToken($request);
    if ($loginid === null) {
      $response->getBody()->write(
        json_encode([
          'success' => false,
          'error' => 'backend.error.auth.unauthorized',
        ]),
      );
      return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }

    $params = $request->getQueryParams();
    $isRecruter = isset($params['isRecruter'])
      ? filter_var($params['isRecruter'], FILTER_VALIDATE_BOOLEAN)
      : null;
    $limit = isset($params['limit']) ? max(1, min(200, (int) $params['limit'])) : 100;
    $q = isset($params['q']) ? trim((string) $params['q']) : '';

    $where = ['c.ref = :ref'];
    $bind = ['ref' => (int) $loginid];

    if ($isRecruter !== null) {
      $where[] = 'c.isrecruter = :isrecruter';
      $bind['isrecruter'] = $isRecruter ? 1 : 0;
    }
    if ($q !== '') {
      $where[] = '(c.name LIKE :q OR c.city LIKE :q OR c.street LIKE :q)';
      $bind['q'] = '%' . $q . '%';
    }

    $sql =
      "SELECT
                    c.companyId,
                    c.name,
                    c.city,
                    c.street,
                    c.houseNumber,
                    c.postalCode,
                    c.isrecruter AS isRecruter,
                    c.ref
                FROM companies c
                WHERE " .
      implode(' AND ', $where) .
      "
                ORDER BY c.companyId DESC
                LIMIT {$limit}";

    $st = $this->db->prepare($sql);
    $st->execute($bind);
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);

    $response->getBody()->write(json_encode($rows));
    return $response->withHeader('Content-Type', 'application/json');
  }
}
