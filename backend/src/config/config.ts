import fs from 'fs';
import path from 'path';

// Интерфейс для типизации конфигурации
interface Config {
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  [key: string]: string; // Дополнительные поля конфигурации, если они присутствуют
}

// Функция для загрузки конфигурации
function loadConfig(): Config {
  const env = process.env.NODE_ENV || 'dev'; // Если NODE_ENV не задан, использовать "dev"
  const configPath = path.join(__dirname, `../../${env}.json`);

  try {
    const configFile = fs.readFileSync(configPath, 'utf-8');
    const config: Config = JSON.parse(configFile);
    return config;
  } catch (error) {
    console.error(`Ошибка загрузки конфигурации для окружения "${env}":`, error);
    process.exit(1); // Завершение процесса при ошибке
  }
}

// Экспорт конфигурации
const config = loadConfig();
console.log('Конфигурация загружена:', config);

export default config;