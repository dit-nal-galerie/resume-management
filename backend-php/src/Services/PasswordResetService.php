<?php
namespace App\Services;

use PDO;
use PHPMailer\PHPMailer\PHPMailer;

class PasswordResetService
{
    private PDO $db;
    private PHPMailer $mailer;

    public function __construct(PDO $db, PHPMailer $mailer)
    {
        $this->db     = $db;
        $this->mailer = $mailer;
    }

    public function sendResetEmail(string $email): array
    {
        $token = bin2hex(random_bytes(16));
        $sql   = "INSERT INTO password_resets (token, loginname) VALUES (:token, :loginname)";
        $stmt  = $this->db->prepare($sql);
        $stmt->execute(['token'=>$token, 'loginname'=>$email]);

        $this->mailer->addAddress($email);
        $this->mailer->Subject = 'Passwort zurücksetzen';
        $this->mailer->Body    = "Nutze diesen Link: https://deine.app/reset-password/$token";
        $sent = $this->mailer->send();

        return ['success'=>$sent, 'token'=>$token];
    }

    public function resetPassword(string $token, string $newPassword): array
    {
        $sql = "SELECT loginname FROM password_resets WHERE token = :token";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['token'=>$token]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return ['success'=>false, 'error'=>'backend.error.token.invalid'];
        }

        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $sql2 = "UPDATE authentification SET password = :pw WHERE loginname = :loginname";
        $stmt2 = $this->db->prepare($sql2);
        $stmt2->execute([
            'pw'=>$hash,
            'loginname'=>$row['loginname']
        ]);

        return ['success'=>true];
    }
}
