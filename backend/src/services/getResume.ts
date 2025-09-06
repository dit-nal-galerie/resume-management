import { Request, Response } from 'express';
// Importiere Pool und Typen von mysql2/promise
import { Pool, PoolConnection } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';
import { Resume } from '../../../interfaces';
import { getUserIdFromToken } from './userService';

/**
 * Lädt ein spezifisches Resume anhand seiner ID, inklusive zugehöriger
 * Firmen- und Kontaktinformationen.
 * Verwendet async/await und einen Connection Pool.
 */
export const getResumeById = async (dbPool: Pool, req: Request, res: Response): Promise<void> => {
  const { resumeId } = req.params;
  let connection: PoolConnection | null = null;

  // Verbesserte Validierung der ID
  const id = parseInt(resumeId, 10);

  if (isNaN(id) || id <= 0) {
    res.status(400).send('backend.error.validation.invalidResumeId');

    return;
  }

  // Korrigiertes SQL-Query mit allen benötigten Feldern und Aliasen
  // (Verwenden Sie Aliase, um Namenskollisionen zu vermeiden und die Zuordnung zu erleichtern)
  const query = `
      SELECT
          r.resumeId, r.ref, r.position, r.stateId, r.link, r.comment, r.created,
          -- Status Text
          s.text AS stateText,
          -- Company (c1) Details
          c1.companyId AS company_Id, c1.name AS company_Name, c1.city AS company_City,
          c1.street AS company_Street, c1.houseNumber AS company_HouseNumber,
          c1.postalCode AS company_PostalCode, c1.isrecruter AS company_IsRecruter,
          c1.ref AS company_Ref,
          -- Recruiting/Parent Company (c2) Details
          c2.companyId AS parentCompany_Id, c2.name AS parentCompany_Name, c2.city AS parentCompany_City,
          c2.street AS parentCompany_Street, c2.houseNumber AS parentCompany_HouseNumber,
          c2.postalCode AS parentCompany_PostalCode, c2.isrecruter AS parentCompany_IsRecruter,
          c2.ref AS parentCompany_Ref,
          -- Contact Company (cc) Details - ALLE benötigten Felder hinzufügen!
          cc.contactid AS contactCompany_Id, cc.vorname AS contactCompany_Vorname, cc.name AS contactCompany_Name,
          cc.email AS contactCompany_Email, cc.anrede AS contactCompany_Anrede, cc.title AS contactCompany_Title,
          cc.zusatzname AS contactCompany_Zusatzname, cc.phone AS contactCompany_Phone, cc.mobile AS contactCompany_Mobile,
          cc.company AS contactCompany_CompanyId, cc.ref AS contactCompany_Ref,
          -- Contact Recruiting/Parent Company (cp) Details - ALLE benötigten Felder hinzufügen!
          cp.contactid AS contactParentCompany_Id, cp.vorname AS contactParentCompany_Vorname, cp.name AS contactParentCompany_Name,
          cp.email AS contactParentCompany_Email, cp.anrede AS contactParentCompany_Anrede, cp.title AS contactParentCompany_Title,
          cp.zusatzname AS contactParentCompany_Zusatzname, cp.phone AS contactParentCompany_Phone, cp.mobile AS contactParentCompany_Mobile,
          cp.company AS contactParentCompany_CompanyId, cp.ref AS contactParentCompany_Ref
      FROM resumes r
      LEFT JOIN states s ON r.stateId = s.stateid -- Sicherstellen, dass Spaltenname 'stateid' korrekt ist
      LEFT JOIN companies c1 ON r.companyId = c1.companyId
      LEFT JOIN companies c2 ON r.parentCompanyId = c2.companyId
      LEFT JOIN contacts cc ON r.contactCompanyId = cc.contactid -- Sicherstellen, dass Spaltenname 'contactid' korrekt ist
      LEFT JOIN contacts cp ON r.contactParentCompanyId = cp.contactid -- Sicherstellen, dass Spaltenname 'contactid' korrekt ist
      WHERE r.resumeId = ?;
    `;

  try {
    // Verbindung aus dem Pool holen
    connection = await dbPool.getConnection();
    console.log(`[getResumeById] Führe Query für Resume ID ${id} aus...`);

    // Query ausführen
    const [results] = await connection.query<RowDataPacket[]>(query, [id]);

    // Prüfen, ob ein Ergebnis gefunden wurde
    if (results.length === 0) {
      console.log(`[getResumeById] Resume mit ID ${id} nicht gefunden.`);
      res.status(404).send('backend.error.notFound.resumeNotFound');

      return; // Frühzeitiger Ausstieg
    }

    // Das erste (und einzige erwartete) Ergebnis nehmen
    const row = results[0];

    // Daten in das verschachtelte Resume-Interface mappen
    const resume: Resume = {
      resumeId: row.resumeId,
      ref: row.ref,
      position: row.position,
      stateId: row.stateId,
      stateText: row.stateText, // Aus dem JOIN mit 'states'
      link: row.link,
      comment: row.comment,
      // 'created' Datum/Zeit korrekt formatieren (DB gibt oft Date-Objekt oder String zurück)
      created: row.created instanceof Date ? row.created.toISOString() : String(row.created),

      // Firma (company) zuordnen
      company: row.company_Id
        ? {
            companyId: row.company_Id,
            name: row.company_Name,
            city: row.company_City,
            street: row.company_Street,
            houseNumber: row.company_HouseNumber,
            postalCode: row.company_PostalCode,
            // isRecruter: DB gibt oft 0/1 zurück -> in Boolean umwandeln
            isRecruter: Boolean(row.company_IsRecruter),
            ref: row.company_Ref,
          }
        : null,

      // Recruiter-Firma (recrutingCompany) zuordnen
      recrutingCompany: row.parentCompany_Id
        ? {
            companyId: row.parentCompany_Id,
            name: row.parentCompany_Name,
            city: row.parentCompany_City,
            street: row.parentCompany_Street,
            houseNumber: row.parentCompany_HouseNumber,
            postalCode: row.parentCompany_PostalCode,
            isRecruter: Boolean(row.parentCompany_IsRecruter),
            ref: row.parentCompany_Ref,
          }
        : null,

      // Kontakt der Firma (contactCompany) zuordnen
      contactCompany: row.contactCompany_Id
        ? {
            contactid: row.contactCompany_Id,
            vorname: row.contactCompany_Vorname,
            name: row.contactCompany_Name,
            email: row.contactCompany_Email,
            anrede: row.contactCompany_Anrede,
            title: row.contactCompany_Title,
            zusatzname: row.contactCompany_Zusatzname,
            phone: row.contactCompany_Phone,
            mobile: row.contactCompany_Mobile,
            company: row.contactCompany_CompanyId, // Das ist die FK-Spalte in contacts
            ref: row.contactCompany_Ref,
          }
        : null,

      // Kontakt der Recruiter-Firma (contactRecrutingCompany) zuordnen
      contactRecrutingCompany: row.contactParentCompany_Id
        ? {
            contactid: row.contactParentCompany_Id,
            vorname: row.contactParentCompany_Vorname,
            name: row.contactParentCompany_Name,
            email: row.contactParentCompany_Email,
            anrede: row.contactParentCompany_Anrede,
            title: row.contactParentCompany_Title,
            zusatzname: row.contactParentCompany_Zusatzname,
            phone: row.contactParentCompany_Phone,
            mobile: row.contactParentCompany_Mobile,
            company: row.contactParentCompany_CompanyId, // Das ist die FK-Spalte in contacts
            ref: row.contactParentCompany_Ref,
          }
        : null,
    };

    console.log(JSON.stringify(resume, null, 2)); // Debug-Ausgabe des Resume-Objekts
    // Erfolgreiche Antwort mit dem strukturierten Resume-Objekt senden
    res.status(200).json(resume);
  } catch (error: any) {
    console.error(`[getResumeById] Fehler beim Abrufen von Resume ID ${id}:`, error);
    // Allgemeine Fehlermeldung senden
    res.status(500).send('backend.error.server.resumeFetchError');
  } finally {
    // Verbindung IMMER freigeben, wenn sie geholt wurde
    if (connection) {
      connection.release();
      console.log(`[getResumeById] Verbindung für Resume ID ${id} freigegeben.`);
    }
  }
};
export const changeResumeStatus = async (db: Pool, req: Request, res: Response) => {
  const { resumeId, stateId, date } = req.body;
  const userId = getUserIdFromToken(req);

  if (!resumeId || !userId || !stateId || !date) {
    return res.status(400).send('backend.error.validation.missingData');
  }

  try {
    const [rows] = await db.query('SELECT ref, stateid FROM resumes WHERE resumeId = ?', [
      resumeId,
    ]);

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).send('backend.error.notFound.applicationNotFound');
    }

    const resume = rows[0] as { ref: number; stateid: number };

    if (resume.ref !== userId) {
      return res.status(403).send('backend.error.auth.noPermission');
    }

    if (resume.stateid === stateId) {
      return res.status(400).send('backend.error.conflict.statusAlreadySet');
    }

    await db.query('UPDATE resumes SET stateid = ? WHERE resumeId = ?', [stateId, resumeId]);

    await db.query('INSERT INTO history (resumeid, stateid, date) VALUES (?, ?, ?)', [
      resumeId,
      stateId,
      date,
    ]);

    return res.status(200).send('backend.success.status.changed');
  } catch (err) {
    console.error('Fehler:', err);

    return res.status(500).send('backend.error.server.internalServerError');
  }
};
