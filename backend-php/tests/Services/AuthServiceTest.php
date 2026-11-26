<?php
use Firebase\JWT\JWT;
use PHPUnit\Framework\TestCase;
use App\Services\AuthService;

class AuthServiceTest extends TestCase
{
  use TestHelpers;

  public function testReadsLoginidFromCookieToken(): void
  {
    $request = $this->makeRequest('GET', '/me', [], [], $this->makeToken(['loginid' => 42]));

    $this->assertSame(42, AuthService::getUserIdFromToken($request));
  }

  public function testReadsLoginidFromAuthorizationHeader(): void
  {
    $token = $this->makeToken(['loginid' => 7]);
    $request = $this->makeRequest('GET', '/me')->withHeader('Authorization', 'Bearer ' . $token);

    $this->assertSame(7, AuthService::getUserIdFromToken($request));
  }

  public function testCookieTokenTakesPrecedenceOverHeader(): void
  {
    $cookieToken = $this->makeToken(['loginid' => 5]);
    $headerToken = $this->makeToken(['loginid' => 9]);
    $request = $this->makeRequest('GET', '/me', [], [], $cookieToken)->withHeader(
      'Authorization',
      'Bearer ' . $headerToken,
    );

    $this->assertSame(5, AuthService::getUserIdFromToken($request));
  }

  public function testReturnsNullWithoutAnyToken(): void
  {
    $this->assertNull(AuthService::getUserIdFromToken($this->makeRequest('GET', '/me')));
  }

  public function testReturnsNullForMalformedToken(): void
  {
    $request = $this->makeRequest('GET', '/me', [], [], 'not-a-jwt');

    $this->assertNull(AuthService::getUserIdFromToken($request));
  }

  public function testReturnsNullForTokenSignedWithAnotherSecret(): void
  {
    $token = JWT::encode(['loginid' => 1, 'exp' => time() + 3600], 'fremdes-secret', 'HS256');
    $request = $this->makeRequest('GET', '/me', [], [], $token);

    $this->assertNull(AuthService::getUserIdFromToken($request));
  }

  public function testReturnsNullForExpiredToken(): void
  {
    $request = $this->makeRequest('GET', '/me', [], [], $this->makeToken(['exp' => time() - 10]));

    $this->assertNull(AuthService::getUserIdFromToken($request));
  }

  public function testReturnsNullForTokenWithoutLoginidClaim(): void
  {
    $request = $this->makeRequest('GET', '/me', [], [], $this->makeToken(['loginid' => null]));

    $this->assertNull(AuthService::getUserIdFromToken($request));
  }
}
