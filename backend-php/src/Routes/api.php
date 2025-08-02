<?php
use Slim\App;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

use App\Controllers\UserController;
use App\Controllers\ResumeController;
use App\Controllers\PasswordResetController;
use App\Controllers\CompanyController;
use App\Controllers\ContactController;
use App\Controllers\HistoryController;

use App\Config\ConfigLoader;
use App\Config\DB;

return function(App $app) {
    // User
    $app->post('/login', [UserController::class, 'login']);
    $app->get('/user/profile', [UserController::class, 'getUserProfile']);
    $app->post('/user', [UserController::class, 'createOrUpdateUser']);

    // Resume
    $app->get('/resumes', [ResumeController::class, 'getResumesWithUsers']);
    $app->post('/resume', [ResumeController::class, 'updateOrCreateResume']);
    $app->get('/resume/{id}', [ResumeController::class, 'getResumeById']);

    // Password Reset
    $app->post('/password-reset', [PasswordResetController::class, 'sendResetEmail']);
    $app->post('/password-reset/{token}', [PasswordResetController::class, 'resetPassword']);

    // Company
    $app->post('/company', [CompanyController::class, 'addCompany']);
    $app->get('/companies', [CompanyController::class, 'getCompanies']);

    // Contact
    $app->post('/contact', [ContactController::class, 'createOrUpdateContact']);
    $app->get('/contacts', [ContactController::class, 'getContacts']);

    // History
    $app->post('/history', [HistoryController::class, 'addHistory']);
    $app->get('/history/{resumeId}', [HistoryController::class, 'getHistoryByResume']);

    // DB check with config details
    $app->get('/db-check', function (Request $request, Response $response): Response {
        // Определяем окружение ('dev' или 'prod')
        $env    = getenv('APP_ENV') ?: 'dev';
        $config = ConfigLoader::load($env);

        try {
            DB::connect(); // просто для проверки
            $data = [
                'success' => true,
                'message' => 'Connected to DB',
                'db_host' => $config['DB_HOST'],
                'db_port' => $config['DB_PORT'],
                'db_name' => $config['DB_NAME'],
            ];
        } catch (\Exception $e) {
            $data = [
                'success' => false,
                'error'   => $e->getMessage(),
                'db_host' => $config['DB_HOST'] ?? null,
                'db_port' => $config['DB_PORT'] ?? null,
                'db_name' => $config['DB_NAME'] ?? null,
            ];
        }

        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json');
    });
};
