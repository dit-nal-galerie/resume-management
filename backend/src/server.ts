import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; // Importiere CORS
import ResumeManagementAPI from './resumeManagementAPI'; // Importiere die API-Klasse
import config from './config/config';
import cookieParser from 'cookie-parser';
import { logout } from './services/logoutService';

export const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: config.FRONTEND_URL, // exakt deine Frontend-URL!
    credentials: true, // wichtig für Cookies/Token
  })
);
// Middleware für JSON-Anfragen
app.use(bodyParser.json());

// Middleware für CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', config.FRONTEND_URL);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Erstelle eine Instanz der API-Klasse
const api = new ResumeManagementAPI();

app.get('/meanrede', (req, res) => api.getUserAnredeAndName(req, res));
app.get('/me', (req, res) => api.getUserProfile(req, res));
// Definiere die Routen
app.post('/createOrUpdateUser', (req: Request, res: Response) => api.createOrUpdateUser(req, res));
app.post('/addContact', (req: Request, res: Response) => api.createOrUpdateContact(req, res));
app.get('/getResumesWithUsers', (req: Request, res: Response) => api.getResumesWithUsers(req, res));
app.post('/addCompany', (req: Request, res: Response) => api.addCompany(req, res));
app.get('/companies', (req: Request, res: Response) => api.getCompanies(req, res));
app.post('/addHistory', (req: Request, res: Response) => api.addHistory(req, res));
app.get('/getHistoryByResumeId', (req: Request, res: Response) =>
  api.getHistoryByResumeId(req, res)
);
app.post('/login', (req: Request, res: Response) => api.login(req, res));
app.get('/getAnrede', (req: Request, res: Response) => api.getAnrede(req, res));
app.get('/getStates', (req: Request, res: Response) => api.getStates(req, res));
app.post('/updateOrCreateResume', (req: Request, res: Response) =>
  api.updateOrCreateResume(req, res)
);
app.get('/resume/:resumeId', (req: Request, res: Response) => api.getResumeById(req, res));
app.get('/contacts', (req: Request, res: Response) => api.getContacts(req, res));
app.get('/getResumeById/:resumeId', (req: Request, res: Response) => api.getResumeById(req, res));
app.post('/changeResumeStatus', (req: Request, res: Response) => api.changeResumeStatus(req, res));
app.post('/changeAccessData', (req: Request, res: Response) => api.changeAccessData(req, res));

// Новые маршруты для восстановления пароля
app.post('/request-password-reset', (req: Request, res: Response) =>
  api.requestPasswordReset(req, res)
);
app.get('/validate-token', (req: Request, res: Response) => api.checkPasswordResetToken(req, res));
app.post('/reset-password', (req: Request, res: Response) => api.resetPassword(req, res));

// Starte den Server
app.listen(config.DB_PORT, () => {
  console.log(`Server läuft auf Port ${config.DB_PORT}`);
});

app.post('/logout', logout);
// Fehlerbehandlung für unvorhergesehene Fehler
process.on('uncaughtException', (err) => {
  console.error('Unbehandelter Fehler:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unbehandelte Promise-Ablehnung:', reason);
});
