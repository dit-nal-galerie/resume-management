import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Connection, OkPacket, RowDataPacket } from 'mysql2';
import { Pool } from "mysql2/promise";

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

//------------------  
export const changeAccessData = async (db: Pool, req: Request, res: Response): Promise<void> => {
  const {
    userId,
    loginname,
    email,
    oldPassword,
    password,
    password2,
    changePassword,
  } = req.body;

  if (!userId || !loginname || !email || !oldPassword) {
    res.status(400).json({ message: "Fehlende Pflichtfelder." });
    console.log("Fehlende Pflichtfelder:", { userId, loginname, email, oldPassword });
    return;
  }
if (changePassword && (!password || !password2)) {
    res.status(400).json({ message: "Fehlende Pflichtfelder." });
    console.log("Fehlende Pflichtfelder:", { changePassword, password, password2, oldPassword });
    return;
  }
  try {
    // 1. Benutzer mit Login-Daten laden (JOIN authentification)
    const [userRows]: any = await db

      .query(
        `SELECT u.userid, u.email, u.name, a.id AS loginid, a.loginname, a.password
         FROM users u
         JOIN authentification a ON u.loginid = a.id
         WHERE u.userid = ?`,
        [userId]
      );

    if (!userRows || userRows.length === 0) {
      res.status(404).json({ message: "Benutzer nicht gefunden." });
      return;
    }

    const user = userRows[0];

    // 2. Altes Passwort prüfen
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Altes Passwort ist falsch." });
      return;
    }

    // 3. Prüfen, ob E-Mail bereits vergeben ist (außer eigene)
    const [emailRows]: any = await db

      .query("SELECT * FROM users WHERE email = ? AND userid != ?", [email, userId]);
    if (emailRows.length > 0) {
      res.status(409).json({ message: "E-Mail ist bereits vergeben." });
      return;
    }

    // 4. Neues Passwort hash vorbereiten (nur wenn gewünscht)
    let newPasswordHash = user.password;
    if (changePassword) {
      if (!password || !password2 || password !== password2) {
        res.status(400).json({ message: "Neue Passwörter stimmen nicht überein." });
        return;
      }
      newPasswordHash = await bcrypt.hash(password, 10);
    }

    // 5. Update in authentification
    await db

      .query(
        "UPDATE authentification SET loginname = ?, password = ? WHERE id = ?",
        [loginname, newPasswordHash, user.loginid]
      );

    // 6. Update in users
    await db

      .query("UPDATE users SET email = ? WHERE userid = ?", [email, userId]);

    // 7. Aktualisierte Benutzerdaten zurückgeben (ohne Passwort)
    const updatedUser = {
      userId,
      loginname,
      email,
      name: user.name,
    };

    res.json({
      message: "Zugangsdaten erfolgreich geändert.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Fehler beim Ändern der Zugangsdaten:", error);
    res.status(500).json({ message: "Serverfehler beim Ändern der Zugangsdaten." });
  }
};

//------------------
async function getPasswordForLoginId(db: Connection, loginid: number): Promise<string | null> {
  return new Promise((resolve, reject) => {
    db.query("SELECT password FROM authentification WHERE id = ?", [loginid], (err, results: RowDataPacket[]) => {
      if (err || results.length === 0) return resolve(null);
      resolve(results[0].password);
    });
  });
}

async function emailExistsForOtherUser(db: Connection, email: string, loginid: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT COUNT(*) AS count FROM users WHERE email = ? AND loginid != ?",
      [email, loginid],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0].count > 0);
      }
    );
  });
}

async function createAuthEntry(db: Connection, loginname: string, password: string): Promise<number> {
  const hash = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO authentification (loginname, password) VALUES (?, ?)`,
      [loginname, hash],
      (err, result: any) => {
        if (err) return reject(err);
        resolve(result.insertId);
      }
    );
  });
}

export const createOrUpdateUser = async (db: Connection, req: Request, res: Response): Promise<void> => {
  const {
    loginid,
    loginname,
    password,
    name,
    email,
    anrede,
    city,
    street,
    houseNumber,
    postalCode,
    phone,
    mobile,
  } = req.body;

  // Neu: Pflichtfelder
  if (!email || (!loginid && (!loginname || !password))) {
    res.status(400).send("Pflichtfelder fehlen.");
    return;
  }

  try {
    if (loginid > 0) {
      // ✅ UPDATE BESTEHENDER USER

      // 1. Passwort prüfen
      const hashed = await getPasswordForLoginId(db, loginid);
      if (!hashed) {
        res.status(404).send("Authentifizierung nicht gefunden.");
        return;
      }
      const match = await bcrypt.compare(password, hashed);
      if (!match) {
        res.status(401).send("Falsches Passwort.");
        return;
      }

      // 2. Prüfen, ob E-Mail bei anderem Benutzer vergeben ist
      const emailInUse = await emailExistsForOtherUser(db, email, loginid);
      if (emailInUse) {
        res.status(409).send("E-Mail ist bereits vergeben.");
        return;
      }

      // 3. User-Daten aktualisieren
      db.query(
        `UPDATE users SET 
          name = ?, email = ?, anrede = ?, city = ?, street = ?, 
          houseNumber = ?, postalCode = ?, phone = ?, mobile = ?
         WHERE loginid = ?`,
        [name, email, anrede, city, street, houseNumber, postalCode, phone, mobile, loginid],
        (err) => {
          if (err) return res.status(500).send("Fehler beim Aktualisieren.");
          res.send("Benutzerdaten erfolgreich aktualisiert.");
        }
      );
    } else {
      // ✅ NEUEN BENUTZER ERSTELLEN

      // 1. loginname/email prüfen
      db.query(
        `SELECT 
           (SELECT COUNT(*) FROM authentification WHERE loginname = ?) AS loginCount,
           (SELECT COUNT(*) FROM users WHERE email = ?) AS emailCount`,
        [loginname, email],
        async (err, results: any) => {
          if (err) return res.status(500).send("Fehler beim Einmaligkeitscheck.");

          if (results[0].loginCount > 0 || results[0].emailCount > 0) {
            return res.status(409).send("Loginname oder E-Mail bereits vergeben.");
          }

          try {
            const newLoginId = await createAuthEntry(db, loginname, password);
            db.query(
              `INSERT INTO users (loginid, name, email, anrede, city, street, houseNumber, postalCode, phone, mobile)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [newLoginId, name, email, anrede, city, street, houseNumber, postalCode, phone, mobile],
              (uErr) => {
                if (uErr) return res.status(500).send("Fehler beim Anlegen.");
                res.status(201).send("Benutzer erfolgreich erstellt.");
              }
            );
          } catch (err) {
            console.error("Fehler beim Anlegen:", err);
            res.status(500).send("Serverfehler.");
          }
        }
      );
    }
  } catch (error) {
    console.error("Fehler in createOrUpdateUser:", error);
    res.status(500).send("Serverfehler.");
  }
};