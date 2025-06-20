'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
// Функция для загрузки конфигурации
function loadConfig() {
  const env = process.env.NODE_ENV || 'dev'; // Если NODE_ENV не задан, использовать "dev"
  const configPath = path.join(__dirname, `../../${env}.json`);
  try {
    const configFile = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configFile);
    return config;
  } catch (error) {
    console.error(`Ошибка загрузки конфигурации для окружения "${env}":`, error);
    process.exit(1); // Завершение процесса при ошибке
  }
}
// Экспорт конфигурации
const config = loadConfig();
console.log('Конфигурация загружена:', config);
exports.default = config;
