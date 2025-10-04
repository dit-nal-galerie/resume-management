<?php
namespace App\Repositories;

use PDO;

class SearchRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function search(string $term, array $filters = [], int $page = 1, int $limit = 20): array
    {
        $sql = "SELECT * FROM resumes WHERE MATCH (title, summary, skills) AGAINST (:term IN BOOLEAN MODE) LIMIT :limit OFFSET :offset";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(':term', $term);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', ($page - 1) * $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
