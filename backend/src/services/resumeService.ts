import { Request, Response } from 'express';
import { Connection, ResultSetHeader, RowDataPacket } from 'mysql2';
import { Resume } from '../../../interfaces/Resume';
import { Company } from '../../../interfaces/Company';
import { Contact } from '../../../interfaces/Contact';

export const getResumeById = (db: Connection, req: Request, res: Response): void => {
  console.log(" Aufruf von getResumeById mit ID:", req.params.resumeId);
  const { resumeId } = req.params;

  if (!resumeId) {
    res.status(400).send("Fehlende Resume-ID.");
    return;
  }

  const query = `
    SELECT 
      r.resumeId,
      r.ref,
      r.position,
      r.stateId,
      s.text AS stateText, -- Status-Text aus der Tabelle states
      r.link,
      r.comment,
      r.created,
      c1.companyId AS companyId,
      c1.name AS companyName,
      c1.city AS companyCity,
      c1.street AS companyStreet,
      c1.houseNumber AS companyHouseNumber,
      c1.postalCode AS companyPostalCode,
      c1.isRecruter AS companyIsRecruter,
      c1.ref AS companyRef,
      c2.companyId AS parentCompanyId,
      c2.name AS parentCompanyName,
      c2.city AS parentCompanyCity,
      c2.street AS parentCompanyStreet,
      c2.houseNumber AS parentCompanyHouseNumber,
      c2.postalCode AS parentCompanyPostalCode,
      c2.isRecruter AS parentCompanyIsRecruter,
      c2.ref AS parentCompanyRef,
      cc.contactId AS contactCompanyId,
      cc.name AS contactCompanyName,
      cp.contactId AS contactParentCompanyId,
      cp.name AS contactParentCompanyName
    FROM resumes r
    LEFT JOIN states s ON r.stateId = s.stateId -- Verknüpfung mit states für den Status-Text
    LEFT JOIN companies c1 ON r.companyId = c1.companyId
    LEFT JOIN companies c2 ON r.parentCompanyId = c2.companyId
    LEFT JOIN contacts cc ON r.contactCompanyId = cc.contactId
    LEFT JOIN contacts cp ON r.contactParentCompanyId = cp.contactId
    WHERE r.resumeId = ?;
  `;

  db.query(query, [resumeId], (err, results) => {
    console.log("🔹 SQL-Abfrage ausgeführt:", query);
    if (err) {
      console.error("Fehler beim Abrufen des Resumes:", err);
      res.status(500).send("Serverfehler.");
      return;
    }
  console.log("🔹 Abruf des Resumes mit ID:", resumeId);
    // Use Array.isArray to ensure results is an array
    if (Array.isArray(results)) {
      if (results.length === 0) {
        res.status(404).send("Resume nicht gefunden.");
        return;
      }
  
      const row = results[0] as RowDataPacket;
      const resume: Resume = {
        resumeId: row.resumeId,
        ref: row.ref,
        position: row.position,
        stateId: row.stateId,
        stateText: row.stateText, 
        link: row.link,
        comment: row.comment,
        created: row.created,
        company: row.companyId
          ? {
              companyId: row.companyId,
              name: row.companyName,
              city: row.companyCity,
              street: row.companyStreet,
              houseNumber: row.companyHouseNumber,
              postalCode: row.companyPostalCode,
              isRecruter: row.companyIsRecruter,
              ref: row.companyRef,
            }
          : null,
        parentCompany: row.parentCompanyId
          ? {
              companyId: row.parentCompanyId,
              name: row.parentCompanyName,
              city: row.parentCompanyCity,
              street: row.parentCompanyStreet,
              houseNumber: row.parentCompanyHouseNumber,
              postalCode: row.parentCompanyPostalCode,
              isRecruter: row.parentCompanyIsRecruter,
              ref: row.parentCompanyRef,
            }
          : null,
        contactCompany: row.contactCompanyId
          ? {
              contactid: row.contactCompanyId,
              name: row.contactCompanyName,
              vorname: row.contactCompanyVorname || null,
              email: row.contactCompanyEmail || null,
              anrede: row.contactCompanyAnrede || null,
              company: row.contactCompanyCompany || null,
              ref: row.contactCompanyRef || null,
            }
          : null,
        contactParentCompany: row.contactParentCompanyId
          ? {
              contactid: row.contactParentCompanyId,
              name: row.contactParentCompanyName,
              vorname: row.contactParentCompanyVorname || null,
              email: row.contactParentCompanyEmail || null,
              anrede: row.contactParentCompanyAnrede || null,
              company: row.contactParentCompanyCompany || null,
              ref: row.contactParentCompanyRef || null,
            }
          : null,
      };
  
      res.json(resume);
    } else {
      console.error("Unerwartetes Ergebnisformat:", results);
      res.status(500).send("Unerwartetes Ergebnisformat.");
    }
  });
};
export const updateOrCreateResume = (db: Connection, req: Request, res: Response): void => {
  const resume: Resume = req.body;
  console.log("🔹 Empfangenes Resume-Objekt:", resume);

  if (!resume.ref) {
    res.status(400).send("Resume-ID und User-ID sind erforderlich.");
    return;
  }

  if (resume.resumeId === 0) {
    // Neue Bewerbung erstellen
    const insertResumeQuery = `
      INSERT INTO resumes (ref, position, stateid, link, comment, companyid, parentcompanyid, created) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;

    db.query(
      insertResumeQuery,
      [
        resume.ref,
        resume.position,
        resume.stateId,
        resume.link,
        resume.comment,
        resume.company?.companyId || null,
        resume.parentCompany?.companyId || null,
      ],
      (err, result) => {
        if (err) {
          console.error("❌ Fehler beim Erstellen der Bewerbung:", err.message);
          res.status(500).send(`Fehler beim Erstellen der Bewerbung: ${err.message}`);
          return;
        }

        if ("insertId" in result) {
          const newResumeId = (result as ResultSetHeader).insertId;

          // Erste Statusänderung in `history` speichern
          const insertHistoryQuery = `
            INSERT INTO history (resumeid, date, stateid) 
            VALUES (?, NOW(), ?)`;

          db.query(insertHistoryQuery, [newResumeId, resume.stateId], (historyErr) => {
            if (historyErr) {
              console.error("❌ Fehler beim Speichern in History:", historyErr.message);
              res.status(500).send(`Fehler beim Speichern in History: ${historyErr.message}`);
              return;
            }

            res.status(201).send("✅ Neue Bewerbung erfolgreich gespeichert.");
          });
        } else {
          res.status(500).send("❌ Fehler: Konnte keine neue Resume-ID ermitteln.");
        }
      }
    );
  } else {
    // Bestehende Bewerbung aktualisieren
    const updateQuery = `
      UPDATE resumes 
      SET position = ?, stateid = ?, link = ?, comment = ?, companyid = ?, parentcompanyid = ? 
      WHERE resumeid = ? AND ref = ?`;

    db.query(
      updateQuery,
      [
        resume.position,
        resume.stateId,
        resume.link,
        resume.comment,
        resume.company?.companyId || null,
        resume.parentCompany?.companyId || null,
        resume.resumeId,
        resume.ref,
      ],
      (err) => {
        if (err) {
          console.error("❌ Fehler beim Aktualisieren der Bewerbung:", err.message);
          res.status(500).send(`Fehler beim Aktualisieren der Bewerbung: ${err.message}`);
          return;
        }

        res.status(200).send("✅ Bewerbung erfolgreich aktualisiert.");
      }
    );
  }
};

export const getResumesWithUsers = (db: Connection, req: Request, res: Response): void => {
  const { userid } = req.query;

  if (!userid) {
    res.status(400).send("Fehlende Nutzer-ID.");
    return;
  }

  const query = `
    SELECT 
      r.resumeId,
      r.ref,
      r.position,
      r.stateId,
      s.text AS stateText, -- Status-Text aus der Tabelle states
      r.link,
      r.comment,
      r.created,
      c1.companyId AS companyId,
      c1.name AS companyName,
      c1.city AS companyCity,
      c1.street AS companyStreet,
      c1.houseNumber AS companyHouseNumber,
      c1.postalCode AS companyPostalCode,
      c1.isRecruter AS companyIsRecruter,
      c1.ref AS companyRef,
      c2.companyId AS parentCompanyId,
      c2.name AS parentCompanyName,
      c2.city AS parentCompanyCity,
      c2.street AS parentCompanyStreet,
      c2.houseNumber AS parentCompanyHouseNumber,
      c2.postalCode AS parentCompanyPostalCode,
      c2.isRecruter AS parentCompanyIsRecruter,
      c2.ref AS parentCompanyRef,
      cc.contactId AS contactCompanyId,
      cc.name AS contactCompanyName,
      cp.contactId AS contactParentCompanyId,
      cp.name AS contactParentCompanyName
    FROM resumes r
    LEFT JOIN states s ON r.stateId = s.stateId -- Verknüpfung mit states für den Status-Text
    LEFT JOIN companies c1 ON r.companyId = c1.companyId
    LEFT JOIN companies c2 ON r.parentCompanyId = c2.companyId
    LEFT JOIN contacts cc ON r.contactCompanyId = cc.contactId
    LEFT JOIN contacts cp ON r.contactParentCompanyId = cp.contactId
    WHERE r.ref = ?;
  `;

  db.query(query, [userid], (err, results) => {
    if (err) {
      console.error("Fehler beim Abrufen der Bewerbungen:", err);
      res.status(500).send("Serverfehler.");
      return;
    }

    // Ergebnisse zurückgeben
    res.json(
      (results as RowDataPacket[]).map((row: RowDataPacket) => ({
        resumeId: row.resumeId,
        ref: row.ref,
        position: row.position,
        stateId: row.stateId,
        stateText: row.stateText, // Status-Text hinzufügen
        link: row.link,
        comment: row.comment,
        created: row.created,
        company: row.companyId
          ? {
              companyId: row.companyId,
              name: row.companyName,
              city: row.companyCity,
              street: row.companyStreet,
              houseNumber: row.companyHouseNumber,
              postalCode: row.companyPostalCode,
              isRecruter: row.companyIsRecruter,
              ref: row.companyRef,
            }
          : null,
        parentCompany: row.parentCompanyId
          ? {
              companyId: row.parentCompanyId,
              name: row.parentCompanyName,
              city: row.parentCompanyCity,
              street: row.parentCompanyStreet,
              houseNumber: row.parentCompanyHouseNumber,
              postalCode: row.parentCompanyPostalCode,
              isRecruter: row.parentCompanyIsRecruter,
              ref: row.parentCompanyRef,
            }
          : null,
        contactCompany: row.contactCompanyId
          ? {
              contactId: row.contactCompanyId,
              name: row.contactCompanyName,
            }
          : null,
        contactParentCompany: row.contactParentCompanyId
          ? {
              contactId: row.contactParentCompanyId,
              name: row.contactParentCompanyName,
            }
          : null,
      }))
    );
  });
};

export const getStates = (db: Connection, req: Request, res: Response): void => {
  const query = "SELECT stateid, text FROM states ORDER BY stateid ASC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Fehler beim Abrufen der Status:", err);
      res.status(500).send("Serverfehler.");
      return;
    }

    res.json(results);
  });
};