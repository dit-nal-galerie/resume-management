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

        $env = getenv('APP_ENV') ?: 'production';
        $config = \App\Config\ConfigLoader::load($env);

        $this->service = new PasswordResetService($db, $config);
    }

    public function sendResetEmail(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();

        if (empty($data['email']) || empty($data['loginname'])) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'error' => 'Email and loginname are required.'
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $result = $this->service->sendResetEmail($data['email'], $data['loginname']);
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
