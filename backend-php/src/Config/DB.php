<?php

namespace App\Config;

use PDO;
use PDOException;

class DB
{
    public static function connect(): PDO
    {
        $env =getenv('APP_ENV') ?? 'production';
        $config = ConfigLoader::load($env);

        try {
            return new PDO(
                "mysql:host={$config['DB_HOST']};port={$config['DB_PORT']};dbname={$config['DB_NAME']};charset=utf8",
                $config['DB_USER'],
                $config['DB_PASSWORD']
            );
        } catch (PDOException $e) {
            die('DB connection failed: ' . $e->getMessage());
        }
    }
}
