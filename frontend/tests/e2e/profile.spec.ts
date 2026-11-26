import { test, expect } from '@playwright/test';
import { apiPath, gotoPage } from './support';

test.describe('Profil', () => {
  test('Neues Profil anlegen', async ({ page }) => {
    // Anrede-Optionen kommen über /getAnrede, sonst ist das Select leer
    await page.route(apiPath('/getAnrede'), (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 1, text: 'Frau' },
          { id: 2, text: 'Herr' },
        ]),
      })
    );
    await page.route(apiPath('/createOrUpdateUser'), (route) =>
      route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
    );

    // checkIsNew() verlangt den Parameter isNew=true
    await gotoPage(page, '/profile?isNew=true');

    await page.getByLabel(/^Loginname$/i).fill('max');
    await page.getByLabel(/^Passwort$/i).fill('geheim');
    await page.getByLabel(/^Passwort wiederholen$/i).fill('geheim');
    await page.getByLabel(/^Anrede$/i).selectOption('1');
    await page.getByLabel(/^Name$/i).fill('Max Mustermann');
    await page.getByLabel(/^E-?Mail$/i).fill('max@example.com');
    await page.getByLabel(/^Stadt$/i).fill('Stuttgart');
    await page.getByLabel(/^Straße$/i).fill('Königstraße');
    await page.getByLabel(/^Hausnummer$/i).fill('1');
    await page.getByLabel(/^Postleitzahl$/i).fill('70173');
    await page.getByLabel(/^Telefon$/i).fill('0711 123456');
    await page.getByLabel(/^Mobil/i).fill('0176 111111');

    await page.getByRole('button', { name: /^Speichern$/i }).click();

    // Nach dem Anlegen wird nach 3 Sekunden zur Anmeldeseite weitergeleitet
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('Zugangsdaten ändern', async ({ page }) => {
    await page.route(apiPath('/me'), (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          loginname: 'demo',
          email: 'demo@example.com',
          name: 'Demo',
        }),
      })
    );
    await page.route(apiPath('/changeAccessData'), (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          user: { loginname: 'maxi', email: 'max@example.com', name: 'Max' },
        }),
      })
    );

    await gotoPage(page, '/changeaccess');

    await page.getByLabel(/^Benutzername/i).fill('maxi');
    await page.getByLabel(/^E-?Mail/i).fill('max@example.com');
    // Feld "Passwort*" = aktuelles Passwort (immer Pflicht)
    await page.getByLabel(/^Passwort\*?$/i).fill('alt123');

    // Passwort-Wechsel aktivieren, dann erscheinen die Neuen-Passwort-Felder
    await page.getByRole('checkbox', { name: /passwort bearbeiten/i }).check();
    await page.getByLabel(/^Neues Passwort/i).fill('Passw0rt!');
    await page.getByLabel(/^Passwort bestätigen/i).fill('Passw0rt!');

    await page.getByRole('button', { name: /^Speichern$/i }).click();

    // Erfolg: Alert (von Playwright automatisch geschlossen) + Redirect zur Liste
    await expect(page).toHaveURL(/\/resumes/);
  });
});
