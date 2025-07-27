<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\UserService;
use App\Config\DB;

class ResumeController
{
    private $db;
    private $userService;

    public function __construct()
    {
        $this->db = DB::connect();
        $this->userService = new UserService($this->db);
    }

    public function getUserProfile(Request $request, Response $response): Response
    {
        $result = $this->userService->getUserProfile($request);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function createOrUpdateUser(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $result = $this->userService->createOrUpdateUser($data);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function login(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $result = $this->userService->login($data);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
