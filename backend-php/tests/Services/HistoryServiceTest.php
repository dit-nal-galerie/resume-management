<?php
use PHPUnit\Framework\TestCase;
use App\Services\HistoryService;

class HistoryServiceTest extends TestCase
{
  use TestHelpers;

  private HistoryService $service;
  private PDO $pdo;

  protected function setUp(): void
  {
    $this->pdo = new PDO('sqlite::memory:');
    $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $this->pdo->exec(
      'CREATE TABLE resumes (resumeId INTEGER PRIMARY KEY AUTOINCREMENT, ref INTEGER)',
    );
    $this->pdo->exec('CREATE TABLE states (stateid INTEGER PRIMARY KEY, text TEXT)');
    $this->pdo->exec(
      'CREATE TABLE history (
        historyid INTEGER PRIMARY KEY AUTOINCREMENT,
        resumeid INTEGER,
        date TEXT,
        stateid INTEGER
      )',
    );

    $this->service = new HistoryService($this->pdo);
  }

  public function testAddHistory(): void
  {
    $request = $this->makeAuthRequest('POST', '/addHistory', [
      'resume_id' => 1,
      'description' => 10,
    ]);
    $response = $this->service->addHistory($request, $this->makeResponse());

    $this->assertSame(201, $response->getStatusCode());
    $body = $this->jsonBody($response);
    $this->assertTrue($body['success']);

    $count = $this->pdo->query('SELECT COUNT(*) FROM history')->fetchColumn();
    $date = $this->pdo->query('SELECT date FROM history')->fetchColumn();
    $this->assertSame(1, (int) $count);
    $this->assertNotEmpty($date); // date ist NOT NULL und wird jetzt mitgeschrieben
  }

  public function testAddHistoryRequiresFields(): void
  {
    $request = $this->makeAuthRequest('POST', '/addHistory', ['resume_id' => 1]);
    $response = $this->service->addHistory($request, $this->makeResponse());

    $this->assertSame(400, $response->getStatusCode());
    $this->assertFalse($this->jsonBody($response)['success']);
  }

  public function testGetHistoryByResume(): void
  {
    $this->pdo->exec('INSERT INTO resumes (resumeId, ref) VALUES (1, 1)');
    $this->pdo->exec("INSERT INTO states (stateid, text) VALUES (10, 'gesendet')");
    $this->pdo->exec("INSERT INTO history (resumeid, date, stateid) VALUES (1, '2026-01-01', 10)");

    $request = $this->makeAuthRequest('GET', '/getHistoryByResume', [], ['resumeId' => 1]);
    $response = $this->service->getHistoryByResume($request, $this->makeResponse());

    $this->assertSame(200, $response->getStatusCode());
    $entries = $this->jsonBody($response);
    $this->assertCount(1, $entries);
    $this->assertSame('gesendet', $entries[0]['status']);
  }

  public function testGetHistoryRequiresAuth(): void
  {
    $request = $this->makeRequest('GET', '/getHistoryByResume', [], ['resumeId' => 1]);
    $response = $this->service->getHistoryByResume($request, $this->makeResponse());

    $this->assertSame(400, $response->getStatusCode());
  }

  public function testGetHistoryWithoutPermission(): void
  {
    // Resume gehört einem anderen User (ref = 99), JWT sagt loginid = 1
    $this->pdo->exec('INSERT INTO resumes (resumeId, ref) VALUES (1, 99)');

    $request = $this->makeAuthRequest('GET', '/getHistoryByResume', [], ['resumeId' => 1]);
    $response = $this->service->getHistoryByResume($request, $this->makeResponse());

    $this->assertSame(403, $response->getStatusCode());
    $this->assertFalse($this->jsonBody($response)['success'] ?? false);
  }
}
