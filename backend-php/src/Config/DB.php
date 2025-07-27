<?php

namespace App\Config;

use PDO;
use PDOException;

class DB
{
    public static function connect(): PDO
    {
        // Определяем окружение ('dev' или 'prod')
        $env = getenv('APP_ENV') ?: 'dev';
        $config = ConfigLoader::load($env);

        try {
            return new PDO(
                "mysql:host={$config['DB_HOST']};dbname={$config['DB_NAME']};charset=utf8",
                $config['DB_USER'],
                $config['DB_PASSWORD']
            );
        } catch (PDOException $e) {
            die('DB connection failed: ' . $e->getMessage());
        }
    }
}
