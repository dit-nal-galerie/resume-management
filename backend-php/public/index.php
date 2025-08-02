<?php
use Slim\Factory\AppFactory;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Dotenv\Dotenv;

require __DIR__ . '/../vendor/autoload.php';

// Загружаем .env
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Создаём приложение
$app = AppFactory::create();

// 1) Обрабатываем preflight-запросы и сразу возвращаем нужные заголовки
$app->options('/{routes:.+}', function (Request $request, Response $response) {
    return $response
        ->withHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
        ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        ->withHeader('Access-Control-Allow-Credentials', 'true');
});

// 2) Оборачиваем всё в мидлвар, чтобы подставить CORS-заголовки в **каждый** ответ
$app->add(function (Request $request, RequestHandler $handler): Response {
    /** @var Response $response */
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
        ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        ->withHeader('Access-Control-Allow-Credentials', 'true');
});

// JSON-парсер для PUT/POST
$app->addBodyParsingMiddleware();

// Подключаем ваши маршруты
(require __DIR__ . '/../src/Routes/api.php')($app);

// Запускаем приложение
$app->run();
