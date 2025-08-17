<?php
use PHPUnit\Framework\TestCase;
use App\Services\CompanyService;

class CompanyServiceTest extends TestCase
{
    private $service;

    protected function setUp(): void
    {
        $pdo = new PDO('sqlite::memory:');
        $pdo->exec("CREATE TABLE companies (companyId INTEGER PRIMARY KEY, name TEXT)");
        $this->service = new CompanyService($pdo);
    }

    public function testAddAndGetCompanies()
    {
        $this->service->addCompany(['name'=>'Acme']);
        $companies = $this->service->getCompanies();
        $this->assertCount(1, $companies);
    }
}
