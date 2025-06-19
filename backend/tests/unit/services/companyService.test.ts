// tests/unit/services/companyService.test.ts
import { addCompany, getCompanies } from '../../../src/services/companyService';
import { Request, Response } from 'express';
import { Connection } from 'mysql2';

describe('companyService', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockDb: Partial<Connection>;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

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
      addCompany(mockDb as Connection, mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('backend.error.validation.missingFields');
    });

    it('should return 201 on successful insert', () => {
      mockReq = {
        body: { name: 'Test GmbH', adress: 'Berlin', ref: 'XYZ' },
      };
      (mockDb.query as jest.Mock).mockImplementation((_query, _values, callback) => callback(null));
      addCompany(mockDb as Connection, mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(sendMock).toHaveBeenCalledWith('backend.success.company.added');
    });

    it('should return 500 on DB error', () => {
      mockReq = {
        body: { name: 'Test GmbH', adress: 'Berlin', ref: 'XYZ' },
      };
      (mockDb.query as jest.Mock).mockImplementation((_query, _values, callback) =>
        callback(new Error('DB Fehler'))
      );
      addCompany(mockDb as Connection, mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('backend.error.server.companyAddError');
    });
  });
});
