<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Symfony\Component\HttpFoundation\Response;

class UserService
{
    public function getUserIdFromToken(Request $request): ?int
    {
        $token = $request->cookie('token') ?? ($request->bearerToken());
        if (!$token) return null;

        try {
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET', 'dein_geheimes_jwt_secret'), 'HS256'));
            return $decoded->loginid ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function getUserAnredeAndName(Request $request)
    {
        $loginid = $this->getUserIdFromToken($request);

        if (!$loginid) {
            return response()->json(['message' => 'backend.error.auth.unauthorized'], 401);
        }

        $result = DB::selectOne(<<<SQL
            SELECT u.name, a.text AS anredeText
            FROM users u
            LEFT JOIN anrede a ON u.anrede = a.id
            WHERE u.loginid = ?
        SQL, [$loginid]);

        if (!$result) {
            return response()->json(['message' => 'backend.error.notFound.userNotFound'], 404);
        }

        return response()->json($result);
    }

    public function getUserProfile(Request $request)
    {
        $loginid = $this->getUserIdFromToken($request);

        if (!$loginid) {
            return response()->json(['message' => 'backend.error.auth.unauthorized'], 401);
        }

        $result = DB::selectOne(<<<SQL
            SELECT u.*, a.loginname 
            FROM users u 
            JOIN authentification a ON u.loginid = a.id 
            WHERE u.loginid = ?
        SQL, [$loginid]);

        if (!$result) {
            return response()->json(['message' => 'backend.error.notFound.userNotFound'], 404);
        }

        return response()->json($result);
    }

    public function createAccount(string $loginname, string $password): ?int
    {
        try {
            $hashedPassword = Hash::make($password);
            return DB::table('authentification')->insertGetId([
                'loginname' => $loginname,
                'password' => $hashedPassword
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating account: ' . $e->getMessage());
            return null;
        }
    }

    public function getAnrede()
    {
        try {
            $anreden = DB::table('anrede')->get();
            return response()->json($anreden);
        } catch (\Exception $e) {
            Log::error('Fehler beim Abrufen der Anrede: ' . $e->getMessage());
            return response('backend.error.server.serverError', 500);
        }
    }

    // Hier können weitere Methoden wie login, changeAccessData, createOrUpdateUser usw. ergänzt werden.
}
