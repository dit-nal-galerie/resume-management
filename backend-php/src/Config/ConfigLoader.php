<?php

namespace App\Config;

class ConfigLoader
{
    public static function load(string $env = 'dev'): array
    {
        $filename = __DIR__ . "/../../../config/{$env}.json";
        if (!file_exists($filename)) {
            throw new \Exception("Config file not found: {$filename}");
        }

        $json = file_get_contents($filename);
        $config = json_decode($json, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("JSON error: " . json_last_error_msg());
        }

        return $config;
    }
}
