<?php
namespace App\Services;

use PDO;

class ResumeService
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getResumesWithUsers()
    {
        $stmt = $this->db->query("
            SELECT r.*, u.name
            FROM resumes r
            JOIN users u ON r.userId = u.userid
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getStates()
    {
        $stmt = $this->db->query("SELECT * FROM states");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateOrCreateResume($data)
    {
        $id = $data['resumeId'] ?? 0;
        if ($id > 0) {
            $stmt = $this->db->prepare("UPDATE resumes SET title = :title WHERE resumeId = :resumeId");
            $stmt->execute(['title' => $data['title'], 'resumeId' => $id]);
        } else {
            $stmt = $this->db->prepare("INSERT INTO resumes (title) VALUES (:title)");
            $stmt->execute(['title' => $data['title']]);
        }
        return ['success' => true];
    }

    public function getResumeById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM resumes WHERE resumeId = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
