---
name: Deploy
description: Deploy-Pipeline des Projekts resume-management - GitHub CI/PR, Render-Blueprint (Backend, backend-php), Vercel (Frontend), Aiven (MySQL). Verwenden fuer Deploys, Releases, Infra-Aenderungen und Checks der Demo/Prod-Umgebung.
---

# Deploy-Pipeline (resume-management)

## Ueberblick

| Komponente | Dienst | Quelle |
|---|---|---|
| Backend (Demo) | Render free, Docker, Service `resume-backend-php-demo` | `render.yaml`, Branch `main` |
| Frontend | Vercel (native Git-Integration) | Root Directory `frontend`, Branch `main` |
| Datenbank (Demo) | externes MySQL (Aiven free), DB `bewerbungs_demo` | Schema: `db/schema.sql` |
| CI | GitHub Actions `.github/workflows/test.yml` | PHP Integration Tests auf push/PR |
| Prod | `api.itprofi-4u.de` laeuft separat - NICHT anfassen | spaeter anbinden |

## Regeln (hart)

1. **Secrets nie in git.** `config/production.json`, `.env`, DB-/Mail-Credentials, `JWT_SECRET` gehoeren nur in Dashboards/`.gitignore`. In `render.yaml` stehen sie ausschliesslich als `sync: false`.
2. **Prod-Kette nicht aendern** (`api.itprofi-4u.de`, bestehende prod-Workflows), ohne explizite Freigabe.
3. **Vor jedem Merge:** CI `PHP Integration Tests` muss auf dem Head-Commit gruen sein.
4. **Nach jedem Merge:** CI auf `main` beobachten, bis sie gruen ist.
5. `backend/` (Express) ist nur nicht Teil des Deploys - Code nicht loeschen.

## Schritt-fuer-Schritt

### 1. Stand pruefen
- `git status`, `git fetch origin --prune`
- CI: `gh run list --branch <branch> --limit 5` oder Actions-API
- PR: `gh pr view <nr>` - `mergeable`, Checks

### 2. Merge nach main
- Nur mit gruenem CI: `gh pr merge <nr> --squash` (oder --merge, je nach Vereinbarung)
- Direkte Commits auf `main` vermeiden - alles ueber PR

### 3. Render (Backend-Demo)
- Blueprint liest `render.yaml` aus `main` (`rootDir: backend-php`, `dockerfilePath: ./Dockerfile`, `healthCheckPath: /health`)
- Env-Vars mit `sync: false` live im Dashboard nachtragen:
  `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`,
  `CORS_ORIGINS`, `RESET_PASSWORD_URL`, `EMAIL_FROM`, `EMAIL_HOST`, `EMAIL_PORT`,
  `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_SECURE`
- Wichtig: Env-Variablen haben in `ConfigLoader` Vorrang vor `config/*.json`
- Free-Plan: nach ~15 Min Inaktivitaet Schlaf, Cold Start ~1 Min
- Pruefung: `GET /health` -> `{"status":"ok"}`, `GET /db-check` -> `success:true`

### 4. Vercel (Frontend)
- Projekt-Import aus GitHub, **Root Directory: `frontend`**, Build `npm run build`
- Env: `VITE_API_TYPE=php`, `VITE_API_URL_PHP=<Render-URL>`
- Nach Erhalt des Domains (`<projekt>.vercel.app`): Domain in `CORS_ORIGINS` auf Render
  ergaenzen und Service neu deployen, sonst CORS-Fehler im Browser

### 5. Aiven (MySQL)
- Free MySQL, Region Frankfurt, DB `bewerbungs_demo`
- Schema einspielen: `mysql -h <host> -P <port> -u <user> -p --ssl-mode=REQUIRED bewerbungs_demo < db/schema.sql`

### 6. Release-Verwaltung
- Release-Branches: `release/*` (z. B. `release/version_2`); CI loest auf `release/**` aus
- Tags: annotated (`git tag -a <name> -m ...`), danach `git push origin <name>`
- Nach dem Loeschen einer Branch: `git push origin --delete <branch>`

## Fehlerbilder

| Symptom | Ursache |
|---|---|
| `Config file not found` auf Render | Env-Vars fehlen (ConfigLoader ist env-first) |
| 404 auf allen Routen | Front Controller fehlt in `public/` (docroot) |
| CORS-Fehler | Domain fehlt in `CORS_ORIGINS` |
| `db-check` -> `DB connection failed` | DB_Env falsch oder Aiven-Sleep/whitelist |
| PHPUnit exit code 2 in CI | bootstrap referenziert nicht eingecheckte Dateien |
| Vercel-Build `npm ci`-Fehler | kein Lockfile im Repo - `npm run build` nutzen |
