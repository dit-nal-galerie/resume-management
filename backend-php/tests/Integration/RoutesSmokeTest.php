<?php
use PHPUnit\Framework\TestCase;
use Slim\Factory\AppFactory;
use Slim\App;

/**
 * Smoke-Test der Routen-Registrierung (src/Routes/api.php).
 *
 * Es wird nur geprüft, dass Slim die Route für Methode + Pfad auflöst –
 * die Handler selbst laufen nicht an, daher ist keine Datenbank nötig.
 */
class RoutesSmokeTest extends TestCase
{
  private App $app;

  protected function setUp(): void
  {
    $this->app = AppFactory::create();
    $registerRoutes = require __DIR__ . '/../../src/Routes/api.php';
    $registerRoutes($this->app);
  }

  private function assertRouteResolves(string $method, string $path): void
  {
    $results = $this->app->getRouteResolver()->computeRoutingResults($path, $method);
    $this->assertNotNull($results->getRouteIdentifier(), "Route nicht registriert: $method $path");
  }

  public function testUserAndAuthRoutes(): void
  {
    $this->assertRouteResolves('POST', '/createOrUpdateUser');
    $this->assertRouteResolves('POST', '/login');
    $this->assertRouteResolves('POST', '/logout');
    $this->assertRouteResolves('GET', '/me');
    $this->assertRouteResolves('GET', '/meanrede');
    $this->assertRouteResolves('GET', '/getAnrede');
    $this->assertRouteResolves('POST', '/changeAccessData');
  }

  public function testResumeRoutesIncludingAliases(): void
  {
    $this->assertRouteResolves('GET', '/getResumesWithUsers');
    $this->assertRouteResolves('GET', '/resumes');
    $this->assertRouteResolves('POST', '/updateOrCreateResume');
    $this->assertRouteResolves('POST', '/resume');
    $this->assertRouteResolves('GET', '/getResumeById/42');
    $this->assertRouteResolves('GET', '/resume/42');
    $this->assertRouteResolves('POST', '/changeResumeStatus');
    $this->assertRouteResolves('GET', '/getStates');
    $this->assertRouteResolves('GET', '/states');
  }

  public function testCompanyAndContactRoutes(): void
  {
    $this->assertRouteResolves('POST', '/addCompany');
    $this->assertRouteResolves('POST', '/company');
    $this->assertRouteResolves('GET', '/companies');
    $this->assertRouteResolves('POST', '/addContact');
    $this->assertRouteResolves('POST', '/contact');
    $this->assertRouteResolves('POST', '/createOrUpdateContact');
    $this->assertRouteResolves('GET', '/contacts');
  }

  public function testHistoryRoutes(): void
  {
    $this->assertRouteResolves('POST', '/addHistory');
    $this->assertRouteResolves('POST', '/history');
    $this->assertRouteResolves('GET', '/getHistoryByResumeId');
    $this->assertRouteResolves('GET', '/history/7');
  }

  public function testPasswordResetRoutes(): void
  {
    $this->assertRouteResolves('POST', '/request-password-reset');
    $this->assertRouteResolves('GET', '/validate-token');
    $this->assertRouteResolves('POST', '/reset-password');
    $this->assertRouteResolves('POST', '/password-reset');
    $this->assertRouteResolves('POST', '/password-reset/some-token');
  }

  public function testDbCheckRoute(): void
  {
    $this->assertRouteResolves('GET', '/db-check');
    $this->assertRouteResolves('POST', '/db-check');
  }

  public function testUnknownRouteDoesNotResolve(): void
  {
    $results = $this->app
      ->getRouteResolver()
      ->computeRoutingResults('/definitely-not-a-route', 'GET');

    $this->assertNull($results->getRouteIdentifier());
  }
}
