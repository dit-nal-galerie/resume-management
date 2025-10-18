<?php

declare(strict_types=1);

use Dotenv\Dotenv;

// Autoloader laden
require __DIR__ . '/../vendor/autoload.php';

// .env.testing laden, falls vorhanden
$envPath = __DIR__ . '/../.env.testing';
if (file_exists($envPath)) {
    $dotenv = Dotenv::createImmutable(dirname($envPath), basename($envPath));
    $dotenv->safeLoad(); // safeLoad() -> keine Exception, falls Datei fehlt
}

// Fallbacks für CI (z. B. GitHub Actions)
$_ENV['APP_ENV'] ??= 'testing';
$_ENV['DB_CONNECTION'] ??= 'mysql';
$_ENV['DB_HOST'] ??= '127.0.0.1';
$_ENV['DB_PORT'] ??= '3306';
$_ENV['DB_DATABASE'] ??= 'resume_test';
$_ENV['DB_USERNAME'] ??= 'test';
$_ENV['DB_PASSWORD'] ??= 'test';

// Diese Umgebungsvariablen auch in getenv() und $_SERVER spiegeln
foreach ($_ENV as $key => $value) {
    if (!getenv($key)) {
        putenv("$key=$value");
    }
    $_SERVER[$key] ??= $value;
}
