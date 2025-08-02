import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { Connection, OkPacket, RowDataPacket } from 'mysql2';
import { Pool } from 'mysql2/promise'; // Pool für changeAccessData

// Importiere alle Funktionen aus der Auth-Datei
import {
  createAccount,
  login,
  getAnrede,
  changeAccessData,
  createOrUpdateUser,
  emailExistsForOtherUser,
  getPasswordForLoginId,
  createAuthEntry,
} from '../../../src/services/userService';

// Mocken von bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => Promise.resolve(`hashed_${password}` === hash)),
}));

// Mocken von console.log und console.error, um Testausgaben sauber zu halten
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Mock für MySQL2 Connection (callback-basiert)
const mockConnection = {
  query: jest.fn(),
} as unknown as Connection;

// Mock für MySQL2 Pool (promise-basiert, für changeAccessData)
const mockPool = {
  query: jest.fn(),
  getConnection: jest.fn(), // Nicht direkt in diesen Funktionen verwendet, aber guter Praxis
} as unknown as Pool;

describe('createAccount', () => {
  beforeEach(() => {
    (mockConnection.query as jest.Mock).mockClear();
    (bcrypt.hash as jest.Mock).mockClear();
  });

  test('should create an account and return insertId on success', async () => {
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      callback(null, { insertId: 100 } as OkPacket);
    });

    const result = await createAccount(mockConnection, 'testuser', 'password123');

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(mockConnection.query).toHaveBeenCalledWith(
      'INSERT INTO authentification (loginname, password) VALUES (?, ?)',
      ['testuser', 'hashed_password123'],
      expect.any(Function)
    );
    expect(result).toBe(100);
  });

  test('should return null and log error if hashing fails', async () => {
    (bcrypt.hash as jest.Mock).mockRejectedValueOnce(new Error('Hashing failed'));

    const result = await createAccount(mockConnection, 'testuser', 'password123');

    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(mockConnection.query).not.toHaveBeenCalled();
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Error hashing password:', expect.any(Error));
  });

  test('should return null and log error if database insertion fails', async () => {
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      callback(new Error('DB error'), null);
    });

    const result = await createAccount(mockConnection, 'testuser', 'password123');

    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(mockConnection.query).toHaveBeenCalledTimes(1);
    expect(result).toBeNull(); // createAccount returns null on error
    expect(console.error).toHaveBeenCalledWith('Error hashing password:', expect.any(Error)); // bcrypt error handler catches it too
  });
});

