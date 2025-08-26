import { Request, Response } from 'express';
// Wichtig: Importiere von 'mysql2/promise' für async/await Unterstützung
import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Resume } from '../../../interfaces/Resume';
import { Company } from '../../../interfaces/Company';
import { Contact } from '../../../interfaces/Contact';
import { getUserIdFromToken } from './userService';

// --- Hilfsfunktion: Firma verarbeiten (INSERT oder UPDATE) ---
async function handleCompany(
  db: PoolConnection,
  company: Company | null,
  userId: number
): Promise<number | null> {
  if (!company) {
    return null;
  }

  try {
    if (company.companyId === 0) {
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
        userId,
      ]);
      if (result.insertId) {
        return result.insertId;
      } else {
        throw new Error('Fehler beim Einfügen der Firma: Keine insertId erhalten.');
      }
    } else if (company.companyId > 0) {
      const updateQuery = `
        UPDATE companies
        SET name = ?, city = ?, street = ?, houseNumber = ?, postalCode = ?, isrecruter = ?
        WHERE companyId = ?
      `;
      const [result] = await db.query<ResultSetHeader>(updateQuery, [
        company.name,
        company.city,
        company.street,
        company.houseNumber,
        company.postalCode,
        company.isRecruter || false,
        company.companyId,
      ]);
      return company.companyId;
    } else {
      return null;
    }
  } catch (error: any) {
    throw new Error(`Fehler bei der Verarbeitung von Firma ${company.companyId}: ${error.message}`);
  }
}

// --- Hilfsfunktion: Kontakt verarbeiten (INSERT oder UPDATE) ---
async function handleContact(
  db: PoolConnection,
  contact: Contact | null,
  companyId: number | null,
  userId: number
): Promise<number | null> {
  if (!contact || companyId === null || companyId <= 0) {
    return null;
  }

  const {
    vorname = '',
    name,
    email = '',

    title = '',
    zusatzname = '',
    phone = '',
    mobile = '',
    contactid,
  } = contact;

  if (!name) {
    return null;
  }

  const finalAnrede = contact.anrede === null || contact.anrede === undefined ? 0 : contact.anrede;

  try {
    if (contactid === 0) {
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
        userId,
      ]);
      if (result.insertId) {
        return result.insertId;
      } else {
        throw new Error('Fehler beim Einfügen des Kontakts: Keine insertId erhalten.');
      }
    } else if (contactid > 0) {
      const updateQuery = `
        UPDATE contacts
        SET vorname = ?, name = ?, email = ?, anrede = ?, title = ?, zusatzname = ?, phone = ?, mobile = ?, company = ?
        WHERE contactid = ?
      `;
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
      return contactid;
    } else {
      return null;
    }
  } catch (error: any) {
    throw new Error(`Fehler bei der Verarbeitung von Kontakt ${contactid}: ${error.message}`);
  }
}

// --- Hilfsfunktion: Historie verarbeiten ---
async function saveHistory(
  db: PoolConnection,
  resumeId: number,
  newStateId: number,
  isNewResume: boolean
): Promise<void> {
  try {
    if (isNewResume) {
      const insertHistoryQuery = `
        INSERT INTO history (resumeid, date, stateid)
        VALUES (?, CURDATE(), ?)
      `;
      await db.query(insertHistoryQuery, [resumeId, newStateId]);
    } else {
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
        if (lastStateId === newStateId) {
          needsInsert = false;
        }
      }
      if (needsInsert) {
        const insertHistoryQuery = `
          INSERT INTO history (resumeid, date, stateid)
          VALUES (?, CURDATE(), ?)
        `;
        await db.query(insertHistoryQuery, [resumeId, newStateId]);
      }
    }
  } catch (error: any) {
    throw new Error(`Fehler beim Speichern der History für Resume ${resumeId}: ${error.message}`);
  }
}

// --- Hauptfunktion: Resume aktualisieren oder erstellen ---
export const updateOrCreateResume = async (
  dbPool: Pool,
  req: Request,
  res: Response
): Promise<void> => {
  let connection: PoolConnection | null = null;
  const resume: Resume = req.body;

  // UserId sicher aus Token holen!
  const userId = getUserIdFromToken(req);

  if (
    !resume ||
    !userId ||
    !resume.position ||
    resume.stateId === undefined ||
    resume.stateId === null
  ) {
    res.status(400).send('backend.error.validation.missingResumeData');
    return;
  }

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    const companyId = await handleCompany(connection, resume.company, userId);
    const parentCompanyId = await handleCompany(connection, resume.recrutingCompany, userId);

    const contactCompanyId = await handleContact(
      connection,
      resume.contactCompany,
      companyId,
      userId
    );
    const contactParentCompanyId = await handleContact(
      connection,
      resume.contactRecrutingCompany,
      parentCompanyId,
      userId
    );

    let finalResumeId = resume.resumeId;
    const isNewResume = resume.resumeId === 0;

    if (isNewResume) {
      const insertResumeQuery = `
        INSERT INTO resumes (ref, position, stateId, link, comment, companyId, parentCompanyId, contactCompanyId, contactParentCompanyId, created)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      const [result] = await connection.query<ResultSetHeader>(insertResumeQuery, [
        userId,
        resume.position,
        resume.stateId,
        resume.link || null,
        resume.comment || null,
        companyId,
        parentCompanyId,
        contactCompanyId,
        contactParentCompanyId,
      ]);
      if (!result.insertId) {
        throw new Error('Fehler beim Einfügen des Resumes: Keine insertId erhalten.');
      }
      finalResumeId = result.insertId;
    } else {
      if (finalResumeId <= 0) {
        throw new Error(`Ungültige resumeId (${finalResumeId}) für Update-Operation.`);
      }
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
        userId,
      ]);
      if (result.affectedRows === 0) {
        // Optional: Warnung oder Fehlerbehandlung
      }
    }

    await saveHistory(connection, finalResumeId, resume.stateId, isNewResume);

    await connection.commit();

    res.status(isNewResume ? 201 : 200).json({
      message: isNewResume ? 'backend.success.resume.created' : 'backend.success.resume.updated',
      resumeId: finalResumeId,
      companyId: companyId,
      parentCompanyId: parentCompanyId,
      contactCompanyId: contactCompanyId,
      contactParentCompanyId: contactParentCompanyId,
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
    }
    if (!res.headersSent) {
      res.status(500).json({
        message: 'backend.error.server.serverError',
        error: error.message,
      });
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
