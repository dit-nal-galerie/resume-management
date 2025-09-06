import { Request, Response } from 'express';
import { Connection } from 'mysql2';
import jwt from 'jsonwebtoken';

// Hilfsfunktion: User-ID aus JWT holen
function getUserIdFromToken(req: Request): number | null {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dein_geheimes_jwt_secret') as {
      loginid: number;
    };

    return decoded.loginid;
  } catch {
    return null;
  }
}

export const addCompany = (db: Connection, req: Request, res: Response): void => {
  const { name, adress } = req.body;
  const loginid = getUserIdFromToken(req);

  if (!loginid || !name || !adress) {
    res.status(400).send('backend.error.validation.missingFields');

    return;
  }

  const query = 'INSERT INTO companies (name, adress, ref) VALUES (?, ?, ?)';

  db.query(query, [name, adress, loginid], (err) => {
    if (err) {
      console.error('Fehler beim Hinzufügen der Firma:', err);
      res.status(500).send('backend.error.server.companyAddError');

      return;
    }

    res.status(201).send('backend.success.company.added');
  });
};

export const getCompanies = (db: Connection, req: Request, res: Response): void => {
  const isRecruter = req.query.isRecruter;
  const loginid = getUserIdFromToken(req);

  if (!loginid || isRecruter === undefined) {
    res.status(400).send('backend.error.validation.missingLoginIdOrRecruiter');

    return;
  }

  const query = `
    SELECT * 
    FROM companies 
    WHERE ref = ? AND isRecruter = ?
  `;

  db.query(query, [loginid, isRecruter === 'true'], (err, results) => {
    if (err) {
      console.error('Fehler beim Abrufen der Firmen:', err);
      res.status(500).send('backend.error.server.fetchCompaniesError');

      return;
    }

    res.json(results);
  });
};
