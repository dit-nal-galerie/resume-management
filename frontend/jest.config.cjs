// jest.config.cjs (CommonJS, damit kein ts-node für die Konfiguration nötig ist)
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)'],
  moduleNameMapper: {
    // tsconfig baseUrl "src" + paths "@/*" (Vite-Resolution für Jest nachbilden)
    '^@/(.*)$': '<rootDir>/src/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    // CSS-Import als leere Mock-Module (z. B. react-datepicker)
    '\\.css$': '<rootDir>/jest.styleMock.cjs',
  },
};
