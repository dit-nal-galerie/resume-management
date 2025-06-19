'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const historyService_1 = require('../../../src/services/historyService');
describe('historyService', () => {
  let mockDb;
  let mockReq;
  let mockRes;
  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });
  describe('addHistory', () => {
    it('should return 400 if resume_id or description is missing', () => {
      mockReq = { body: {} };
      (0, historyService_1.addHistory)(mockDb, mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('backend.error.validation.missingFields');
    });
    it('should return 500 if db error occurs', () => {
      mockReq = { body: { resume_id: 1, description: 'Test' } };
      mockDb.query.mockImplementation((_q, _p, cb) => cb(new Error('DB error')));
      (0, historyService_1.addHistory)(mockDb, mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('backend.error.server.historyAddError');
    });
    it('should return 201 if insert is successful', () => {
      mockReq = { body: { resume_id: 1, description: 'Test' } };
      mockDb.query.mockImplementation((_q, _p, cb) => cb(null));
      (0, historyService_1.addHistory)(mockDb, mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith('backend.success.history.added');
    });
  });
  describe('getHistoryByResumeId', () => {
    it('should return 400 if resumeId or refId is missing', () => {
      mockReq = { query: {} };
      (0, historyService_1.getHistoryByResumeId)(mockDb, mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'backend.error.validation.missingFields',
      });
    });
    it('should return 500 if db error occurs during validation', () => {
      mockReq = { query: { resumeId: '1', refId: '2' } };
      mockDb.query.mockImplementationOnce((_q, _p, cb) => cb(new Error('DB error')));
      (0, historyService_1.getHistoryByResumeId)(mockDb, mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'backend.error.server.serverError' });
    });
    it('should return 403 if validation fails', () => {
      mockReq = { query: { resumeId: '1', refId: '2' } };
      mockDb.query.mockImplementationOnce((_q, _p, cb) => cb(null, []));
      (0, historyService_1.getHistoryByResumeId)(mockDb, mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'backend.error.auth.noPermission' });
    });
    it('should return 500 if db error occurs during history query', () => {
      mockReq = { query: { resumeId: '1', refId: '2' } };
      // First call: validation ok
      mockDb.query
        .mockImplementationOnce((_q, _p, cb) => cb(null, [{}]))
        .mockImplementationOnce((_q, _p, cb) => cb(new Error('DB error')));
      (0, historyService_1.getHistoryByResumeId)(mockDb, mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'backend.error.server.serverError' });
    });
    it('should return history entries if everything is ok', () => {
      mockReq = { query: { resumeId: '1', refId: '2' } };
      const dbRows = [{ date: '2024-01-01', status: 'Gesendet' }];
      // First call: validation ok, Second call: history ok
      mockDb.query
        .mockImplementationOnce((_q, _p, cb) => cb(null, [{}]))
        .mockImplementationOnce((_q, _p, cb) => cb(null, dbRows));
      (0, historyService_1.getHistoryByResumeId)(mockDb, mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith([{ date: '2024-01-01', status: 'Gesendet' }]);
    });
  });
});
