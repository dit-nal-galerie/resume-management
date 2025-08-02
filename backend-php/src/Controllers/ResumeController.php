<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Config\DB;
use App\Services\ResumeService;

class ResumeController
{
    private $service;

    public function __construct()
    {
        $db = DB::connect();
        $this->service = new ResumeService($db);
    }

    public function getResumesWithUsers(Request $request, Response $response): Response
    {
        $result = $this->service->getResumesWithUsers();
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function getStates(Request $request, Response $response): Response
    {
        $result = $this->service->getStates();
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function updateOrCreateResume(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $result = $this->service->updateOrCreateResume($data);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function getResumeById(Request $request, Response $response, array $args): Response
    {
        $result = $this->service->getResumeById($args['id']);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
