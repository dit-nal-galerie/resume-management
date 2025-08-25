import { Request, Response } from 'express';
import { Pool, OkPacket, RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import config from '../config/config';

// Конфигурация для токенов восстановления пароля
const TOKEN_LENGTH = 32; // Длина токена
const TOKEN_EXPIRY_MINUTES = 10; // Срок действия токена в минутах

// Конфигурация для отправки email
const EMAIL_CONFIG = {
  host: config.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(config.EMAIL_PORT || '587', 10),
  secure: config.EMAIL_SECURE === 'true',
  auth: {
    user: config.EMAIL_USER || '',
    pass: config.EMAIL_PASSWORD || '',
  },
  tls: {
    // Wenn du Probleme hast, kann das Hinzufügen dieser Option helfen,
    // um Selbstsignierte Zertifikate zu ignorieren, obwohl es nicht empfohlen wird
    // für Produktionsumgebungen ohne genaue Kenntnis der Risiken.
    rejectUnauthorized: false,
  },
};

const RESET_PASSWORD_URL = config.RESET_PASSWORD_URL || 'http://localhost:3000/reset-password';

/**
 * Создает таблицу для токенов восстановления пароля, если она не существует
 * @param pool - Пул соединений с базой данных
 */

/**
 * Генерирует случайный токен указанной длины
 * @param length - Длина токена
 * @returns Сгенерированный токен
 */
export const generateToken = (length: number = TOKEN_LENGTH): string => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

/**
 * Создает новый токен восстановления пароля
 * @param pool - Пул соединений с базой данных
 * @param userId - ID пользователя
 * @returns Сгенерированный токен
 */
export const createToken = async (pool: Pool, userId: number): Promise<string> => {
  try {
    // Генерация случайного токена
    const token = generateToken();

    // Расчет времени истечения токена в виде UNIX-timestamp
    const now = Math.floor(Date.now() / 1000); // Текущее время в секундах
    const expiresAt = now + TOKEN_EXPIRY_MINUTES * 60; // Добавляем минуты в секундах

    console.log('Текущее время (timestamp):', now);
    console.log('Время истечения (timestamp):', expiresAt);
    console.log('Разница в минутах:', (expiresAt - now) / 60);

    // Удаление старых токенов для этого пользователя
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId]);

    // Сохранение нового токена в базе данных
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at_timestamp) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );

    return token;
  } catch (error) {
    console.error('Ошибка при создании токена:', error);
    throw new Error('backend.error.server.tokenCreationError');
  }
};

/**
 * Проверяет валидность токена
 * @param pool - Пул соединений с базой данных
 * @param token - Токен для проверки
 * @returns Результат проверки
 */
export const validateToken = async (pool: Pool, token: string): Promise<boolean> => {
  try {
    // Получение текущего времени в виде UNIX-timestamp
    const now = Math.floor(Date.now() / 1000);

    console.log('Проверка токена:', token);
    console.log('Текущее время (timestamp):', now);

    // Проверка токена в базе данных
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at_timestamp > ? AND is_used = FALSE',
      [token, now]
    );

    console.log('Результат запроса:', rows);

    return rows.length > 0;
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    return false;
  }
};

/**
 * Отмечает токен как использованный
 * @param pool - Пул соединений с базой данных
 * @param token - Токен для отметки
 * @returns Результат операции
 */
