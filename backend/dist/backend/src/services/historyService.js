'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getHistoryByResumeId = exports.addHistory = void 0;
const addHistory = (db, req, res) => {
  const { resume_id, description } = req.body;
  if (!resume_id || !description) {
    res.status(400).send('backend.error.validation.missingFields');
    return;
  }
  const query = 'INSERT INTO history (resume_id, description) VALUES (?, ?)';
  db.query(query, [resume_id, description], (err) => {
    if (err) {
      console.error('Fehler beim Hinzufügen der Historie:', err);
      res.status(500).send('backend.error.server.historyAddError');
      return;
    }
    res.status(201).send('backend.success.history.added');
  });
};
exports.addHistory = addHistory;
const getHistoryByResumeId = (db, req, res) => {
  const { refId, resumeId } = req.query;
  console.log('getHistoryByResumeId', refId, resumeId);
  if (!resumeId || !refId) {
    res.status(400).json({ message: 'backend.error.validation.missingFields' });
    return;
  }
  const validateQuery = `
    SELECT resumeId FROM resumes WHERE resumeId = ? AND ref = ?
  `;
  db.query(validateQuery, [resumeId, refId], (err, validationResult) => {
    if (err) {
      console.error('Fehler beim Prüfen der Bewerbung:', err);
      res.status(500).json({ message: 'backend.error.server.serverError' });
      return;
    }
    if (!Array.isArray(validationResult) || validationResult.length === 0) {
      res.status(403).json({ message: 'backend.error.auth.noPermission' });
      return;
    }
    const historyQuery = `
      SELECT h.date AS date, s.text AS status
      FROM history h
      JOIN states s ON h.stateid = s.stateid
      WHERE h.resumeid = ?
      ORDER BY h.date ASC
    `;
    console.log('historyQuery', historyQuery, 'resumeid', resumeId);
    db.query(historyQuery, [resumeId], (err, results) => {
      if (err) {
        console.error('Fehler beim Abrufen der Historie:', err);
        res.status(500).json({ message: 'backend.error.server.serverError' });
        return;
      }
      const historyEntries = results.map((row) => ({
        date: row.date,
        status: row.status,
      }));
      res.json(historyEntries);
    });
  });
};
exports.getHistoryByResumeId = getHistoryByResumeId;
