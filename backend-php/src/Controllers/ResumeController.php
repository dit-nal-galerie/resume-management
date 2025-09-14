<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Config\DB;
use App\Services\ResumeService;

class ResumeController
{
  private ResumeService $service;

  public function __construct()
  {
    $db = DB::connect();
    $this->service = new ResumeService($db);
  }

  public function getResumesWithUsers(Request $request, Response $response): Response
  {
    return $this->service->getResumesWithUsers($request, $response);
  }

  public function getStates(Request $request, Response $response): Response
  {
    return $this->service->getStates($request, $response);
  }

  public function updateOrCreateResume(Request $request, Response $response, array $args): Response
  {
    // ВАЖНО: передаём Request и Response, НЕ массив!
    return $this->service->updateOrCreateResume($request, $response);
  }

  public function getResumeById(Request $request, Response $response, array $args): Response
  {
    // Hier den korrekten Key aus $args verwenden:
    $resumeId = isset($args['resumeId']) ? (int) $args['resumeId'] : 0;

    // Service‐Methode aufrufen
    $resume = $this->service->getResumeById($resumeId);

    if ($resume === null) {
      // Kein Eintrag gefunden -> 404 mit JSON-Error
      $payload = [
        'success' => false,
        'error' => 'backend.error.notFound.resumeNotFound',
      ];
      $response->getBody()->write(json_encode($payload));
      return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }

    // Alles gut -> Resume als JSON zurück
    $response->getBody()->write(json_encode($resume));
    return $response->withHeader('Content-Type', 'application/json');
  }

  public function changeResumeStatus(Request $request, Response $response, array $args): Response
  {
    return $this->service->changeResumeStatus($request, $response);
  }
}
