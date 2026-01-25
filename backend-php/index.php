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

// 1. Error Middleware: Muss als innerste Schicht (zuletzt hinzugefügt) sein,
//    um Ausnahmen aller anderen Middlewares und Routen zu fangen.
$app->addErrorMiddleware(true, true, true);

// 2. Routing Middleware: Bestimmt, welche Route aufgerufen wird.
$app->addRoutingMiddleware();

// 3. Body Parsing: Liegt zwischen Routing und CORS (z.B. nach Routing) oder davor.
$app->addBodyParsingMiddleware();

// 4. Eigene CORS-Middleware: Sollte die äußerste Schicht sein (d.h. ZUERST HINZUFÜGEN),
//    um Preflight-Anfragen (OPTIONS) abzufangen, bevor sie geroutet werden.
//    Die letzte add()-Anweisung wird ZUERST ausgeführt (LIFO).

// **WICHTIGSTE ÄNDERUNG: CORS ist die erste Middleware, die hinzugefügt wird**
$app->add(new CorsMiddleware(['https://bewerbungs.itprofi-4u.de', 'http://localhost:3000']));


// OPTIONS-Route für Preflight
$app->options('/{routes:.+}', function ($request, $response) {
  return $response;
});

// Routen einbinden
(require __DIR__ . '/src/Routes/api.php')($app);

$app->run();