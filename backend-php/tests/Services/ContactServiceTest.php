<?php
use PHPUnit\Framework\TestCase;
use App\Services\ContactService;

class ContactServiceTest extends TestCase
{
  use TestHelpers;

  private ContactService $service;

  protected function setUp(): void
  {
    $pdo = new PDO('sqlite::memory:');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // resolveUserIds() braucht die users-Tabelle
    $pdo->exec(
      'CREATE TABLE users (userid INTEGER PRIMARY KEY AUTOINCREMENT, loginid INTEGER, name TEXT)',
    );
    $pdo->exec("INSERT INTO users (userid, loginid, name) VALUES (1, 1, 'John Doe')");

    $pdo->exec(
      'CREATE TABLE contacts (
        contactid INTEGER PRIMARY KEY AUTOINCREMENT,
        vorname TEXT,
        name TEXT NOT NULL,
        email TEXT,
        anrede INTEGER,
        title TEXT,
        zusatzname TEXT,
        phone TEXT,
        mobile TEXT,
        company INTEGER,
        ref INTEGER
      )',
    );

    $this->service = new ContactService($pdo);
  }

  public function testGetContactsRequiresAuth(): void
  {
    $request = $this->makeRequest('GET', '/contacts');
    $response = $this->service->getContacts($request, $this->makeResponse());

    $this->assertSame(401, $response->getStatusCode());
    $this->assertFalse($this->jsonBody($response)['success']);
  }

  public function testCreateContactRequiresFields(): void
  {
    $request = $this->makeAuthRequest('POST', '/addContact', ['vorname' => 'Max']);
    $response = $this->service->createOrUpdateContact($request, $this->makeResponse());

    $this->assertSame(400, $response->getStatusCode());
    $this->assertFalse($this->jsonBody($response)['success']);
  }

  public function testCreateContact(): void
  {
    $request = $this->makeAuthRequest('POST', '/addContact', [
      'vorname' => 'Max',
      'name' => 'Mustermann',
      'email' => 'max@example.com',
      'anrede' => 1,
      'company' => 5,
    ]);
    $response = $this->service->createOrUpdateContact($request, $this->makeResponse());

    $this->assertSame(201, $response->getStatusCode());
    $body = $this->jsonBody($response);
    $this->assertTrue($body['success']);
    $this->assertGreaterThan(0, $body['contactid']);

    $getResponse = $this->service->getContacts(
      $this->makeAuthRequest('GET', '/contacts', [], ['companyId' => 5]),
      $this->makeResponse(),
    );
    $rows = $this->jsonBody($getResponse);

    $this->assertCount(1, $rows);
    $this->assertSame('Mustermann', $rows[0]['name']);
    $this->assertSame(1, (int) $rows[0]['ref']);
  }

  public function testUpdateContact(): void
  {
    $create = $this->service->createOrUpdateContact(
      $this->makeAuthRequest('POST', '/addContact', [
        'vorname' => 'Max',
        'name' => 'Mustermann',
        'email' => 'max@example.com',
        'anrede' => 1,
        'company' => 5,
      ]),
      $this->makeResponse(),
    );
    $contactid = $this->jsonBody($create)['contactid'];

    $update = $this->service->createOrUpdateContact(
      $this->makeAuthRequest('POST', '/addContact', [
        'contactid' => $contactid,
        'vorname' => 'Max',
        'name' => 'Musterfrau',
        'email' => 'max@example.com',
        'anrede' => 1,
        'company' => 5,
      ]),
      $this->makeResponse(),
    );

    $this->assertSame(200, $update->getStatusCode());
    $body = $this->jsonBody($update);
    $this->assertTrue($body['success']);
    $this->assertSame($contactid, $body['contactid']);

    $getResponse = $this->service->getContacts(
      $this->makeAuthRequest('GET', '/contacts', [], ['companyId' => 5]),
      $this->makeResponse(),
    );
    $rows = $this->jsonBody($getResponse);

    $this->assertCount(1, $rows);
    $this->assertSame('Musterfrau', $rows[0]['name']);
  }
}
