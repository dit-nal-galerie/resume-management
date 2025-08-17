<?php
namespace App\Services;

use PDO;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class HistoryService
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Fügt einen neuen History-Eintrag hinzu.
     * JSON-Body: { resume_id: number, description: number }
     * (description wird hier als stateId gespeichert)
     */
    public function addHistory(Request $request, Response $response): Response
    {
        $data = (array)$request->getParsedBody();
        $resumeId    = $data['resume_id']   ?? null;
        $description = $data['description'] ?? null;

        if (!$resumeId || !$description) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'error'   => 'backend.error.validation.missingFields'
            ]));
            return $response
                ->withStatus(400)
                ->withHeader('Content-Type','application/json');
        }

        $sql = "INSERT INTO history (resumeid, stateid) VALUES (:resumeid, :stateid)";
        $stmt = $this->db->prepare($sql);

        try {
            $stmt->execute([
                'resumeid' => $resumeId,
                'stateid'  => $description
            ]);
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'backend.success.history.added'
            ]));
            return $response
                ->withStatus(201)
                ->withHeader('Content-Type','application/json');
        } catch (\PDOException $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'error'   => 'backend.error.server.historyAddError'
            ]));
            return $response
                ->withStatus(500)
                ->withHeader('Content-Type','application/json');
        }
    }

    /**
     * Gibt die History-Einträge zu einem Resume zurück.
     * Query-String: ?resumeId=… 
     * Auth gegen Ref überprüft.
     */
    public function getHistoryByResume(Request $request, Response $response): Response
{
    $params   = $request->getQueryParams();
    $resumeId = isset($params['resumeId']) ? (int)$params['resumeId'] : 0;
    $userId   = AuthService::getUserIdFromToken($request);

    if ($resumeId <= 0 || $userId === null) {
        return $response
            ->withStatus(400)
            ->withHeader('Content-Type','application/json')
            ->write(json_encode(['error'=>'backend.error.validation.missingFields']));
    }

    // 1) Permission-Check: nicht mehr "ref", sondern resume.userid
    $validateSql = "
        SELECT resumeid
          FROM resumes
         WHERE resumeid = :resumeid
           AND ref   = :userid
    ";
    $stmt = $this->db->prepare($validateSql);
    $stmt->execute([
        'resumeid' => $resumeId,
        'userid'   => $userId
    ]);
    if ($stmt->rowCount() === 0) {
        return $response
            ->withStatus(403)
            ->withHeader('Content-Type','application/json')
            ->write(json_encode(['error'=>'backend.error.auth.noPermission']));
    }

    // 2) History-Daten holen
    $histSql = "
        SELECT h.date AS date, s.text AS status
          FROM history h
          JOIN states  s ON h.stateid = s.stateid
         WHERE h.resumeid = :resumeid
      ORDER BY h.date ASC
    ";
    $hStmt = $this->db->prepare($histSql);
    $hStmt->execute(['resumeid' => $resumeId]);
    $rows = $hStmt->fetchAll(PDO::FETCH_ASSOC);

    // 3) Format dd.mm.yyyy
    $entries = [];
    foreach ($rows as $row) {
       
        $entries[] = [
            'date'   => $row['date'],
            'status' => $row['status']
        ];
    }

    // 4) Nur das Array zurückgeben
    $response->getBody()->write(json_encode($entries));
    return $response->withHeader('Content-Type','application/json');
}

}
