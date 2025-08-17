<?php
use PHPUnit\Framework\TestCase;
use App\Services\PasswordResetService;
use PHPMailer\PHPMailer\PHPMailer;


class PasswordResetServiceTest extends TestCase
{
    private PasswordResetService $service;

    protected function setUp(): void
    {
        // Задаём in-memory SQLite и создаём нужную таблицу
        $pdo = new PDO('sqlite::memory:');
        $pdo->exec("CREATE TABLE password_resets (token TEXT, loginname TEXT)");

        // Мок PHPMailer
        $mailer = $this->getMockBuilder(PHPMailer::class)
                       ->disableOriginalConstructor()
                       ->getMock();
        $mailer->method('send')->willReturn(true);

        $this->service = new PasswordResetService($pdo, $mailer);
    }

    public function testSendResetEmail(): void
    {
        $result = $this->service->sendResetEmail('john@example.com');

        // Проверяем, что вернулся массив с нужными ключами
        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('token', $result);
        $this->assertNotEmpty($result['token']);
    }

    public function testResetPassword(): void
    {
        // Сначала генерируем токен
        $send = $this->service->sendResetEmail('john@example.com');
        $token = $send['token'];

        // Затем сбрасываем пароль
        $reset = $this->service->resetPassword($token, 'newpass');

        $this->assertIsArray($reset);
        $this->assertArrayHasKey('success', $reset);
        $this->assertTrue($reset['success']);
    }
}
