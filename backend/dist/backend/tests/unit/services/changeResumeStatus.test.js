'use strict';
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
const getResume_1 = require('../../../src/services/getResume');
// Mock the console.error to prevent clutter during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});
describe('changeResumeStatus', () => {
  let mockRequest;
  let mockResponse;
  let mockDbPool;
  beforeEach(() => {
    // Mock the Pool's query method directly since changeResumeStatus uses db.query directly
    mockDbPool = {
      query: jest.fn(),
    };
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });
  // Test case 1: Missing required data
  test('should return 400 if required data is missing', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { resumeId: 1, userId: 1 }; // stateId and date are missing
      yield (0, getResume_1.changeResumeStatus)(mockDbPool, mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.validation.missingData');
      expect(mockDbPool.query).not.toHaveBeenCalled(); // No DB query should be made
    }));
  // Test case 2: Application not found
  test('should return 404 if resume is not found', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { resumeId: 999, userId: 1, stateId: 2, date: '2025-06-07' };
      mockDbPool.query.mockResolvedValueOnce([[]]); // Simulate no rows returned
      yield (0, getResume_1.changeResumeStatus)(mockDbPool, mockRequest, mockResponse);
      expect(mockDbPool.query).toHaveBeenCalledWith(
        'SELECT ref, stateid FROM resumes WHERE resumeId = ?',
        [999]
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.notFound.applicationNotFound');
    }));
  // Test case 3: User ID mismatch (no permission)
  test('should return 403 if userId does not match resume ref', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { resumeId: 1, userId: 100, stateId: 2, date: '2025-06-07' };
      mockDbPool.query.mockResolvedValueOnce([[{ ref: 1, stateid: 1 }]]); // Resume exists, but ref is 1
      yield (0, getResume_1.changeResumeStatus)(mockDbPool, mockRequest, mockResponse);
      expect(mockDbPool.query).toHaveBeenCalledWith(
        'SELECT ref, stateid FROM resumes WHERE resumeId = ?',
        [1]
      );
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.auth.noPermission');
    }));
  // Test case 4: Status already set
  test('should return 400 if the status is already the same', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { resumeId: 1, userId: 1, stateId: 1, date: '2025-06-07' };
      mockDbPool.query.mockResolvedValueOnce([[{ ref: 1, stateid: 1 }]]); // Current state is 1
      yield (0, getResume_1.changeResumeStatus)(mockDbPool, mockRequest, mockResponse);
      expect(mockDbPool.query).toHaveBeenCalledWith(
        'SELECT ref, stateid FROM resumes WHERE resumeId = ?',
        [1]
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.conflict.statusAlreadySet');
    }));
  // Test case 5: Successful status change and history entry
  test('should return 200 on successful status change', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { resumeId: 1, userId: 1, stateId: 2, date: '2025-06-07' };
      mockDbPool.query
        .mockResolvedValueOnce([[{ ref: 1, stateid: 1 }]]) // Initial state
        .mockResolvedValueOnce([{}]) // Simulate successful update
        .mockResolvedValueOnce([{}]); // Simulate successful history insert
      yield (0, getResume_1.changeResumeStatus)(mockDbPool, mockRequest, mockResponse);
      expect(mockDbPool.query).toHaveBeenCalledWith(
        'SELECT ref, stateid FROM resumes WHERE resumeId = ?',
        [1]
      );
      expect(mockDbPool.query).toHaveBeenCalledWith(
        'UPDATE resumes SET stateid = ? WHERE resumeId = ?',
        [2, 1]
      );
      expect(mockDbPool.query).toHaveBeenCalledWith(
        'INSERT INTO history (resumeid, stateid, date) VALUES (?, ?, ?)',
        [1, 2, '2025-06-07']
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.success.status.changed');
    }));
  // Test case 6: Database error during update or insert
  test('should return 500 on database error during update/insert', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.body = { resumeId: 1, userId: 1, stateId: 2, date: '2025-06-07' };
      const errorMessage = 'Database write error';
      mockDbPool.query
        .mockResolvedValueOnce([[{ ref: 1, stateid: 1 }]]) // Initial state
        .mockRejectedValueOnce(new Error(errorMessage)); // Simulate error during UPDATE or INSERT
      yield (0, getResume_1.changeResumeStatus)(mockDbPool, mockRequest, mockResponse);
      expect(mockDbPool.query).toHaveBeenCalledWith(
        'SELECT ref, stateid FROM resumes WHERE resumeId = ?',
        [1]
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.internalServerError');
      expect(console.error).toHaveBeenCalledWith('Fehler:', expect.any(Error));
    }));
});
