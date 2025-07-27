<?php

namespace App\Services;

use PDO;
use Firebase\JWT\JWT;

class UserService
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getUserProfile($request)
    {
        return ['id' => 1, 'name' => 'John Doe'];
    }

    public function createOrUpdateUser($data)
    {
        return ['success' => true];
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

        $stmtUser = $this->db->prepare("SELECT a.loginname, u.userid, u.loginid, u.name, u.email, u.anrede, u.city, u.street, u.houseNumber, u.postalCode, u.phone, u.mobile
                                         FROM users u
                                         JOIN authentification a ON u.loginid = a.id
                                         WHERE u.loginid = :loginid");
        $stmtUser->execute(['loginid' => $loginid]);
        $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['success' => false, 'error' => 'User info not found'];
        }

        $payload = [
            'loginid' => $user['loginid'],
            'loginname' => $user['loginname'],
            'userId' => $user['userid'],
            'exp' => time() + 2 * 60 * 60
        ];

        $secret = $_ENV['JWT_SECRET'] ?? 'default_jwt_secret';
        $token = JWT::encode($payload, $secret, 'HS256');

        return [
            'name' => $user['name'],
            'token' => $token
        ];
    }
}
