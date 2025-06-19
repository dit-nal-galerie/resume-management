'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getStates = exports.getResumesWithUsers = void 0;
const getResumesWithUsers = (db, req, res) => {
  const { userid } = req.query;
  if (!userid) {
    res.status(400).send('backend.error.validation.missingUserId');
    return;
  }
  const query = `
 SELECT 
    r.resumeId,
    r.ref,
    r.position,
    hs.stateId,
    s.text AS stateText,
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
LEFT JOIN (
    SELECT h1.resumeId, h1.stateId
    FROM history h1
    INNER JOIN (
        SELECT resumeId, MAX(historyid) AS maxHistoryId
        FROM history
        GROUP BY resumeId
    ) h2 ON h1.resumeId = h2.resumeId AND h1.historyid = h2.maxHistoryId
) hs ON r.resumeId = hs.resumeId
LEFT JOIN states s ON hs.stateId = s.stateId
LEFT JOIN companies c1 ON r.companyId = c1.companyId
LEFT JOIN companies c2 ON r.parentCompanyId = c2.companyId
LEFT JOIN contacts cc ON r.contactCompanyId = cc.contactId
LEFT JOIN contacts cp ON r.contactParentCompanyId = cp.contactId
WHERE r.ref = ?
  `;
  db.query(query, [userid], (err, results) => {
    if (err) {
      console.error('Fehler beim Abrufen der Bewerbungen:', err);
      res.status(500).send('backend.error.server.serverError');
      return;
    }
    // Map, um pro resumeId nur ein Resume-Objekt zu erzeugen
    const resumeMap = new Map();
    for (const row of results) {
      if (!resumeMap.has(row.resumeId)) {
        resumeMap.set(row.resumeId, {
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
          recrutingCompany: row.parentCompanyId
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
          contactCompany: null,
          contactParentCompany: null,
        });
      }
      const resume = resumeMap.get(row.resumeId);
      if (row.contactCompanyId) {
        resume.contactCompany = {
          contactId: row.contactCompanyId,
          name: row.contactCompanyName,
        };
      }
      if (row.contactParentCompanyId) {
        resume.contactParentCompany = {
          contactId: row.contactParentCompanyId,
          name: row.contactParentCompanyName,
        };
      }
    }
    res.json(Array.from(resumeMap.values()));
  });
};
exports.getResumesWithUsers = getResumesWithUsers;
const getStates = (db, req, res) => {
  const query = 'SELECT stateid, text FROM states ORDER BY stateid ASC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Fehler beim Abrufen der Status:', err);
      res.status(500).send('backend.error.server.serverError');
      return;
    }
    res.json(results);
  });
};
exports.getStates = getStates;
