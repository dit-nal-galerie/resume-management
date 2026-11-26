<?php
use PHPUnit\Framework\TestCase;
use App\Services\CompanyService;

class CompanyServiceTest extends TestCase
{
  use TestHelpers;

  private CompanyService $service;

  protected function setUp(): void
  {
    $pdo = new PDO('sqlite::memory:');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec(
      'CREATE TABLE companies (
        companyId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        city TEXT,
        street TEXT,
        houseNumber TEXT,
        postalCode TEXT,
        isrecruter INTEGER DEFAULT 0,
        ref INTEGER
      )',
    );
    $this->service = new CompanyService($pdo);
  }

  public function testAddCompanyRequiresAuth(): void
  {
    $request = $this->makeRequest('POST', '/addCompany', ['name' => 'Acme']);
    $response = $this->service->addCompany($request, $this->makeResponse());

    $this->assertSame(401, $response->getStatusCode());
    $this->assertFalse($this->jsonBody($response)['success']);
  }

  public function testAddCompanyRequiresName(): void
  {
    $request = $this->makeAuthRequest('POST', '/addCompany', []);
    $response = $this->service->addCompany($request, $this->makeResponse());

    $this->assertSame(400, $response->getStatusCode());
    $this->assertFalse($this->jsonBody($response)['success']);
  }

  public function testAddAndGetCompanies(): void
  {
    $request = $this->makeAuthRequest('POST', '/addCompany', [
      'name' => 'Acme',
      'city' => 'Berlin',
      'street' => 'Hauptstrasse',
      'houseNumber' => '1',
      'postalCode' => '10115',
      'isRecruter' => true,
    ]);
    $response = $this->service->addCompany($request, $this->makeResponse());

    $this->assertSame(201, $response->getStatusCode());
    $body = $this->jsonBody($response);
    $this->assertTrue($body['success']);
    $this->assertGreaterThan(0, $body['companyId']);

    $getResponse = $this->service->getCompanies(
      $this->makeAuthRequest('GET', '/companies'),
      $this->makeResponse(),
    );
    $this->assertSame(200, $getResponse->getStatusCode());
    $rows = $this->jsonBody($getResponse);

    $this->assertCount(1, $rows);
    $this->assertSame('Acme', $rows[0]['name']);
    $this->assertSame(1, (int) $rows[0]['ref']);
    $this->assertSame(1, (int) $rows[0]['isRecruter']);
  }
}
