<?php
use PHPUnit\Framework\TestCase;
use App\Services\PasswordResetService;

class PasswordResetServiceTest extends TestCase
{
  private PasswordResetService $service;
  private PDO $pdo;

  protected function setUp(): void
  {
    $this->pdo = new PDO('sqlite::memory:');
    $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $this->pdo->exec(
      'CREATE TABLE authentification (id INTEGER PRIMARY KEY AUTOINCREMENT, loginname TEXT, password TEXT)',
    );
    // sendResetEmail() joint authentification mit users
    $this->pdo->exec(
      'CREATE TABLE users (
        userid INTEGER PRIMARY KEY AUTOINCREMENT,
        loginid INTEGER,
        name TEXT,
        email TEXT
      )',
    );
    $this->pdo->exec(
      'CREATE TABLE password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        expires_at_timestamp INTEGER NOT NULL,
        is_used INTEGER DEFAULT 0
      )',
    );

    $hash = password_hash('old-secret', PASSWORD_DEFAULT);
    $this->pdo->exec("INSERT INTO authentification (loginname, password) VALUES ('john', '$hash')");

    // Config-Array reicht: Erfolgspfad mit echtem Mailversand wird hier nicht getestet
    $this->service = new PasswordResetService($this->pdo, []);
  }

  private function insertToken(string $token, int $expiresAt, int $isUsed = 0): void
  {
    $stmt = $this->pdo->prepare(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at_timestamp, is_used)
       VALUES (1, :token, :expires, :used)',
    );
    $stmt->execute(['token' => $token, 'expires' => $expiresAt, 'used' => $isUsed]);
  }

  public function testSendResetEmailUserNotFound(): void
  {
    $result = $this->service->sendResetEmail('nobody@example.com', 'unknown');

    $this->assertIsArray($result);
    $this->assertFalse($result['success']);
    $this->assertSame('User not found', $result['error']);
  }

  public function testValidateToken(): void
  {
    $this->insertToken('valid-token', time() + 3600);
    $this->insertToken('expired-token', time() - 3600);
    $this->insertToken('used-token', time() + 3600, 1);

    $this->assertTrue($this->service->validateToken('valid-token'));
    $this->assertFalse($this->service->validateToken('expired-token'));
    $this->assertFalse($this->service->validateToken('used-token'));
    $this->assertFalse($this->service->validateToken('unknown-token'));
  }

  public function testResetPassword(): void
  {
    $this->insertToken('reset-token', time() + 3600);

    $result = $this->service->resetPassword('reset-token', 'new-password');
    $this->assertTrue($result['success']);

    $row = $this->pdo
      ->query("SELECT password FROM authentification WHERE loginname = 'john'")
      ->fetch(PDO::FETCH_ASSOC);
    $this->assertTrue(password_verify('new-password', $row['password']));

    // Token ist single-use
    $used = $this->pdo
      ->query("SELECT is_used FROM password_reset_tokens WHERE token = 'reset-token'")
      ->fetchColumn();
    $this->assertSame(1, (int) $used);
    $this->assertFalse($this->service->validateToken('reset-token'));
  }

  public function testResetPasswordInvalidToken(): void
  {
    $result = $this->service->resetPassword('nope', 'new-password');

    $this->assertFalse($result['success']);
    $this->assertArrayHasKey('error', $result);
  }
}
