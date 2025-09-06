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
    public function createOrUpdateUser($request, $res): Response
    {
        $data = $request->getParsedBody();
        if (
            !isset($data['email']) ||
            ($data['isNew'] && (empty($data['loginname']) || empty($data['password']) || empty($data['password2'])))
        ) {
            $res->getBody()->write('backend.error.validation.missingRequiredFields');
            return $res->withStatus(400);
        }

        if (!empty($data['isNew'])) {
            return $this->createUser($data, $res);
        } else {
            $loginid = AuthService::getUserIdFromToken($request);
            if (!$loginid) {
                $payload = ['error' => 'backend.error.auth.unauthorized'];
                $res->getBody()->write(json_encode($payload));
                return $res->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            return $this->updateUser($data, $res, $loginid);
        }
    }

    private function createUser(array $data, Response $res): Response
    {
        if ($data['password'] !== $data['password2']) {
            $res->getBody()->write('backend.error.validation.passwordMismatch');
            return $res->withStatus(400);
        }

        // Prüfen ob Username oder Email existieren
        $stmt = $this->db->prepare("SELECT id FROM authentification WHERE loginname = :loginname ");
        $stmt->execute([
            ':loginname' => $data['loginname']

        ]);

        if ($stmt->fetch()) {
            $res->getBody()->write('backend.error.validation.userAlreadyExists');
            return $res->withStatus(409); // Conflict
        }

        $stmt = $this->db->prepare("SELECT userid FROM users WHERE email = :email ");
        $stmt->execute([
            ':email' => $data['email']

        ]);

        if ($stmt->fetch()) {
            $res->getBody()->write('backend.error.validation.userAlreadyExists');
            return $res->withStatus(409); // Conflict
        }
        // Neue User anlegen
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare("
              INSERT INTO authentification (loginname, password)
    VALUES (:loginname, :password)
            ");
            $stmt->execute([
                ':loginname' => $data['loginname'],
                ':password' => password_hash($data['password'], PASSWORD_BCRYPT)
            ]);
            $sql = (int) $this->db->lastInsertId();
            $sqlUser = "INSERT INTO users (loginid, name, email, anrede, city, street, houseNumber, postalCode, phone, mobile) 
VALUES (:loginid, :name, :email, :anrede, :city, :street, :houseNumber, :postalCode, :phone, :mobile)";
            $stmt = $this->db->prepare($sqlUser);
            $stmt->execute([
                ':loginid' => $sql,
                ':name' => $data['name'] ?? '',
                ':email' => $data['email'] ?? '',
                ':anrede' => $data['anrede'] ?? '',
                ':city' => $data['city'] ?? '',
                ':street' => $data['street'] ?? '',
                ':houseNumber' => $data['houseNumber'] ?? '',
                ':postalCode' => $data['postalCode'] ?? '',
                ':phone' => $data['phone'] ?? '',
                ':mobile' => $data['mobile'] ?? '',
            ]);

            $this->db->commit();

            $res->getBody()->write(json_encode(['success' => true, 'message' => 'User created']));
            return $res->withStatus(201)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $this->db->rollBack();
            $res->getBody()->write('backend.error.internal: ' . $e->getMessage());
            return $res->withStatus(500);
        }
    }

    private function updateUser(array $data, Response $res, int $userId): Response
    {

        if (!$userId) {
            $res->getBody()->write('backend.error.auth.invalidTokenPayload');
            return $res->withStatus(401);
        }

        // Passwort prüfen
        $stmt = $this->db->prepare("SELECT password FROM authentification WHERE id = :id");
        $stmt->execute([':id' => $userId]);

        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$row || !password_verify($data['password'], $row['password'])) {
            $res->getBody()->write('backend.error.auth.invalidPassword');
            return $res->withStatus(401);
        }

        // Update in users
        $sql = "UPDATE users SET 
            name        = :name, 
            email       = :email, 
            anrede      = :anrede, 
            city        = :city, 
            street      = :street, 
            houseNumber = :houseNumber, 
            postalCode  = :postalCode, 
            phone       = :phone, 
            mobile      = :mobile
        WHERE loginid = :loginid";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':name' => $data['name'] ?? '',
            ':email' => $data['email'] ?? '',
            ':anrede' => $data['anrede'] ?? '',
            ':city' => $data['city'] ?? '',
            ':street' => $data['street'] ?? '',
            ':houseNumber' => $data['houseNumber'] ?? '',
            ':postalCode' => $data['postalCode'] ?? '',
            ':phone' => $data['phone'] ?? '',
            ':mobile' => $data['mobile'] ?? '',
            ':loginid' => $userId,
        ]);


        $res->getBody()->write(json_encode(['success' => true, 'message' => 'User updated']));
        return $res->withStatus(200)->withHeader('Content-Type', 'application/json');
    }
    private function jsonResponse(Response $response, array $payload, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($payload));
        return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
    }
    /**
     * GET /user/anrede-name
     */
    public function getUserAnredeAndName(Request $request, Response $response): Response
    {
        $loginid = AuthService::getUserIdFromToken($request);
        if (!$loginid) {
            $payload = ['error' => 'backend.error.auth.unauthorized'];
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
            $payload = ['error' => 'backend.error.auth.unauthorized'];
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
        $body = (array) $request->getParsedBody();
        $loginname = $body['loginname'] ?? null;
        $password = $body['password'] ?? null;

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
            $insertId = (int) $this->db->lastInsertId();
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
        $rawBody = (string) $request->getBody();
        $body = json_decode($rawBody, true) ?: [];
        $loginname = $body['loginname'] ?? null;
        $password = $body['password'] ?? null;

        if (!$loginname || !$password) {
            $payload = ['success' => false, 'error' => 'Missing loginname or password'];
            $response->getBody()->write(json_encode($payload));
            return $response
                ->withStatus(400)
                ->withHeader('Content-Type', 'application/json');
        }



        // 1) Получаем хеш из таблицы authentification
        $sqlAuth = "SELECT id, password FROM authentification WHERE loginname = :loginname";
        $stmt = $this->db->prepare($sqlAuth);
        $stmt->execute(['loginname' => $loginname]);
        $auth = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$auth) {
            $payload = ['success' => false, 'error' => 'backend.error.notFound.userNotFound'];
            $response->getBody()->write(json_encode($payload));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // 2) Сравниваем пароли
        if (!password_verify($password, $auth['password'])) {
            $payload = ['success' => false, 'error' => 'backend.error.auth.wrongPassword'];
            $response->getBody()->write(json_encode($payload));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $loginid = (int) $auth['id'];

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
        $stmt2->execute(['loginid' => $loginid]);
        $user = $stmt2->fetch(\PDO::FETCH_ASSOC);

        if (!$user) {
            $payload = ['success' => false, 'error' => 'backend.error.notFound.userInfoNotFound'];
            $response->getBody()->write(json_encode($payload));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // 4) Генерируем JWT
        $payloadToken = [
            'loginid' => $user['loginid'],
            'loginname' => $user['loginname'],
            'userId' => $user['userid'],
            'exp' => time() + 2 * 60 * 60
        ];
        $secret = $_ENV['JWT_SECRET'] ?? 'default_jwt_secret';
        $token = JWT::encode($payloadToken, $secret, 'HS256');

        // Отправляем HttpOnly-cookie (рекомендуется)
        setcookie('token', $token, [
            'expires' => time() + 2 * 60 * 60, // время жизни в секундах от now
            'httponly' => true,
            'secure' => false,               // на проде поставьте true
            'samesite' => 'Lax',
        ]);

        $response->getBody()->write(json_encode(['name' => $user['name']]));
        return $response->withHeader('Content-Type', 'application/json');
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
        return $response->withHeader('Content-Type', 'application/json');
    }

    /**
     * POST /user/change-access
     */
    public function changeAccessData(Request $request, Response $response): Response
    {
        $loginId = AuthService::getUserIdFromToken($request);
        $body = (array) $request->getParsedBody();
        $loginname = $body['loginname'] ?? null;
        $email = $body['email'] ?? null;
        $oldPassword = $body['oldPassword'] ?? null;
        $newPassword = $body['password'] ?? null;
        $password2 = $body['password2'] ?? null;
        $changePassword = !empty($body['changePassword']);

        if (!$loginId || !$loginname || !$email || !$oldPassword) {
            $response->getBody()->write(json_encode(['error' => 'backend.error.validation.missingFields']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
        if ($changePassword && (!$newPassword || !$password2)) {
            $response->getBody()->write(json_encode(['error' => 'backend.error.validation.missingFields']));
            return $response->withStatus(410)->withHeader('Content-Type', 'application/json');
        }

        try {
            // 1) Загружаем пользователя с паролем
            $sql = <<<SQL
SELECT
    u.userid, u.email, u.name,
    a.id AS loginid, a.loginname, a.password
FROM users u
JOIN authentification a ON u.loginid = a.id
WHERE a.id = :loginId
SQL;
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['loginId' => $loginId]);
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$row) {
                $response->getBody()->write(json_encode(['error' => 'backend.error.notFound.userNotFound']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            // 2) Проверяем старый пароль
            if (!password_verify($oldPassword, $row['password'])) {
                $response->getBody()->write(json_encode([
                    'error' => 'backend.error.auth.oldPasswordWrong' +
                        ' ' + $oldPassword
                ]));
                return $response->withStatus(411)->withHeader('Content-Type', 'application/json');
            }

            // 3) Проверяем уникальность email (кроме себя)
            $stmt2 = $this->db->prepare("SELECT COUNT(*) FROM users WHERE email = :email AND loginId != :loginId");
            $stmt2->execute(['email' => $email, 'loginId' => $loginId]);
            if ($stmt2->fetchColumn() > 0) {
                $response->getBody()->write(json_encode(['message' => 'backend.error.conflict.emailTaken']));
                return $response->withStatus(411)->withHeader('Content-Type', 'application/json');
            }

            // 4) Хэшируем новый пароль, если нужно
            $passwordHash = $row['password'];
            if ($changePassword) {
                if ($newPassword !== $password2) {
                    $response->getBody()->write(json_encode(['message' => 'backend.error.validation.passwordMismatch']));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                }
                $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
            }

            // 5) Обновляем аутентификацию
            $updAuth = $this->db->prepare("UPDATE authentification SET loginname = :loginname, password = :password WHERE id = :loginid");
            $updAuth->execute([
                'loginname' => $loginname,
                'password' => $passwordHash,
                'loginid' => $loginId
            ]);

            // 6) Обновляем users
            $updUser = $this->db->prepare("UPDATE users SET email = :email WHERE loginId = :loginId");
            $updUser->execute(['email' => $email, 'loginId' => $loginId]);

            $response->getBody()->write(json_encode([
                'success' => true,
                'user' => [

                    'loginname' => $loginname,
                    'email' => $email,
                    'name' => $row['name']
                ]
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\PDOException $e) {
            error_log($e->getMessage());
            $response->getBody()->write(json_encode(['error' => 'backend.error.server.credentialChangeError']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    /**
     * POST /logout
     */
    public function logout(Request $request, Response $response): Response
    {
        // Cookie "token" invalidieren
        setcookie('token', '', [
            'expires' => time() - 3600, // abgelaufen in Vergangenheit
            'httponly' => true,
            'secure' => true,         // in Prod: true
            'samesite' => 'Lax',
            'path' => '/',           // wichtig: gleiche Path wie beim Setzen
        ]);

        $payload = ['message' => 'backend.success.logout'];
        $response->getBody()->write(json_encode($payload));

        return $response
            ->withStatus(200)
            ->withHeader('Content-Type', 'application/json');
    }
}
