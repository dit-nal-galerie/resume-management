<?php
namespace App\Controllers;

use App\Config\DB;
use App\Services\AuthService;
use Firebase\JWT\JWT;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class UserController
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = DB::connect();
    }

    /**
     * GET /user/anrede-name
     */
    public function getUserAnredeAndName(Request $request, Response $response): Response
    {
        $loginid = AuthService::getUserIdFromToken($request);
        if (!$loginid) {
            $payload = ['message' => 'backend.error.auth.unauthorized'];
            $response->getBody()->write(json_encode($payload));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $sql = <<<SQL
SELECT 
    u.name, 
    a.text AS anredeText
FROM users u
LEFT JOIN anrede a ON u.anrede = a.id
WHERE u.loginid = :loginid
SQL;

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['loginid' => $loginid]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$row) {
            $payload = ['message' => 'backend.error.notFound.userNotFound'];
            $response->getBody()->write(json_encode($payload));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode($row));
        return $response->withHeader('Content-Type', 'application/json');
    }

    /**
     * GET /user/profile
     */
    public function getUserProfile(Request $request, Response $response): Response
    {
        $loginid = AuthService::getUserIdFromToken($request);
        if (!$loginid) {
            $payload = ['message' => 'backend.error.auth.unauthorized'];
            $response->getBody()->write(json_encode($payload));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $sql = <<<SQL
SELECT 
    u.*, 
    a.loginname
FROM users u
JOIN authentification a ON u.loginid = a.id
WHERE u.loginid = :loginid
SQL;

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['loginid' => $loginid]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$row) {
            $payload = ['message' => 'backend.error.notFound.userNotFound'];
            $response->getBody()->write(json_encode($payload));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode($row));
        return $response->withHeader('Content-Type', 'application/json');
    }

    /**
     * POST /account/create
     */
    public function createAccount(Request $request, Response $response): Response
    {
        $body = (array)$request->getParsedBody();
        $loginname = $body['loginname'] ?? null;
        $password  = $body['password']  ?? null;

        if (!$loginname || !$password) {
            $payload = ['error' => 'Missing loginname or password'];
            $response->getBody()->write(json_encode($payload));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Хэшируем пароль
        $hash = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO authentification (loginname, password) VALUES (:loginname, :password)";
        $stmt = $this->db->prepare($sql);

        try {
            $stmt->execute(['loginname' => $loginname, 'password' => $hash]);
            $insertId = (int)$this->db->lastInsertId();
            $response->getBody()->write(json_encode(['insertId' => $insertId]));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\PDOException $e) {
            $payload = ['error' => $e->getMessage()];
            $response->getBody()->write(json_encode($payload));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    /**
     * POST /login
     */
    public function login(Request $request, Response $response): Response
    {
        $rawBody  = (string)$request->getBody();
    $body     = json_decode($rawBody, true) ?: [];
    $loginname = $body['loginname'] ?? null;
    $password  = $body['password']  ?? null;

    if (!$loginname || !$password) {
        $payload = ['success'=> false, 'error'=>'Missing loginname or password'];
        $response->getBody()->write(json_encode($payload));
        return $response
            ->withStatus(400)
            ->withHeader('Content-Type','application/json');
    }

        

        // 1) Получаем хеш из таблицы authentification
        $sqlAuth = "SELECT id, password FROM authentification WHERE loginname = :loginname";
        $stmt   = $this->db->prepare($sqlAuth);
        $stmt->execute(['loginname'=>$loginname]);
        $auth   = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$auth) {
            $payload = ['success'=> false, 'error'=>'backend.error.notFound.userNotFound'];
            $response->getBody()->write(json_encode($payload));
            return $response->withStatus(404)->withHeader('Content-Type','application/json');
        }

        // 2) Сравниваем пароли
        if (!password_verify($password, $auth['password'])) {
            $payload = ['success'=> false, 'error'=>'backend.error.auth.wrongPassword'];
            $response->getBody()->write(json_encode($payload));
            return $response->withStatus(401)->withHeader('Content-Type','application/json');
        }

        $loginid = (int)$auth['id'];

        // 3) Достаём данные пользователя
        $sqlUser = <<<SQL
SELECT 
    a.loginname,
    u.userid, u.loginid, u.name, u.email, u.anrede, 
    u.city, u.street, u.houseNumber, u.postalCode, u.phone, u.mobile
FROM users u
JOIN authentification a ON u.loginid = a.id
WHERE u.loginid = :loginid
SQL;
        $stmt2 = $this->db->prepare($sqlUser);
        $stmt2->execute(['loginid'=>$loginid]);
        $user  = $stmt2->fetch(\PDO::FETCH_ASSOC);

        if (!$user) {
            $payload = ['success'=> false, 'error'=>'backend.error.notFound.userInfoNotFound'];
            $response->getBody()->write(json_encode($payload));
            return $response->withStatus(404)->withHeader('Content-Type','application/json');
        }

        // 4) Генерируем JWT
        $payloadToken = [
            'loginid'   => $user['loginid'],
            'loginname' => $user['loginname'],
            'userId'    => $user['userid'],
            'exp'       => time() + 2*60*60
        ];
        $secret = $_ENV['JWT_SECRET'] ?? 'default_jwt_secret';
        $token  = JWT::encode($payloadToken, $secret, 'HS256');

        // Отправляем HttpOnly-cookie (рекомендуется)
       setcookie('token', $token, [
    'expires'  => time() + 2 * 60 * 60, // время жизни в секундах от now
    'httponly' => true,
    'secure'   => false,               // на проде поставьте true
    'samesite' => 'Lax',
]);

        $response->getBody()->write(json_encode(['name'=>$user['name']]));
        return $response->withHeader('Content-Type','application/json');
    }

    /**
     * GET /anrede
     */
    public function getAnrede(Request $request, Response $response): Response
    {
        $sql = "SELECT * FROM anrede";
        $stmt = $this->db->query($sql);
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode($rows));
        return $response->withHeader('Content-Type','application/json');
    }

    /**
     * POST /user/change-access
     */
    public function changeAccessData(Request $request, Response $response): Response
    {
        $body = (array)$request->getParsedBody();
        $userId         = $body['userId']         ?? null;
        $loginname      = $body['loginname']      ?? null;
        $email          = $body['email']          ?? null;
        $oldPassword    = $body['oldPassword']    ?? null;
        $newPassword    = $body['password']       ?? null;
        $password2      = $body['password2']     ?? null;
        $changePassword = !empty($body['changePassword']);

        if (!$userId || !$loginname || !$email || !$oldPassword) {
            $response->getBody()->write(json_encode(['message'=>'backend.error.validation.missingFields']));
            return $response->withStatus(400)->withHeader('Content-Type','application/json');
        }
        if ($changePassword && (!$newPassword || !$password2)) {
            $response->getBody()->write(json_encode(['message'=>'backend.error.validation.missingFields']));
            return $response->withStatus(400)->withHeader('Content-Type','application/json');
        }

        try {
            // 1) Загружаем пользователя с паролем
            $sql = <<<SQL
SELECT 
    u.userid, u.email, u.name, 
    a.id AS loginid, a.loginname, a.password
FROM users u
JOIN authentification a ON u.loginid = a.id
WHERE u.userid = :userid
SQL;
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['userid'=>$userId]);
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$row) {
                $response->getBody()->write(json_encode(['message'=>'backend.error.notFound.userNotFound']));
                return $response->withStatus(404)->withHeader('Content-Type','application/json');
            }

            // 2) Проверяем старый пароль
            if (!password_verify($oldPassword, $row['password'])) {
                $response->getBody()->write(json_encode(['message'=>'backend.error.auth.oldPasswordWrong']));
                return $response->withStatus(401)->withHeader('Content-Type','application/json');
            }

            // 3) Проверяем уникальность email (кроме себя)
            $stmt2 = $this->db->prepare("SELECT COUNT(*) FROM users WHERE email = :email AND userid != :userid");
            $stmt2->execute(['email'=>$email,'userid'=>$userId]);
            if ($stmt2->fetchColumn() > 0) {
                $response->getBody()->write(json_encode(['message'=>'backend.error.conflict.emailTaken']));
                return $response->withStatus(409)->withHeader('Content-Type','application/json');
            }

            // 4) Хэшируем новый пароль, если нужно
            $passwordHash = $row['password'];
            if ($changePassword) {
                if ($newPassword !== $password2) {
                    $response->getBody()->write(json_encode(['message'=>'backend.error.validation.passwordMismatch']));
                    return $response->withStatus(400)->withHeader('Content-Type','application/json');
                }
                $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
            }

            // 5) Обновляем аутентификацию
            $updAuth = $this->db->prepare("UPDATE authentification SET loginname = :loginname, password = :password WHERE id = :loginid");
            $updAuth->execute([
                'loginname'=>$loginname,
                'password'=>$passwordHash,
                'loginid'=>$row['loginid']
            ]);

            // 6) Обновляем users
            $updUser = $this->db->prepare("UPDATE users SET email = :email WHERE userid = :userid");
            $updUser->execute(['email'=>$email,'userid'=>$userId]);

            $response->getBody()->write(json_encode([
                'message'=>'backend.success.user.dataUpdated',
                'user'=>[
                    'userId'=>$userId,
                    'loginname'=>$loginname,
                    'email'=>$email,
                    'name'=>$row['name']
                ]
            ]));
            return $response->withHeader('Content-Type','application/json');
        } catch (\PDOException $e) {
            error_log($e->getMessage());
            $response->getBody()->write(json_encode(['message'=>'backend.error.server.credentialChangeError']));
            return $response->withStatus(500)->withHeader('Content-Type','application/json');
        }
    }
}
