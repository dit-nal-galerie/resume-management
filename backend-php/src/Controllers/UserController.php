<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Config\DB;
use App\Services\UserService;

class UserController
{
    private $service;

    public function __construct()
    {
        $db = DB::connect();
        $this->service = new UserService($db);
    }

    public function login(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $result = $this->service->login($data);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function getUserProfile(Request $request, Response $response): Response
    {
        $loginid = $request->getAttribute('loginid');
        $result = $this->service->getUserProfile($loginid);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function createOrUpdateUser(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $result = $this->service->createOrUpdateUser($data);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
