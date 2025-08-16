<?php
use PHPUnit\Framework\TestCase;
use App\Services\ResumeService;

class ResumeServiceTest extends TestCase
{
    private $service;

    protected function setUp(): void
    {
        $pdo = new PDO('sqlite::memory:');
        $pdo->exec("CREATE TABLE resumes (resumeId INTEGER PRIMARY KEY, title TEXT)");
        $pdo->exec("INSERT INTO resumes (resumeId,title) VALUES (1,'Test Resume')");
        $this->service = new ResumeService($pdo);
    }

    public function testGetResumes()
    {
        $resumes = $this->service->getResumesWithUsers();
        $this->assertCount(1, $resumes);
    }

    public function testCreateOrUpdateResume()
    {
        $data = ['resumeId' => 2, 'title' => 'New'];
        $result = $this->service->updateOrCreateResume($data);
        $this->assertTrue($result['success']);
    }
}
