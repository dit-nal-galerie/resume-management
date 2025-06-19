import { Request, Response } from 'express';
import { Pool, PoolConnection } from 'mysql2/promise';
import { changeResumeStatus, getResumeById } from '../../../src/services/getResume';

describe('resumeManagementAPI', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let db: Partial<Pool>;
  let connection: Partial<PoolConnection>;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;
  let jsonMock: jest.Mock;

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
    it('should return 400 for invalid resumeId', async () => {
      req = { params: { resumeId: 'abc' } };
      await getResumeById(db as Pool, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('backend.error.validation.invalidResumeId');
    });

    it('should return 404 if resume not found', async () => {
      req = { params: { resumeId: '1' } };
      (db as Pool).getConnection = jest.fn().mockResolvedValue(connection);
      (connection.query as jest.Mock).mockResolvedValue([[]]);

      await getResumeById(db as Pool, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('backend.error.notFound.resumeNotFound');
      expect(connection.release).toHaveBeenCalled();
    });

    it('should return 200 and resume data if found', async () => {
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
      (db as Pool).getConnection = jest.fn().mockResolvedValue(connection);
      (connection.query as jest.Mock).mockResolvedValue([mockResult]);

      await getResumeById(db as Pool, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          resumeId: 1,
          position: 'Entwickler',
          company: expect.objectContaining({ name: 'Firma A' }),
        })
      );
      expect(connection.release).toHaveBeenCalled();
    });

    it('should return 500 on unexpected error', async () => {
      req = { params: { resumeId: '1' } };
      (db as Pool).getConnection = jest.fn().mockRejectedValue(new Error('DB Error'));

      await getResumeById(db as Pool, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('backend.error.server.resumeFetchError');
    });
  });

  describe('changeResumeStatus', () => {
    it('should return 400 if required data is missing', async () => {
      req = { body: {} };
      await changeResumeStatus(db as Pool, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('backend.error.validation.missingData');
    });

    it('should return 404 if resume not found', async () => {
      req = {
        body: { resumeId: 1, userId: 2, stateId: 3, date: '2024-01-01' },
      };
      (db.query as jest.Mock).mockResolvedValue([[]]);

      await changeResumeStatus(db as Pool, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('backend.error.notFound.applicationNotFound');
    });

    it('should return 403 if userId does not match ref', async () => {
      req = {
        body: { resumeId: 1, userId: 999, stateId: 3, date: '2024-01-01' },
      };
      (db.query as jest.Mock).mockResolvedValue([[{ ref: 5, stateid: 1 }]]);

      await changeResumeStatus(db as Pool, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(sendMock).toHaveBeenCalledWith('backend.error.auth.noPermission');
    });

    it('should return 400 if stateId is already set', async () => {
      req = {
        body: { resumeId: 1, userId: 5, stateId: 3, date: '2024-01-01' },
      };
      (db.query as jest.Mock).mockResolvedValue([[{ ref: 5, stateid: 3 }]]);

      await changeResumeStatus(db as Pool, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('backend.error.conflict.statusAlreadySet');
    });

    it('should update status and insert history successfully', async () => {
      req = {
        body: { resumeId: 1, userId: 5, stateId: 4, date: '2024-01-01' },
      };
      (db.query as jest.Mock)
        .mockResolvedValueOnce([[{ ref: 5, stateid: 1 }]]) // SELECT
        .mockResolvedValueOnce([]) // UPDATE
        .mockResolvedValueOnce([]); // INSERT

      await changeResumeStatus(db as Pool, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith('backend.success.status.changed');
    });

    it('should return 500 on DB error', async () => {
      req = {
        body: { resumeId: 1, userId: 5, stateId: 4, date: '2024-01-01' },
      };
      (db.query as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await changeResumeStatus(db as Pool, req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('backend.error.server.internalServerError');
    });
  });
});
