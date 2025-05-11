import { Request, Response } from 'express';
import { Connection, RowDataPacket } from 'mysql2';
import { HistoryEntry } from '../../../interfaces/histori';

export const addHistory = (db: Connection, req: Request, res: Response): void => {
  const { resume_id, description } = req.body;

  if (!resume_id || !description) {
    res.status(400).send('Alle Pflichtfelder müssen ausgefüllt sein.');
    return;
  }

  const query = 'INSERT INTO history (resume_id, description) VALUES (?, ?)';
  db.query(query, [resume_id, description], (err) => {
    if (err) {
      console.error('Fehler beim Hinzufügen der Historie:', err);
      res.status(500).send('Fehler beim Hinzufügen der Historie.');
      return;
    }

    res.status(201).send('Historie erfolgreich hinzugefügt.');
  });
};

export const getHistoryByResumeId = (db: Connection, req: Request, res: Response): void => {
  const { refId, resumeId } = req.query;
console.log("getHistoryByResumeId", refId, resumeId);
  if (!resumeId || !refId) {
    res.status(400).json({ message: "Resume-ID und Benutzer-ID sind erforderlich." });
    return;
  }

  const validateQuery = `
    SELECT resumeId FROM resumes WHERE resumeId = ? AND ref = ?
  `;

  db.query(validateQuery, [resumeId, refId], (err, validationResult: RowDataPacket[]) => {
    if (err) {
      console.error("Fehler beim Prüfen der Bewerbung:", err);
      res.status(500).json({ message: "Fehler beim Prüfen der Bewerbung." });
      return;
    }

    if (!Array.isArray(validationResult) || validationResult.length === 0) {
      res.status(403).json({ message: "Keine Berechtigung oder Bewerbung nicht gefunden." });
      return;
    }

    const historyQuery = `
      SELECT h.date AS date, s.text AS status
      FROM history h
      JOIN states s ON h.stateid = s.stateid
      WHERE h.resumeid = ?
      ORDER BY h.date DESC
    `;
console.log("historyQuery", historyQuery,"resumeid", resumeId);
    db.query(historyQuery, [resumeId], (err, results: RowDataPacket[]) => {
      if (err) {
        console.error("Fehler beim Abrufen der Historie:", err);
        res.status(500).json({ message: "Fehler beim Abrufen der Historie." });
        return;
      }

      const historyEntries: HistoryEntry[] = results.map(row => ({
        date: row.date,
        status: row.status,
      }));

      res.json(historyEntries);
    });
  });
};
