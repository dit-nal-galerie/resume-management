# resume-management
# 📄 Projekt: Bewerbungs-/Resümee-Verwaltungssystem

## 🌟 Ziel

Ein webbasiertes System, das Benutzern hilft, den Überblick über ihre Bewerbungen zu behalten. Jeder Benutzer kann Bewerbungen (Resümees) erstellen, verwalten und den Status bis zur finalen Rückmeldung (z. B. angenommen oder abgelehnt) verfolgen.

## 🚀 Tech-Stack

* **Frontend:** React (mit TypeScript)
* **Backend:** Node.js + Express
* **Datenbank:** MySQL
* **Auth & Sicherheit:** bcrypt + LocalStorage
* **Internationalisierung:** `react-i18next` (Deutsch & Englisch)

## ✨ Features

### 🔑 Benutzer & Authentifizierung

* Registrierung & Login (Loginname + Passwort)
* Passwortänderung mit alter Passwortprüfung
* E-Mail muss eindeutig sein
* Daten werden sicher gespeichert (Passwort gehasht)

### 👤 Benutzerprofil

* Anzeigen & Bearbeiten von Benutzerdaten (Name, Adresse, Kontakt)
* Zugangsdaten (Loginname, Passwort, E-Mail) separat änderbar
* Bei Passwortänderung: altes Passwort erforderlich

### 📄 Resümees

* Erstellung neuer Lebensläufe
* Status-Tracking jeder Bewerbung (z. B. "erstellt", "gesendet", "gelesen", "abgelehnt")
* Historie sichtbar je Bewerbung

### 🌐 Internationalisierung

* Mehrsprachigkeit vorbereitet (Deutsch/Englisch)
* Verwendung von `t('key')` für alle Texte
* Sprachauswahl via Dropdown geplant

## 📂 Projektstruktur (Auszug)

```
project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── i18n/           # Lokalisierung mit react-i18next
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── db/
```

## 🌐 Internationalisierung (i18n)

Verwendung von `react-i18next`. Beispiel:

```tsx
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();

  return <h1>{t('welcome_message')}</h1>;
};
```

### Beispiel: `de.json`

```json
{
  "welcome_message": "Willkommen",
  "login": "Anmelden",
  "logout": "Abmelden",
  "email": "E-Mail",
  "password": "Passwort",
  "profile": "Profil",
  "resume_list": "Meine Bewerbungen"
}
```

### Beispiel: `en.json`

```json
{
  "welcome_message": "Welcome",
  "login": "Login",
  "logout": "Logout",
  "email": "Email",
  "password": "Password",
  "profile": "Profile",
  "resume_list": "My Applications"
}
```

## 🛎️ Deployment

**Aktueller Stand (Demo-Pipeline):**

* **Frontend:** Vercel — native Git-Integration (Root Directory `frontend`, Build `npm run build`)
* **Backend (Demo):** Render free, Blueprint `render.yaml`, Branch `main`
  (Docker, `backend-php/Dockerfile`, Health-Check `/health`)
* **Datenbank (Demo):** externes MySQL (z. B. Aiven free), Schema aus `db/schema.sql`
* **Produktion:** `api.itprofi-4u.de` läuft separat und wird später angebunden

**Lokale Entwicklung:**

* Backend: Docroot `backend-php/` (Root-`index.php` leitet auf `public/index.php` weiter),
  DB-Konfig aus `config/dev.json`, Env-Variablen haben Vorrang
* Frontend: `npm run dev` (siehe `frontend/.env.development`)

## ⚠️ Hinweise für Entwicklung

* `loginid` und `authentification`-Tabelle beachten (Login-Daten getrennt)
* `changeAccessData` verwendet zwei Tabellen: `users` + `authentification`
* Bei `updateUser`: Wenn `loginid > 0`, wird nur `users` aktualisiert
* `useTranslate()` sollte für alle Texte eingebaut werden

## ✅ ToDos

* [ ] Alle Texte mit `t('key')` ersetzen
* [ ] Spracheinstellungen im UI auswählbar machen
* [ ] Tests für Passwort-Validierung einfügen
* [x] Deployment vorbereiten (Frontend & Backend) — Demo-Pipeline Render + Vercel steht

---

Mit diesem System behalten Nutzer den kompletten Bewerbungsprozess im Blick – von der Erstellung bis zur finalen Entscheidung.
