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
const saveResume_1 = require('../../../src/services/saveResume');
describe('updateOrCreateResume', () => {
  let mockDbPool;
  let mockConnection;
  let mockReq;
  let mockRes;
  beforeEach(() => {
    mockConnection = {
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
      query: jest.fn(),
    };
    mockDbPool = {
      getConnection: jest.fn().mockResolvedValue(mockConnection),
    };
    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      headersSent: false,
    };
  });
  it('should return 400 if required resume data is missing', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockReq.body = {};
      yield (0, saveResume_1.updateOrCreateResume)(mockDbPool, mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('backend.error.validation.missingResumeData');
    }));
  it('should create a new resume and commit transaction', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockReq.body = {
        resumeId: 0,
        ref: 1,
        position: 'Entwickler',
        stateId: 10,
        company: {
          companyId: 0,
          name: 'Firma',
          city: '',
          street: '',
          houseNumber: '',
          postalCode: '',
          isRecruter: false,
          ref: 1,
        },
        recrutingCompany: null,
        contactCompany: null,
        contactRecrutingCompany: null,
      };
      // Firmen-Insert
      mockConnection.query
        .mockResolvedValueOnce([{ insertId: 5 }]) // handleCompany (company)
        .mockResolvedValueOnce([{ insertId: 1 }]) // insertResume
        .mockResolvedValueOnce([[]]); // saveHistory
      yield (0, saveResume_1.updateOrCreateResume)(mockDbPool, mockReq, mockRes);
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'backend.success.resume.created',
          resumeId: 1,
          companyId: 5,
        })
      );
      expect(mockConnection.release).toHaveBeenCalled();
    }));
  it('should update an existing resume', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockReq.body = {
        resumeId: 2,
        ref: 1,
        position: 'Entwickler',
        stateId: 10,
        company: {
          companyId: 3,
          name: 'Firma',
          city: '',
          street: '',
          houseNumber: '',
          postalCode: '',
          isRecruter: false,
          ref: 1,
        },
        recrutingCompany: null,
        contactCompany: null,
        contactRecrutingCompany: null,
      };
      // Firmen-Update
      mockConnection.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // handleCompany (company)
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // updateResume
        .mockResolvedValueOnce([[]]); // saveHistory
      yield (0, saveResume_1.updateOrCreateResume)(mockDbPool, mockReq, mockRes);
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'backend.success.resume.updated',
          resumeId: 2,
          companyId: 3,
        })
      );
      expect(mockConnection.release).toHaveBeenCalled();
    }));
  it('should rollback and return 500 on error', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockReq.body = {
        resumeId: 0,
        ref: 1,
        position: 'Entwickler',
        stateId: 10,
        company: {
          companyId: 0,
          name: 'Firma',
          city: '',
          street: '',
          houseNumber: '',
          postalCode: '',
          isRecruter: false,
          ref: 1,
        },
        recrutingCompany: null,
        contactCompany: null,
        contactRecrutingCompany: null,
      };
      mockConnection.query.mockRejectedValueOnce(new Error('DB error'));
      yield (0, saveResume_1.updateOrCreateResume)(mockDbPool, mockReq, mockRes);
      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'backend.error.server.serverError',
        })
      );
      expect(mockConnection.release).toHaveBeenCalled();
    }));
});
