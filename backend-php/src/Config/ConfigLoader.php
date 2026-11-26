<?php

namespace App\Config;

class ConfigLoader
{
  /**
   * Konfiguration laden: JSON-Datei (lokale Entwicklung) wird durch
   * Umgebungsvariablen ueberschrieben (Docker/Render/CI).
   *
   * Reihenfolge: JSON-Fallback -> Env-Variablen gewinnen immer.
   */
  public static function load(string $env = 'dev'): array
  {
    $filename = __DIR__ . "/../../../config/{$env}.json";
    $config = [];

    if (file_exists($filename)) {
      $json = file_get_contents($filename);
      $config = json_decode($json, true);

      if (json_last_error() !== JSON_ERROR_NONE) {
        throw new \Exception("JSON error in {$filename}: " . json_last_error_msg());
      }
      if (!is_array($config)) {
        $config = [];
      }
    }

    // Env-Variablen haben Vorrang. Mehrere Aliase pro Ziel (Render- vs.
    // interne Namenskonvention), erste gesetzte Gewinn.
    $map = [
      'DB_HOST' => ['DB_HOST'],
      'DB_PORT' => ['DB_PORT'],
      'DB_USER' => ['DB_USERNAME', 'DB_USER'],
      'DB_NAME' => ['DB_DATABASE', 'DB_NAME'],
      'DB_PASSWORD' => ['DB_PASSWORD'],
      'EMAIL_FROM' => ['EMAIL_FROM'],
      'EMAIL_HOST' => ['EMAIL_HOST'],
      'EMAIL_PORT' => ['EMAIL_PORT'],
      'EMAIL_USER' => ['EMAIL_USER'],
      'EMAIL_PASSWORD' => ['EMAIL_PASSWORD'],
      'EMAIL_SECURE' => ['EMAIL_SECURE'],
      'FRONTEND_URL' => ['FRONTEND_URL'],
      'RESET_PASSWORD_URL' => ['RESET_PASSWORD_URL'],
      'TOKEN_LENGTH' => ['TOKEN_LENGTH'],
      'TOKEN_EXPIRY_MINUTES' => ['TOKEN_EXPIRY_MINUTES'],
    ];

    foreach ($map as $target => $sources) {
      foreach ($sources as $source) {
        $value = getenv($source);
        if ($value !== false && $value !== '') {
          $config[$target] = $value;
          break;
        }
      }
    }

    if ($config === []) {
      throw new \Exception(
        "No configuration found for env '{$env}': " .
          "file {$filename} does not exist and no DB_*/EMAIL_* environment variables are set.",
      );
    }

    return $config;
  }
}
