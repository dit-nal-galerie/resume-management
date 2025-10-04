<?php
use PHPUnit\Framework\TestCase;
use App\Services\ResumeService;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class ResumeServiceTest extends TestCase
{
<<<<<<< HEAD
    private $service;
=======
  private $dbMock;
  private $resumeService;
>>>>>>> stash

<<<<<<< HEAD
    protected function setUp(): void
    {
        $pdo = new PDO('sqlite::memory:');
        $pdo->exec("CREATE TABLE resumes (resumeId INTEGER PRIMARY KEY, title TEXT)");
        $pdo->exec("INSERT INTO resumes (resumeId,title) VALUES (1,'Test Resume')");
        $this->service = new ResumeService($pdo);
    }
=======
  protected function setUp(): void
  {
    // Erstellen Sie einen Mock für das PDO-Objekt
    $this->dbMock = $this->createMock(PDO::class);

    // Erstellen Sie eine Instanz des Service mit dem Mock
    $this->resumeService = new ResumeService($this->dbMock);
  }
>>>>>>> stash

<<<<<<< HEAD
    public function testGetResumes()
    {
        $resumes = $this->service->getResumesWithUsers();
        $this->assertCount(1, $resumes);
    }
=======
  public function testUpdateOrCreateResume_insertsNewRecordSuccessfully()
  {
    // Mocking der auth-Funktion
    $requestMock = $this->createMock(Request::class);
    $requestMock->method('getHeaderLine')->willReturn('Bearer testtoken');
    $requestMock->method('getParsedBody')->willReturn([
      'position' => 'Senior Developer',
      'company' => [
        'name' => 'Tech Solutions Inc.'
      ],
      'stateId' => 1
    ]);
>>>>>>> stash

<<<<<<< HEAD
    public function testCreateOrUpdateResume()
    {
        $data = ['resumeId' => 2, 'title' => 'New'];
        $result = $this->service->updateOrCreateResume($data);
        $this->assertTrue($result['success']);
    }
}
=======
    // Mocking der resolveUserIds-Methode
    $stmtUserMock = $this->createMock(PDOStatement::class);
    $stmtUserMock->method('fetch')->willReturn([
      'userid' => 1,
      'loginid' => 1
    ]);
    $this->dbMock->method('prepare')
      ->with('SELECT userid, loginid FROM users WHERE userid=:id OR loginid=:id LIMIT 1')
      ->willReturn($stmtUserMock);

    // Mocking des ersten INSERT (für die Firma)
    $stmtCompanyMock = $this->createMock(PDOStatement::class);
    $this->dbMock->method('prepare')
      ->with('INSERT INTO companies (name, city, street, houseNumber, postalCode, isrecruter, ref) VALUES (:name,:city,:street,:houseNumber,:postalCode,:isrecruter,:ref)')
      ->willReturn($stmtCompanyMock);

    // Mocking des zweiten INSERT (für das Resume)
    $stmtResumeMock = $this->createMock(PDOStatement::class);
    $this->dbMock->method('prepare')
      ->with('INSERT INTO resumes (ref, position, link, comment, companyId, parentCompanyId, contactCompanyId, contactParentCompanyId, created) VALUES (:userid, :position, :link, :comment, :companyId, :recrutingCompanyId, :contactCompanyId, :contactRecrutingId, NOW())')
      ->willReturn($stmtResumeMock);

    // Mocking des letzten INSERT (für die Historie)
    $stmtHistoryMock = $this->createMock(PDOStatement::class);
    $this->dbMock->method('prepare')
      ->with('INSERT INTO history (resumeid, stateid, date) VALUES (:rid,:sid,:dt)')
      ->willReturn($stmtHistoryMock);

    // Mocking der lastInsertId Methode
    $this->dbMock->method('lastInsertId')->willReturn(10);

    // Mocking der Transaktion
    $this->dbMock->method('beginTransaction')->willReturn(true);
    $this->dbMock->method('commit')->willReturn(true);

    // Erstellen Sie ein Mock für die Response
    $responseMock = $this->createMock(Response::class);
    $responseMock->method('withStatus')->willReturnSelf();
    $responseMock->method('withHeader')->willReturnSelf();
    $responseMock->method('getBody')->willReturn(new MockStream());

    // Führen Sie die Methode aus, die wir testen wollen
    $result = $this->resumeService->updateOrCreateResume($requestMock, $responseMock);

    // Überprüfen Sie, ob die Methode erfolgreich war
    $this->assertEquals(200, $result->getStatusCode());
    $this->assertStringContainsString('{"success":true,"resumeId":10}', (string) $result->getBody());
  }
}
>>>>>>> stash
