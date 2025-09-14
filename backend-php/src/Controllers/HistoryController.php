<?php
namespace App\Controllers;

use Psr\Http\Message\RequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use App\Services\HistoryService;
use App\Config\DB;

class HistoryController
{
  private HistoryService $service;

  public function __construct()
  {
    $pdo = DB::connect();
    $this->service = new HistoryService($pdo);
  }

  public function addHistory(Request $request, Response $response): Response
  {
    return $this->service->addHistory($request, $response);
  }

  public function getHistoryByResume(Request $request, Response $response): Response
  {
    return $this->service->getHistoryByResume($request, $response);
  }
}