export const markTokenAsUsed = async (pool: Pool, token: string): Promise<boolean> => {
  try {
    const [result] = await pool.query<OkPacket>(
      'UPDATE password_reset_tokens SET is_used = TRUE WHERE token = ?',
      [token]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Ошибка при отметке токена как использованного:', error);
    throw new Error('backend.error.server.tokenUpdateError');
  }
};

/**
 * Отправляет email для восстановления пароля
 * @param to - Email получателя
 * @param token - Токен восстановления пароля
 * @returns Результат отправки
 */
export const sendPasswordResetEmail = async (to: string, token: string): Promise<boolean> => {
  if (process.env.NODE_ENV === 'development' || !EMAIL_CONFIG.auth.user) {
    const testAccount = await nodemailer.createTestAccount();

    // Обновляем конфигурацию для тестового аккаунта
    EMAIL_CONFIG.host = 'smtp.ethereal.email';
    EMAIL_CONFIG.port = 587;
    EMAIL_CONFIG.secure = false;
    EMAIL_CONFIG.auth = {
      user: testAccount.user,
      pass: testAccount.pass,
    };

    console.log('Тестовый SMTP аккаунт создан:', testAccount);
  } else {
    console.log('Используется реальный SMTP аккаунт:', EMAIL_CONFIG);
  }
  try {
    // Проверка наличия настроек email
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      console.warn(
        'Email-Konfiguration fehlt. E-Mails zum Zurücksetzen des Passworts werden nicht gesendet.'
      );
      return false;
    }

    // Формирование URL для восстановления пароля
    const resetUrl = `${RESET_PASSWORD_URL}?token=${token}`;

    // Создание транспорта для отправки email
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);

    // Настройки email
    const mailOptions = {
      from: config.EMAIL_FROM || 'noreply@example.com',
      to,
      subject: 'Passwort zurücksetzen',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Passwort zurücksetzen</h2>
          <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.</p>
          <p>Bitte klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:</p>
          <p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
              Passwort zurücksetzen
            </a>
          </p>
          <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
          <p>${resetUrl}</p>
          <p>Dieser Link ist nur ${TOKEN_EXPIRY_MINUTES} Minuten gültig.</p>
          <p>Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie bitte diese E-Mail.</p>
          <p>Mit freundlichen Grüßen,<br>Ihr Team</p>
        </div>
      `,
    };

    // Отправка email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email gesendet:', info.messageId);
    // Для тестирования - выводим URL для просмотра письма
    if (EMAIL_CONFIG.host === 'smtp.ethereal.email') {
      console.log(
        'Тестовое письмо отправлено. URL для просмотра:',
        nodemailer.getTestMessageUrl(info)
      );
    }

    return true;
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error);
    return false;
  }
};

/**
 * Обрабатывает запрос на восстановление пароля
 * @param pool - Пул соединений с базой данных
 * @param req - HTTP-запрос
 * @param res - HTTP-ответ
 */
export const requestPasswordReset = async (
  pool: Pool,
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { loginname, email } = req.body;

    // Проверка наличия обязательных полей
    if (!loginname || !email) {
      res.status(400).json({
        success: false,
        error: 'backend.error.validation.missingFields',
      });
      return;
    }

    // Поиск пользователя по имени и email
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT a.id, a.loginname, u.email 
       FROM authentification a 
       JOIN users u ON a.id = u.loginid 
       WHERE a.loginname = ? AND u.email = ?`,
      [loginname, email]
    );

    // Если пользователь не найден, все равно возвращаем успешный ответ
    // для предотвращения утечки информации о существовании пользователя
    if (users.length === 0) {
      console.log(`Benutzer nicht gefunden: ${loginname}, ${email}`);
      res.json({
        success: true,
        message: 'backend.success.passwordReset.emailSent',
      });
      return;
    }

    // Создание токена восстановления пароля
    const token = await createToken(pool, users[0].id);

    // Отправка email с токеном
    const emailSent = await sendPasswordResetEmail(users[0].email, token);

    if (!emailSent) {
      console.warn('E-Mail konnte nicht gesendet werden, aber Token wurde erstellt');
      const resetLink = `${config.RESET_PASSWORD_URL}?token=${token}`;
      console.log('Ссылка для восстановления пароля:', resetLink);
    }

    // Возвращаем успешный ответ
    res.json({
      success: true,
      message: 'backend.success.passwordReset.emailSent',
    });
  } catch (error) {
    console.error('Fehler bei der Anfrage zum Zurücksetzen des Passworts:', error);
    res.status(500).json({
      success: false,
      error: 'backend.error.server.serverError',
    });
  }
};

/**
 * Проверяет валидность токена восстановления пароля
 * @param pool - Пул соединений с базой данных
 * @param req - HTTP-запрос
 * @param res - HTTP-ответ
 */
export const checkPasswordResetToken = async (
  pool: Pool,
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({
        success: false,
        error: 'backend.error.validation.missingToken',
      });
      return;
    }

    // Проверка валидности токена
    const isValid = await validateToken(pool, token);

    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'backend.error.validation.invalidToken',
      });
      return;
    }

    // Возвращаем успешный ответ
    res.json({
      success: true,
      message: 'backend.success.passwordReset.validToken',
    });
  } catch (error) {
    console.error('Fehler bei der Token-Validierung:', error);
    res.status(500).json({
      success: false,
      error: 'backend.error.server.serverError',
    });
  }
};

/**
 * Сбрасывает пароль по токену
 * @param pool - Пул соединений с базой данных
 * @param req - HTTP-запрос
 * @param res - HTTP-ответ
 */
export const resetPassword = async (pool: Pool, req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // Проверка наличия обязательных полей
    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'backend.error.validation.missingTokenOrPassword',
      });
      return;
    }

    // Минимальная валидация пароля
    if (newPassword.length < 2) {
      res.status(400).json({
        success: false,
        error: 'backend.error.validation.passwordTooShort',
      });
      return;
    }

    // Проверка валидности токена
    const isValid = await validateToken(pool, token);

    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'backend.error.validation.invalidToken',
      });
      return;
    }

    // Хеширование нового пароля
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Получаем user_id по токену
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT user_id FROM password_reset_tokens WHERE token = ?',
      [token]
    );
    if (!rows.length) {
      res.status(404).json({
        success: false,
        error: 'backend.error.notFound.userNotFound',
      });
      return;
    }
    const userId = rows[0].user_id;

    // Обновление пароля пользователя
    const [result] = await pool.query<OkPacket>(
      'UPDATE authentification SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({
        success: false,
        error: 'backend.error.notFound.userNotFound',
      });
      return;
    }

    // Отметка токена как использованного
    await markTokenAsUsed(pool, token);

    // Возвращаем успешный ответ
    res.json({
      success: true,
      message: 'backend.success.passwordReset.passwordChanged',
    });
  } catch (error) {
    console.error('Fehler beim Zurücksetzen des Passworts:', error);
    res.status(500).json({
      success: false,
      error: 'backend.error.server.serverError',
    });
  }
};
