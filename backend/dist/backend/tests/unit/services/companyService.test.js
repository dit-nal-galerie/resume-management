'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// tests/unit/services/companyService.test.ts
const companyService_1 = require('../../../src/services/companyService');
describe('companyService', () => {
  let mockReq;
  let mockRes;
  let mockDb;
  let statusMock;
  let sendMock;
  beforeEach(() => {
    sendMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ send: sendMock });
    mockRes = {
      status: statusMock,
      send: sendMock,
    };
    mockDb = {
      query: jest.fn(),
    };
  });
  describe('addCompany', () => {
    it('should return 400 if required fields are missing', () => {
      mockReq = { body: {} };
      (0, companyService_1.addCompany)(mockDb, mockReq, mockRes);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('backend.error.validation.missingFields');
    });
    it('should return 201 on successful insert', () => {
      mockReq = {
        body: { name: 'Test GmbH', adress: 'Berlin', ref: 'XYZ' },
      };
      mockDb.query.mockImplementation((_query, _values, callback) => callback(null));
      (0, companyService_1.addCompany)(mockDb, mockReq, mockRes);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(sendMock).toHaveBeenCalledWith('backend.success.company.added');
    });
    it('should return 500 on DB error', () => {
      mockReq = {
        body: { name: 'Test GmbH', adress: 'Berlin', ref: 'XYZ' },
      };
      mockDb.query.mockImplementation((_query, _values, callback) =>
        callback(new Error('DB Fehler'))
      );
      (0, companyService_1.addCompany)(mockDb, mockReq, mockRes);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('backend.error.server.companyAddError');
    });
  });
});
