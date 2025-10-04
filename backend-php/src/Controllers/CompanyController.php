<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Config\DB;
use App\Services\CompanyService;

class CompanyController
{
  private $service;

  public function __construct()
  {
    $db = DB::connect();
    $this->service = new CompanyService($db);
  }

  // public function addCompany(Request $request, Response $response): Response
  // {
  //     $data = $request->getParsedBody();
  //     $result = $this->service->addCompany($data, $response);
  //     $response->getBody()->write(json_encode($result));
  //     return $response->withHeader('Content-Type', 'application/json');
  // }
  public function addCompany(Request $request, Response $response): Response
  {
    return $this->service->addCompany($request, $response);
  }
  public function getCompanies(Request $req, Response $res, array $args): Response
  {
    return $this->service->getCompanies($req, $res); // NICHTS zusätzlich schreiben!
  }
}
