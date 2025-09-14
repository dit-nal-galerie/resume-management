<?php
use PHPUnit\Framework\TestCase;
use App\Services\UserService;
use App\Config\DB;

class UserServiceTest extends TestCase
{
  private $service;

  protected function setUp(): void
  {
    $pdo = new PDO('sqlite::memory:');
    $pdo->exec(
      'CREATE TABLE authentification (id INTEGER PRIMARY KEY, loginname TEXT, password TEXT)',
    );
    $hash = password_hash('secret', PASSWORD_DEFAULT);
    $pdo->exec("INSERT INTO authentification (loginname,password) VALUES ('john', '$hash')");
    $pdo->exec('CREATE TABLE users (userid INTEGER PRIMARY KEY, loginid INTEGER, name TEXT)');
    $pdo->exec("INSERT INTO users (loginid,name) VALUES (1,'John Doe')");
    $this->service = new UserService($pdo);
  }

  public function testLoginSuccess()
  {
    $result = $this->service->login(['loginname' => 'john', 'password' => 'secret']);
    $this->assertArrayHasKey('token', $result);
    $this->assertEquals('John Doe', $result['name']);
  }

  public function testLoginFailure()
  {
    $result = $this->service->login(['loginname' => 'john', 'password' => 'wrong']);
    $this->assertFalse($result['success'] ?? false);
  }

  public function testGetUserProfile()
  {
    $profile = $this->service->getUserProfile(1);
    $this->assertTrue($profile['success']);
    $this->assertEquals('John Doe', $profile['user']['name']);
  }
}
