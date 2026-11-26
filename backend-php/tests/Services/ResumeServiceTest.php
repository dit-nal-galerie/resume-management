<?php
use PHPUnit\Framework\TestCase;
use App\Services\ResumeService;

class ResumeServiceTest extends TestCase
{
  use TestHelpers;

  private ResumeService $service;
  private PDO $pdo;

  protected function setUp(): void
  {
    $this->pdo = new PDO('sqlite::memory:');
    $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $this->pdo->exec(
      'CREATE TABLE users (
        userid INTEGER PRIMARY KEY AUTOINCREMENT,
        loginid INTEGER,
        name TEXT
      )',
    );
    $this->pdo->exec("INSERT INTO users (userid, loginid, name) VALUES (1, 1, 'John Doe')");

    $this->pdo->exec(
      'CREATE TABLE companies (
        companyId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        city TEXT,
        street TEXT,
        houseNumber TEXT,
        postalCode TEXT,
        isrecruter INTEGER DEFAULT 0,
        ref INTEGER
      )',
    );

    $this->pdo->exec(
      'CREATE TABLE contacts (
        contactid INTEGER PRIMARY KEY AUTOINCREMENT,
        anrede INTEGER,
        title TEXT,
        vorname TEXT,
        zusatzname TEXT,
        name TEXT,
        email TEXT,
        phone TEXT,
        mobile TEXT,
        company INTEGER,
        ref INTEGER
      )',
    );

    $this->pdo->exec(
      'CREATE TABLE resumes (
        resumeId INTEGER PRIMARY KEY AUTOINCREMENT,
        ref INTEGER,
        position TEXT,
        stateId INTEGER DEFAULT 0,
        link TEXT,
        comment TEXT,
        companyId INTEGER,
        parentCompanyId INTEGER,
        contactCompanyId INTEGER,
        contactParentCompanyId INTEGER,
        created TEXT
      )',
    );

    $this->pdo->exec(
      'CREATE TABLE history (
        historyid INTEGER PRIMARY KEY AUTOINCREMENT,
        resumeid INTEGER,
        date TEXT,
        stateid INTEGER
      )',
    );

    $this->service = new ResumeService($this->pdo);
  }

  public function testUpdateOrCreateResumeRequiresAuth(): void
  {
    $request = $this->makeRequest('POST', '/updateOrCreateResume', ['position' => 'Dev']);
    $response = $this->service->updateOrCreateResume($request, $this->makeResponse());

    $this->assertSame(401, $response->getStatusCode());
    $this->assertFalse($this->jsonBody($response)['success']);
  }

  public function testInsertResumeSuccessfully(): void
  {
    $request = $this->makeAuthRequest('POST', '/updateOrCreateResume', [
      'position' => 'Senior Developer',
      'company' => ['name' => 'Tech Solutions Inc.'],
      'stateId' => 1,
    ]);
    $response = $this->service->updateOrCreateResume($request, $this->makeResponse());

    $this->assertSame(200, $response->getStatusCode());
    $body = $this->jsonBody($response);
    $this->assertTrue($body['success']);
    $this->assertGreaterThan(0, $body['resumeId']);

    // Firma angelegt
    $companies = (int) $this->pdo->query('SELECT COUNT(*) FROM companies')->fetchColumn();
    $this->assertSame(1, $companies);

    // Resume inkl. stateId angelegt (Node-Parität; war vorher nicht enthalten)
    $resume = $this->pdo
      ->query('SELECT ref, position, stateId, created FROM resumes')
      ->fetch(PDO::FETCH_ASSOC);
    $this->assertSame(1, (int) $resume['ref']);
    $this->assertSame('Senior Developer', $resume['position']);
    $this->assertSame(1, (int) $resume['stateId']);
    $this->assertNotEmpty($resume['created']);

    // History-Eintrag, weil stateId > 0
    $history = (int) $this->pdo->query('SELECT COUNT(*) FROM history')->fetchColumn();
    $this->assertSame(1, $history);
  }

  public function testUpdateResumeSuccessfully(): void
  {
    $this->pdo->exec(
      "INSERT INTO resumes (resumeId, ref, position, stateId, created)
       VALUES (7, 1, 'Old Position', 0, '2026-01-01 10:00:00')",
    );

    $request = $this->makeAuthRequest('POST', '/updateOrCreateResume', [
      'resumeId' => 7,
      'position' => 'New Position',
      'stateId' => 20,
    ]);
    $response = $this->service->updateOrCreateResume($request, $this->makeResponse());

    $this->assertSame(200, $response->getStatusCode());
    $body = $this->jsonBody($response);
    $this->assertTrue($body['success']);
    $this->assertSame(7, $body['resumeId']);

    $resume = $this->pdo
      ->query('SELECT position, stateId FROM resumes WHERE resumeId = 7')
      ->fetch(PDO::FETCH_ASSOC);
    $this->assertSame('New Position', $resume['position']);
    $this->assertSame(20, (int) $resume['stateId']);
  }

  /* ----------------------------------------------------------------------
   * changeResumeStatus
   * -------------------------------------------------------------------- */

  private function insertResume(int $id, int $ref, int $stateId): void
  {
    $st = $this->pdo->prepare(
      'INSERT INTO resumes (resumeId, ref, position, stateId, created)
       VALUES (:id, :ref, :pos, :sid, :created)',
    );
    $st->execute([
      'id' => $id,
      'ref' => $ref,
      'pos' => 'Entwickler',
      'sid' => $stateId,
      'created' => '2026-01-01 10:00:00',
    ]);
  }

  public function testChangeResumeStatusRequiresToken(): void
  {
    $request = $this->makeRequest('POST', '/changeResumeStatus', [
      'resumeId' => 1,
      'stateId' => 2,
      'date' => '2026-02-03',
    ]);

    $response = $this->service->changeResumeStatus($request, $this->makeResponse());

    $this->assertSame(400, $response->getStatusCode());
    $this->assertSame('backend.error.validation.missingData', (string) $response->getBody());
  }

  public function testChangeResumeStatusRequiresStateAndDate(): void
  {
    $request = $this->makeAuthRequest('POST', '/changeResumeStatus', ['resumeId' => 1]);

    $response = $this->service->changeResumeStatus($request, $this->makeResponse());

    $this->assertSame(400, $response->getStatusCode());
    $this->assertSame('backend.error.validation.missingData', (string) $response->getBody());
  }

  public function testChangeResumeStatusReturns401ForUnknownUser(): void
  {
    // Token mit loginid, das in der users-Tabelle nicht existiert
    $token = $this->makeToken(['loginid' => 999]);
    $request = $this->makeRequest(
      'POST',
      '/changeResumeStatus',
      [
        'resumeId' => 1,
        'stateId' => 2,
        'date' => '2026-02-03',
      ],
      [],
      $token,
    );

    $response = $this->service->changeResumeStatus($request, $this->makeResponse());

    $this->assertSame(401, $response->getStatusCode());
    $this->assertSame('backend.error.auth.unauthorized', (string) $response->getBody());
  }

  public function testChangeResumeStatusReturns404WhenResumeMissing(): void
  {
    $request = $this->makeAuthRequest('POST', '/changeResumeStatus', [
      'resumeId' => 999,
      'stateId' => 2,
      'date' => '2026-02-03',
    ]);

    $response = $this->service->changeResumeStatus($request, $this->makeResponse());

    $this->assertSame(404, $response->getStatusCode());
    $this->assertSame('backend.error.notFound.applicationNotFound', (string) $response->getBody());
  }

  public function testChangeResumeStatusReturns403ForForeignResume(): void
  {
    // ref = 2 gehört zu einem anderen Nutzer (Test-User hat userid 1)
    $this->insertResume(10, 2, 1);

    $request = $this->makeAuthRequest('POST', '/changeResumeStatus', [
      'resumeId' => 10,
      'stateId' => 2,
      'date' => '2026-02-03',
    ]);

    $response = $this->service->changeResumeStatus($request, $this->makeResponse());

    $this->assertSame(403, $response->getStatusCode());
    $this->assertSame('backend.error.auth.noPermission', (string) $response->getBody());
  }

  public function testChangeResumeStatusReturns400WhenStateAlreadySet(): void
  {
    $this->insertResume(11, 1, 2);

    $request = $this->makeAuthRequest('POST', '/changeResumeStatus', [
      'resumeId' => 11,
      'stateId' => 2,
      'date' => '2026-02-03',
    ]);

    $response = $this->service->changeResumeStatus($request, $this->makeResponse());

    $this->assertSame(400, $response->getStatusCode());
    $this->assertSame('backend.error.conflict.statusAlreadySet', (string) $response->getBody());

    // Kein History-Eintrag bei unverändertem Status
    $history = (int) $this->pdo->query('SELECT COUNT(*) FROM history')->fetchColumn();
    $this->assertSame(0, $history);
  }

  public function testChangeResumeStatusUpdatesResumeAndWritesHistory(): void
  {
    $this->insertResume(12, 1, 1);

    $request = $this->makeAuthRequest('POST', '/changeResumeStatus', [
      'resumeId' => 12,
      'stateId' => 3,
      'date' => '2026-03-04',
    ]);

    $response = $this->service->changeResumeStatus($request, $this->makeResponse());

    $this->assertSame(200, $response->getStatusCode());
    $this->assertSame('backend.success.status.changed', (string) $response->getBody());

    $stateId = $this->pdo->query('SELECT stateId FROM resumes WHERE resumeId = 12')->fetchColumn();
    $this->assertSame(3, (int) $stateId);

    $history = $this->pdo
      ->query('SELECT resumeid, stateid, date FROM history WHERE resumeid = 12')
      ->fetch(PDO::FETCH_ASSOC);
    $this->assertSame(3, (int) $history['stateid']);
    $this->assertSame('2026-03-04', $history['date']);
  }
}
