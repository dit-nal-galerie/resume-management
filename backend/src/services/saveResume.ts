import { Request, Response } from 'express';
// Wichtig: Importiere von 'mysql2/promise' für async/await Unterstützung
import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Resume } from '../../../interfaces/Resume';
import { Company } from '../../../interfaces/Company';
import { Contact } from '../../../interfaces/Contact';

// --- Hilfsfunktion: Firma verarbeiten (INSERT oder UPDATE) ---
// Verwendet die Transaktions-Connection
async function handleCompany(
  db: PoolConnection,
  company: Company | null,
  ref: number // Requirement 9: Use resume.ref
): Promise<number | null> {
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
      const [result] = await db.query<ResultSetHeader>(insertQuery, [
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
      const [result] = await db.query<ResultSetHeader>(updateQuery, [
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
  } catch (error: any) {
    console.error(`❌ Fehler bei der Verarbeitung von Firma ${company.companyId}:`, error.message);
    // Fehler innerhalb der Transaktion weiterwerfen
    throw new Error(`Fehler bei der Verarbeitung von Firma ${company.companyId}: ${error.message}`);
  }
}

// --- Hilfsfunktion: Kontakt verarbeiten (INSERT oder UPDATE) ---
// Verwendet die Transaktions-Connection
async function handleContact(
  db: PoolConnection,
  contact: Contact | null,
  companyId: number | null, // Zugehörige Firmen-ID
  ref: number // Requirement 9: Use resume.ref
): Promise<number | null> {
  // Requirement 2: Kein Kontakt speichern, wenn Firma null ist (oder companyId ungültig)
  if (!contact || companyId === null || companyId <= 0) {
    if (contact) {
      console.log(`ℹ️ Kontakt für ungültige/fehlende Firma (ID: ${companyId}) wird übersprungen.`);
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
  const finalAnrede = contact.anrede === null || contact.anrede === undefined ? 0 : contact.anrede;

  try {
    if (contactid === 0) {
      // Requirement 3 (analog für Kontakt): Neuen Kontakt anlegen
      const insertQuery = `
                INSERT INTO contacts (vorname, name, email, anrede, title, zusatzname, phone, mobile, company, ref)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
      const [result] = await db.query<ResultSetHeader>(insertQuery, [
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
      const [result] = await db.query<ResultSetHeader>(updateQuery, [
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
  } catch (error: any) {
    console.error(
      `❌ Fehler bei der Verarbeitung von Kontakt ${contactid} für Firma ${companyId}:`,
      error.message
    );
    throw new Error(`Fehler bei der Verarbeitung von Kontakt ${contactid}: ${error.message}`);
  }
}

// --- Hilfsfunktion: Historie verarbeiten ---
// Verwendet die Transaktions-Connection
async function saveHistory(
  db: PoolConnection,
  resumeId: number,
  newStateId: number,
  isNewResume: boolean // Flag, um zu wissen, ob es ein neues Resume ist
): Promise<void> {
  try {
    if (isNewResume) {
      // Requirement 7: Immer Eintrag für neues Resume
      console.log(`📝 Füge History für neues Resume ${resumeId} mit Status ${newStateId} hinzu.`);
      const insertHistoryQuery = `
                INSERT INTO history (resumeid, date, stateid)
                VALUES (?, CURDATE(), ?) -- Oder NOW() wenn Spalte DATETIME ist
            `;
      await db.query(insertHistoryQuery, [resumeId, newStateId]);
    } else {
      // Requirement 8: Prüfen für bestehendes Resume
      const getLastStateQuery = `
                SELECT stateid FROM history
                WHERE resumeid = ?
                ORDER BY date DESC, historyid DESC
                LIMIT 1
            `;
      const [lastStateRows] = await db.query<RowDataPacket[]>(getLastStateQuery, [resumeId]);

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
        await db.query(insertHistoryQuery, [resumeId, newStateId]);
      }
    }
  } catch (error: any) {
    console.error(`❌ Fehler beim Speichern der History für Resume ${resumeId}:`, error.message);
    throw new Error(`Fehler beim Speichern der History für Resume ${resumeId}: ${error.message}`);
  }
}

// --- Hauptfunktion: Resume aktualisieren oder erstellen ---
// Erwartet einen Pool von mysql2/promise
export const updateOrCreateResume = async (
  dbPool: Pool,
  req: Request,
  res: Response
): Promise<void> => {
  let connection: PoolConnection | null = null;
  const resume: Resume = req.body;

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
    connection = await dbPool.getConnection();
    console.log('ℹ️ Transaktion gestartet.');
    await connection.beginTransaction();

    // 2. Firmen verarbeiten (Requirement 10: Gleich behandeln)
    // Firmen-ID für das Hauptunternehmen
    const companyId = await handleCompany(connection, resume.company, userRef);
    // Firmen-ID für das vermittelnde Unternehmen (Recruiter)
    const parentCompanyId = await handleCompany(connection, resume.recrutingCompany, userRef);

    // 3. Kontakte verarbeiten (Requirement 11: Gleich behandeln, abhängig von Firma)
    // Kontakt für das Hauptunternehmen (nur wenn companyId gültig ist)
    const contactCompanyId = await handleContact(
      connection,
      resume.contactCompany,
      companyId,
      userRef
    );
    // Kontakt für den Recruiter (nur wenn parentCompanyId gültig ist)
    const contactParentCompanyId = await handleContact(
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
      const [result] = await connection.query<ResultSetHeader>(insertResumeQuery, [
        userRef,
        resume.position,
        resume.stateId,
        resume.link || null,
        resume.comment || null,
        companyId, // Wird null sein, wenn Firma null war
        parentCompanyId, // Wird null sein, wenn Firma null war
        contactCompanyId, // Wird null sein, wenn Kontakt nicht verarbeitet wurde
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
      const [result] = await connection.query<ResultSetHeader>(updateResumeQuery, [
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
    await saveHistory(connection, finalResumeId, resume.stateId, isNewResume);

    // 6. Transaktion abschließen (COMMIT)
    await connection.commit();
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
  } catch (error: any) {
    // Bei Fehlern: Rollback durchführen
    if (connection) {
      console.error('❌ Fehler während der Transaktion, führe ROLLBACK aus.');
      await connection.rollback();
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
};
