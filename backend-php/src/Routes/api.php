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

return function (App $app) {
  //
  // 1. User / Auth
  //
  $app->post('/createOrUpdateUser', [UserController::class, 'createOrUpdateUser']);
  $app->post('/login', [UserController::class, 'login']);
  $app->post('/logout', [UserController::class, 'logout']);
  $app->get('/me', [UserController::class, 'getUserProfile']);
  $app->get('/meanrede', [UserController::class, 'getUserAnredeAndName']);
  $app->get('/getAnrede', [UserController::class, 'getAnrede']);
  $app->post('/changeAccessData', [UserController::class, 'changeAccessData']);

  //
  // 2. Resume
  //
  $app->get('/getResumesWithUsers', [ResumeController::class, 'getResumesWithUsers']);
  $app->get('/resumes', [ResumeController::class, 'getResumesWithUsers']); // Alias
  $app->post('/updateOrCreateResume', [ResumeController::class, 'updateOrCreateResume']);
  $app->post('/resume', [ResumeController::class, 'updateOrCreateResume']); // Alias
  $app->get('/getResumeById/{resumeId}', [ResumeController::class, 'getResumeById']);
  $app->get('/resume/{resumeId}', [ResumeController::class, 'getResumeById']);
  $app->post('/changeResumeStatus', [ResumeController::class, 'changeResumeStatus']);

  //
  // 3. Company
  //
  $app->post('/addCompany', [CompanyController::class, 'addCompany']);
  $app->post('/company', [CompanyController::class, 'addCompany']); // Alias
  $app->get('/companies', [CompanyController::class, 'getCompanies']);

  //
  // 4. Contact
  //
  $app->post('/addContact', [ContactController::class, 'createOrUpdateContact']);
  $app->post('/contact', [ContactController::class, 'createOrUpdateContact']); // Alias
  $app->get('/contacts', [ContactController::class, 'getContacts']);

  //
  // 5. History
  //
  $app->post('/addHistory', [HistoryController::class, 'addHistory']);
  $app->post('/history', [HistoryController::class, 'addHistory']); // Alias
  $app->get('/getHistoryByResumeId', [HistoryController::class, 'getHistoryByResume']);
  $app->get('/history/{resumeId}', [HistoryController::class, 'getHistoryByResume']); // Alias

  //
  // 6. Password Reset
  //
  $app->post('/request-password-reset', [PasswordResetController::class, 'sendResetEmail']);
  $app->get('/validate-token', [PasswordResetController::class, 'checkPasswordResetToken']);
  $app->post('/reset-password', [PasswordResetController::class, 'resetPassword']);
  $app->post('/password-reset', [PasswordResetController::class, 'sendResetEmail']); // Alias
  $app->post('/password-reset/{token}', [PasswordResetController::class, 'resetPassword']); // Alias

  //
  // 7. States (z.B. Status im Resume)
  //
  $app->get('/getStates', [ResumeController::class, 'getStates']);
  $app->get('/states', [ResumeController::class, 'getStates']); // Alias

  //
  // 8. DB-Check (Diagnose)
  //
  $app->map(['GET', 'POST'], '/db-check', function (
    Request $request,
    Response $response,
  ): Response {
    $env = getenv('APP_ENV') ?: 'dev';
    $cfg = ConfigLoader::load($env);
    try {
      DB::connect();
      $data = [
        'success' => true,
        'message' => 'Connected to DB',
        'db_host' => $cfg['DB_HOST'],
        'db_port' => $cfg['DB_PORT'],
        'db_name' => $cfg['DB_NAME'],
      ];
    } catch (\Exception $e) {
      $data = [
        'success' => false,
        'error' => $e->getMessage(),
        'db_host' => $cfg['DB_HOST'],
        'db_port' => $cfg['DB_PORT'],
        'db_name' => $cfg['DB_NAME'],
        'modus' => $env,
      ];
    }
    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
  });
};
