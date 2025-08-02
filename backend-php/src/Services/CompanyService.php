<?php
namespace App\Services;

use PDO;

class CompanyService
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function addCompany($data)
    {
        $stmt = $this->db->prepare("INSERT INTO companies (name) VALUES (:name)");
        $stmt->execute(['name' => $data['name']]);
        return ['success' => true, 'companyId' => $this->db->lastInsertId()];
    }

    public function getCompanies()
    {
        $stmt = $this->db->query("SELECT * FROM companies");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
