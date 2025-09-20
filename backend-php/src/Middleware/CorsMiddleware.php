<?php
declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Psr\Http\Server\MiddlewareInterface;
use Slim\Psr7\Factory\ResponseFactory;

class CorsMiddleware implements MiddlewareInterface
{
  private array $allowedOrigins;

  public function __construct(array $allowedOrigins = [])
  {
    $this->allowedOrigins = $allowedOrigins ?: ['*'];
  }

  public function process(Request $request, RequestHandler $handler): Response
  {
    $origin = $request->getHeaderLine('Origin');
    $allowOrigin = '';

    if (($this->allowedOrigins[0] ?? null) === '*') {
      $allowOrigin = '*';
    } elseif ($origin !== '' && in_array($origin, $this->allowedOrigins, true)) {
      $allowOrigin = $origin;
    } else {
      // Fallback wenn Origin nicht erlaubt oder nicht gesetzt
      $allowOrigin = $this->allowedOrigins[0] ?? '*';
    }

    // Preflight OPTIONS
    if (strtoupper($request->getMethod()) === 'OPTIONS') {
      $response = (new ResponseFactory())->createResponse();
      return $this->addCorsHeaders($response, $allowOrigin);
    }

    // Normale Requests
    $response = $handler->handle($request);
    return $this->addCorsHeaders($response, $allowOrigin);
  }

  private function addCorsHeaders(Response $response, string $allowOrigin): Response
  {
    return $response
      ->withHeader('Access-Control-Allow-Origin', $allowOrigin)
      ->withHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With, Content-Type, Accept, Origin, Authorization'
      )
      ->withHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      )
      ->withHeader('Access-Control-Allow-Credentials', 'true');
  }
}
