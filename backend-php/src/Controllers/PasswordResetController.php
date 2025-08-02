<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Config\DB;
use App\Services\PasswordResetService;

class PasswordResetController
{
    private $service;

    public function __construct()
    {
        $db = DB::connect();
        $this->service = new PasswordResetService($db);
    }

    public function sendResetEmail(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $result = $this->service->sendResetEmail($data['email']);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function resetPassword(Request $request, Response $response, array $args): Response
    {
        $data = $request->getParsedBody();
        $token = $args['token'];
        $result = $this->service->resetPassword($token, $data['newPassword']);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
