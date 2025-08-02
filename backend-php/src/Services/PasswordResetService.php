<?php
namespace App\Services;

use PDO;
use PHPMailer\PHPMailer\PHPMailer;

class PasswordResetService
{
    private $db;
    private $mailer;

    public function __construct(PDO $db, PHPMailer $mailer)
    {
        $this->db = $db;
        $this->mailer = $mailer;
    }

    public function sendResetEmail($email)
    {
        $token = bin2hex(random_bytes(16));
        $stmt = $this->db->prepare("INSERT INTO password_resets (token, email) VALUES (:token, :email)");
        $stmt->execute(['token' => $token, 'email' => $email]);

        $this->mailer->addAddress($email);
        $this->mailer->Subject = 'Password Reset';
        $this->mailer->Body = "Reset link: http://example.com/password-reset/$token";
        $this->mailer->send();

        return ['success' => true, 'token' => $token];
    }

    public function resetPassword($token, $newPassword)
    {
        $stmt = $this->db->prepare("SELECT email FROM password_resets WHERE token = :token");
        $stmt->execute(['token' => $token]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return ['success' => false, 'error' => 'Invalid token'];
        }

        $email = $row['email'];
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);

        $stmt2 = $this->db->prepare("UPDATE authentification SET password = :hash WHERE loginname = :loginname");
        $stmt2->execute(['hash' => $hash, 'loginname' => $email]);

        $stmt3 = $this->db->prepare("DELETE FROM password_resets WHERE token = :token");
        $stmt3->execute(['token' => $token]);

        return ['success' => true];
    }
}
