import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; // Importiere CORS
import ResumeManagementAPI from './resumeManagementAPI'; // Importiere die API-Klasse

export const app = express();
const PORT = 3001;
app.use(cors());
// Middleware für JSON-Anfragen
app.use(bodyParser.json());

// Middleware für CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Erstelle eine Instanz der API-Klasse
const api = new ResumeManagementAPI();

// Definiere die Routen
app.post('/createUser', (req: Request, res: Response) => api.createUser(req, res));
app.post('/addContact', (req: Request, res: Response) => api.createOrUpdateContact(req, res));
app.get('/getResumesWithUsers', (req: Request, res: Response) => api.getResumesWithUsers(req, res));
app.post('/addCompany', (req: Request, res: Response) => api.addCompany(req, res));
app.get('/companies', (req: Request, res: Response) => api.getCompanies(req, res));
app.post('/addHistory', (req: Request, res: Response) => api.addHistory(req, res));
app.get('/getHistoryByResumeId', (req: Request, res: Response) => api.getHistoryByResumeId(req, res));
app.post('/login', (req: Request, res: Response) => api.login(req, res));
app.get('/getAnrede', (req: Request, res: Response) => api.getAnrede(req, res));
app.get('/getStates', (req: Request, res: Response) => api.getStates(req, res));
app.post('/updateOrCreateResume', (req: Request, res: Response) => api.updateOrCreateResume(req, res));
app.get('/resume/:resumeId', (req: Request, res: Response) => api.getResumeById(req, res));
app.get('/contacts', (req: Request, res: Response) => api.getContacts(req, res));
app.get('/getResumeById/:resumeId', (req: Request, res: Response) => {
  //console.log("apiAufruf von getResumeById mit ID:", req.params.resumeId);
  api.getResumeById(req, res)
});

// Starte den Server
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});

// Fehlerbehandlung für unvorhergesehene Fehler
process.on('uncaughtException', (err) => {
  console.error('Unbehandelter Fehler:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unbehandelte Promise-Ablehnung:', reason);
});