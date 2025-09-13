<?php
namespace App\Services;

use PDO;
use PHPMailer\PHPMailer\PHPMailer;

class PasswordResetService
{
    private PDO $db;
    private array $config;

    public function __construct(\PDO $db, array $config)   // <-- erwartet 2 Parameter
    {
        $this->db = $db;
        $this->config = $config;
    }

    public function sendResetEmail(string $email, string $loginname): array
    {
        // 1. Loginname in authentication suchen
        $stmt = $this->db->prepare("
    SELECT a.id AS loginid, u.email 
    FROM authentification a
    JOIN users u ON u.loginid = a.id
    WHERE a.loginname = :loginname
      AND u.email = :email
");
        $stmt->execute([
            ':loginname' => $loginname,
            ':email' => $email
        ]);

        $row = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$row) {
            return ['success' => false, 'error' => 'User not found'];
        }

        // 2. Token generieren
        $token = bin2hex(random_bytes(32));
        $expires = time() + 3600;

        $insert = $this->db->prepare("
        INSERT INTO password_reset_tokens (user_id, token, expires_at_timestamp)
        VALUES (:user_id, :token, :expires)
    ");
        $insert->execute([
            ':user_id' => $row['loginid'],
            ':token' => $token,
            ':expires' => $expires
        ]);

        // 3. Email-Versand kannst du hier einbauen
        $mailer = new \App\Services\MailerService();
        $mailer->sendPasswordResetEmail($email, $token);
        return ['success' => true];
    }

    public function resetPassword(string $token, string $newPassword): array
    {
        $sql = "SELECT loginname FROM password_resets WHERE token = :token";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['token' => $token]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return ['success' => false, 'error' => 'backend.error.token.invalid'];
        }

        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $sql2 = "UPDATE authentification SET password = :pw WHERE loginname = :loginname";
        $stmt2 = $this->db->prepare($sql2);
        $stmt2->execute([
            'pw' => $hash,
            'loginname' => $row['loginname']
        ]);

        return ['success' => true];
    }
}
