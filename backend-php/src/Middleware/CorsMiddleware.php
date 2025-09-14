<?php
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

    if ($this->allowedOrigins[0] === '*') {
      $allowOrigin = '*';
    } elseif (in_array($origin, $this->allowedOrigins, true)) {
      $allowOrigin = $origin;
    } else {
      // Origin not allowed, but we'll set the first one as a default for OPTIONS.
      $allowOrigin = $this->allowedOrigins[0] ?? '*';
    }

    // Handle preflight OPTIONS requests
    if ($request->getMethod() === 'OPTIONS') {
      $response = new ResponseFactory()->createResponse();
      return $response
        ->withHeader('Access-Control-Allow-Origin', $allowOrigin)
        ->withHeader(
          'Access-Control-Allow-Headers',
          'X-Requested-With, Content-Type, Accept, Origin, Authorization',
        )
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        ->withHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Handle normal requests
    $response = $handler->handle($request);

    return $response
      ->withHeader('Access-Control-Allow-Origin', $allowOrigin)
      ->withHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With, Content-Type, Accept, Origin, Authorization',
      )
      ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      ->withHeader('Access-Control-Allow-Credentials', 'true');
  }
}
