import { Request, Response } from 'express';
import { Connection } from 'mysql2';
import jwt from 'jsonwebtoken';
import { getUserIdFromToken } from './userService';

// Hilfsfunktion: User-ID aus JWT holen

export const createOrUpdateContact = async (
  db: Connection,
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      contactid = 0,
      vorname,
      name,
      email,
      anrede,
      title,
      zusatzname,
      phone,
      mobile,
      company,
    } = req.body;

    const loginid = getUserIdFromToken(req);

    if (!vorname || !name || !email || !anrede || !company || !loginid) {
      res.status(400).json({ message: 'backend.error.validation.missingFields' });
      return;
    }

    if (contactid === 0) {
      const insertQuery = `
        INSERT INTO contacts (vorname, name, email, anrede, title, zusatzname, phone, mobile, company, ref)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.query(
        insertQuery,
        [vorname, name, email, anrede, title, zusatzname, phone, mobile, company, loginid],
        (err) => {
          if (err) {
            res.status(500).json({ message: 'backend.error.server.serverError' });
            return;
          }
          res.status(201).json({ message: 'backend.success.contact.added' });
        }
      );
    } else {
      const updateQuery = `
        UPDATE contacts
        SET vorname = ?, name = ?, email = ?, anrede = ?, title = ?, zusatzname = ?, phone = ?, mobile = ?, company = ?, ref = ?
        WHERE contactid = ?`;
      db.query(
        updateQuery,
        [
          vorname,
          name,
          email,
          anrede,
          title,
          zusatzname,
          phone,
          mobile,
          company,
          loginid,
          contactid,
        ],
        (err) => {
          if (err) {
            res.status(500).json({ message: 'backend.error.server.serverError' });
            return;
          }
          res.status(200).json({ message: 'backend.success.contact.updated' });
        }
      );
    }
  } catch (error) {
    console.error('Error in createOrUpdateContact:', error);
    res.status(500).json({ message: 'backend.error.server.serverError' });
  }
};

export const getContacts = (db: Connection, req: Request, res: Response): void => {
  const { company } = req.query;
  const loginid = getUserIdFromToken(req);

  if (!loginid || !company) {
    res.status(400).send('backend.error.validation.missingRefOrCompany');
    return;
  }

  const query = `
    SELECT 
      contactid, 
      vorname, 
      name, 
      email, 
      anrede, 
      title, 
      zusatzname, 
      phone, 
      mobile, 
      company, 
      ref
    FROM contacts
    WHERE ref = ? AND company = ?
  `;

  db.query(query, [loginid, company], (err, results) => {
    if (err) {
      console.error('Fehler beim Abrufen der Kontakte:', err);
      res.status(500).send('backend.error.server.fetchContactsError');
      return;
    }

    res.json(results);
  });
};
