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
describe('resumeManagementAPI', () => {
  let req;
  let res;
  let db;
  let connection;
  let statusMock;
  let sendMock;
  let jsonMock;
  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    sendMock = jest.fn();
    jsonMock = jest.fn();
    res = {
      status: statusMock,
      send: sendMock,
      json: jsonMock,
    };
    db = {
      query: jest.fn(),
    };
    connection = {
      query: jest.fn(),
      release: jest.fn(),
    };
  });
  describe('getResumeById', () => {
    it('should return 400 for invalid resumeId', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        req = { params: { resumeId: 'abc' } };
        yield (0, getResume_1.getResumeById)(db, req, res);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(sendMock).toHaveBeenCalledWith('backend.error.validation.invalidResumeId');
      }));
    it('should return 404 if resume not found', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        req = { params: { resumeId: '1' } };
        db.getConnection = jest.fn().mockResolvedValue(connection);
        connection.query.mockResolvedValue([[]]);
        yield (0, getResume_1.getResumeById)(db, req, res);
        expect(statusMock).toHaveBeenCalledWith(404);
        expect(sendMock).toHaveBeenCalledWith('backend.error.notFound.resumeNotFound');
        expect(connection.release).toHaveBeenCalled();
      }));
    it('should return 200 and resume data if found', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        req = { params: { resumeId: '1' } };
        const mockResult = [
          {
            resumeId: 1,
            ref: 101,
            position: 'Entwickler',
            stateId: 2,
            stateText: 'In Bearbeitung',
            link: 'http://example.com',
            comment: 'Test',
            created: new Date('2024-01-01'),
            company_Id: 1,
            company_Name: 'Firma A',
            company_City: 'Berlin',
            company_Street: 'Hauptstraße',
            company_HouseNumber: '1',
            company_PostalCode: '10115',
            company_IsRecruter: 0,
            company_Ref: 123,
            parentCompany_Id: null,
            contactCompany_Id: null,
            contactParentCompany_Id: null,
          },
        ];
        db.getConnection = jest.fn().mockResolvedValue(connection);
        connection.query.mockResolvedValue([mockResult]);
        yield (0, getResume_1.getResumeById)(db, req, res);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            resumeId: 1,
            position: 'Entwickler',
            company: expect.objectContaining({ name: 'Firma A' }),
          })
        );
        expect(connection.release).toHaveBeenCalled();
      }));
    it('should return 500 on unexpected error', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        req = { params: { resumeId: '1' } };
        db.getConnection = jest.fn().mockRejectedValue(new Error('DB Error'));
        yield (0, getResume_1.getResumeById)(db, req, res);
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(sendMock).toHaveBeenCalledWith('backend.error.server.resumeFetchError');
      }));
  });
  describe('changeResumeStatus', () => {
    it('should return 400 if required data is missing', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        req = { body: {} };
        yield (0, getResume_1.changeResumeStatus)(db, req, res);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(sendMock).toHaveBeenCalledWith('backend.error.validation.missingData');
      }));
    it('should return 404 if resume not found', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        req = {
          body: { resumeId: 1, userId: 2, stateId: 3, date: '2024-01-01' },
        };
        db.query.mockResolvedValue([[]]);
        yield (0, getResume_1.changeResumeStatus)(db, req, res);
        expect(statusMock).toHaveBeenCalledWith(404);
        expect(sendMock).toHaveBeenCalledWith('backend.error.notFound.applicationNotFound');
      }));
    it('should return 403 if userId does not match ref', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        req = {
          body: { resumeId: 1, userId: 999, stateId: 3, date: '2024-01-01' },
        };
        db.query.mockResolvedValue([[{ ref: 5, stateid: 1 }]]);
        yield (0, getResume_1.changeResumeStatus)(db, req, res);
        expect(statusMock).toHaveBeenCalledWith(403);
        expect(sendMock).toHaveBeenCalledWith('backend.error.auth.noPermission');
      }));
    it('should return 400 if stateId is already set', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        req = {
          body: { resumeId: 1, userId: 5, stateId: 3, date: '2024-01-01' },
        };
        db.query.mockResolvedValue([[{ ref: 5, stateid: 3 }]]);
        yield (0, getResume_1.changeResumeStatus)(db, req, res);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(sendMock).toHaveBeenCalledWith('backend.error.conflict.statusAlreadySet');
      }));
    it('should update status and insert history successfully', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        req = {
          body: { resumeId: 1, userId: 5, stateId: 4, date: '2024-01-01' },
        };
        db.query
          .mockResolvedValueOnce([[{ ref: 5, stateid: 1 }]]) // SELECT
          .mockResolvedValueOnce([]) // UPDATE
          .mockResolvedValueOnce([]); // INSERT
        yield (0, getResume_1.changeResumeStatus)(db, req, res);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(sendMock).toHaveBeenCalledWith('backend.success.status.changed');
      }));
    it('should return 500 on DB error', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        req = {
          body: { resumeId: 1, userId: 5, stateId: 4, date: '2024-01-01' },
        };
        db.query.mockRejectedValue(new Error('DB Error'));
        yield (0, getResume_1.changeResumeStatus)(db, req, res);
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(sendMock).toHaveBeenCalledWith('backend.error.server.internalServerError');
      }));
  });
});
