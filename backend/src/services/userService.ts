import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Connection, OkPacket, RowDataPacket } from 'mysql2';

export const createAccount = async (db: Connection, loginname: string, password: string): Promise<number | null> => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = 'INSERT INTO authentification (loginname, password) VALUES (?, ?)';
      return new Promise((resolve, reject) => {
        db.query(query, [loginname, hashedPassword], (err, result) => {
          if (err) {
            reject(err);
          } else {
            // Cast result to OkPacket to access insertId
            const okPacket = result as OkPacket;
            resolve(okPacket.insertId);
          }
        });
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      return null;
    }
  };

export const createUser = async (db: Connection, req: Request, res: Response): Promise<void> => {
  const { loginname, password, name, email, anrede, city, street, houseNumber, postalCode, phone, mobile } = req.body;

  if (!loginname || !password || !email) {
    res.status(400).send('All required fields must be filled.');
    return;
  }

  const checkQuery = `
    SELECT COUNT(*) AS count FROM authentification WHERE loginname = ? 
    UNION ALL 
    SELECT COUNT(*) AS count FROM users WHERE email = ?`;

  db.query(checkQuery, [loginname, email], async (err, results) => {
    if (err) {
      res.status(500).send('Server error.');
      return;
    }

    if (results[0].count > 0 || results[1].count > 0) {
      res.status(409).send('User with these credentials already exists.');
      return;
    }

    try {
      const loginid = await createAccount(db, loginname, password);
      if (!loginid) {
        res.status(500).send('Error creating account.');
        return;
      }

      const userQuery = `
        INSERT INTO users (loginid, name, email, anrede, city, street, houseNumber, postalCode, phone, mobile)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(userQuery, [loginid, name, email, anrede, city, street, houseNumber, postalCode, phone, mobile], (userErr) => {
        if (userErr) {
          res.status(500).send('Error creating user.');
          return;
        }
        res.status(201).send('User successfully created.');
      });
    } catch (error) {
      res.status(500).send('Error processing request.');
    }
  });
};

export const login = async (db: Connection, req: Request, res: Response): Promise<void> => {
  const { loginname, password } = req.body;
  const queryAuth = "SELECT id, password FROM authentification WHERE loginname = ?";

  db.query(queryAuth, [loginname], async (err, authResults) => {
    if (err) {
      console.error("Fehler beim Abrufen der Login-Daten:", err);
      res.status(500).send("Serverfehler.");
      return;
    }

    const authRows = authResults as RowDataPacket[];

    if (authRows.length === 0) {
      res.status(404).json({ message: "Benutzer nicht gefunden." });
      return;
    }

    const hashedPassword = authRows[0].password;
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Falsches Passwort." });
      return;
    }

    const loginid = authRows[0].id;

    // 🔹 Nutzerinformationen aus der `users`-Tabelle abrufen
    const queryUser = `
      SELECT a.loginname, u.loginid, u.name, u.email, u.anrede, u.city, u.street, u.houseNumber, u.postalCode, u.phone, u.mobile 
      FROM users u
      JOIN authentification a ON u.loginid = a.id
      WHERE u.loginid = ?`;

    db.query(queryUser, [loginid], (userErr, userResults) => {
      if (userErr) {
        console.error("Fehler beim Abrufen der Benutzerinformationen:", userErr);
        res.status(500).send("Fehler beim Laden der Nutzerdaten.");
        return;
      }

      const userRows = userResults as RowDataPacket[];

      if (userRows.length === 0) {
        res.status(404).json({ message: "Benutzerinformationen nicht gefunden." });
        return;
      }

      // ✅ Erfolgreicher Login → Senden der vollständigen Benutzerinformationen
      res.json(userRows[0]);
    });
  });
};

export const getAnrede = (db: Connection, req: Request, res: Response): void => {
  const query = 'SELECT * FROM anrede';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Fehler beim Abrufen der Anrede:', err);
      res.status(500).send('Serverfehler.');
      return;
    }

    res.json(results);
  });
};