describe('login', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    (mockConnection.query as jest.Mock).mockClear();
    (bcrypt.compare as jest.Mock).mockClear();
    mockRequest = { body: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  test('should return user data on successful login', async () => {
    mockRequest.body = { loginname: 'testuser', password: 'password123' };
    const hashedPassword = 'hashed_password123';
    const userId = 1;
    const userData = {
      loginname: 'testuser',
      loginid: 1,
      name: 'Test User',
      email: 'test@example.com',
      anrede: 'Herr',
      city: 'Teststadt',
      street: 'Teststr.',
      houseNumber: '10',
      postalCode: '12345',
      phone: '123456789',
      mobile: '987654321',
    };

    // Mock for auth query
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      expect(sql).toContain('SELECT id, password FROM authentification WHERE loginname = ?');
      expect(values).toEqual(['testuser']);
      callback(null, [{ id: userId, password: hashedPassword }] as RowDataPacket[]);
    });

    // Mock for user query
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      expect(sql).toContain('SELECT a.loginname, u.loginid, u.name, u.email');
      expect(values).toEqual([userId]);
      callback(null, [userData] as RowDataPacket[]);
    });

    await login(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(bcrypt.compare).toHaveBeenCalledWith('password123', hashedPassword);
    expect(mockResponse.status).not.toHaveBeenCalled(); // No status sent means 200 OK
    expect(mockResponse.json).toHaveBeenCalledWith(userData);
  });

  test('should return 404 if user not found during authentication', async () => {
    mockRequest.body = { loginname: 'nonexistent', password: 'any' };

    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      callback(null, [] as RowDataPacket[]); // No user found
    });

    await login(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(mockConnection.query).toHaveBeenCalledTimes(1); // Only auth query
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'backend.error.notFound.userNotFound',
    });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  test('should return 401 if password is incorrect', async () => {
    mockRequest.body = { loginname: 'testuser', password: 'wrongpassword' };
    const hashedPassword = 'hashed_correctpassword'; // bcrypt.compare will return false

    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      callback(null, [{ id: 1, password: hashedPassword }] as RowDataPacket[]);
    });
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false); // Simulate incorrect password

    await login(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', hashedPassword);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'backend.error.auth.wrongPassword' });
    expect(mockConnection.query).toHaveBeenCalledTimes(1); // Only auth query
  });

  test('should return 500 on database error during authentication query', async () => {
    mockRequest.body = { loginname: 'testuser', password: 'password123' };

    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      callback(new Error('DB connection failed'), null);
    });

    await login(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.serverError');
    expect(console.error).toHaveBeenCalledWith(
      'Fehler beim Abrufen der Login-Daten:',
      expect.any(Error)
    );
  });

  test('should return 500 on database error during user info query', async () => {
    mockRequest.body = { loginname: 'testuser', password: 'password123' };
    const hashedPassword = 'hashed_password123';
    const userId = 1;

    // Mock for auth query
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      callback(null, [{ id: userId, password: hashedPassword }] as RowDataPacket[]);
    });

    // Mock for user query - simulate error
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      callback(new Error('User DB error'), null);
    });

    await login(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(bcrypt.compare).toHaveBeenCalledWith('password123', hashedPassword);
    expect(mockConnection.query).toHaveBeenCalledTimes(2); // Both queries attempted
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.loadingUserDataError');
    expect(console.error).toHaveBeenCalledWith(
      'Fehler beim Abrufen der Benutzerinformationen:',
      expect.any(Error)
    );
  });

  test('should return 404 if user info not found after successful authentication', async () => {
    mockRequest.body = { loginname: 'testuser', password: 'password123' };
    const hashedPassword = 'hashed_password123';
    const userId = 1;

    // Mock for auth query
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      callback(null, [{ id: userId, password: hashedPassword }] as RowDataPacket[]);
    });

    // Mock for user query - simulate no user data found (e.g., inconsistent DB)
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      callback(null, [] as RowDataPacket[]);
    });

    await login(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(bcrypt.compare).toHaveBeenCalledWith('password123', hashedPassword);
    expect(mockConnection.query).toHaveBeenCalledTimes(2);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'backend.error.notFound.userInfoNotFound',
    });
  });
});

describe('getAnrede', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    (mockConnection.query as jest.Mock).mockClear();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  test('should return salutations on success', () => {
    const mockAnrede = [
      { id: 1, text: 'Herr' },
      { id: 2, text: 'Frau' },
    ];
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, callback) => {
      expect(sql).toBe('SELECT * FROM anrede');
      callback(null, mockAnrede);
    });

    getAnrede(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(mockConnection.query).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(mockAnrede);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  test('should return 500 on database error', () => {
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, callback) => {
      callback(new Error('DB error'), null);
    });

    getAnrede(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(mockConnection.query).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.serverError');
    expect(console.error).toHaveBeenCalledWith(
      'Fehler beim Abrufen der Anrede:',
      expect.any(Error)
    );
  });
});

