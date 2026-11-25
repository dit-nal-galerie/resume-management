import { test, expect } from '@playwright/test';
import { apiPath, gotoPage } from './support';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    // Nicht eingeloggt: /meanrede schlägt fehl -> kein automatischer Redirect
    await page.route(apiPath('/meanrede'), (route) =>
      route.fulfill({ status: 401, body: JSON.stringify({ error: 'unauthorized' }) })
    );

    await page.route(apiPath('/login'), async (route) => {
      const body = await route.request().postDataJSON();

      if (body?.loginname === 'demo' && body?.password === 'demo') {
        return route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, token: 'jwt-demo' }),
        });
      }

      return route.fulfill({
        status: 401,
        body: JSON.stringify({ success: false, error: 'login.invalidCredentials' }),
      });
    });

    // Nach erfolgreichem Login lädt login() das Profil über /me nach:
    await page.route(apiPath('/me'), (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          loginname: 'demo',
          name: 'Demo User',
          email: 'demo@example.com',
        }),
      })
    );
  });

  test('erfolgreich -> Resumeliste', async ({ page }) => {
    await gotoPage(page, '/');
    await page.getByLabel(/benutzername|loginname/i).fill('demo');
    await page.getByLabel(/^passwort$/i).fill('demo');
    await page.getByRole('button', { name: /anmelden/i }).click();

    await expect(page).toHaveURL(/resumes/);
    await expect(page.getByRole('heading', { name: /bewerbungen/i })).toBeVisible();
  });

  test('Fehlerhafte Daten zeigen Fehlermeldung', async ({ page }) => {
    await gotoPage(page, '/login');
    await page.getByLabel(/benutzername|loginname/i).fill('demo');
    await page.getByLabel(/^passwort$/i).fill('x');
    await page.getByRole('button', { name: /anmelden/i }).click();

    // Login.tsx zeigt bei fehlgeschlagenem Login t('common.serverError')
    // plus Feldfehler ("Prüfen Sie den Benutzernamen")
    await expect(page.getByText(/serverfehler|prüf/i).first()).toBeVisible();
  });
});
