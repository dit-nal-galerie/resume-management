import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { Connection, OkPacket, RowDataPacket } from 'mysql2';
import { Pool } from 'mysql2/promise';
import jwt from 'jsonwebtoken';

// Middleware: User aus JWT holen (z.B. req.user.loginid)
export const getUserIdFromToken = (req: Request): number | null => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dein_geheimes_jwt_secret') as any;

    return decoded.loginid;
  } catch {
    return null;
  }
};

export const getUserAnredeAndName = (db: Connection, req: Request, res: Response): void => {
  const loginid = getUserIdFromToken(req);

  if (!loginid) {
    res.status(401).json({ message: 'backend.error.auth.unauthorized' });

    return;
  }

  const query = `
    SELECT u.name, a.text AS anredeText
    FROM users u
    LEFT JOIN anrede a ON u.anrede = a.id
    WHERE u.loginid = ?
  `;

  db.query(query, [loginid], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'backend.error.server.serverError' });

      return;
    }
    const rowResults = results as RowDataPacket[];

    if (!rowResults.length) {
      res.status(404).json({ message: 'backend.error.notFound.userNotFound' });

      return;
    }
    res.json(rowResults[0]);
  });
};
export const getUserProfile = (db: Connection, req: Request, res: Response): void => {
  const loginid = getUserIdFromToken(req);

  if (!loginid) {
    res.status(401).json({ message: 'backend.error.auth.unauthorized' });

    return;
  }

  const query =
    ' SELECT u.*, a.loginname FROM users u JOIN authentification a ON u.loginid = a.id WHERE u.loginid = ?';

  db.query(query, [loginid], (err, results) => {
    if (err) {
      res.status(500).json({ message: 'backend.error.server.serverError' });

      return;
    }
    const rowResults = results as RowDataPacket[];

    if (!rowResults.length) {
      res.status(404).json({ message: 'backend.error.notFound.userNotFound' });

      return;
    }
    res.json(rowResults[0]);
  });
};
export const createAccount = async (
  db: Connection,
  loginname: string,
  password: string
): Promise<number | null> => {
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
  const queryAuth = 'SELECT id, password FROM authentification WHERE loginname = ?';

  db.query(queryAuth, [loginname], async (err, authResults) => {
    if (err) {
      console.error('Fehler beim Abrufen der Login-Daten:', err);
      res.status(500).send('backend.error.server.serverError');

      return;
    }

    const authRows = authResults as RowDataPacket[];

    if (authRows.length === 0) {
      res.status(404).json({ message: 'backend.error.notFound.userNotFound' });

      return;
    }

    const hashedPassword = authRows[0].password;
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'backend.error.auth.wrongPassword' });

      return;
    }

    const loginid = authRows[0].id;

    // Nutzerinformationen abrufen (optional, falls du Claims brauchst)
    const queryUser = `
      SELECT a.loginname,u.userid, u.loginid, u.name, u.email, u.anrede, u.city, u.street, u.houseNumber, u.postalCode, u.phone, u.mobile 
      FROM users u
      JOIN authentification a ON u.loginid = a.id
      WHERE u.loginid = ?`;

    db.query(queryUser, [loginid], (userErr, userResults) => {
      if (userErr) {
        console.error('Fehler beim Abrufen der Benutzerinformationen:', userErr);
        res.status(500).send('backend.error.server.loadingUserDataError');

        return;
      }

      const userRows = userResults as RowDataPacket[];

      if (userRows.length === 0) {
        res.status(404).json({ message: 'backend.error.notFound.userInfoNotFound' });

        return;
      }

      // JWT erzeugen (nur mit minimalen Claims, z.B. loginid und ggf. Rolle)
      const user = userRows[0];
      const token = jwt.sign(
        {
          loginid: user.loginid,
          loginname: user.loginname,
          userId: user.userid,
          // Optional: weitere Claims wie Rolle, Name, etc.
        },
        process.env.JWT_SECRET || 'dein_geheimes_jwt_secret', // Setze das Secret in .env!
        { expiresIn: '2h' }
      );

      // Token als HttpOnly-Cookie senden (empfohlen) oder im Body zurückgeben
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // in Produktion: true (nur über HTTPS)
        sameSite: 'lax', // oder 'strict'
        maxAge: 2 * 60 * 60 * 1000, // 2 Stunden
      });

      // Sende nur die erlaubten Userdaten zurück (ohne loginid!):
      res.json({
        name: user.name,
      });
    });
  });
};

export const getAnrede = (db: Connection, req: Request, res: Response): void => {
  const query = 'SELECT * FROM anrede';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Fehler beim Abrufen der Anrede:', err);
      res.status(500).send('backend.error.server.serverError');

      return;
    }

    res.json(results);
  });
};

