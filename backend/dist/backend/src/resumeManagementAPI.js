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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const mysql2_1 = __importDefault(require('mysql2'));
const config_1 = __importDefault(require('./config/config'));
// Importiere die ausgelagerten Services
const userService_1 = require('./services/userService');
const contactService_1 = require('./services/contactService');
const resumeService_1 = require('./services/resumeService');
const companyService_1 = require('./services/companyService');
const historyService_1 = require('./services/historyService');
const saveResume_1 = require('./services/saveResume');
const passwordResetService_1 = require('./services/passwordResetService');
const promise_1 = __importDefault(require('mysql2/promise')); // Hauptsächlich diesen verwenden
const getResume_1 = require('./services/getResume');
class ResumeManagementAPI {
  constructor() {
    this.db = mysql2_1.default.createConnection({
      host: config_1.default.DB_HOST,
      user: config_1.default.DB_USER,
      password: config_1.default.DB_PASSWORD,
      database: config_1.default.DB_NAME,
    });
    this.dbPool = promise_1.default.createPool({
      host: config_1.default.DB_HOST,
      user: config_1.default.DB_USER,
      password: config_1.default.DB_PASSWORD,
      database: config_1.default.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  createOrUpdateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      yield (0, userService_1.createOrUpdateUser)(this.db, req, res);
    });
  }
  login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      yield (0, userService_1.login)(this.db, req, res);
    });
  }
  createOrUpdateContact(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      yield (0, contactService_1.createOrUpdateContact)(this.db, req, res);
    });
  }
  updateOrCreateResume(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      yield (0, saveResume_1.updateOrCreateResume)(this.dbPool, req, res);
    });
  }
  getResumeById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      yield (0, getResume_1.getResumeById)(this.dbPool, req, res);
    });
  }
  getResumesWithUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      yield (0, resumeService_1.getResumesWithUsers)(this.db, req, res);
    });
  }
  addCompany(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      (0, companyService_1.addCompany)(this.db, req, res);
    });
  }
  getCompanies(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      (0, companyService_1.getCompanies)(this.db, req, res);
    });
  }
  addHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      (0, historyService_1.addHistory)(this.db, req, res);
    });
  }
  getHistoryByResumeId(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      (0, historyService_1.getHistoryByResumeId)(this.db, req, res);
    });
  }
  getStates(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      (0, resumeService_1.getStates)(this.db, req, res);
    });
  }
  getAnrede(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      (0, userService_1.getAnrede)(this.db, req, res);
    });
  }
  getContacts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      (0, contactService_1.getContacts)(this.db, req, res);
    });
  }
  changeResumeStatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      yield (0, getResume_1.changeResumeStatus)(this.dbPool, req, res);
    });
  }
  changeAccessData(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      yield (0, userService_1.changeAccessData)(this.dbPool, req, res);
    });
  }
  // Новые методы для восстановления пароля
  requestPasswordReset(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      yield (0, passwordResetService_1.requestPasswordReset)(this.dbPool, req, res);
    });
  }
  checkPasswordResetToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      yield (0, passwordResetService_1.checkPasswordResetToken)(this.dbPool, req, res);
    });
  }
  resetPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
      yield (0, passwordResetService_1.resetPassword)(this.dbPool, req, res);
    });
  }
}
exports.default = ResumeManagementAPI;
