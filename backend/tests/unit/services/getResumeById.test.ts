import { Request, Response } from 'express';
import { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { getResumeById } from '../../../src/services/getResume';

// Mock the console.log and console.error to prevent clutter during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('getResumeById', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockPool: Pool;
  let mockConnection: PoolConnection;

  beforeEach(() => {
    // Reset mocks before each test
    mockConnection = {
      query: jest.fn(),
      release: jest.fn(),
    } as unknown as PoolConnection; // Cast to PoolConnection

    mockPool = {
      getConnection: jest.fn(() => Promise.resolve(mockConnection)),
    } as unknown as Pool; // Cast to Pool

    mockRequest = {
      params: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  // Test case 1: Invalid resumeId (not a number)
  test('should return 400 if resumeId is not a number', async () => {
    mockRequest.params = { resumeId: 'abc' };

    await getResumeById(mockPool, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.validation.invalidResumeId');
    expect(mockPool.getConnection).not.toHaveBeenCalled(); // No connection should be attempted
  });

  // Test case 2: Invalid resumeId (zero or negative)
  test('should return 400 if resumeId is zero or negative', async () => {
    mockRequest.params = { resumeId: '0' };
    await getResumeById(mockPool, mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.validation.invalidResumeId');
    expect(mockPool.getConnection).not.toHaveBeenCalled();

    mockRequest.params = { resumeId: '-5' };
    await getResumeById(mockPool, mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.validation.invalidResumeId');
    expect(mockPool.getConnection).not.toHaveBeenCalled();
  });

  // Test case 3: Resume not found
  test('should return 404 if no resume is found', async () => {
    mockRequest.params = { resumeId: '999' };
    (mockConnection.query as jest.Mock).mockResolvedValueOnce([[]]); // Simulate no results

    await getResumeById(mockPool, mockRequest as Request, mockResponse as Response);

    expect(mockPool.getConnection).toHaveBeenCalledTimes(1);
    expect(mockConnection.query).toHaveBeenCalledTimes(1);
    expect(mockConnection.release).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.notFound.resumeNotFound');
  });

  // Test case 4: Successful retrieval of a resume with all associated data
  test('should return 200 with resume data on success', async () => {
    const mockResumeData = {
      resumeId: 1,
      ref: 'REF001',
      position: 'Software Developer',
      stateId: 10,
      stateText: 'Active',
      link: 'http://example.com/resume1',
      comment: 'Great candidate',
      created: new Date().toISOString(), // Use ISO string for created date

      company_Id: 101,
      company_Name: 'Tech Solutions Inc.',
      company_City: 'New York',
      company_Street: 'Main St',
      company_HouseNumber: '10',
      company_PostalCode: '10001',
      company_IsRecruter: 0, // 0 for false
      company_Ref: 'COMPREF001',

      parentCompany_Id: 102,
      parentCompany_Name: 'Global Recruiters',
      parentCompany_City: 'London',
      parentCompany_Street: 'Recruiters Ave',
      parentCompany_HouseNumber: '5',
      parentCompany_PostalCode: 'SW1A 0AA',
      parentCompany_IsRecruter: 1, // 1 for true
      parentCompany_Ref: 'PARENTREF001',

      contactCompany_Id: 201,
      contactCompany_Vorname: 'John',
      contactCompany_Name: 'Doe',
      contactCompany_Email: 'john.doe@techsolutions.com',
      contactCompany_Anrede: 'Mr.',
      contactCompany_Title: 'Manager',
      contactCompany_Zusatzname: null,
      contactCompany_Phone: '111-222-3333',
      contactCompany_Mobile: '444-555-6666',
      contactCompany_CompanyId: 101,
      contactCompany_Ref: 'CONTACTREF001',

      contactParentCompany_Id: 202,
      contactParentCompany_Vorname: 'Jane',
      contactParentCompany_Name: 'Smith',
      contactParentCompany_Email: 'jane.smith@globalrecruiters.com',
      contactParentCompany_Anrede: 'Ms.',
      contactParentCompany_Title: 'HR Specialist',
      contactParentCompany_Zusatzname: null,
      contactParentCompany_Phone: '777-888-9999',
      contactParentCompany_Mobile: '000-111-2222',
      contactParentCompany_CompanyId: 102,
      contactParentCompany_Ref: 'CONTACTREF002',
    };

    mockRequest.params = { resumeId: '1' };
    (mockConnection.query as jest.Mock).mockResolvedValueOnce([[mockResumeData]]);

    await getResumeById(mockPool, mockRequest as Request, mockResponse as Response);

    expect(mockPool.getConnection).toHaveBeenCalledTimes(1);
    expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String), [1]);
    expect(mockConnection.release).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      resumeId: 1,
      ref: 'REF001',
      position: 'Software Developer',
      stateId: 10,
      stateText: 'Active',
      link: 'http://example.com/resume1',
      comment: 'Great candidate',
      created: expect.any(String), // We check for any string, as the actual date might vary slightly based on mock creation
      company: {
        companyId: 101,
        name: 'Tech Solutions Inc.',
        city: 'New York',
        street: 'Main St',
        houseNumber: '10',
        postalCode: '10001',
        isRecruter: false, // Mapped from 0
        ref: 'COMPREF001',
      },
      recrutingCompany: {
        companyId: 102,
        name: 'Global Recruiters',
        city: 'London',
        street: 'Recruiters Ave',
        houseNumber: '5',
        postalCode: 'SW1A 0AA',
        isRecruter: true, // Mapped from 1
        ref: 'PARENTREF001',
      },
      contactCompany: {
        contactid: 201,
        vorname: 'John',
        name: 'Doe',
        email: 'john.doe@techsolutions.com',
        anrede: 'Mr.',
        title: 'Manager',
        zusatzname: null,
        phone: '111-222-3333',
        mobile: '444-555-6666',
        company: 101,
        ref: 'CONTACTREF001',
      },
      contactRecrutingCompany: {
        contactid: 202,
        vorname: 'Jane',
        name: 'Smith',
        email: 'jane.smith@globalrecruiters.com',
        anrede: 'Ms.',
        title: 'HR Specialist',
        zusatzname: null,
        phone: '777-888-9999',
        mobile: '000-111-2222',
        company: 102,
        ref: 'CONTACTREF002',
      },
    });
  });

  // Test case 5: Database error
  test('should return 500 on database error', async () => {
    mockRequest.params = { resumeId: '1' };
    const errorMessage = 'Database connection failed';
    (mockConnection.query as jest.Mock).mockRejectedValueOnce(new Error(errorMessage)); // Simulate a DB error

    await getResumeById(mockPool, mockRequest as Request, mockResponse as Response);

    expect(mockPool.getConnection).toHaveBeenCalledTimes(1);
    expect(mockConnection.query).toHaveBeenCalledTimes(1);
    expect(mockConnection.release).toHaveBeenCalledTimes(1); // Connection should still be released
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.resumeFetchError');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[getResumeById] Fehler beim Abrufen von Resume ID 1:'),
      expect.any(Error)
    );
  });

  // Test case 6: Resume with no company/contact data
  test('should return 200 with null for optional fields if not present', async () => {
    const mockResumeMinimalData = {
      resumeId: 2,
      ref: 'REF002',
      position: 'Junior Developer',
      stateId: 20,
      stateText: 'Pending',
      link: null,
      comment: null,
      created: new Date().toISOString(),
      // No company, parent company, or contact data
      company_Id: null,
      parentCompany_Id: null,
      contactCompany_Id: null,
      contactParentCompany_Id: null,
    };

    mockRequest.params = { resumeId: '2' };
    (mockConnection.query as jest.Mock).mockResolvedValueOnce([[mockResumeMinimalData]]);

    await getResumeById(mockPool, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        resumeId: 2,
        company: null,
        recrutingCompany: null,
        contactCompany: null,
        contactRecrutingCompany: null,
      })
    );
  });
});
