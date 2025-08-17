<?php
use PHPUnit\Framework\TestCase;
use App\Services\HistoryService;

class HistoryServiceTest extends TestCase
{
    private $service;

    protected function setUp(): void
    {
        $pdo = new PDO('sqlite::memory:');
        $pdo->exec("CREATE TABLE history (id INTEGER PRIMARY KEY, description TEXT)");
        $this->service = new HistoryService($pdo);
    }

    public function testGetHistory()
    {
        $this->service->addHistory(['description'=>'Init']);
        $history = $this->service->getHistoryByResume(1);
        $this->assertCount(1, $history);
    }
}
