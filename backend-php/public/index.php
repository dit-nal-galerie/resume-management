<?php
declare(strict_types=1);

// 1) Development-Fehler anzeigen
ini_set('display_errors','1');
ini_set('display_startup_errors','1');
error_reporting(E_ALL);

// 2) Composer-Autoloader
require __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use Slim\Factory\AppFactory;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

// 3) .env laden
Dotenv::createImmutable(__DIR__ . '/../')->load();

// 4) Slim-App erstellen
$app = AppFactory::create();

// 5) Routing-Middleware (damit Slim deine Routen kennt)
$app->addRoutingMiddleware();

// 6) Error-Middleware (zeigt Exceptions und Stacktraces)
$app->addErrorMiddleware(
    true,   // displayErrorDetails
    true,   // logErrors
    true    // logErrorDetails
);

// 7) Body-Parser für JSON-Requests
$app->addBodyParsingMiddleware();

// 8) Deine Routen einbinden
(require __DIR__ . '/../src/Routes/api.php')($app);

// 9) App starten
$app->run();