describe('changeAccessData', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    (mockPool.query as jest.Mock).mockClear();
    (bcrypt.compare as jest.Mock).mockClear();
    (bcrypt.hash as jest.Mock).mockClear();
    mockRequest = { body: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  test('should return 400 if essential fields are missing', async () => {
    mockRequest.body = { userId: 1, loginname: 'user', email: 'a@b.c' }; // oldPassword missing

    await changeAccessData(mockPool, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'backend.error.validation.missingFields',
    });
    expect(mockPool.query).not.toHaveBeenCalled();
  });

  test('should return 400 if password fields are missing when changePassword is true', async () => {
    mockRequest.body = {
      userId: 1,
      loginname: 'user',
      email: 'a@b.c',
      oldPassword: 'old',
      changePassword: true,
      password: 'new', // password2 missing
    };

    await changeAccessData(mockPool, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'backend.error.validation.missingFields',
    });
    expect(mockPool.query).not.toHaveBeenCalled();
  });

  test('should return 404 if user not found', async () => {
    mockRequest.body = {
      userId: 999,
      loginname: 'user',
      email: 'a@b.c',
      oldPassword: 'old',
    };
    (mockPool.query as jest.Mock).mockResolvedValueOnce([[]]); // No user found

    await changeAccessData(mockPool, mockRequest as Request, mockResponse as Response);

    expect(mockPool.query).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'backend.error.notFound.userNotFound',
    });
  });

  test('should return 401 if old password is incorrect', async () => {
    mockRequest.body = {
      userId: 1,
      loginname: 'user',
      email: 'a@b.c',
      oldPassword: 'wrong_old_password',
    };
    (mockPool.query as jest.Mock).mockResolvedValueOnce([
      [{ userid: 1, loginid: 1, password: 'hashed_correct_old_password' }],
    ]);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false); // Simulate incorrect password

    await changeAccessData(mockPool, mockRequest as Request, mockResponse as Response);

    expect(mockPool.query).toHaveBeenCalledTimes(1); // User lookup
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'wrong_old_password',
      'hashed_correct_old_password'
    );
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'backend.error.auth.oldPasswordWrong',
    });
  });

  test('should return 409 if new email is already taken by another user', async () => {
    mockRequest.body = {
      userId: 1,
      loginname: 'user',
      email: 'existing@other.com',
      oldPassword: 'old_password',
    };
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce([[{ userid: 1, loginid: 1, password: 'hashed_old_password' }]]) // User found
      .mockResolvedValueOnce([[{ userid: 2, email: 'existing@other.com' }]]); // Email taken by another user
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

    await changeAccessData(mockPool, mockRequest as Request, mockResponse as Response);

    expect(mockPool.query).toHaveBeenCalledTimes(2); // User lookup + email check
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'backend.error.conflict.emailTaken',
    });
  });

  test('should return 400 if new passwords mismatch when changePassword is true', async () => {
    mockRequest.body = {
      userId: 1,
      loginname: 'user',
      email: 'a@b.c',
      oldPassword: 'old_password',
      changePassword: true,
      password: 'new_password',
      password2: 'mismatch_password',
    };
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce([[{ userid: 1, loginid: 1, password: 'hashed_old_password' }]]) // User found
      .mockResolvedValueOnce([[]]); // Email not taken
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

    await changeAccessData(mockPool, mockRequest as Request, mockResponse as Response);

    expect(mockPool.query).toHaveBeenCalledTimes(2); // User lookup + email check
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'backend.error.validation.passwordMismatch',
    });
    expect(bcrypt.hash).not.toHaveBeenCalled(); // No hashing if mismatch
  });

  test('should successfully update loginname and email without password change', async () => {
    mockRequest.body = {
      userId: 1,
      loginname: 'new_loginname',
      email: 'new_email@example.com',
      oldPassword: 'old_password',
      changePassword: false, // No password change
    };
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce([
        [{ userid: 1, loginid: 1, name: 'Test User', password: 'hashed_old_password' }],
      ]) // User found
      .mockResolvedValueOnce([[]]) // Email not taken
      .mockResolvedValueOnce([{}]) // auth update success
      .mockResolvedValueOnce([{}]); // users update success
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

    await changeAccessData(mockPool, mockRequest as Request, mockResponse as Response);

    expect(mockPool.query).toHaveBeenCalledWith(
      'UPDATE authentification SET loginname = ?, password = ? WHERE id = ?',
      ['new_loginname', 'hashed_old_password', 1]
    );
    expect(mockPool.query).toHaveBeenCalledWith('UPDATE users SET email = ? WHERE userid = ?', [
      'new_email@example.com',
      1,
    ]);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'backend.success.user.dataUpdated',
      user: {
        userId: 1,
        loginname: 'new_loginname',
        email: 'new_email@example.com',
        name: 'Test User',
      },
    });
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  test('should successfully update loginname, email, and password', async () => {
    mockRequest.body = {
      userId: 1,
      loginname: 'new_loginname_pw',
      email: 'new_email_pw@example.com',
      oldPassword: 'old_password',
      changePassword: true,
      password: 'new_password',
      password2: 'new_password',
    };
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce([
        [{ userid: 1, loginid: 1, name: 'Test User', password: 'hashed_old_password' }],
      ]) // User found
      .mockResolvedValueOnce([[]]) // Email not taken
      .mockResolvedValueOnce([{}]) // auth update success
      .mockResolvedValueOnce([{}]); // users update success
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed_new_password'); // New password hash

    await changeAccessData(mockPool, mockRequest as Request, mockResponse as Response);

    expect(bcrypt.hash).toHaveBeenCalledWith('new_password', 10);
    expect(mockPool.query).toHaveBeenCalledWith(
      'UPDATE authentification SET loginname = ?, password = ? WHERE id = ?',
      ['new_loginname_pw', 'hashed_new_password', 1]
    );
    expect(mockPool.query).toHaveBeenCalledWith('UPDATE users SET email = ? WHERE userid = ?', [
      'new_email_pw@example.com',
      1,
    ]);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'backend.success.user.dataUpdated',
      user: {
        userId: 1,
        loginname: 'new_loginname_pw',
        email: 'new_email_pw@example.com',
        name: 'Test User',
      },
    });
  });

  test('should return 500 on any database error during update process', async () => {
    mockRequest.body = {
      userId: 1,
      loginname: 'user',
      email: 'a@b.c',
      oldPassword: 'old_password',
    };
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce([[{ userid: 1, loginid: 1, password: 'hashed_old_password' }]]) // User found
      .mockRejectedValueOnce(new Error('Simulated DB error')); // Error at email check or subsequent query
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

    await changeAccessData(mockPool, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'backend.error.server.credentialChangeError',
    });
    expect(console.error).toHaveBeenCalledWith(
      'Fehler beim Ändern der Zugangsdaten:',
      expect.any(Error)
    );
  });
});

