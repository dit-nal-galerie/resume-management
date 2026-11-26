# Copilot Instructions

- This is a monorepo with three main app areas:
  - `frontend/`: React + TypeScript + Vite + Tailwind UI.
  - `backend/`: Node.js + Express + TypeScript API server.
  - `backend-php/`: legacy Slim PHP backend with PHPUnit tests.

- Use the root `package.json` scripts for development and cross-package workflows:
  - `npm install` / `npm run install:all`
  - `npm run start:frontend`
  - `npm run start:backend`
  - `npm run start:all`
  - `npm run build:all`
  - `npm run test:all`

- The frontend API layer is centralized in `frontend/src/shared/api/queries.ts`.
  - It chooses backend target via `VITE_API_TYPE` (`php` | `node`).
  - Default base URL is `VITE_API_URL_PHP` or `VITE_API_URL_NODE`.
  - Keep route names aligned with `backend/src/server.ts` and `backend/src/resumeManagementAPI.ts`.

- The active Node backend is configured in `backend/src/server.ts`.
  - Routes like `/login`, `/me`, `/getResumesWithUsers`, `/changeAccessData`, `/request-password-reset` are defined there.
  - Backend CORS config is driven by `backend/dev.json` and `config.FRONTEND_URL`.

- The legacy PHP backend is a separate application in `backend-php/`.
  - It has its own `composer.json` and `tests/` folder.
  - CI runs PHPUnit via `.github/workflows/test.yml` (MySQL service + `db/schema.sql`).
  - Deploys: Render (blueprint `render.yaml`, branch `main`, auto-deploy on push)
    for the demo backend; frontend deploys via Vercel's native Git integration.

- Shared domain types live at the repo root in `interfaces/`.
  - Frontend imports these shared interfaces directly (for example `Resume`, `Contact`, `Company`).

- Frontend conventions:
  - Prefer `useTranslation()` from `react-i18next` for all UI text.
  - Use `react-hook-form` + `yup` for form validation patterns.
  - Reuse UI wrappers such as `FormField`, `CompanySection`, `ContactSection`, and `PageHeader`.

- Tests and debugging:
  - Frontend unit tests: `npm test` in `frontend/`.
  - Backend Node tests: `npm test` in `backend/`.
  - PHP tests: `composer test` in `backend-php/`.
  - End-to-end tests live under `frontend/tests/e2e/` and use Playwright.

- When updating UI or API features:
  - Keep frontend fetch clients and backend route names consistent.
  - Update i18n keys in `frontend/src/utils/i18n/locales/{de,en}/translation.json`.
  - Avoid introducing duplicate route variants if the same endpoint already exists in `backend/src/server.ts`.

- Do not assume the PHP backend and Node backend are interchangeable unless the task explicitly targets the `backend-php/` service.
  - If you change API shapes in `frontend/src/shared/api/queries.ts`, verify the corresponding backend implementation in `backend/src/`.

- Recommended files to inspect for context before editing:
  - `frontend/src/App.tsx`
  - `frontend/src/shared/api/queries.ts`
  - `backend/src/server.ts`
  - `backend/src/resumeManagementAPI.ts`
  - `frontend/vite-env.d.ts`
  - `backend/dev.json`
  - `.github/workflows/test.yml`
