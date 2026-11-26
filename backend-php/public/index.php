<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use App\Middleware\CorsMiddleware;

// Produktion: keine Fehlerausgabe im Response (nur Logging).
$isProduction = (getenv('APP_ENV') ?: 'production') === 'production';

ini_set('display_errors', $isProduction ? '0' : '1');
ini_set('display_startup_errors', $isProduction ? '0' : '1');
error_reporting(E_ALL);

$app = AppFactory::create();

// 1. Error Middleware: Muss als innerste Schicht (zuletzt hinzugefuegt) sein,
//    um Ausnahmen aller anderen Middlewares und Routen zu fangen.
//    displayErrorDetails nur in der Entwicklung aktivieren.
$app->addErrorMiddleware(!$isProduction, true, true);

// 2. Routing Middleware: Bestimmt, welche Route aufgerufen wird.
$app->addRoutingMiddleware();

// 3. Body Parsing.
$app->addBodyParsingMiddleware();

// 4. CORS-Middleware: aeuere Schicht, damit Preflight (OPTIONS) abgefangen wird.
//    Erlaubte Origins ueber CORS_ORIGINS (komma-getrennt) konfigurierbar,
//    z. B. in render.yaml. Fallback = bisherige Werte.
$corsOrigins = getenv('CORS_ORIGINS') ?: 'https://bewerbungs.itprofi-4u.de,http://localhost:3000';
$allowedOrigins = array_values(array_filter(array_map('trim', explode(',', $corsOrigins))));

$app->add(new CorsMiddleware($allowedOrigins));

// OPTIONS-Route fuer Preflight
$app->options('/{routes:.+}', function ($request, $response) {
  return $response;
});

// Routen einbinden: erst require (liefert die Closure), dann aufrufen.
$routes = require __DIR__ . '/../src/Routes/api.php';
$routes($app);

$app->run();
