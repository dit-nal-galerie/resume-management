<?php
namespace App\Services;

use PDO;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;

class UserService
{
    private $db;
    private $jwtSecret;

    public function __construct(PDO $db, string $jwtSecret)
    {
        $this->db = $db;
        $this->jwtSecret = $jwtSecret;
    }

    public function getUserProfile($loginid)
    {
        $stmt = $this->db->prepare("SELECT name, email, phone FROM users WHERE loginid = :loginid");
        $stmt->execute(['loginid' => $loginid]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['success' => false, 'error' => 'User not found'];
        }

        return ['success' => true, 'user' => $user];
    }

    /**
     * Creates a new user if $data['isNew'] is true, or updates the existing user if false.
     */
    public function createOrUpdateUser($data, $res): Response
    {
        if (
            !isset($data['email']) ||
            ($data['isNew'] && (empty($data['loginname']) || empty($data['password']) || empty($data['password2'])))
        ) {
            $res->getBody()->write(json_encode(['message' => 'backend.error.validation.missingRequiredFields']));
            return $res->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        if (!empty($data['isNew'])) {
            return $this->createUser($data, $res);
        } else {
            return $this->updateUser($data, $res);
        }
    }

    private function createUser(array $data, Response $res): Response
    {
        if ($data['password'] !== $data['password2']) {
            $res->getBody()->write(json_encode(['message' => 'backend.error.validation.passwordMismatch']));
            return $res->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Prüfen ob Loginname oder Email existieren
        $stmt = $this->db->prepare("SELECT id FROM authentification WHERE loginname = :loginname");
        $stmt->execute([':loginname' => $data['loginname']]);
        if ($stmt->fetch()) {
            $res->getBody()->write(json_encode(['message' => 'backend.error.validation.userAlreadyExists']));
            return $res->withStatus(409)->withHeader('Content-Type', 'application/json');
        }

        $stmt = $this->db->prepare("SELECT userid FROM users WHERE email = :email");
        $stmt->execute([':email' => $data['email']]);
        if ($stmt->fetch()) {
            $res->getBody()->write(json_encode(['message' => 'backend.error.conflict.emailTaken']));
            return $res->withStatus(409)->withHeader('Content-Type', 'application/json');
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
            $loginid = (int) $this->db->lastInsertId();

            $stmt = $this->db->prepare("
                INSERT INTO users (loginid, name, email, anrede, city, street, houseNumber, postalCode, phone, mobile) 
                VALUES (:loginid, :name, :email, :anrede, :city, :street, :houseNumber, :postalCode, :phone, :mobile)
            ");
            $stmt->execute([
                ':loginid' => $loginid,
                ':name' => $data['name'] ?? '',
                ':email' => $data['email'] ?? '',
                ':anrede' => isset($data['anrede']) ? (int) $data['anrede'] : null,
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
            $res->getBody()->write(json_encode(['message' => 'backend.error.internal', 'error' => $e->getMessage()]));
            return $res->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    private function updateUser(array $data, Response $res): Response
    {
        if (empty($data['token'])) {
            $res->getBody()->write(json_encode(['message' => 'backend.error.auth.missingToken']));
            return $res->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Token prüfen
        try {
            $decoded = JWT::decode($data['token'], new Key($this->jwtSecret, 'HS256'));
        } catch (\Exception $e) {
            $res->getBody()->write(json_encode(['message' => 'backend.error.auth.invalidToken']));
            return $res->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $loginid = $decoded->loginid ?? null;
        if (!$loginid) {
            $res->getBody()->write(json_encode(['message' => 'backend.error.auth.invalidTokenPayload']));
            return $res->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Passwort prüfen
        $stmt = $this->db->prepare("SELECT password FROM authentification WHERE id = :id");
        $stmt->execute([':id' => $loginid]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row || !password_verify($data['password'], $row['password'])) {
            $res->getBody()->write(json_encode(['message' => 'backend.error.auth.invalidPassword']));
            return $res->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Update in users
        $stmt = $this->db->prepare("
            UPDATE users 
            SET name = :name, email = :email, anrede = :anrede, city = :city, street = :street, houseNumber = :houseNumber, postalCode = :postalCode, phone = :phone, mobile = :mobile
            WHERE loginid = :loginid
        ");
        $stmt->execute([
            ':name' => $data['name'] ?? '',
            ':email' => $data['email'] ?? '',
            ':anrede' => isset($data['anrede']) ? (int) $data['anrede'] : null,
            ':city' => $data['city'] ?? '',
            ':street' => $data['street'] ?? '',
            ':houseNumber' => $data['houseNumber'] ?? '',
            ':postalCode' => $data['postalCode'] ?? '',
            ':phone' => $data['phone'] ?? '',
            ':mobile' => $data['mobile'] ?? '',
            ':loginid' => $loginid
        ]);

        $res->getBody()->write(json_encode(['success' => true, 'message' => 'User updated']));
        return $res->withStatus(200)->withHeader('Content-Type', 'application/json');
    }

    public function login($data)
    {
        $loginname = $data['loginname'] ?? null;
        $password = $data['password'] ?? null;

        if (!$loginname || !$password) {
            return ['success' => false, 'error' => 'Missing loginname or password'];
        }

        $stmt = $this->db->prepare("SELECT id, password FROM authentification WHERE loginname = :loginname");
        $stmt->execute(['loginname' => $loginname]);
        $auth = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$auth || !password_verify($password, $auth['password'])) {
            return ['success' => false, 'error' => 'Invalid login credentials'];
        }

        $loginid = $auth['id'];

        $stmtUser = $this->db->prepare("
            SELECT a.loginname, u.userid, u.loginid, u.name, u.email, u.anrede, u.city,
                   u.street, u.houseNumber, u.postalCode, u.phone, u.mobile
            FROM users u
            JOIN authentification a ON u.loginid = a.id
            WHERE u.loginid = :loginid
        ");
        $stmtUser->execute(['loginid' => $loginid]);
        $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['success' => false, 'error' => 'User info not found'];
        }

        $payload = [
            'loginid' => $user['loginid'],
            'loginname' => $user['loginname'],
            'userid' => $user['userid'],
            'exp' => time() + 2 * 60 * 60
        ];

        $token = JWT::encode($payload, $this->jwtSecret, 'HS256');

        return [
            'name' => $user['name'],
            'token' => $token
        ];
    }
}