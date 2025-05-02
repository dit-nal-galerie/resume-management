import { Request, Response } from 'express';
import { Connection } from 'mysql2';

export const addCompany = (db: Connection, req: Request, res: Response): void => {
  const { name, adress, ref } = req.body;

  if (!name || !adress || !ref) {
    res.status(400).send('Alle Pflichtfelder müssen ausgefüllt sein.');
    return;
  }

  const query = 'INSERT INTO companies (name, adress, ref) VALUES (?, ?, ?)';
  db.query(query, [name, adress, ref], (err) => {
    if (err) {
      console.error('Fehler beim Hinzufügen der Firma:', err);
      res.status(500).send('Fehler beim Hinzufügen der Firma.');
      return;
    }

    res.status(201).send('Firma erfolgreich hinzugefügt.');
  });
};

export const getCompanies = (db: Connection, req: Request, res: Response): void => {
  const { loginId, isRecruter } = req.query; // loginId und isRecruter aus der Anfrage entnehmen
  
  if (!loginId || isRecruter === undefined) {
    res.status(400).send("Fehlende Parameter: loginId und/oder isRecruter.");
    return;
  }

  const query = `
    SELECT * 
    FROM companies 
    WHERE ref = ? AND isRecruter = ?
  `;
  console.log("query" , query, "Parameters:", [loginId, isRecruter === "true"]);
  db.query(query, [loginId, isRecruter === "true"], (err, results) => {
  
    if (err) {
      console.error("Fehler beim Abrufen der Firmen:", err);
      res.status(500).send("Fehler beim Abrufen der Firmen.");
      return;
    }

    res.json(results);
  });
};
