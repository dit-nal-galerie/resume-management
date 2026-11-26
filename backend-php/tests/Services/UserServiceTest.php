<?php
use PHPUnit\Framework\TestCase;
use App\Services\UserService;

class UserServiceTest extends TestCase
{
  use TestHelpers;

  private UserService $service;
  private PDO $pdo;

  protected function setUp(): void
  {
    $this->pdo = new PDO('sqlite::memory:');
    $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Alle Spalten, die das User-SELECT in UserService::login() braucht
    $this->pdo->exec(
      'CREATE TABLE authentification (id INTEGER PRIMARY KEY AUTOINCREMENT, loginname TEXT, password TEXT)',
    );
    $hash = password_hash('secret', PASSWORD_DEFAULT);
    $this->pdo->exec("INSERT INTO authentification (loginname, password) VALUES ('john', '$hash')");

    $this->pdo->exec(
      'CREATE TABLE users (
        userid INTEGER PRIMARY KEY AUTOINCREMENT,
        loginid INTEGER,
        name TEXT,
        email TEXT,
        anrede INTEGER,
        city TEXT,
        street TEXT,
        houseNumber TEXT,
        postalCode TEXT,
        phone TEXT,
        mobile TEXT
      )',
    );
    $this->pdo->exec(
      "INSERT INTO users (loginid, name, email, anrede, city, street, houseNumber, postalCode)
       VALUES (1, 'John Doe', 'john@example.com', 1, 'Teststadt', 'Teststrasse', '1', '12345')",
    );

