// eslint.config.mjs
import js from '@eslint/js';
import * as tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  // Globale Ignorierliste
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.vercel/**',
      '**/public/**',
    ],
  },

  // JS-Basisregeln
  js.configs.recommended,

  // TypeScript (empfohlen, *mit* Type-Checking über Project Service)
  // Falls dir das zu langsam ist oder du (noch) keine tsconfig hast,
  // tausche "recommendedTypeChecked" gegen "recommended".
  ...tseslint.configs.recommendedTypeChecked,

  // Gemeinsame Einstellungen/Regeln für beide Workspaces
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // Project Service erkennt automatisch tsconfig.* in Unterordnern
        projectService: true,
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
    },
    rules: {
      // React Hooks (wir nutzen nur das Plugin im Frontend-Override schärfer)
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',

      // Unused imports/vars
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Klassische ESLint-Kleinigkeiten
      'no-unused-vars': 'off', // wird von unused-imports übernommen
      'no-console': 'off',
    },
  },

  // Frontend-Override (Browser + TS/JSX)
  {
    files: ['frontend/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        JSX: 'readonly',
      },
    },
    rules: {
      // Hier Hooks aktivieren
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Backend-Override (Node)
  {
    files: ['backend/**/*.{ts,js}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
  },

  // Prettier am Ende, um Format-Konflikte zu neutralisieren
  prettier,
];
