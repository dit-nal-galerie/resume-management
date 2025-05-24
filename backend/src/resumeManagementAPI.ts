import { Request, Response } from 'express';
import mysql from 'mysql2';
import config from './config/config';

// Importiere die ausgelagerten Services
import { createOrUpdateUser, login, getAnrede, changeAccessData } from './services/userService';
import { createOrUpdateContact, getContacts } from './services/contactService';
import { getResumesWithUsers, getStates } from './services/resumeService';
import { addCompany, getCompanies } from './services/companyService';
import { addHistory,  getHistoryByResumeId } from './services/historyService';
import {  updateOrCreateResume } from './services/saveResume';
import { requestPasswordReset, checkPasswordResetToken, resetPassword, ensurePasswordResetTableExists } from './services/passwordResetService';

import mysqlPromise, { Pool as PromisePool, PoolConnection as PromisePoolConnection } from 'mysql2/promise'; // Hauptsächlich diesen verwenden
import { changeResumeStatus, getResumeById } from './services/getResume';

class ResumeManagementAPI {
  [x: string]: any;
  private db: any;
  private dbPool: PromisePool;
  constructor() {
    this.db = mysql.createConnection({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
    });

    this.dbPool = mysqlPromise.createPool({
      host: config.DB_HOST,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Проверка и создание таблицы для токенов восстановления пароля
    this.initPasswordResetTable();
  }

  // Инициализация таблицы для токенов восстановления пароля
  private async initPasswordResetTable(): Promise<void> {
    try {
      await ensurePasswordResetTableExists(this.dbPool);
    } catch (error) {
      console.error('Fehler bei der Initialisierung der Passwort-Reset-Tabelle:', error);
    }
  }

  async createOrUpdateUser(req: Request, res: Response): Promise<void> {
    await createOrUpdateUser(this.db, req, res);
  }
  async login(req: Request, res: Response): Promise<void> {
    await login(this.db, req, res);
  }
  async createOrUpdateContact(req: Request, res: Response): Promise<void> {
    await createOrUpdateContact(this.db, req, res);
  }

  async updateOrCreateResume(req: Request, res: Response): Promise<void> {
    await updateOrCreateResume(this.dbPool, req, res);
  }
  async getResumeById(req: Request, res: Response): Promise<void> {
    await getResumeById(this.dbPool, req, res);
  }

  async getResumesWithUsers(req: Request, res: Response): Promise<void> {
    await getResumesWithUsers(this.db, req, res);
  }

  async addCompany(req: Request, res: Response): Promise<void> {
    addCompany(this.db, req, res);
  }

  async getCompanies(req: Request, res: Response): Promise<void> {
    getCompanies(this.db, req, res);
  }

  async addHistory(req: Request, res: Response): Promise<void> {
    addHistory(this.db, req, res);
  }

  async getHistoryByResumeId(req: Request, res: Response): Promise<void> {
    getHistoryByResumeId(this.db, req, res);
  }

  async getStates(req: Request, res: Response): Promise<void> {
    getStates(this.db, req, res);
  }

  async getAnrede(req: Request, res: Response): Promise<void> {
    getAnrede(this.db, req, res);
  }
  async getContacts(req: Request, res: Response): Promise<void> {
    getContacts(this.db, req, res);
  }
  async changeResumeStatus(req: Request, res: Response) {
    await changeResumeStatus(this.dbPool, req, res);
  }
  async changeAccessData(req: Request, res: Response) {
    await changeAccessData(this.dbPool, req, res);
  }

  // Новые методы для восстановления пароля
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    await requestPasswordReset(this.dbPool, req, res);
  }

  async checkPasswordResetToken(req: Request, res: Response): Promise<void> {
    await checkPasswordResetToken(this.dbPool, req, res);
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    await resetPassword(this.dbPool, req, res);
  }
}

export default ResumeManagementAPI;