// --- Tests für Helferfunktionen (optional, aber gute Praxis) ---
describe('Helper Functions', () => {
  beforeEach(() => {
    (mockConnection.query as jest.Mock).mockClear();
    (bcrypt.hash as jest.Mock).mockClear();
  });

  describe('getPasswordForLoginId', () => {
    test('should return hashed password if loginid exists', async () => {
      (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
        callback(null, [{ password: 'hashed_pw_123' }] as RowDataPacket[]);
      });
      const password = await getPasswordForLoginId(mockConnection, 1);
      expect(password).toBe('hashed_pw_123');
      expect(mockConnection.query).toHaveBeenCalledWith(
        'SELECT password FROM authentification WHERE id = ?',
        [1],
        expect.any(Function)
      );
    });

    test('should return null if loginid does not exist', async () => {
      (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
        callback(null, [] as RowDataPacket[]);
      });
      const password = await getPasswordForLoginId(mockConnection, 999);
      expect(password).toBeNull();
    });

    test('should reject on database error', async () => {
      (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
        callback(new Error('DB error'), null);
      });
      await expect(getPasswordForLoginId(mockConnection, 1)).rejects.toThrow('DB error');
    });
  });

  describe('emailExistsForOtherUser', () => {
    test('should return true if email exists for another user', async () => {
      (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
        callback(null, [{ count: 1 }] as RowDataPacket[]);
      });
      const exists = await emailExistsForOtherUser(mockConnection, 'test@example.com', 1);
      expect(exists).toBe(true);
      expect(mockConnection.query).toHaveBeenCalledWith(
        'SELECT COUNT(*) AS count FROM users WHERE email = ? AND loginid != ?',
        ['test@example.com', 1],
        expect.any(Function)
      );
    });

    test('should return false if email does not exist for another user', async () => {
      (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
        callback(null, [{ count: 0 }] as RowDataPacket[]);
      });
      const exists = await emailExistsForOtherUser(mockConnection, 'new@example.com', 1);
      expect(exists).toBe(false);
    });

    test('should reject on database error', async () => {
      (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
        callback(new Error('DB error'), null);
      });
      await expect(emailExistsForOtherUser(mockConnection, 'test@example.com', 1)).rejects.toThrow(
        'DB error'
      );
    });
  });

  describe('createAuthEntry', () => {
    test('should create auth entry and return insertId', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed_new_pw');
      (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
        callback(null, { insertId: 200 } as OkPacket);
      });
      const insertId = await createAuthEntry(mockConnection, 'newuser', 'newpassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(mockConnection.query).toHaveBeenCalledWith(
        'INSERT INTO authentification (loginname, password) VALUES (?, ?)',
        ['newuser', 'hashed_new_pw'],
        expect.any(Function)
      );
      expect(insertId).toBe(200);
    });

    test('should reject on database error', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed_new_pw');
      (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
        callback(new Error('DB error'), null);
      });
      await expect(createAuthEntry(mockConnection, 'newuser', 'newpassword')).rejects.toThrow(
        'DB error'
      );
    });
  });
});

