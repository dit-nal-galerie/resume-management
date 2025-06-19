'use strict';
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
exports.updateOrCreateResume = void 0;
// --- Hilfsfunktion: Firma verarbeiten (INSERT oder UPDATE) ---
// Verwendet die Transaktions-Connection
function handleCompany(
  db,
  company,
  ref // Requirement 9: Use resume.ref
) {
  return __awaiter(this, void 0, void 0, function* () {
    // Requirement 1: Company kann null sein
    if (!company) {
      return null;
    }
    try {
      if (company.companyId === 0) {
        // Requirement 3: Neue Firma anlegen
        const insertQuery = `
                INSERT INTO companies (name, city, street, houseNumber, postalCode, isrecruter, ref)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
        const [result] = yield db.query(insertQuery, [
          company.name,
          company.city,
          company.street,
          company.houseNumber,
          company.postalCode,
          company.isRecruter || false,
          ref, // Standardwert für isrecruter falls nicht gesetzt
        ]);
        if (result.insertId) {
          console.log(`✅ Firma eingefügt mit ID: ${result.insertId}`);
          // Optional: Aktualisiere die ID im Objekt (wenn es weiterverwendet wird)
          // company.companyId = result.insertId;
          return result.insertId;
        } else {
          throw new Error('Fehler beim Einfügen der Firma: Keine insertId erhalten.');
        }
      } else if (company.companyId > 0) {
        // Requirement 4: Bestehende Firma aktualisieren
        const updateQuery = `
                UPDATE companies
                SET name = ?, city = ?, street = ?, houseNumber = ?, postalCode = ?, isrecruter = ?
                WHERE companyId = ?
            `;
        // 'ref' wird hier NICHT aktualisiert, da dies normalerweise konstant ist.
        const [result] = yield db.query(updateQuery, [
          company.name,
          company.city,
          company.street,
          company.houseNumber,
          company.postalCode,
          company.isRecruter || false,
          company.companyId,
        ]);
        console.log(
          `✅ Firma aktualisiert mit ID: ${company.companyId}. Betroffene Zeilen: ${result.affectedRows}`
        );
        return company.companyId;
      } else {
        // Ungültige companyId (z.B. negativ)
        console.warn(`Ungültige companyId (${company.companyId}) erhalten. Wird ignoriert.`);
        return null;
      }
    } catch (error) {
      console.error(
        `❌ Fehler bei der Verarbeitung von Firma ${company.companyId}:`,
        error.message
      );
      // Fehler innerhalb der Transaktion weiterwerfen
      throw new Error(
        `Fehler bei der Verarbeitung von Firma ${company.companyId}: ${error.message}`
      );
    }
  });
}
// --- Hilfsfunktion: Kontakt verarbeiten (INSERT oder UPDATE) ---
// Verwendet die Transaktions-Connection
function handleContact(
  db,
  contact,
  companyId, // Zugehörige Firmen-ID
  ref // Requirement 9: Use resume.ref
) {
  return __awaiter(this, void 0, void 0, function* () {
    // Requirement 2: Kein Kontakt speichern, wenn Firma null ist (oder companyId ungültig)
    if (!contact || companyId === null || companyId <= 0) {
      if (contact) {
        console.log(
          `ℹ️ Kontakt für ungültige/fehlende Firma (ID: ${companyId}) wird übersprungen.`
        );
      }
      return null;
    }
    // Requirement 6: anrede kann 0 sein, aber nicht null, wenn Kontakt existiert
    const {
      vorname = '', // Standardwerte verwenden, falls Felder fehlen
      name, // `name` ist NOT NULL im Schema, sollte vorhanden sein
      email = '',
      anrede = 0, // Standardwert 0, wenn nicht angegeben
      title = '',
      zusatzname = '',
      phone = '',
      mobile = '',
      contactid, // Bestehende ID
    } = contact;
    // Wichtig: Prüfen, ob Pflichtfelder (wie `name`) vorhanden sind
    if (!name) {
      console.warn('Kontaktname fehlt. Kontakt wird übersprungen.');
      // Alternativ: Fehler werfen, wenn Name zwingend erforderlich ist
      // throw new Error("Kontaktname ist erforderlich.");
      return null;
    }
    // Sicherstellen, dass `anrede` nicht null ist, wenn ein Kontaktobjekt übergeben wurde
    const finalAnrede =
      contact.anrede === null || contact.anrede === undefined ? 0 : contact.anrede;
    try {
      if (contactid === 0) {
        // Requirement 3 (analog für Kontakt): Neuen Kontakt anlegen
        const insertQuery = `
                INSERT INTO contacts (vorname, name, email, anrede, title, zusatzname, phone, mobile, company, ref)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
        const [result] = yield db.query(insertQuery, [
          vorname,
          name,
          email,
          finalAnrede,
          title,
          zusatzname,
          phone,
          mobile,
          companyId,
          ref,
        ]);
        if (result.insertId) {
          console.log(`✅ Kontakt eingefügt mit ID: ${result.insertId} für Firma ${companyId}`);
          return result.insertId;
        } else {
          throw new Error('Fehler beim Einfügen des Kontakts: Keine insertId erhalten.');
        }
      } else if (contactid > 0) {
        // Requirement 5: Bestehenden Kontakt aktualisieren
        const updateQuery = `
                UPDATE contacts
                SET vorname = ?, name = ?, email = ?, anrede = ?, title = ?, zusatzname = ?, phone = ?, mobile = ?, company = ?
                WHERE contactid = ?
            `;
        // 'ref' wird nicht aktualisiert. 'company' wird aktualisiert, falls sich die Zuordnung ändert (sollte nicht?).
        const [result] = yield db.query(updateQuery, [
          vorname,
          name,
          email,
          finalAnrede,
          title,
          zusatzname,
          phone,
          mobile,
          companyId,
          contactid,
        ]);
        console.log(
          `✅ Kontakt aktualisiert mit ID: ${contactid}. Betroffene Zeilen: ${result.affectedRows}`
        );
        return contactid;
      } else {
        console.warn(`Ungültige contactid (${contactid}) erhalten. Wird ignoriert.`);
        return null;
      }
    } catch (error) {
      console.error(
        `❌ Fehler bei der Verarbeitung von Kontakt ${contactid} für Firma ${companyId}:`,
        error.message
      );
      throw new Error(`Fehler bei der Verarbeitung von Kontakt ${contactid}: ${error.message}`);
    }
  });
}
// --- Hilfsfunktion: Historie verarbeiten ---
// Verwendet die Transaktions-Connection
function saveHistory(
  db,
  resumeId,
  newStateId,
  isNewResume // Flag, um zu wissen, ob es ein neues Resume ist
) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      if (isNewResume) {
        // Requirement 7: Immer Eintrag für neues Resume
        console.log(`📝 Füge History für neues Resume ${resumeId} mit Status ${newStateId} hinzu.`);
        const insertHistoryQuery = `
                INSERT INTO history (resumeid, date, stateid)
                VALUES (?, CURDATE(), ?) -- Oder NOW() wenn Spalte DATETIME ist
            `;
        yield db.query(insertHistoryQuery, [resumeId, newStateId]);
      } else {
        // Requirement 8: Prüfen für bestehendes Resume
        const getLastStateQuery = `
                SELECT stateid FROM history
                WHERE resumeid = ?
                ORDER BY date DESC, historyid DESC
                LIMIT 1
            `;
        const [lastStateRows] = yield db.query(getLastStateQuery, [resumeId]);
        let needsInsert = true;
        if (lastStateRows.length > 0) {
          const lastStateId = lastStateRows[0].stateid;
          console.log(
            `ℹ️ Letzter bekannter Status für Resume ${resumeId} ist ${lastStateId}. Neuer Status ist ${newStateId}.`
          );
          if (lastStateId === newStateId) {
            needsInsert = false;
            console.log(
              `ℹ️ Status hat sich nicht geändert. Kein neuer History-Eintrag für Resume ${resumeId}.`
            );
          }
        } else {
          console.log(
            `ℹ️ Keine vorherige History für Resume ${resumeId} gefunden. Füge ersten Eintrag hinzu.`
          );
        }
        if (needsInsert) {
          console.log(
            `📝 Füge History für bestehendes Resume ${resumeId} mit neuem Status ${newStateId} hinzu.`
          );
          const insertHistoryQuery = `
                    INSERT INTO history (resumeid, date, stateid)
                    VALUES (?, CURDATE(), ?) -- Oder NOW() wenn Spalte DATETIME ist
                `;
          yield db.query(insertHistoryQuery, [resumeId, newStateId]);
        }
      }
    } catch (error) {
      console.error(`❌ Fehler beim Speichern der History für Resume ${resumeId}:`, error.message);
      throw new Error(`Fehler beim Speichern der History für Resume ${resumeId}: ${error.message}`);
    }
  });
}
// --- Hauptfunktion: Resume aktualisieren oder erstellen ---
// Erwartet einen Pool von mysql2/promise
const updateOrCreateResume = (dbPool, req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    let connection = null;
    const resume = req.body;
    // Grundlegende Eingabevalidierung
    if (
      !resume ||
      !resume.ref ||
      !resume.position ||
      resume.stateId === undefined ||
      resume.stateId === null
    ) {
      res.status(400).send('backend.error.validation.missingResumeData');
      return;
    }
    const userRef = resume.ref; // Requirement 9
    try {
      // 1. Verbindung aus dem Pool holen und Transaktion starten
      connection = yield dbPool.getConnection();
      console.log('ℹ️ Transaktion gestartet.');
      yield connection.beginTransaction();
      // 2. Firmen verarbeiten (Requirement 10: Gleich behandeln)
      // Firmen-ID für das Hauptunternehmen
      const companyId = yield handleCompany(connection, resume.company, userRef);
      // Firmen-ID für das vermittelnde Unternehmen (Recruiter)
      const parentCompanyId = yield handleCompany(connection, resume.recrutingCompany, userRef);
      // 3. Kontakte verarbeiten (Requirement 11: Gleich behandeln, abhängig von Firma)
      // Kontakt für das Hauptunternehmen (nur wenn companyId gültig ist)
      const contactCompanyId = yield handleContact(
        connection,
        resume.contactCompany,
        companyId,
        userRef
      );
      // Kontakt für den Recruiter (nur wenn parentCompanyId gültig ist)
      const contactParentCompanyId = yield handleContact(
        connection,
        resume.contactRecrutingCompany,
        parentCompanyId,
        userRef
      );
      let finalResumeId = resume.resumeId;
      const isNewResume = resume.resumeId === 0;
      // 4. Resume verarbeiten (INSERT oder UPDATE)
      if (isNewResume) {
        // INSERT
        console.log(`🔄 Erstelle neues Resume für User ${userRef}...`);
        const insertResumeQuery = `
                INSERT INTO resumes (ref, position, stateId, link, comment, companyId, parentCompanyId, contactCompanyId, contactParentCompanyId, created)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
        const [result] = yield connection.query(insertResumeQuery, [
          userRef,
          resume.position,
          resume.stateId,
          resume.link || null,
          resume.comment || null,
          companyId,
          parentCompanyId,
          contactCompanyId,
          contactParentCompanyId, // Wird null sein, wenn Kontakt nicht verarbeitet wurde
        ]);
        if (!result.insertId) {
          throw new Error('Fehler beim Einfügen des Resumes: Keine insertId erhalten.');
        }
        finalResumeId = result.insertId; // Die neue ID für die History merken
        console.log(`✅ Neues Resume erstellt mit ID: ${finalResumeId}`);
      } else {
        // UPDATE
        if (finalResumeId <= 0) {
          throw new Error(`Ungültige resumeId (${finalResumeId}) für Update-Operation.`);
        }
        console.log(`🔄 Aktualisiere Resume mit ID: ${finalResumeId} für User ${userRef}...`);
        const updateResumeQuery = `
                UPDATE resumes
                SET position = ?, stateId = ?, link = ?, comment = ?, companyId = ?,
                    parentCompanyId = ?, contactCompanyId = ?, contactParentCompanyId = ?
                WHERE resumeId = ? AND ref = ?
            `;
        const [result] = yield connection.query(updateResumeQuery, [
          resume.position,
          resume.stateId,
          resume.link || null,
          resume.comment || null,
          companyId,
          parentCompanyId,
          contactCompanyId,
          contactParentCompanyId,
          finalResumeId,
          userRef,
        ]);
        console.log(
          `✅ Resume ${finalResumeId} aktualisiert. Betroffene Zeilen: ${result.affectedRows}`
        );
        // Optional: Prüfen ob result.affectedRows > 0, um sicherzustellen, dass etwas geändert wurde.
        if (result.affectedRows === 0) {
          console.warn(
            `Keine Zeile für Resume ID ${finalResumeId} und User Ref ${userRef} zum Aktualisieren gefunden.`
          );
          // Eventuell Fehler werfen oder spezifische Rückmeldung geben
        }
      }
      // 5. Historie verarbeiten (Requirements 7 & 8)
      // Nutzt finalResumeId (entweder die alte oder die neue ID)
      yield saveHistory(connection, finalResumeId, resume.stateId, isNewResume);
      // 6. Transaktion abschließen (COMMIT)
      yield connection.commit();
      console.log('✅ Transaktion erfolgreich abgeschlossen (COMMIT).');
      // 7. Erfolgsantwort senden
      res.status(isNewResume ? 201 : 200).json({
        message: isNewResume ? 'backend.success.resume.created' : 'backend.success.resume.updated',
        resumeId: finalResumeId,
        // Optional: IDs der verarbeiteten abhängigen Entitäten zurückgeben
        companyId: companyId,
        parentCompanyId: parentCompanyId,
        contactCompanyId: contactCompanyId,
        contactParentCompanyId: contactParentCompanyId,
      });
    } catch (error) {
      // Bei Fehlern: Rollback durchführen
      if (connection) {
        console.error('❌ Fehler während der Transaktion, führe ROLLBACK aus.');
        yield connection.rollback();
        console.log('↩️ Transaktion zurückgerollt.');
      }
      console.error('❌ Fehler bei der Verarbeitung des Resumes:', error.message);
      // Sicherstellen, dass die Antwort nur einmal gesendet wird
      if (!res.headersSent) {
        res.status(500).json({
          message: 'backend.error.server.serverError',
          error: error.message, // Detaillierte Fehlermeldung für Debugging (ggf. im Produktivbetrieb anpassen)
        });
      }
    } finally {
      // Verbindung immer freigeben
      if (connection) {
        connection.release();
        console.log('ℹ️ Datenbankverbindung freigegeben.');
      }
    }
  });
exports.updateOrCreateResume = updateOrCreateResume;
