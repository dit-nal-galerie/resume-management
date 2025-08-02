<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Config\DB;
use App\Services\ContactService;

class ContactController
{
    private $service;

    public function __construct()
    {
        $db = DB::connect();
        $this->service = new ContactService($db);
    }

    public function createOrUpdateContact(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $result = $this->service->createOrUpdateContact($data);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function getContacts(Request $request, Response $response): Response
    {
        $result = $this->service->getContacts();
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
