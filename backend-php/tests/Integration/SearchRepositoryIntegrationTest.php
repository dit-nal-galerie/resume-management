<?php
use PHPUnit\Framework\TestCase;
class SearchRepositoryIntegrationTest extends TestCase
{
    private $pdo;
    protected function setUp(): void
    {
        // Passe DSN an deine Test-DB an 
        $this->pdo = new PDO('mysql:host=127.0.0.1;dbname=resume_test', 'test', 'test', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        // Transaktion für saubere Tests
        $this->pdo->beginTransaction();
        // Seed-Beispiele 
        $this->pdo->exec("DELETE FROM resumes");
        $this->pdo->exec(" INSERT INTO resumes (title, summary, skills, status) VALUES ('Senior PHP Developer', 'Erfahrung mit PHP, Laravel', 'php,laravel,sql', 'active'), ('Frontend Engineer', 'React, TypeScript', 'react,typescript,frontend', 'active') ");
    }
    protected function tearDown(): void
    {
        $this->pdo->rollBack();
        $this->pdo = null;
    }
    public function testSearchReturnsResults()
    {
        $repo = new SearchRepository($this->pdo);
        $results = $repo->search('PHP', [], 1, 10);
        $this->assertIsArray($results);
        $this->assertNotEmpty($results);
    }
} ?>