// eslint.config.mjs
import js from '@eslint/js';
import * as tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';

export default [
  // 0) Ignorierliste
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.vercel/**',
      '**/public/**',
      '**/*.min.js',
      'backend-php/**',
      'vendor/**',
    ],
  },

  // 1) Basis
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 2) Gemeinsame Regeln
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    plugins: {
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off', // wir nutzen unused-imports stattdessen
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react-hooks/rules-of-hooks': 'off', // wird nur im Frontend gebraucht
      'react-hooks/exhaustive-deps': 'off',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'padding-line-between-statements': [
        'error',
        // immer Leerzeile vor return
        { blankLine: 'always', prev: '*', next: 'return' },

        // immer Leerzeile nach imports
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' }, // zwischen Imports keine Leerzeile nötig

        // immer Leerzeile vor function-Definitionen
        { blankLine: 'always', prev: '*', next: 'function' },

        // immer Leerzeile nach variable-Block (let/const/var), außer wenn direkt noch eine Deklaration folgt
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
      ],
    },
  },

  // 3) Frontend
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
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // 4) Optional: D3 global erlauben
  {
    files: ['frontend/src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: { d3: 'readonly' },
    },
  },

  // 5) Backend
  {
    files: ['backend/**/*.{ts,js}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // 6) Tests – any ist erlaubt!
  {
    files: ['**/tests/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // 7) Config-Dateien (Node Globals)
  {
    files: [
      '**/tailwind.config.{js,cjs,mjs,ts}',
      '**/postcss.config.{js,cjs,mjs,ts}',
      '**/vite.config.{js,cjs,mjs,ts}',
      '**/*.config.{js,cjs,mjs,ts}',
    ],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
      },
    },
  },

  // 8) Prettier
  prettier,
];