    $this->service = new UserService($this->pdo, 'test-secret');
  }

  public function testLoginSuccess(): void
  {
    $result = $this->service->login(['loginname' => 'john', 'password' => 'secret']);
    $this->assertArrayHasKey('token', $result);
    $this->assertEquals('John Doe', $result['name']);
  }

  public function testLoginFailure(): void
  {
    $result = $this->service->login(['loginname' => 'john', 'password' => 'wrong']);
    $this->assertFalse($result['success'] ?? false);
  }

  public function testGetUserProfile(): void
  {
    $profile = $this->service->getUserProfile(1);
    $this->assertTrue($profile['success']);
    $this->assertEquals('John Doe', $profile['user']['name']);
  }

  /* ----------------------------------------------------------------------
   * createOrUpdateUser – Validierung
   * -------------------------------------------------------------------- */

  public function testCreateOrUpdateUserRequiresEmail(): void
  {
    $response = $this->service->createOrUpdateUser(['isNew' => true], $this->makeResponse());

    $this->assertSame(400, $response->getStatusCode());
    $this->assertSame(
      'backend.error.validation.missingRequiredFields',
      $this->jsonBody($response)['message'],
    );
  }

  public function testCreateUserRequiresLoginDataWhenNew(): void
  {
    $response = $this->service->createOrUpdateUser(
      ['isNew' => true, 'email' => 'jane@example.com'],
      $this->makeResponse(),
    );

    $this->assertSame(400, $response->getStatusCode());
    $this->assertSame(
      'backend.error.validation.missingRequiredFields',
      $this->jsonBody($response)['message'],
    );
  }

  /* ----------------------------------------------------------------------
   * createOrUpdateUser – neuen Nutzer anlegen
   * -------------------------------------------------------------------- */

  public function testCreateUserRejectsPasswordMismatch(): void
  {
    $response = $this->service->createOrUpdateUser(
      [
        'isNew' => true,
        'loginname' => 'jane',
        'password' => 'first',
        'password2' => 'second',
        'email' => 'jane@example.com',
      ],
      $this->makeResponse(),
    );

    $this->assertSame(400, $response->getStatusCode());
    $this->assertSame(
      'backend.error.validation.passwordMismatch',
      $this->jsonBody($response)['message'],
    );
  }

  public function testCreateUserRejectsDuplicateLoginname(): void
  {
    $response = $this->service->createOrUpdateUser(
      [
        'isNew' => true,
        'loginname' => 'john',
        'password' => 'pw',
        'password2' => 'pw',
        'email' => 'other@example.com',
      ],
      $this->makeResponse(),
    );

    $this->assertSame(409, $response->getStatusCode());
    $this->assertSame(
      'backend.error.validation.userAlreadyExists',
      $this->jsonBody($response)['message'],
    );
    $this->assertSame(
      1,
      (int) $this->pdo->query('SELECT COUNT(*) FROM authentification')->fetchColumn(),
    );
  }

  public function testCreateUserRejectsTakenEmail(): void
  {
    $response = $this->service->createOrUpdateUser(
      [
        'isNew' => true,
        'loginname' => 'jane',
        'password' => 'pw',
        'password2' => 'pw',
        'email' => 'john@example.com',
      ],
      $this->makeResponse(),
    );

    $this->assertSame(409, $response->getStatusCode());
    $this->assertSame('backend.error.conflict.emailTaken', $this->jsonBody($response)['message']);
    $this->assertSame(1, (int) $this->pdo->query('SELECT COUNT(*) FROM users')->fetchColumn());
  }

  public function testCreateUserSucceeds(): void
  {
    $response = $this->service->createOrUpdateUser(
      [
        'isNew' => true,
        'loginname' => 'jane',
        'password' => 'geheim',
        'password2' => 'geheim',
        'email' => 'jane@example.com',
        'name' => 'Jane Doe',
        'city' => 'Musterstadt',
      ],
      $this->makeResponse(),
    );

    $this->assertSame(201, $response->getStatusCode());
    $body = $this->jsonBody($response);
    $this->assertTrue($body['success']);

    $auth = $this->pdo
      ->query("SELECT id, loginname, password FROM authentification WHERE loginname = 'jane'")
      ->fetch(PDO::FETCH_ASSOC);
    $this->assertNotFalse($auth);
    $this->assertSame('jane', $auth['loginname']);
    $this->assertTrue(password_verify('geheim', $auth['password']));

    $user = $this->pdo
      ->query("SELECT loginid, name, email, city FROM users WHERE email = 'jane@example.com'")
      ->fetch(PDO::FETCH_ASSOC);
    $this->assertNotFalse($user);
    $this->assertSame((int) $auth['id'], (int) $user['loginid']);
    $this->assertSame('Jane Doe', $user['name']);
    $this->assertSame('jane@example.com', $user['email']);
    $this->assertSame('Musterstadt', $user['city']);
  }

  /* ----------------------------------------------------------------------
   * createOrUpdateUser – bestehenden Nutzer aktualisieren
   * -------------------------------------------------------------------- */

  public function testUpdateUserRequiresToken(): void
  {
    $response = $this->service->createOrUpdateUser(
      ['isNew' => false, 'email' => 'john@example.com', 'password' => 'secret'],
      $this->makeResponse(),
    );

    $this->assertSame(401, $response->getStatusCode());
    $this->assertSame('backend.error.auth.missingToken', $this->jsonBody($response)['message']);
  }

  public function testUpdateUserRejectsInvalidToken(): void
  {
    $response = $this->service->createOrUpdateUser(
      [
        'isNew' => false,
        'email' => 'john@example.com',
        'password' => 'secret',
        'token' => 'kaputtes-token',
      ],
      $this->makeResponse(),
    );

    $this->assertSame(401, $response->getStatusCode());
    $this->assertSame('backend.error.auth.invalidToken', $this->jsonBody($response)['message']);
  }

  public function testUpdateUserRejectsWrongPassword(): void
  {
    $response = $this->service->createOrUpdateUser(
      [
        'isNew' => false,
        'email' => 'john@example.com',
        'password' => 'falsch',
        'token' => $this->makeToken(['loginid' => 1]),
      ],
      $this->makeResponse(),
    );

    $this->assertSame(401, $response->getStatusCode());
    $this->assertSame('backend.error.auth.invalidPassword', $this->jsonBody($response)['message']);
  }

  public function testUpdateUserSucceeds(): void
  {
    $response = $this->service->createOrUpdateUser(
      [
        'isNew' => false,
        'email' => 'john.neu@example.com',
        'password' => 'secret',
        'token' => $this->makeToken(['loginid' => 1]),
        'name' => 'John Neu',
        'city' => 'Neustadt',
      ],
      $this->makeResponse(),
    );

    $this->assertSame(200, $response->getStatusCode());
    $body = $this->jsonBody($response);
    $this->assertTrue($body['success']);
    $this->assertSame('User updated', $body['message']);

    $user = $this->pdo
      ->query('SELECT name, email, city FROM users WHERE loginid = 1')
      ->fetch(PDO::FETCH_ASSOC);
    $this->assertSame('John Neu', $user['name']);
    $this->assertSame('john.neu@example.com', $user['email']);
    $this->assertSame('Neustadt', $user['city']);
  }

  public function testUpdateUserRejectsTokenForUnknownLoginid(): void
  {
    $response = $this->service->createOrUpdateUser(
      [
        'isNew' => false,
        'email' => 'x@example.com',
        'password' => 'secret',
        'token' => $this->makeToken(['loginid' => 999]),
      ],
      $this->makeResponse(),
    );

    // Kein authentification-Eintrag für loginid 999 → Passwortprüfung schlägt fehl
    $this->assertSame(401, $response->getStatusCode());
    $this->assertSame('backend.error.auth.invalidPassword', $this->jsonBody($response)['message']);
  }
}
