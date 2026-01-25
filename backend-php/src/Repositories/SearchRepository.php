<?php
namespace App\Repositories;

use PDO;

class SearchRepository
{

    public function __construct(private PDO $pdo)
    {}

    public function search(string $term, array $filters = [], int $page = 1, int $limit = 20): array
    {
        $driver = $this->pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

        if ($driver === 'sqlite') {
            // SQLite doesn't support MySQL FULLTEXT `MATCH ... AGAINST` syntax.
            // Use simple LIKE-based search for tests running on sqlite::memory:
            $sql = "SELECT * FROM resumes WHERE title LIKE :term OR summary LIKE :term OR skills LIKE :term LIMIT :limit OFFSET :offset";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindValue(':term', '%' . $term . '%', PDO::PARAM_STR);
        } else {
            // Default to MySQL fulltext search when available
            $sql = "SELECT * FROM resumes WHERE MATCH (title, summary, skills) AGAINST (:term IN BOOLEAN MODE) LIMIT :limit OFFSET :offset";
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindValue(':term', $term, PDO::PARAM_STR);
        }

        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', ($page - 1) * $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
