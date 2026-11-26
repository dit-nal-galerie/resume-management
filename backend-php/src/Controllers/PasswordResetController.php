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
      $response->getBody()->write(
        json_encode([
          'success' => false,
          'error' => 'Email and loginname are required.',
        ]),
      );
      return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $result = $this->service->sendResetEmail($data['email'], $data['loginname']);
    $response->getBody()->write(json_encode($result));
    return $response->withHeader('Content-Type', 'application/json');
  }

  /**
   * GET /validate-token?token=…
   */
  public function checkPasswordResetToken(Request $request, Response $response): Response
  {
    $params = $request->getQueryParams();
    $token = isset($params['token']) ? trim((string) $params['token']) : '';

    if ($token === '') {
      $response->getBody()->write(
        json_encode([
          'success' => false,
          'error' => 'backend.error.validation.missingToken',
        ]),
      );
      return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    if (!$this->service->validateToken($token)) {
      $response->getBody()->write(
        json_encode([
          'success' => false,
          'error' => 'backend.error.validation.invalidToken',
        ]),
      );
      return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $response->getBody()->write(
      json_encode([
        'success' => true,
        'message' => 'backend.success.passwordReset.validToken',
      ]),
    );
    return $response->withHeader('Content-Type', 'application/json');
  }

  /**
   * POST /reset-password (Token im Body) und /password-reset/{token} (Token in der URL).
   * Der Frontend-Client sendet { token, password }.
   */
  public function resetPassword(Request $request, Response $response, array $args): Response
  {
    $data = (array) $request->getParsedBody();
    $token = $args['token'] ?? ($data['token'] ?? null);
    $password = $data['password'] ?? ($data['newPassword'] ?? null);

    if (!$token || !$password) {
      $response->getBody()->write(
        json_encode([
          'success' => false,
          'error' => 'backend.error.validation.missingTokenOrPassword',
        ]),
      );
      return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $result = $this->service->resetPassword((string) $token, (string) $password);
    $response->getBody()->write(json_encode($result));
    return $response->withHeader('Content-Type', 'application/json');
  }
}