describe('createOrUpdateUser', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    (mockConnection.query as jest.Mock).mockClear();
    (bcrypt.compare as jest.Mock).mockClear();
    (bcrypt.hash as jest.Mock).mockClear();

    // Reset mocks for internal helpers (important if they were mocked globally in previous tests)
    jest.spyOn(module.exports, 'getPasswordForLoginId').mockRestore();
    jest.spyOn(module.exports, 'emailExistsForOtherUser').mockRestore();
    jest.spyOn(module.exports, 'createAuthEntry').mockRestore();

    // Re-mock them to control behavior for specific test cases below
    jest.spyOn(module.exports, 'getPasswordForLoginId');
    jest.spyOn(module.exports, 'emailExistsForOtherUser');
    jest.spyOn(module.exports, 'createAuthEntry');

    mockRequest = { body: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  // Testfälle für fehlende Pflichtfelder
  test('should return 400 if email is missing', async () => {
    mockRequest.body = { loginid: 1, loginname: 'u', password: 'p' }; // email fehlt
    await createOrUpdateUser(mockConnection, mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith(
      'backend.error.validation.missingRequiredFields'
    );
  });

  test('should return 400 if loginid is missing and loginname/password are missing', async () => {
    mockRequest.body = { email: 'e@e.e' }; // loginid fehlt, loginname/password fehlen
    await createOrUpdateUser(mockConnection, mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith(
      'backend.error.validation.missingRequiredFields'
    );
  });

  // --- UPDATE BESTEHENDER USER (loginid > 0) ---
  test('should return 404 if auth data not found for existing loginid', async () => {
    mockRequest.body = { loginid: 999, email: 'u@e.e', password: 'pw' };
    (getPasswordForLoginId as jest.Mock).mockResolvedValueOnce(null);

    await createOrUpdateUser(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(getPasswordForLoginId).toHaveBeenCalledWith(mockConnection, 999);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.auth.authNotFound');
  });

  test('should return 401 if old password is wrong for existing user', async () => {
    mockRequest.body = { loginid: 1, email: 'u@e.e', password: 'wrong_pw' };
    (getPasswordForLoginId as jest.Mock).mockResolvedValueOnce('hashed_correct_pw');
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

    await createOrUpdateUser(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(getPasswordForLoginId).toHaveBeenCalledWith(mockConnection, 1);
    expect(bcrypt.compare).toHaveBeenCalledWith('wrong_pw', 'hashed_correct_pw');
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.auth.wrongPassword');
  });

  test('should return 409 if email is taken by another user during update', async () => {
    mockRequest.body = { loginid: 1, email: 'taken@e.e', password: 'pw' };
    (getPasswordForLoginId as jest.Mock).mockResolvedValueOnce('hashed_pw');
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    (emailExistsForOtherUser as jest.Mock).mockResolvedValueOnce(true);

    await createOrUpdateUser(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(emailExistsForOtherUser).toHaveBeenCalledWith(mockConnection, 'taken@e.e', 1);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.conflict.emailTaken');
  });

  test('should successfully update user data', async () => {
    mockRequest.body = {
      loginid: 1,
      loginname: 'user1',
      password: 'password123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      anrede: 'Herr',
      city: 'City',
      street: 'Street',
      houseNumber: '1A',
      postalCode: '12345',
      phone: '123',
      mobile: '456',
    };
    (getPasswordForLoginId as jest.Mock).mockResolvedValueOnce('hashed_password123');
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    (emailExistsForOtherUser as jest.Mock).mockResolvedValueOnce(false);
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      // Mock for UPDATE users
      expect(sql).toContain('UPDATE users SET');
      expect(values).toEqual([
        'John Doe',
        'john.doe@example.com',
        'Herr',
        'City',
        'Street',
        '1A',
        '12345',
        '123',
        '456',
        1,
      ]);
      callback(null, {});
    });

    await createOrUpdateUser(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).not.toHaveBeenCalled(); // Default is 200 OK
    expect(mockResponse.send).toHaveBeenCalledWith('backend.success.user.dataUpdated');
  });

  test('should return 500 on database error during user data update', async () => {
    mockRequest.body = {
      loginid: 1,
      email: 'u@e.e',
      password: 'pw',
      name: 'John Doe',
      anrede: 'Herr',
      city: 'City',
      street: 'Street',
      houseNumber: '1A',
      postalCode: '12345',
      phone: '123',
      mobile: '456',
    };
    (getPasswordForLoginId as jest.Mock).mockResolvedValueOnce('hashed_pw');
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    (emailExistsForOtherUser as jest.Mock).mockResolvedValueOnce(false);
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      callback(new Error('Update DB error'), null);
    });

    await createOrUpdateUser(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.updateError');
  });

  // --- NEUEN BENUTZER ERSTELLEN (loginid <= 0) ---
  test('should return 409 if loginname or email is already taken during creation', async () => {
    mockRequest.body = { loginname: 'existing', password: 'pw', email: 'e@e.e' };
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      // Mock for uniqueness check
      callback(null, [{ loginCount: 1, emailCount: 0 }] as RowDataPacket[]); // Login taken
    });

    await createOrUpdateUser(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(mockConnection.query).toHaveBeenCalledTimes(1); // Only uniqueness check
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.conflict.loginOrEmailTaken');
  });

  test('should successfully create a new user', async () => {
    mockRequest.body = {
      loginid: 0, // Indicate creation
      loginname: 'newuser',
      password: 'newpassword',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      anrede: 'Frau',
      city: 'Town',
      street: 'Lane',
      houseNumber: '2B',
      postalCode: '54321',
      phone: '789',
      mobile: '012',
    };

    // Mock for uniqueness check
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      expect(sql).toContain(
        'SELECT (SELECT COUNT(*) FROM authentification WHERE loginname = ?) AS loginCount'
      );
      expect(values).toEqual(['newuser', 'jane.doe@example.com']);
      callback(null, [{ loginCount: 0, emailCount: 0 }] as RowDataPacket[]);
    });

    // Mock for createAuthEntry
    (createAuthEntry as jest.Mock).mockResolvedValueOnce(101); // New loginid

    // Mock for INSERT users
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      expect(sql).toContain('INSERT INTO users');
      expect(values).toEqual([
        101, // newLoginId from mockAuthEntry
        'Jane Doe',
        'jane.doe@example.com',
        'Frau',
        'Town',
        'Lane',
        '2B',
        '54321',
        '789',
        '012',
      ]);
      callback(null, {});
    });

    await createOrUpdateUser(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(createAuthEntry).toHaveBeenCalledWith(mockConnection, 'newuser', 'newpassword');
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.success.user.created');
  });

  test('should return 500 on database error during uniqueness check for new user', async () => {
    mockRequest.body = { loginid: 0, loginname: 'user', password: 'pw', email: 'e@e.e' };
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      callback(new Error('Uniqueness check DB error'), null);
    });

    await createOrUpdateUser(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.uniquenessCheckError');
  });

  test('should return 500 on database error during auth entry creation for new user', async () => {
    mockRequest.body = { loginid: 0, loginname: 'user', password: 'pw', email: 'e@e.e' };
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      callback(null, [{ loginCount: 0, emailCount: 0 }] as RowDataPacket[]);
    });
    (createAuthEntry as jest.Mock).mockRejectedValueOnce(new Error('Auth creation error'));

    await createOrUpdateUser(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(createAuthEntry).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.serverError');
    expect(console.error).toHaveBeenCalledWith('Fehler beim Anlegen:', expect.any(Error));
  });

  test('should return 500 on database error during user entry creation for new user', async () => {
    mockRequest.body = { loginid: 0, loginname: 'user', password: 'pw', email: 'e@e.e' };
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      callback(null, [{ loginCount: 0, emailCount: 0 }] as RowDataPacket[]);
    });
    (createAuthEntry as jest.Mock).mockResolvedValueOnce(101); // Auth created
    (mockConnection.query as jest.Mock).mockImplementationOnce((sql, values, callback) => {
      // Mock for INSERT users
      callback(new Error('User creation DB error'), null);
    });

    await createOrUpdateUser(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(createAuthEntry).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.creationError');
  });

  test('should return 500 on general unexpected error', async () => {
    mockRequest.body = { loginid: 0, loginname: 'user', password: 'pw', email: 'e@e.e' };
    // Simulate an error that occurs outside the explicit try-catch blocks
    jest.spyOn(module.exports, 'createOrUpdateUser').mockImplementationOnce(() => {
      throw new Error('Unexpected general error');
    });

    await createOrUpdateUser(mockConnection, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.serverError');
    expect(console.error).toHaveBeenCalledWith('Fehler in createOrUpdateUser:', expect.any(Error));
  });
});
