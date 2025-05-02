import { Request, Response } from 'express';
import { Connection } from 'mysql2';

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
  const { resume_id } = req.params;

  if (!resume_id) {
    res.status(400).send('Resume-ID ist erforderlich.');
    return;
  }

  const query = 'SELECT * FROM history WHERE resume_id = ? ORDER BY created_at DESC';
  db.query(query, [resume_id], (err, results) => {
    if (err) {
      console.error('Fehler beim Abrufen der Historie:', err);
      res.status(500).send('Fehler beim Abrufen der Historie.');
      return;
    }

    res.json(results);
  });
};