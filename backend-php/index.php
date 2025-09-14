<?php
declare(strict_types=1);

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require __DIR__ . '/vendor/autoload.php';

use Slim\Factory\AppFactory;
use App\Middleware\CorsMiddleware;
use App\Config;

$app = AppFactory::create();

$app->addRoutingMiddleware();
$app->addErrorMiddleware(true, true, true);
$app->addBodyParsingMiddleware();

// **NUR DIE EIGENE CORS-MIDDLEWARE EINBINDEN**
$app->add(new CorsMiddleware(['https://bewerbungs.itprofi-4u.de', 'http://localhost:3000']));

// OPTIONS-Route für Preflight
$app->options('/{routes:.+}', function ($request, $response) {
  return $response;
});

// Routen einbinden
require __DIR__ . ('/src/Routes/api.php')($app);

$app->run();
