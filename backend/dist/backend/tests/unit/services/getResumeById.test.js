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
  let mockRequest;
  let mockResponse;
  let mockPool;
  let mockConnection;
  beforeEach(() => {
    // Reset mocks before each test
    mockConnection = {
      query: jest.fn(),
      release: jest.fn(),
    }; // Cast to PoolConnection
    mockPool = {
      getConnection: jest.fn(() => Promise.resolve(mockConnection)),
    }; // Cast to Pool
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
  test('should return 400 if resumeId is not a number', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.params = { resumeId: 'abc' };
      yield (0, getResume_1.getResumeById)(mockPool, mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.validation.invalidResumeId');
      expect(mockPool.getConnection).not.toHaveBeenCalled(); // No connection should be attempted
    }));
  // Test case 2: Invalid resumeId (zero or negative)
  test('should return 400 if resumeId is zero or negative', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.params = { resumeId: '0' };
      yield (0, getResume_1.getResumeById)(mockPool, mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.validation.invalidResumeId');
      expect(mockPool.getConnection).not.toHaveBeenCalled();
      mockRequest.params = { resumeId: '-5' };
      yield (0, getResume_1.getResumeById)(mockPool, mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.validation.invalidResumeId');
      expect(mockPool.getConnection).not.toHaveBeenCalled();
    }));
  // Test case 3: Resume not found
  test('should return 404 if no resume is found', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.params = { resumeId: '999' };
      mockConnection.query.mockResolvedValueOnce([[]]); // Simulate no results
      yield (0, getResume_1.getResumeById)(mockPool, mockRequest, mockResponse);
      expect(mockPool.getConnection).toHaveBeenCalledTimes(1);
      expect(mockConnection.query).toHaveBeenCalledTimes(1);
      expect(mockConnection.release).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.notFound.resumeNotFound');
    }));
  // Test case 4: Successful retrieval of a resume with all associated data
  test('should return 200 with resume data on success', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const mockResumeData = {
        resumeId: 1,
        ref: 'REF001',
        position: 'Software Developer',
        stateId: 10,
        stateText: 'Active',
        link: 'http://example.com/resume1',
        comment: 'Great candidate',
        created: new Date().toISOString(),
        company_Id: 101,
        company_Name: 'Tech Solutions Inc.',
        company_City: 'New York',
        company_Street: 'Main St',
        company_HouseNumber: '10',
        company_PostalCode: '10001',
        company_IsRecruter: 0,
        company_Ref: 'COMPREF001',
        parentCompany_Id: 102,
        parentCompany_Name: 'Global Recruiters',
        parentCompany_City: 'London',
        parentCompany_Street: 'Recruiters Ave',
        parentCompany_HouseNumber: '5',
        parentCompany_PostalCode: 'SW1A 0AA',
        parentCompany_IsRecruter: 1,
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
      mockConnection.query.mockResolvedValueOnce([[mockResumeData]]);
      yield (0, getResume_1.getResumeById)(mockPool, mockRequest, mockResponse);
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
        created: expect.any(String),
        company: {
          companyId: 101,
          name: 'Tech Solutions Inc.',
          city: 'New York',
          street: 'Main St',
          houseNumber: '10',
          postalCode: '10001',
          isRecruter: false,
          ref: 'COMPREF001',
        },
        recrutingCompany: {
          companyId: 102,
          name: 'Global Recruiters',
          city: 'London',
          street: 'Recruiters Ave',
          houseNumber: '5',
          postalCode: 'SW1A 0AA',
          isRecruter: true,
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
    }));
  // Test case 5: Database error
  test('should return 500 on database error', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      mockRequest.params = { resumeId: '1' };
      const errorMessage = 'Database connection failed';
      mockConnection.query.mockRejectedValueOnce(new Error(errorMessage)); // Simulate a DB error
      yield (0, getResume_1.getResumeById)(mockPool, mockRequest, mockResponse);
      expect(mockPool.getConnection).toHaveBeenCalledTimes(1);
      expect(mockConnection.query).toHaveBeenCalledTimes(1);
      expect(mockConnection.release).toHaveBeenCalledTimes(1); // Connection should still be released
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('backend.error.server.resumeFetchError');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[getResumeById] Fehler beim Abrufen von Resume ID 1:'),
        expect.any(Error)
      );
    }));
  // Test case 6: Resume with no company/contact data
  test('should return 200 with null for optional fields if not present', () =>
    __awaiter(void 0, void 0, void 0, function* () {
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
      mockConnection.query.mockResolvedValueOnce([[mockResumeMinimalData]]);
      yield (0, getResume_1.getResumeById)(mockPool, mockRequest, mockResponse);
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
    }));
});
