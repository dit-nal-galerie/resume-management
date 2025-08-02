<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Config\DB;
use App\Services\HistoryService;

class HistoryController
{
    private $service;

    public function __construct()
    {
        $db = DB::connect();
        $this->service = new HistoryService($db);
    }

    public function addHistory(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $result = $this->service->addHistory($data);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function getHistoryByResume(Request $request, Response $response, array $args): Response
    {
        $result = $this->service->getHistoryByResume($args['resumeId']);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
