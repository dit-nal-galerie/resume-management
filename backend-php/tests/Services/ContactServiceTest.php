<?php
use PHPUnit\Framework\TestCase;
use App\Services\ContactService;

class ContactServiceTest extends TestCase
{
  private $service;

  protected function setUp(): void
  {
    $pdo = new PDO('sqlite::memory:');
    $pdo->exec('CREATE TABLE contacts (contactid INTEGER PRIMARY KEY, name TEXT)');
    $this->service = new ContactService($pdo);
  }


}
