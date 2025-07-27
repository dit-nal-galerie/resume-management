<?php

use Slim\App;
use App\Controllers\ResumeController;

return function (App $app) {
    $controller = new ResumeController();

    $app->get('/user/profile', [$controller, 'getUserProfile']);
    $app->post('/user', [$controller, 'createOrUpdateUser']);
    $app->post('/login', [$controller, 'login']);

    // Проверка подключения к БД
    $app->get('/db-check', function ($request, $response, $args) {
        try {
            $pdo = \App\Config\DB::connect();
            $response->getBody()->write(json_encode(['success' => true, 'message' => 'Connected to DB']));
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['success' => false, 'error' => $e->getMessage()]));
        }
        return $response->withHeader('Content-Type', 'application/json');
    });
};
