<?php
use PHPUnit\Framework\TestCase;
use App\Repositories\SearchRepository;

class SearchRepositoryIntegrationTest extends TestCase
{

    private $pdo;

    protected function setUp(): void
    {
        // Allow tests to use a real DB via env or fall back to SQLite in-memory
        $dsn = getenv('TEST_DB_DSN') ?: 'sqlite::memory:';
        $user = getenv('TEST_DB_USER') ?: null;
        $pass = getenv('TEST_DB_PASS') ?: null;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ];

        if ($user === null) {
            $this->pdo = new PDO($dsn, null, null, $options);
        } else {
            $this->pdo = new PDO($dsn, $user, $pass, $options);
        }

        // If we're using SQLite in-memory, ensure the `resumes` table exists
        if (str_starts_with($dsn, 'sqlite')) {
            $this->pdo->exec(<<<'SQL'
            CREATE TABLE IF NOT EXISTS resumes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                summary TEXT,
                skills TEXT,
                status TEXT
            );
            SQL);
        }

        // Transaktion für saubere Tests
        $this->pdo->beginTransaction();

        // Seed-Beispiele
        $this->pdo->exec("DELETE FROM resumes");
        $this->pdo->exec("INSERT INTO resumes (title, summary, skills, status) VALUES ('Senior PHP Developer', 'Erfahrung mit PHP, Laravel', 'php,laravel,sql', 'active'), ('Frontend Engineer', 'React, TypeScript', 'react,typescript,frontend', 'active')");
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
}
?>