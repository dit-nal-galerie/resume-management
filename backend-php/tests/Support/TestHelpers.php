<?php

declare(strict_types=1);

use Firebase\JWT\JWT;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Response;

/**
 * Gemeinsame Helfer für die Service-Tests:
 * - SQLite-taugliche Requests/Responses (slim/psr7)
 * - JWT-Cookies, die AuthService::getUserIdFromToken akzeptiert
 */
trait TestHelpers
{
  protected function jwtSecret(): string
  {
    $_ENV['JWT_SECRET'] = 'test-secret';

    return 'test-secret';
  }

  protected function makeToken(array $claims = []): string
  {
    $payload = array_merge(
      [
        'loginid' => 1,
        'loginname' => 'john',
        'userid' => 1,
        'exp' => time() + 3600,
      ],
      $claims,
    );

    return JWT::encode($payload, $this->jwtSecret(), 'HS256');
  }

  protected function makeRequest(
    string $method = 'GET',
    string $path = '/',
    array $body = [],
    array $query = [],
    ?string $token = null,
  ): ServerRequestInterface {
    // slim/psr7 1.7: Slim\Psr7\Request implementiert ServerRequestInterface,
    // erzeugt wird es über die PSR-17-Factory.
    $request = (new ServerRequestFactory())->createServerRequest($method, $path);

    if ($query !== []) {
      $request = $request->withQueryParams($query);
    }
    if ($body !== []) {
      $request = $request->withParsedBody($body);
    }
    if ($token !== null) {
      $request = $request->withCookieParams(['token' => $token]);
    }

    return $request;
  }

  protected function makeAuthRequest(
    string $method = 'GET',
    string $path = '/',
    array $body = [],
    array $query = [],
  ): ServerRequestInterface {
    return $this->makeRequest($method, $path, $body, $query, $this->makeToken());
  }

  protected function makeResponse(): ResponseInterface
  {
    return new Response();
  }

  protected function jsonBody(ResponseInterface $response): array
  {
    $body = $response->getBody();
    $body->rewind();
    $decoded = json_decode((string) $body, true);

    return is_array($decoded) ? $decoded : [];
  }
}
