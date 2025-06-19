'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.createOrUpdateUser =
  exports.createAuthEntry =
  exports.emailExistsForOtherUser =
  exports.getPasswordForLoginId =
  exports.changeAccessData =
  exports.getAnrede =
  exports.login =
  exports.createAccount =
    void 0;
const bcrypt = __importStar(require('bcrypt'));
const createAccount = (db, loginname, password) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const hashedPassword = yield bcrypt.hash(password, 10);
      const query = 'INSERT INTO authentification (loginname, password) VALUES (?, ?)';
      return new Promise((resolve, reject) => {
        db.query(query, [loginname, hashedPassword], (err, result) => {
          if (err) {
            reject(err);
          } else {
            // Cast result to OkPacket to access insertId
            const okPacket = result;
            resolve(okPacket.insertId);
          }
        });
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      return null;
    }
  });
exports.createAccount = createAccount;
const login = (db, req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { loginname, password } = req.body;
    const queryAuth = 'SELECT id, password FROM authentification WHERE loginname = ?';
    db.query(queryAuth, [loginname], (err, authResults) =>
      __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
          console.error('Fehler beim Abrufen der Login-Daten:', err);
          res.status(500).send('backend.error.server.serverError');
          return;
        }
        const authRows = authResults;
        if (authRows.length === 0) {
          res.status(404).json({ message: 'backend.error.notFound.userNotFound' });
          return;
        }
        const hashedPassword = authRows[0].password;
        const isPasswordValid = yield bcrypt.compare(password, hashedPassword);
        if (!isPasswordValid) {
          res.status(401).json({ message: 'backend.error.auth.wrongPassword' });
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
            console.error('Fehler beim Abrufen der Benutzerinformationen:', userErr);
            res.status(500).send('backend.error.server.loadingUserDataError');
            return;
          }
          const userRows = userResults;
          if (userRows.length === 0) {
            res.status(404).json({ message: 'backend.error.notFound.userInfoNotFound' });
            return;
          }
          // ✅ Erfolgreicher Login → Senden der vollständigen Benutzerinformationen
          res.json(userRows[0]);
        });
      })
    );
  });
exports.login = login;
const getAnrede = (db, req, res) => {
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
exports.getAnrede = getAnrede;
//------------------
const changeAccessData = (db, req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { userId, loginname, email, oldPassword, password, password2, changePassword } = req.body;
    if (!userId || !loginname || !email || !oldPassword) {
      res.status(400).json({ message: 'backend.error.validation.missingFields' });
      console.log('Fehlende Pflichtfelder:', { userId, loginname, email, oldPassword });
      return;
    }
    if (changePassword && (!password || !password2)) {
      res.status(400).json({ message: 'backend.error.validation.missingFields' });
      console.log('Fehlende Pflichtfelder:', { changePassword, password, password2, oldPassword });
      return;
    }
    try {
      // 1. Benutzer mit Login-Daten laden (JOIN authentification)
      const [userRows] = yield db.query(
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
      const passwordMatch = yield bcrypt.compare(oldPassword, user.password);
      if (!passwordMatch) {
        res.status(401).json({ message: 'backend.error.auth.oldPasswordWrong' });
        return;
      }
      // 3. Prüfen, ob E-Mail bereits vergeben ist (außer eigene)
      const [emailRows] = yield db.query('SELECT * FROM users WHERE email = ? AND userid != ?', [
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
        newPasswordHash = yield bcrypt.hash(password, 10);
      }
      // 5. Update in authentification
      yield db.query('UPDATE authentification SET loginname = ?, password = ? WHERE id = ?', [
        loginname,
        newPasswordHash,
        user.loginid,
      ]);
      // 6. Update in users
      yield db.query('UPDATE users SET email = ? WHERE userid = ?', [email, userId]);
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
  });
exports.changeAccessData = changeAccessData;
//------------------
function getPasswordForLoginId(db, loginid) {
  return __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
      db.query('SELECT password FROM authentification WHERE id = ?', [loginid], (err, results) => {
        if (err || results.length === 0) return resolve(null);
        resolve(results[0].password);
      });
    });
  });
}
exports.getPasswordForLoginId = getPasswordForLoginId;
function emailExistsForOtherUser(db, email, loginid) {
  return __awaiter(this, void 0, void 0, function* () {
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
  });
}
exports.emailExistsForOtherUser = emailExistsForOtherUser;
function createAuthEntry(db, loginname, password) {
  return __awaiter(this, void 0, void 0, function* () {
    const hash = yield bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO authentification (loginname, password) VALUES (?, ?)`,
        [loginname, hash],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.insertId);
        }
      );
    });
  });
}
exports.createAuthEntry = createAuthEntry;
const createOrUpdateUser = (db, req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
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
      res.status(400).send('backend.error.validation.missingRequiredFields');
      return;
    }
    try {
      if (loginid > 0) {
        // ✅ UPDATE BESTEHENDER USER
        // 1. Passwort prüfen
        const hashed = yield getPasswordForLoginId(db, loginid);
        if (!hashed) {
          res.status(404).send('backend.error.auth.authNotFound');
          return;
        }
        const match = yield bcrypt.compare(password, hashed);
        if (!match) {
          res.status(401).send('backend.error.auth.wrongPassword');
          return;
        }
        // 2. Prüfen, ob E-Mail bei anderem Benutzer vergeben ist
        const emailInUse = yield emailExistsForOtherUser(db, email, loginid);
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
            if (err) return res.status(500).send('backend.error.server.updateError');
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
          (err, results) =>
            __awaiter(void 0, void 0, void 0, function* () {
              if (err) return res.status(500).send('backend.error.server.uniquenessCheckError');
              if (results[0].loginCount > 0 || results[0].emailCount > 0) {
                return res.status(409).send('backend.error.conflict.loginOrEmailTaken');
              }
              try {
                const newLoginId = yield createAuthEntry(db, loginname, password);
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
            })
        );
      }
    } catch (error) {
      console.error('Fehler in createOrUpdateUser:', error);
      res.status(500).send('backend.error.server.serverError');
    }
  });
exports.createOrUpdateUser = createOrUpdateUser;
