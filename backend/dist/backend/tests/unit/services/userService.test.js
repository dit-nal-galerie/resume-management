'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
const bcrypt = __importStar(require('bcrypt'));
// Importiere alle Funktionen aus der Auth-Datei
const userService_1 = require('../../../src/services/userService');
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
};
// Mock für MySQL2 Pool (promise-basiert, für changeAccessData)
const mockPool = {
  query: jest.fn(),
  getConnection: jest.fn(), // Nicht direkt in diesen Funktionen verwendet, aber guter Praxis
};
describe('createAccount', () => {
  beforeEach(() => {
    mockConnection.query.mockClear();
    bcrypt.hash.mockClear();
  });
  test('should create an account and return insertId on success', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        callback(null, { insertId: 100 });
      });
      const result = yield (0, userService_1.createAccount)(
        mockConnection,
        'testuser',
        'password123'
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockConnection.query).toHaveBeenCalledWith(
        'INSERT INTO authentification (loginname, password) VALUES (?, ?)',
        ['testuser', 'hashed_password123'],
        expect.any(Function)
      );
      expect(result).toBe(100);
    }));
  test('should return null and log error if hashing fails', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      bcrypt.hash.mockRejectedValueOnce(new Error('Hashing failed'));
      const result = yield (0, userService_1.createAccount)(
        mockConnection,
        'testuser',
        'password123'
      );
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(mockConnection.query).not.toHaveBeenCalled();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error hashing password:', expect.any(Error));
    }));
  test('should return null and log error if database insertion fails', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        callback(new Error('DB error'), null);
      });
      const result = yield (0, userService_1.createAccount)(
        mockConnection,
        'testuser',
        'password123'
      );
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(mockConnection.query).toHaveBeenCalledTimes(1);
      expect(result).toBeNull(); // createAccount returns null on error
      expect(console.error).toHaveBeenCalledWith('Error hashing password:', expect.any(Error)); // bcrypt error handler catches it too
    }));
});
describe('login', () => {
  let mockRequest;
  let mockResponse;
  beforeEach(() => {
    mockConnection.query.mockClear();
    bcrypt.compare.mockClear();
    mockRequest = { body: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });
  test('should return user data on successful login', () =>
    __awaiter(void 0, void 0, void 0, function* () {
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
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        expect(sql).toContain('SELECT id, password FROM authentification WHERE loginname = ?');
        expect(values).toEqual(['testuser']);
        callback(null, [{ id: userId, password: hashedPassword }]);
      });
      // Mock for user query
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        expect(sql).toContain('SELECT a.loginname, u.loginid, u.name, u.email');
        expect(values).toEqual([userId]);
        callback(null, [userData]);
      });
      yield (0, userService_1.login)(mockConnection, mockRequest, mockResponse);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', hashedPassword);
      expect(mockResponse.status).not.toHaveBeenCalled(); // No status sent means 200 OK
      expect(mockResponse.json).toHaveBeenCalledWith(userData);
    }));
  test('should return 404 if user not found during authentication', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { loginname: 'nonexistent', password: 'any' };
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        callback(null, []); // No user found
      });
      yield (0, userService_1.login)(mockConnection, mockRequest, mockResponse);
      expect(mockConnection.query).toHaveBeenCalledTimes(1); // Only auth query
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'backend.error.notFound.userNotFound',
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    }));
  test('should return 401 if password is incorrect', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { loginname: 'testuser', password: 'wrongpassword' };
      const hashedPassword = 'hashed_correctpassword'; // bcrypt.compare will return false
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        callback(null, [{ id: 1, password: hashedPassword }]);
      });
      bcrypt.compare.mockResolvedValueOnce(false); // Simulate incorrect password
      yield (0, userService_1.login)(mockConnection, mockRequest, mockResponse);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', hashedPassword);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'backend.error.auth.wrongPassword',
      });
      expect(mockConnection.query).toHaveBeenCalledTimes(1); // Only auth query
    }));
  test('should return 500 on database error during authentication query', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { loginname: 'testuser', password: 'password123' };
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        callback(new Error('DB connection failed'), null);
      });
      yield (0, userService_1.login)(mockConnection, mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.serverError');
      expect(console.error).toHaveBeenCalledWith(
        'Fehler beim Abrufen der Login-Daten:',
        expect.any(Error)
      );
    }));
  test('should return 500 on database error during user info query', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { loginname: 'testuser', password: 'password123' };
      const hashedPassword = 'hashed_password123';
      const userId = 1;
      // Mock for auth query
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        callback(null, [{ id: userId, password: hashedPassword }]);
      });
      // Mock for user query - simulate error
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        callback(new Error('User DB error'), null);
      });
      yield (0, userService_1.login)(mockConnection, mockRequest, mockResponse);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', hashedPassword);
      expect(mockConnection.query).toHaveBeenCalledTimes(2); // Both queries attempted
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.loadingUserDataError');
      expect(console.error).toHaveBeenCalledWith(
        'Fehler beim Abrufen der Benutzerinformationen:',
        expect.any(Error)
      );
    }));
  test('should return 404 if user info not found after successful authentication', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { loginname: 'testuser', password: 'password123' };
      const hashedPassword = 'hashed_password123';
      const userId = 1;
      // Mock for auth query
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        callback(null, [{ id: userId, password: hashedPassword }]);
      });
      // Mock for user query - simulate no user data found (e.g., inconsistent DB)
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        callback(null, []);
      });
      yield (0, userService_1.login)(mockConnection, mockRequest, mockResponse);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', hashedPassword);
      expect(mockConnection.query).toHaveBeenCalledTimes(2);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'backend.error.notFound.userInfoNotFound',
      });
    }));
});
describe('getAnrede', () => {
  let mockRequest;
  let mockResponse;
  beforeEach(() => {
    mockConnection.query.mockClear();
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
    mockConnection.query.mockImplementationOnce((sql, callback) => {
      expect(sql).toBe('SELECT * FROM anrede');
      callback(null, mockAnrede);
    });
    (0, userService_1.getAnrede)(mockConnection, mockRequest, mockResponse);
    expect(mockConnection.query).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(mockAnrede);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });
  test('should return 500 on database error', () => {
    mockConnection.query.mockImplementationOnce((sql, callback) => {
      callback(new Error('DB error'), null);
    });
    (0, userService_1.getAnrede)(mockConnection, mockRequest, mockResponse);
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
  let mockRequest;
  let mockResponse;
  beforeEach(() => {
    mockPool.query.mockClear();
    bcrypt.compare.mockClear();
    bcrypt.hash.mockClear();
    mockRequest = { body: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });
  test('should return 400 if essential fields are missing', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { userId: 1, loginname: 'user', email: 'a@b.c' }; // oldPassword missing
      yield (0, userService_1.changeAccessData)(mockPool, mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'backend.error.validation.missingFields',
      });
      expect(mockPool.query).not.toHaveBeenCalled();
    }));
  test('should return 400 if password fields are missing when changePassword is true', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = {
        userId: 1,
        loginname: 'user',
        email: 'a@b.c',
        oldPassword: 'old',
        changePassword: true,
        password: 'new', // password2 missing
      };
      yield (0, userService_1.changeAccessData)(mockPool, mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'backend.error.validation.missingFields',
      });
      expect(mockPool.query).not.toHaveBeenCalled();
    }));
  test('should return 404 if user not found', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = {
        userId: 999,
        loginname: 'user',
        email: 'a@b.c',
        oldPassword: 'old',
      };
      mockPool.query.mockResolvedValueOnce([[]]); // No user found
      yield (0, userService_1.changeAccessData)(mockPool, mockRequest, mockResponse);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'backend.error.notFound.userNotFound',
      });
    }));
  test('should return 401 if old password is incorrect', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = {
        userId: 1,
        loginname: 'user',
        email: 'a@b.c',
        oldPassword: 'wrong_old_password',
      };
      mockPool.query.mockResolvedValueOnce([
        [{ userid: 1, loginid: 1, password: 'hashed_correct_old_password' }],
      ]);
      bcrypt.compare.mockResolvedValueOnce(false); // Simulate incorrect password
      yield (0, userService_1.changeAccessData)(mockPool, mockRequest, mockResponse);
      expect(mockPool.query).toHaveBeenCalledTimes(1); // User lookup
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong_old_password',
        'hashed_correct_old_password'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'backend.error.auth.oldPasswordWrong',
      });
    }));
  test('should return 409 if new email is already taken by another user', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = {
        userId: 1,
        loginname: 'user',
        email: 'existing@other.com',
        oldPassword: 'old_password',
      };
      mockPool.query
        .mockResolvedValueOnce([[{ userid: 1, loginid: 1, password: 'hashed_old_password' }]]) // User found
        .mockResolvedValueOnce([[{ userid: 2, email: 'existing@other.com' }]]); // Email taken by another user
      bcrypt.compare.mockResolvedValueOnce(true);
      yield (0, userService_1.changeAccessData)(mockPool, mockRequest, mockResponse);
      expect(mockPool.query).toHaveBeenCalledTimes(2); // User lookup + email check
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'backend.error.conflict.emailTaken',
      });
    }));
  test('should return 400 if new passwords mismatch when changePassword is true', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = {
        userId: 1,
        loginname: 'user',
        email: 'a@b.c',
        oldPassword: 'old_password',
        changePassword: true,
        password: 'new_password',
        password2: 'mismatch_password',
      };
      mockPool.query
        .mockResolvedValueOnce([[{ userid: 1, loginid: 1, password: 'hashed_old_password' }]]) // User found
        .mockResolvedValueOnce([[]]); // Email not taken
      bcrypt.compare.mockResolvedValueOnce(true);
      yield (0, userService_1.changeAccessData)(mockPool, mockRequest, mockResponse);
      expect(mockPool.query).toHaveBeenCalledTimes(2); // User lookup + email check
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'backend.error.validation.passwordMismatch',
      });
      expect(bcrypt.hash).not.toHaveBeenCalled(); // No hashing if mismatch
    }));
  test('should successfully update loginname and email without password change', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = {
        userId: 1,
        loginname: 'new_loginname',
        email: 'new_email@example.com',
        oldPassword: 'old_password',
        changePassword: false, // No password change
      };
      mockPool.query
        .mockResolvedValueOnce([
          [{ userid: 1, loginid: 1, name: 'Test User', password: 'hashed_old_password' }],
        ]) // User found
        .mockResolvedValueOnce([[]]) // Email not taken
        .mockResolvedValueOnce([{}]) // auth update success
        .mockResolvedValueOnce([{}]); // users update success
      bcrypt.compare.mockResolvedValueOnce(true);
      yield (0, userService_1.changeAccessData)(mockPool, mockRequest, mockResponse);
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
    }));
  test('should successfully update loginname, email, and password', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = {
        userId: 1,
        loginname: 'new_loginname_pw',
        email: 'new_email_pw@example.com',
        oldPassword: 'old_password',
        changePassword: true,
        password: 'new_password',
        password2: 'new_password',
      };
      mockPool.query
        .mockResolvedValueOnce([
          [{ userid: 1, loginid: 1, name: 'Test User', password: 'hashed_old_password' }],
        ]) // User found
        .mockResolvedValueOnce([[]]) // Email not taken
        .mockResolvedValueOnce([{}]) // auth update success
        .mockResolvedValueOnce([{}]); // users update success
      bcrypt.compare.mockResolvedValueOnce(true);
      bcrypt.hash.mockResolvedValueOnce('hashed_new_password'); // New password hash
      yield (0, userService_1.changeAccessData)(mockPool, mockRequest, mockResponse);
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
    }));
  test('should return 500 on any database error during update process', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = {
        userId: 1,
        loginname: 'user',
        email: 'a@b.c',
        oldPassword: 'old_password',
      };
      mockPool.query
        .mockResolvedValueOnce([[{ userid: 1, loginid: 1, password: 'hashed_old_password' }]]) // User found
        .mockRejectedValueOnce(new Error('Simulated DB error')); // Error at email check or subsequent query
      bcrypt.compare.mockResolvedValueOnce(true);
      yield (0, userService_1.changeAccessData)(mockPool, mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'backend.error.server.credentialChangeError',
      });
      expect(console.error).toHaveBeenCalledWith(
        'Fehler beim Ändern der Zugangsdaten:',
        expect.any(Error)
      );
    }));
});
// --- Tests für Helferfunktionen (optional, aber gute Praxis) ---
describe('Helper Functions', () => {
  beforeEach(() => {
    mockConnection.query.mockClear();
    bcrypt.hash.mockClear();
  });
  describe('getPasswordForLoginId', () => {
    test('should return hashed password if loginid exists', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        mockConnection.query.mockImplementationOnce((sql, values, callback) => {
          callback(null, [{ password: 'hashed_pw_123' }]);
        });
        const password = yield (0, userService_1.getPasswordForLoginId)(mockConnection, 1);
        expect(password).toBe('hashed_pw_123');
        expect(mockConnection.query).toHaveBeenCalledWith(
          'SELECT password FROM authentification WHERE id = ?',
          [1],
          expect.any(Function)
        );
      }));
    test('should return null if loginid does not exist', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        mockConnection.query.mockImplementationOnce((sql, values, callback) => {
          callback(null, []);
        });
        const password = yield (0, userService_1.getPasswordForLoginId)(mockConnection, 999);
        expect(password).toBeNull();
      }));
    test('should reject on database error', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        mockConnection.query.mockImplementationOnce((sql, values, callback) => {
          callback(new Error('DB error'), null);
        });
        yield expect((0, userService_1.getPasswordForLoginId)(mockConnection, 1)).rejects.toThrow(
          'DB error'
        );
      }));
  });
  describe('emailExistsForOtherUser', () => {
    test('should return true if email exists for another user', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        mockConnection.query.mockImplementationOnce((sql, values, callback) => {
          callback(null, [{ count: 1 }]);
        });
        const exists = yield (0, userService_1.emailExistsForOtherUser)(
          mockConnection,
          'test@example.com',
          1
        );
        expect(exists).toBe(true);
        expect(mockConnection.query).toHaveBeenCalledWith(
          'SELECT COUNT(*) AS count FROM users WHERE email = ? AND loginid != ?',
          ['test@example.com', 1],
          expect.any(Function)
        );
      }));
    test('should return false if email does not exist for another user', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        mockConnection.query.mockImplementationOnce((sql, values, callback) => {
          callback(null, [{ count: 0 }]);
        });
        const exists = yield (0, userService_1.emailExistsForOtherUser)(
          mockConnection,
          'new@example.com',
          1
        );
        expect(exists).toBe(false);
      }));
    test('should reject on database error', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        mockConnection.query.mockImplementationOnce((sql, values, callback) => {
          callback(new Error('DB error'), null);
        });
        yield expect(
          (0, userService_1.emailExistsForOtherUser)(mockConnection, 'test@example.com', 1)
        ).rejects.toThrow('DB error');
      }));
  });
  describe('createAuthEntry', () => {
    test('should create auth entry and return insertId', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        bcrypt.hash.mockResolvedValueOnce('hashed_new_pw');
        mockConnection.query.mockImplementationOnce((sql, values, callback) => {
          callback(null, { insertId: 200 });
        });
        const insertId = yield (0, userService_1.createAuthEntry)(
          mockConnection,
          'newuser',
          'newpassword'
        );
        expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
        expect(mockConnection.query).toHaveBeenCalledWith(
          'INSERT INTO authentification (loginname, password) VALUES (?, ?)',
          ['newuser', 'hashed_new_pw'],
          expect.any(Function)
        );
        expect(insertId).toBe(200);
      }));
    test('should reject on database error', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        bcrypt.hash.mockResolvedValueOnce('hashed_new_pw');
        mockConnection.query.mockImplementationOnce((sql, values, callback) => {
          callback(new Error('DB error'), null);
        });
        yield expect(
          (0, userService_1.createAuthEntry)(mockConnection, 'newuser', 'newpassword')
        ).rejects.toThrow('DB error');
      }));
  });
});
describe('createOrUpdateUser', () => {
  let mockRequest;
  let mockResponse;
  beforeEach(() => {
    mockConnection.query.mockClear();
    bcrypt.compare.mockClear();
    bcrypt.hash.mockClear();
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
  test('should return 400 if email is missing', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { loginid: 1, loginname: 'u', password: 'p' }; // email fehlt
      yield (0, userService_1.createOrUpdateUser)(mockConnection, mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith(
        'backend.error.validation.missingRequiredFields'
      );
    }));
  test('should return 400 if loginid is missing and loginname/password are missing', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { email: 'e@e.e' }; // loginid fehlt, loginname/password fehlen
      yield (0, userService_1.createOrUpdateUser)(mockConnection, mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith(
        'backend.error.validation.missingRequiredFields'
      );
    }));
  // --- UPDATE BESTEHENDER USER (loginid > 0) ---
  test('should return 404 if auth data not found for existing loginid', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { loginid: 999, email: 'u@e.e', password: 'pw' };
      userService_1.getPasswordForLoginId.mockResolvedValueOnce(null);
      yield (0, userService_1.createOrUpdateUser)(mockConnection, mockRequest, mockResponse);
      expect(userService_1.getPasswordForLoginId).toHaveBeenCalledWith(mockConnection, 999);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.auth.authNotFound');
    }));
  test('should return 401 if old password is wrong for existing user', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { loginid: 1, email: 'u@e.e', password: 'wrong_pw' };
      userService_1.getPasswordForLoginId.mockResolvedValueOnce('hashed_correct_pw');
      bcrypt.compare.mockResolvedValueOnce(false);
      yield (0, userService_1.createOrUpdateUser)(mockConnection, mockRequest, mockResponse);
      expect(userService_1.getPasswordForLoginId).toHaveBeenCalledWith(mockConnection, 1);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong_pw', 'hashed_correct_pw');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.auth.wrongPassword');
    }));
  test('should return 409 if email is taken by another user during update', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { loginid: 1, email: 'taken@e.e', password: 'pw' };
      userService_1.getPasswordForLoginId.mockResolvedValueOnce('hashed_pw');
      bcrypt.compare.mockResolvedValueOnce(true);
      userService_1.emailExistsForOtherUser.mockResolvedValueOnce(true);
      yield (0, userService_1.createOrUpdateUser)(mockConnection, mockRequest, mockResponse);
      expect(userService_1.emailExistsForOtherUser).toHaveBeenCalledWith(
        mockConnection,
        'taken@e.e',
        1
      );
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.conflict.emailTaken');
    }));
  test('should successfully update user data', () =>
    __awaiter(void 0, void 0, void 0, function* () {
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
      userService_1.getPasswordForLoginId.mockResolvedValueOnce('hashed_password123');
      bcrypt.compare.mockResolvedValueOnce(true);
      userService_1.emailExistsForOtherUser.mockResolvedValueOnce(false);
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
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
      yield (0, userService_1.createOrUpdateUser)(mockConnection, mockRequest, mockResponse);
      expect(mockResponse.status).not.toHaveBeenCalled(); // Default is 200 OK
      expect(mockResponse.send).toHaveBeenCalledWith('backend.success.user.dataUpdated');
    }));
  test('should return 500 on database error during user data update', () =>
    __awaiter(void 0, void 0, void 0, function* () {
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
      userService_1.getPasswordForLoginId.mockResolvedValueOnce('hashed_pw');
      bcrypt.compare.mockResolvedValueOnce(true);
      userService_1.emailExistsForOtherUser.mockResolvedValueOnce(false);
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        callback(new Error('Update DB error'), null);
      });
      yield (0, userService_1.createOrUpdateUser)(mockConnection, mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.updateError');
    }));
  // --- NEUEN BENUTZER ERSTELLEN (loginid <= 0) ---
  test('should return 409 if loginname or email is already taken during creation', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { loginname: 'existing', password: 'pw', email: 'e@e.e' };
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        // Mock for uniqueness check
        callback(null, [{ loginCount: 1, emailCount: 0 }]); // Login taken
      });
      yield (0, userService_1.createOrUpdateUser)(mockConnection, mockRequest, mockResponse);
      expect(mockConnection.query).toHaveBeenCalledTimes(1); // Only uniqueness check
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.conflict.loginOrEmailTaken');
    }));
  test('should successfully create a new user', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = {
        loginid: 0,
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
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        expect(sql).toContain(
          'SELECT (SELECT COUNT(*) FROM authentification WHERE loginname = ?) AS loginCount'
        );
        expect(values).toEqual(['newuser', 'jane.doe@example.com']);
        callback(null, [{ loginCount: 0, emailCount: 0 }]);
      });
      // Mock for createAuthEntry
      userService_1.createAuthEntry.mockResolvedValueOnce(101); // New loginid
      // Mock for INSERT users
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        expect(sql).toContain('INSERT INTO users');
        expect(values).toEqual([
          101,
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
      yield (0, userService_1.createOrUpdateUser)(mockConnection, mockRequest, mockResponse);
      expect(userService_1.createAuthEntry).toHaveBeenCalledWith(
        mockConnection,
        'newuser',
        'newpassword'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.success.user.created');
    }));
  test('should return 500 on database error during uniqueness check for new user', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { loginid: 0, loginname: 'user', password: 'pw', email: 'e@e.e' };
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        callback(new Error('Uniqueness check DB error'), null);
      });
      yield (0, userService_1.createOrUpdateUser)(mockConnection, mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.uniquenessCheckError');
    }));
  test('should return 500 on database error during auth entry creation for new user', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { loginid: 0, loginname: 'user', password: 'pw', email: 'e@e.e' };
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        callback(null, [{ loginCount: 0, emailCount: 0 }]);
      });
      userService_1.createAuthEntry.mockRejectedValueOnce(new Error('Auth creation error'));
      yield (0, userService_1.createOrUpdateUser)(mockConnection, mockRequest, mockResponse);
      expect(userService_1.createAuthEntry).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.serverError');
      expect(console.error).toHaveBeenCalledWith('Fehler beim Anlegen:', expect.any(Error));
    }));
  test('should return 500 on database error during user entry creation for new user', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { loginid: 0, loginname: 'user', password: 'pw', email: 'e@e.e' };
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        callback(null, [{ loginCount: 0, emailCount: 0 }]);
      });
      userService_1.createAuthEntry.mockResolvedValueOnce(101); // Auth created
      mockConnection.query.mockImplementationOnce((sql, values, callback) => {
        // Mock for INSERT users
        callback(new Error('User creation DB error'), null);
      });
      yield (0, userService_1.createOrUpdateUser)(mockConnection, mockRequest, mockResponse);
      expect(userService_1.createAuthEntry).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.creationError');
    }));
  test('should return 500 on general unexpected error', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { loginid: 0, loginname: 'user', password: 'pw', email: 'e@e.e' };
      // Simulate an error that occurs outside the explicit try-catch blocks
      jest.spyOn(module.exports, 'createOrUpdateUser').mockImplementationOnce(() => {
        throw new Error('Unexpected general error');
      });
      yield (0, userService_1.createOrUpdateUser)(mockConnection, mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.serverError');
      expect(console.error).toHaveBeenCalledWith(
        'Fehler in createOrUpdateUser:',
        expect.any(Error)
      );
    }));
});
