import { Request, Response } from 'express';
import { Pool, PoolConnection } from 'mysql2/promise';
import { changeResumeStatus } from '../../../src/services/getResume';

// Mock the console.error to prevent clutter during tests
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('changeResumeStatus', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockDbPool: Pool;

  beforeEach(() => {
    // Mock the Pool's query method directly since changeResumeStatus uses db.query directly
    mockDbPool = {
      query: jest.fn(),
    } as unknown as Pool;

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  // Test case 1: Missing required data
  test('should return 400 if required data is missing', async () => {
    mockRequest.body = { resumeId: 1, userId: 1 }; // stateId and date are missing

    await changeResumeStatus(mockDbPool, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.validation.missingData');
    expect(mockDbPool.query).not.toHaveBeenCalled(); // No DB query should be made
  });

  // Test case 2: Application not found
  test('should return 404 if resume is not found', async () => {
    mockRequest.body = { resumeId: 999, userId: 1, stateId: 2, date: '2025-06-07' };
    (mockDbPool.query as jest.Mock).mockResolvedValueOnce([[]]); // Simulate no rows returned

    await changeResumeStatus(mockDbPool, mockRequest as Request, mockResponse as Response);

    expect(mockDbPool.query).toHaveBeenCalledWith(
      'SELECT ref, stateid FROM resumes WHERE resumeId = ?',
      [999]
    );
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.notFound.applicationNotFound');
  });

  // Test case 3: User ID mismatch (no permission)
  test('should return 403 if userId does not match resume ref', async () => {
    mockRequest.body = { resumeId: 1, userId: 100, stateId: 2, date: '2025-06-07' };
    (mockDbPool.query as jest.Mock).mockResolvedValueOnce([[{ ref: 1, stateid: 1 }]]); // Resume exists, but ref is 1

    await changeResumeStatus(mockDbPool, mockRequest as Request, mockResponse as Response);

    expect(mockDbPool.query).toHaveBeenCalledWith(
      'SELECT ref, stateid FROM resumes WHERE resumeId = ?',
      [1]
    );
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.auth.noPermission');
  });

  // Test case 4: Status already set
  test('should return 400 if the status is already the same', async () => {
    mockRequest.body = { resumeId: 1, userId: 1, stateId: 1, date: '2025-06-07' };
    (mockDbPool.query as jest.Mock).mockResolvedValueOnce([[{ ref: 1, stateid: 1 }]]); // Current state is 1

    await changeResumeStatus(mockDbPool, mockRequest as Request, mockResponse as Response);

    expect(mockDbPool.query).toHaveBeenCalledWith(
      'SELECT ref, stateid FROM resumes WHERE resumeId = ?',
      [1]
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.conflict.statusAlreadySet');
  });

  // Test case 5: Successful status change and history entry
  test('should return 200 on successful status change', async () => {
    mockRequest.body = { resumeId: 1, userId: 1, stateId: 2, date: '2025-06-07' };
    (mockDbPool.query as jest.Mock)
      .mockResolvedValueOnce([[{ ref: 1, stateid: 1 }]]) // Initial state
      .mockResolvedValueOnce([{}]) // Simulate successful update
      .mockResolvedValueOnce([{}]); // Simulate successful history insert

    await changeResumeStatus(mockDbPool, mockRequest as Request, mockResponse as Response);

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
  });

  // Test case 6: Database error during update or insert
  test('should return 500 on database error during update/insert', async () => {
    mockRequest.body = { resumeId: 1, userId: 1, stateId: 2, date: '2025-06-07' };
    const errorMessage = 'Database write error';
    (mockDbPool.query as jest.Mock)
      .mockResolvedValueOnce([[{ ref: 1, stateid: 1 }]]) // Initial state
      .mockRejectedValueOnce(new Error(errorMessage)); // Simulate error during UPDATE or INSERT

    await changeResumeStatus(mockDbPool, mockRequest as Request, mockResponse as Response);

    expect(mockDbPool.query).toHaveBeenCalledWith(
      'SELECT ref, stateid FROM resumes WHERE resumeId = ?',
      [1]
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.internalServerError');
    expect(console.error).toHaveBeenCalledWith('Fehler:', expect.any(Error));
  });
});
