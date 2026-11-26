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
    // WICHTIG: direkt das Response aus den Service zurückgeben.
    return $this->service->createOrUpdateContact($request, $response);
  }

  public function getContacts(Request $request, Response $response, array $args): Response
  {
    // WICHTIG: direkt das Response aus dem Service zurückgeben.
    return $this->service->getContacts($request, $response);
  }
}
