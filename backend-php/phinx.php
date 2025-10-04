<?php

declare(strict_types=1);

use Dotenv\Dotenv;

require __DIR__ . '/vendor/autoload.php';

// .env.testing laden, falls vorhanden
$envPath = __DIR__ . '/.env.testing';
if (file_exists($envPath)) {
    $dotenv = Dotenv::createImmutable(__DIR__, '.env.testing');
    $dotenv->safeLoad();
}

// Standardwerte (für GitHub Actions)
$dbConnection = $_ENV['DB_CONNECTION'] ?? 'mysql';
$dbHost = $_ENV['DB_HOST'] ?? '127.0.0.1';
$dbPort = $_ENV['DB_PORT'] ?? '3306';
$dbDatabase = $_ENV['DB_DATABASE'] ?? 'resume_test';
$dbUsername = $_ENV['DB_USERNAME'] ?? 'test';
$dbPassword = $_ENV['DB_PASSWORD'] ?? 'test';

return [
    'paths' => [
        'migrations' => '%%PHINX_CONFIG_DIR%%/db/migrations',
        'seeds' => '%%PHINX_CONFIG_DIR%%/db/seeds',
    ],

    'environments' => [
        'default_migration_table' => 'phinxlog',
        'default_environment' => 'testing',

        'testing' => [
            'adapter' => $dbConnection,
            'host' => $dbHost,
            'name' => $dbDatabase,
            'user' => $dbUsername,
            'pass' => $dbPassword,
            'port' => $dbPort,
            'charset' => 'utf8mb4',
        ],
    ],

    'version_order' => 'creation',
];