//------------------
export const changeAccessData = async (db: Pool, req: Request, res: Response): Promise<void> => {
  const { userId, loginname, email, oldPassword, password, password2, changePassword } = req.body;

  if (!userId || !loginname || !email || !oldPassword) {
    res.status(400).json({ error: 'backend.error.validation.missingFields' });
    console.log('Fehlende Pflichtfelder:', { userId, loginname, email, oldPassword });

    return;
  }
  if (changePassword && (!password || !password2)) {
    res.status(400).json({ error: 'backend.error.validation.missingFields' });
    console.log('Fehlende Pflichtfelder:', { changePassword, password, password2, oldPassword });

    return;
  }
  try {
    // 1. Benutzer mit Login-Daten laden (JOIN authentification)
    const [userRows]: any = await db.query(
      `SELECT u.userid, u.email, u.name, a.id AS loginid, a.loginname, a.password
         FROM users u
         JOIN authentification a ON u.loginid = a.id
         WHERE u.userid = ?`,
      [userId]
    );

    if (!userRows || userRows.length === 0) {
      res.status(404).json({ message: 'backend.error.notFound.userNotFound' });

      return;
    }

    const user = userRows[0];

    // 2. Altes Passwort prüfen
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      res.status(401).json({ message: 'backend.error.auth.oldPasswordWrong' });

      return;
    }

    // 3. Prüfen, ob E-Mail bereits vergeben ist (außer eigene)
    const [emailRows]: any = await db.query('SELECT * FROM users WHERE email = ? AND userid != ?', [
      email,
      userId,
    ]);

    if (emailRows.length > 0) {
      res.status(409).json({ message: 'backend.error.conflict.emailTaken' });

      return;
    }

    // 4. Neues Passwort hash vorbereiten (nur wenn gewünscht)
    let newPasswordHash = user.password;

    if (changePassword) {
      if (!password || !password2 || password !== password2) {
        res.status(400).json({ message: 'backend.error.validation.passwordMismatch' });

        return;
      }
      newPasswordHash = await bcrypt.hash(password, 10);
    }

    // 5. Update in authentification
    await db.query('UPDATE authentification SET loginname = ?, password = ? WHERE id = ?', [
      loginname,
      newPasswordHash,
      user.loginid,
    ]);

    // 6. Update in users
    await db.query('UPDATE users SET email = ? WHERE userid = ?', [email, userId]);

    // 7. Aktualisierte Benutzerdaten zurückgeben (ohne Passwort)
    const updatedUser = {
      userId,
      loginname,
      email,
      name: user.name,
    };

    res.json({
      message: 'backend.success.user.dataUpdated',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Fehler beim Ändern der Zugangsdaten:', error);
    res.status(500).json({ message: 'backend.error.server.credentialChangeError' });
  }
};

//------------------
export async function getPasswordForLoginId(
  db: Connection,
  loginid: number
): Promise<string | null> {
  return new Promise((resolve) => {
    db.query(
      'SELECT password FROM authentification WHERE id = ?',
      [loginid],
      (err, results: RowDataPacket[]) => {
        if (err || results.length === 0) return resolve(null);
        resolve(results[0].password);
      }
    );
  });
}

export async function emailExistsForOtherUser(
  db: Connection,
  email: string,
  loginid: number
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT COUNT(*) AS count FROM users WHERE email = ? AND loginid != ?',
      [email, loginid],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0].count > 0);
      }
    );
  });
}

export async function createAuthEntry(
  db: Connection,
  loginname: string,
  password: string
): Promise<number> {
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

export const createOrUpdateUser = async (
  db: Connection,
  req: Request,
  res: Response
): Promise<void> => {
  const {
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

  const loginid = getUserIdFromToken(req) || 0;

  // Neu: Pflichtfelder
  if (!email || (!loginid && (!loginname || !password))) {
    res.status(400).send('backend.error.validation.missingRequiredFields');

    return;
  }

  try {
    if (loginid > 0) {
      // ✅ UPDATE BESTEHENDER USER

      // 1. Passwort prüfen
      const hashed = await getPasswordForLoginId(db, loginid);

      if (!hashed) {
        res.status(404).send('backend.error.auth.authNotFound');

        return;
      }
      const match = await bcrypt.compare(password, hashed);

      if (!match) {
        res.status(401).send('backend.error.auth.wrongPassword');

        return;
      }

      // 2. Prüfen, ob E-Mail bei anderem Benutzer vergeben ist
      const emailInUse = await emailExistsForOtherUser(db, email, loginid);

      if (emailInUse) {
        res.status(409).send('backend.error.conflict.emailTaken');

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
          if (err) {
            //     console.log(
            //       `UPDATE users SET
            //   name = ?, email = ?, anrede = ?, city = ?, street = ?,
            //   houseNumber = ?, postalCode = ?, phone = ?, mobile = ?
            //  WHERE loginid = ?`,
            //       [name, email, anrede, city, street, houseNumber, postalCode, phone, mobile, loginid]
            //     );
            return res.status(500).send('backend.error.server.updateError');
          }
          res.send('backend.success.user.dataUpdated');
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
          if (err) return res.status(500).send('backend.error.server.uniquenessCheckError');

          if (results[0].loginCount > 0 || results[0].emailCount > 0) {
            return res.status(409).send('backend.error.conflict.loginOrEmailTaken');
          }

          try {
            const newLoginId = await createAuthEntry(db, loginname, password);

            db.query(
              `INSERT INTO users (loginid, name, email, anrede, city, street, houseNumber, postalCode, phone, mobile)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                newLoginId,
                name,
                email,
                anrede,
                city,
                street,
                houseNumber,
                postalCode,
                phone,
                mobile,
              ],
              (uErr) => {
                if (uErr) return res.status(500).send('backend.error.server.creationError');
                res.status(201).send('backend.success.user.created');
              }
            );
          } catch (err) {
            console.error('Fehler beim Anlegen:', err);
            res.status(500).send('backend.error.server.serverError');
          }
        }
      );
    }
  } catch (error) {
    console.error('Fehler in createOrUpdateUser:', error);
    res.status(500).send('backend.error.server.serverError');
  }
};
