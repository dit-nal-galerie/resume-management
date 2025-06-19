'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const resumeService_1 = require('../../../src/services/resumeService'); // Pfad anpassen
describe('resumeService', () => {
  let req;
  let res;
  let db;
  let statusMock;
  let sendMock;
  let jsonMock;
  beforeEach(() => {
    sendMock = jest.fn();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ send: sendMock });
    res = {
      status: statusMock,
      send: sendMock,
      json: jsonMock,
    };
    db = {
      query: jest.fn(),
    };
  });
  describe('getResumesWithUsers', () => {
    it('should return 400 if userid is missing', () => {
      req = { query: {} };
      (0, resumeService_1.getResumesWithUsers)(db, req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('backend.error.validation.missingUserId');
    });
    it('should return 500 on DB error', () => {
      req = { query: { userid: 'testUser' } };
      db.query.mockImplementation((_q, _v, cb) => cb(new Error('DB-Fehler')));
      (0, resumeService_1.getResumesWithUsers)(db, req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('backend.error.server.serverError');
    });
    it('should return resumes correctly mapped', () => {
      req = { query: { userid: '123' } };
      const mockResults = [
        {
          resumeId: 1,
          ref: '123',
          position: 'Dev',
          stateId: 1,
          stateText: 'Bewerbung',
          link: 'https://...',
          comment: 'Notiz',
          created: '2024-01-01',
          companyId: 1,
          companyName: 'Firma',
          companyCity: 'Berlin',
          companyStreet: 'Straße',
          companyHouseNumber: '12A',
          companyPostalCode: '10115',
          companyIsRecruter: false,
          companyRef: 'C-1',
          parentCompanyId: null,
          parentCompanyName: null,
          contactCompanyId: 2,
          contactCompanyName: 'Herr Mustermann',
          contactParentCompanyId: null,
          contactParentCompanyName: null,
        },
      ];
      db.query.mockImplementation((_q, _v, cb) => cb(null, mockResults));
      (0, resumeService_1.getResumesWithUsers)(db, req, res);
      expect(jsonMock).toHaveBeenCalledWith([
        {
          resumeId: 1,
          ref: '123',
          position: 'Dev',
          stateId: 1,
          stateText: 'Bewerbung',
          link: 'https://...',
          comment: 'Notiz',
          created: '2024-01-01',
          company: {
            companyId: 1,
            name: 'Firma',
            city: 'Berlin',
            street: 'Straße',
            houseNumber: '12A',
            postalCode: '10115',
            isRecruter: false,
            ref: 'C-1',
          },
          recrutingCompany: null,
          contactCompany: {
            contactId: 2,
            name: 'Herr Mustermann',
          },
          contactParentCompany: null,
        },
      ]);
    });
  });
  describe('getStates', () => {
    it('should return 500 on DB error', () => {
      db.query.mockImplementation((_q, cb) => cb(new Error('Fehler')));
      (0, resumeService_1.getStates)(db, {}, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('backend.error.server.serverError');
    });
    it('should return states successfully', () => {
      const mockStates = [
        { stateid: 1, text: 'Offen' },
        { stateid: 2, text: 'Abgelehnt' },
      ];
      db.query.mockImplementation((_q, cb) => cb(null, mockStates));
      (0, resumeService_1.getStates)(db, {}, res);
      expect(jsonMock).toHaveBeenCalledWith(mockStates);
    });
  });
});
