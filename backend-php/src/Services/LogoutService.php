<?php
namespace App\Services;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class LogoutService
{
    public function logout(Request $request, Response $response): Response
    {
        setcookie('token', '', ['expires'=>time()-3600, 'path'=>'/', 'httponly'=>true]);
        return $response->withStatus(204);
    }
}
