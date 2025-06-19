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
const contactService_1 = require('../../../src/services/contactService'); // Pfad ggf. anpassen
describe('contactService', () => {
  let req;
  let res;
  let db;
  let statusMock;
  let jsonMock;
  let sendMock;
  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    sendMock = jest.fn();
    res = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    };
    db = {
      query: jest.fn(),
    };
  });
  describe('createOrUpdateContact', () => {
    it('should return 400 if required fields are missing', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        req = { body: { name: 'Mustermann' } };
        yield (0, contactService_1.createOrUpdateContact)(db, req, res);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          message: 'backend.error.validation.missingFields',
        });
      }));
    it('should insert contact and return 201 on success', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        req = {
          body: {
            contactid: 0,
            vorname: 'Max',
            name: 'Mustermann',
            email: 'max@example.com',
            anrede: 'Herr',
            title: '',
            zusatzname: '',
            phone: '',
            mobile: '',
            company: 1,
            ref: 'abc',
          },
        };
        db.query.mockImplementation((_q, _v, cb) => cb(null));
        yield (0, contactService_1.createOrUpdateContact)(db, req, res);
        expect(statusMock).toHaveBeenCalledWith(201);
        expect(jsonMock).toHaveBeenCalledWith({
          message: 'backend.success.contact.added',
        });
      }));
    it('should update contact and return 200 on success', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        req = {
          body: {
            contactid: 5,
            vorname: 'Max',
            name: 'Mustermann',
            email: 'max@example.com',
            anrede: 'Herr',
            title: '',
            zusatzname: '',
            phone: '',
            mobile: '',
            company: 1,
            ref: 'abc',
          },
        };
        db.query.mockImplementation((_q, _v, cb) => cb(null));
        yield (0, contactService_1.createOrUpdateContact)(db, req, res);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
          message: 'backend.success.contact.updated',
        });
      }));
    it('should return 500 on DB error (insert)', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        req = {
          body: {
            contactid: 0,
            vorname: 'Max',
            name: 'Mustermann',
            email: 'max@example.com',
            anrede: 'Herr',
            title: '',
            zusatzname: '',
            phone: '',
            mobile: '',
            company: 1,
            ref: 'abc',
          },
        };
        db.query.mockImplementation((_q, _v, cb) => cb(new Error('Fehler')));
        yield (0, contactService_1.createOrUpdateContact)(db, req, res);
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          message: 'backend.error.server.serverError',
        });
      }));
  });
  describe('getContacts', () => {
    it('should return 400 if ref or company is missing', () => {
      req = { query: {} };
      (0, contactService_1.getContacts)(db, req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('backend.error.validation.missingRefOrCompany');
    });
    it('should return 500 on DB error', () => {
      req = { query: { ref: 'abc', company: '1' } };
      db.query.mockImplementation((_q, _v, cb) => cb(new Error('Fehler')));
      (0, contactService_1.getContacts)(db, req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('backend.error.server.fetchContactsError');
    });
    it('should return contacts on success', () => {
      req = { query: { ref: 'abc', company: '1' } };
      const mockResults = [
        {
          contactid: 1,
          vorname: 'Max',
          name: 'Mustermann',
          email: 'max@example.com',
          anrede: 'Herr',
          title: '',
          zusatzname: '',
          phone: '',
          mobile: '',
          company: 1,
          ref: 'abc',
        },
      ];
      db.query.mockImplementation((_q, _v, cb) => cb(null, mockResults));
      (0, contactService_1.getContacts)(db, req, res);
      expect(jsonMock).toHaveBeenCalledWith(mockResults);
    });
  });
});
