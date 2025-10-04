<?php
namespace App\Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Repositories\SearchRepository;
use PDO;
use PDOStatement;

class SearchRepositoryFulltextTest extends TestCase
{
    public function testFulltextSqlUsesMatchAgainst()
    {
        $stmt = $this->createMock(PDOStatement::class);
        $pdo = $this->createMock(PDO::class);

        $pdo->expects($this->once())
            ->method('prepare')
            ->with($this->callback(function ($sql) {
                $normalized = preg_replace('/\s+/', ' ', $sql);
                return strpos($normalized, 'MATCH (title, summary, skills) AGAINST') !== false;
            }))
            ->willReturn($stmt);

        $repo = new SearchRepository($pdo);
        $repo->search('engineer', [], 1, 20);

        $this->assertTrue(true); // risky Test vermeiden
    }
}
