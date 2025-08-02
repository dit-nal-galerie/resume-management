<?php
use PHPUnit\Framework\TestCase;
use App\Services\PasswordResetService;

class PasswordResetServiceTest extends TestCase
{
    private $service;

    protected function setUp(): void
    {
        $pdo = new PDO('sqlite::memory:');
        $pdo->exec("CREATE TABLE password_resets (token TEXT, loginname TEXT)");

        $mailer = \$this->getMockBuilder(\PHPMailer\PHPMailer\PHPMailer::class)
                       ->disableOriginalConstructor()
                       ->getMock();
        \$mailer->method('send')->willReturn(true);

        \$this->service = new PasswordResetService($pdo, $mailer);
    }

    public function testSendResetEmail()
    {
        \$result = \$this->service->sendResetEmail('john@example.com');
        \$this->assertTrue(\$result['success']);
        \$this->assertNotEmpty(\$result['token']);
    }

    public function testResetPassword()
    {
        \$send = \$this->service->sendResetEmail('john@example.com');
        \$token = \$send['token'];
        \$reset = \$this->service->resetPassword(\$token, 'newpass');
        \$this->assertTrue(\$reset['success']);
    }
}
