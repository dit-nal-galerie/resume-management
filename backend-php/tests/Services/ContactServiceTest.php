<?php
use PHPUnit\Framework\TestCase;
use App\Services\ContactService;

class ContactServiceTest extends TestCase
{
    private $service;

    protected function setUp(): void
    {
        $pdo = new PDO('sqlite::memory:');
        $pdo->exec("CREATE TABLE contacts (contactid INTEGER PRIMARY KEY, name TEXT)");
        $this->service = new ContactService($pdo);
    }

    public function testCreateOrUpdateContact()
    {
        $result = $this->service->createOrUpdateContact(['name'=>'Bob']);
        $this->assertTrue($result['success']);
    }

    public function testGetContacts()
    {
        $this->service->createOrUpdateContact(['name'=>'Bob']);
        $contacts = $this->service->getContacts();
        $this->assertCount(1, $contacts);
    }
}
