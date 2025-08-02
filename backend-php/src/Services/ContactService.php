<?php
namespace App\Services;

use PDO;

class ContactService
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function createOrUpdateContact($data)
    {
        if (!empty($data['contactid'])) {
            $stmt = $this->db->prepare("UPDATE contacts SET name = :name WHERE contactid = :id");
            $stmt->execute(['name' => $data['name'], 'id' => $data['contactid']]);
        } else {
            $stmt = $this->db->prepare("INSERT INTO contacts (name) VALUES (:name)");
            $stmt->execute(['name' => $data['name']]);
        }
        return ['success' => true];
    }

    public function getContacts()
    {
        $stmt = $this->db->query("SELECT * FROM contacts");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
