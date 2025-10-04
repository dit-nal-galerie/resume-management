<?php
namespace App\Services;

use Psr\Http\Message\ServerRequestInterface as Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthService
{
  /**
   * Liest das JWT-Token aus Cookie oder Authorization-Header
   * und gibt loginid zurück (oder null bei Fehlern/Fehlen).
   */
  public static function getUserIdFromToken(Request $request): ?int
  {
    // 1) Token aus HttpOnly-Cookie auslesen
    $cookies = $request->getCookieParams();
    $token = $cookies['token'] ?? null;

    // 2) Falls noch nichts, aus Authorization-Header holen
    if (!$token) {
      if (preg_match('/Bearer\s+(.*)$/i', $request->getHeaderLine('Authorization'), $m)) {
        $token = $m[1];
      }
    }

    if (!$token) {
      return null;
    }

    try {
      $secret = $_ENV['JWT_SECRET'] ?? 'default_jwt_secret';
      $decoded = JWT::decode($token, new Key($secret, 'HS256'));
      return $decoded->loginid ?? null;
    } catch (\Throwable $e) {
      // Token ungültig / abgelaufen
      return null;
    }
  }
}
