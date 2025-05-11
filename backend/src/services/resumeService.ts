import { Request, Response } from 'express';
import { Connection, ResultSetHeader, RowDataPacket } from 'mysql2';




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