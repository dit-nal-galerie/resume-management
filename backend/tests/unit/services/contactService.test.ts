import { createOrUpdateContact, getContacts } from '../../../src/services/contactService'; // Pfad ggf. anpassen
import { Request, Response } from 'express';
import { Connection } from 'mysql2';

describe('contactService', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let db: Partial<Connection>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

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
    it('should return 400 if required fields are missing', async () => {
      req = { body: { name: 'Mustermann' } };
      await createOrUpdateContact(db as Connection, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'backend.error.validation.missingFields',
      });
    });

    it('should insert contact and return 201 on success', async () => {
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
      (db.query as jest.Mock).mockImplementation((_q, _v, cb) => cb(null));

      await createOrUpdateContact(db as Connection, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'backend.success.contact.added',
      });
    });

    it('should update contact and return 200 on success', async () => {
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
      (db.query as jest.Mock).mockImplementation((_q, _v, cb) => cb(null));

      await createOrUpdateContact(db as Connection, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'backend.success.contact.updated',
      });
    });

    it('should return 500 on DB error (insert)', async () => {
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
      (db.query as jest.Mock).mockImplementation((_q, _v, cb) => cb(new Error('Fehler')));
      await createOrUpdateContact(db as Connection, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'backend.error.server.serverError',
      });
    });
  });

  describe('getContacts', () => {
    it('should return 400 if ref or company is missing', () => {
      req = { query: {} };
      getContacts(db as Connection, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('backend.error.validation.missingRefOrCompany');
    });

    it('should return 500 on DB error', () => {
      req = { query: { ref: 'abc', company: '1' } };
      (db.query as jest.Mock).mockImplementation((_q, _v, cb) => cb(new Error('Fehler')));
      getContacts(db as Connection, req as Request, res as Response);
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

      (db.query as jest.Mock).mockImplementation((_q, _v, cb) => cb(null, mockResults));
      getContacts(db as Connection, req as Request, res as Response);
      expect(jsonMock).toHaveBeenCalledWith(mockResults);
    });
  });
});
