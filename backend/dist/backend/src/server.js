'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.app = void 0;
const express_1 = __importDefault(require('express'));
const body_parser_1 = __importDefault(require('body-parser'));
const cors_1 = __importDefault(require('cors')); // Importiere CORS
const resumeManagementAPI_1 = __importDefault(require('./resumeManagementAPI')); // Importiere die API-Klasse
exports.app = (0, express_1.default)();
const PORT = 3001;
exports.app.use((0, cors_1.default)());
// Middleware für JSON-Anfragen
exports.app.use(body_parser_1.default.json());
// Middleware für CORS
exports.app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
// Erstelle eine Instanz der API-Klasse
const api = new resumeManagementAPI_1.default();
// Definiere die Routen
exports.app.post('/createOrUpdateUser', (req, res) => api.createOrUpdateUser(req, res));
exports.app.post('/addContact', (req, res) => api.createOrUpdateContact(req, res));
exports.app.get('/getResumesWithUsers', (req, res) => api.getResumesWithUsers(req, res));
exports.app.post('/addCompany', (req, res) => api.addCompany(req, res));
exports.app.get('/companies', (req, res) => api.getCompanies(req, res));
exports.app.post('/addHistory', (req, res) => api.addHistory(req, res));
exports.app.get('/getHistoryByResumeId', (req, res) => api.getHistoryByResumeId(req, res));
exports.app.post('/login', (req, res) => api.login(req, res));
exports.app.get('/getAnrede', (req, res) => api.getAnrede(req, res));
exports.app.get('/getStates', (req, res) => api.getStates(req, res));
exports.app.post('/updateOrCreateResume', (req, res) => api.updateOrCreateResume(req, res));
exports.app.get('/resume/:resumeId', (req, res) => api.getResumeById(req, res));
exports.app.get('/contacts', (req, res) => api.getContacts(req, res));
exports.app.get('/getResumeById/:resumeId', (req, res) => api.getResumeById(req, res));
exports.app.post('/changeResumeStatus', (req, res) => api.changeResumeStatus(req, res));
exports.app.post('/changeAccessData', (req, res) => api.changeAccessData(req, res));
// Новые маршруты для восстановления пароля
exports.app.post('/request-password-reset', (req, res) => api.requestPasswordReset(req, res));
exports.app.get('/validate-token', (req, res) => api.checkPasswordResetToken(req, res));
exports.app.post('/reset-password', (req, res) => api.resetPassword(req, res));
// Starte den Server
exports.app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
// Fehlerbehandlung für unvorhergesehene Fehler
process.on('uncaughtException', (err) => {
  console.error('Unbehandelter Fehler:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unbehandelte Promise-Ablehnung:', reason);
});
