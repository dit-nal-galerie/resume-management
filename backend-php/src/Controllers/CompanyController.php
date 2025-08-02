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

    public function addCompany(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $result = $this->service->addCompany($data);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function getCompanies(Request $request, Response $response): Response
    {
        $result = $this->service->getCompanies();
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
