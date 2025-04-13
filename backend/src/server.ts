import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';

import ResumeManagementAPI from './resumeManagementAPI'; // Класс с API, который мы ранее создали

const app = express();
const PORT = 3001
; // Укажите желаемый порт для сервера

// Настройка CORS: разрешение запросов с фронтенда



// Middleware для обработки JSON-запросов
app.use(bodyParser.json());

// Middleware для разрешения CORS-заголовков
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*'); // Разрешение CORS
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next(); // Переход к следующему обработчику
});

// Создаем экземпляр класса ResumeManagementAPI
const api = new ResumeManagementAPI();

// Определяем маршруты
app.post('/createUser', (req: Request, res: Response) => api.createUser(req, res));
app.post('/login', (req: Request, res: Response) => api.login(req, res));
app.post('/getUserData', (req: Request, res: Response) => api.getUserData(req, res));
app.put('/updateUserData', (req: Request, res: Response) => api.updateUserData(req, res));
app.get('/getResumesWithUsers', (req: Request, res: Response) => api.getResumesWithUsers(req, res));
app.post('/addContact', (req: Request, res: Response) => api.addContact(req, res));
app.post('/addCompany', (req: Request, res: Response) => api.addCompany(req, res));
app.post('/addHistory', (req: Request, res: Response) => api.addHistory(req, res));
app.put('/updateResume', (req: Request, res: Response) => api.updateResume(req, res));
//app.post('/createAccount', (req: Request, res: Response) => api.createAccount(req, res));
app.get('/getAnrede', (req: Request, res: Response) => api.getAnrede(req, res));
app.get("/getResumeById/:id", (req, res) =>   api.getResumeById(req, res));
app.get("/getStates", (req, res) =>   api.getStates(req, res));


// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});



process.on('uncaughtException', (err) => {
  console.error('Необработанное исключение:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Необработанное отклонение промиса:', reason);
});
