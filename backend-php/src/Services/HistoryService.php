<?php
namespace App\Services;

use PDO;

class HistoryService
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function addHistory($data)
    {
        $stmt = $this->db->prepare("INSERT INTO history (resumeId, description) VALUES (:resumeId, :description)");
        $stmt->execute(['resumeId' => $data['resumeId'], 'description' => $data['description']]);
        return ['success' => true];
    }

    public function getHistoryByResume($resumeId)
    {
        $stmt = $this->db->prepare("SELECT * FROM history WHERE resumeId = :resumeId");
        $stmt->execute(['resumeId' => $resumeId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
