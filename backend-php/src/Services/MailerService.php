<?php
namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use App\Config\ConfigLoader;

class MailerService
{
  private array $config;

  public function __construct(?string $env = null)
  {
    // Fallback: APP_ENV aus Umgebung oder production
    $env = $env ?? (getenv('APP_ENV') ?? 'production');
    $this->config = ConfigLoader::load($env);
  }

  public function sendPasswordResetEmail(string $to, string $token): array
  {
    $env = getenv('APP_ENV') ?: 'production';
    $from = $this->config['EMAIL_FROM'] ?? 'noreply@example.com';
    $host = $this->config['EMAIL_HOST'] ?? '';
    $port = $this->config['EMAIL_PORT'] ?? 587;
    $user = $this->config['EMAIL_USER'] ?? '';
    $pass = $this->config['EMAIL_PASSWORD'] ?? '';
    $secure = $this->config['EMAIL_SECURE'] ?? 'false';
    $resetUrlBase = $this->config['RESET_PASSWORD_URL'] ?? 'https://example.com/reset-password';
    $expiryMinutes = $this->config['TOKEN_EXPIRY_MINUTES'] ?? 60;

    $resetUrl = $resetUrlBase . '?token=' . urlencode($token);

    $html = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
          <h2 style='color: #333;'>Passwort zurücksetzen</h2>
          <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.</p>
          <p><a href='{$resetUrl}'>Passwort zurücksetzen</a></p>
          <p>Dieser Link ist nur {$expiryMinutes} Minuten gültig.</p>
        </div>
    ";

    // 👉 DEV-MODUS: kein Mailversand, aber Link zurückgeben
    if ($env === 'dev') {
      error_log("[DEV EMAIL] To: {$to}");
      error_log("[DEV EMAIL] Reset URL: {$resetUrl}");

      return [
        'success' => true,
        'message' => 'Testmodus: Keine echte E-Mail gesendet.',
        'resetUrl' => $resetUrl, // Link zurückgeben
        'to' => $to,
      ];
    }

    // 👉 PRODUCTION: echte Mail senden
    try {
      $mail = new PHPMailer(true);
      $mail->isSMTP();
      $mail->Host = $host;
      $mail->SMTPAuth = true;
      $mail->Username = $user;
      $mail->Password = $pass;

      if ($secure === 'ssl') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
      } elseif ($secure === 'tls' || $secure === 'true') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
      } else {
        $mail->SMTPSecure = false;
      }

      $mail->Port = (int) $port;

      $mail->setFrom($from, 'Support');
      $mail->addAddress($to);

      $mail->isHTML(true);
      $mail->Subject = 'Passwort zurücksetzen';
      $mail->Body = $html;
      $mail->AltBody = "Bitte nutzen Sie diesen Link: $resetUrl";

      $mail->send();

      return [
        'success' => true,
        'message' => 'E-Mail erfolgreich gesendet.',
      ];
    } catch (Exception $e) {
      error_log("Fehler beim Senden der E-Mail: {$mail->ErrorInfo}");
      return [
        'success' => false,
        'error' => 'E-Mail konnte nicht gesendet werden.',
      ];
    }
  }
}
