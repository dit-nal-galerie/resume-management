import { test, expect } from '@playwright/test';
import { apiPath, gotoPage } from './support';

test('Passwort anfordern & zurücksetzen', async ({ page }) => {
  await page.route(apiPath('/request-password-reset'), (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ success: true, message: 'ok' }) })
  );

  // Token-Prüfung (Phase F): ohne successful validate-token bleibt der Submit-Button gesperrt
  await page.route(apiPath('/validate-token'), (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
  );

  await page.route(apiPath('/reset-password'), (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
  );

  // --- Link anfordern ---
  await gotoPage(page, '/restore');
  await page.getByLabel(/benutzername|username|loginname/i).fill('demo');
  await page.getByLabel(/e-mail|email/i).fill('demo@example.com');
  await page.getByRole('button', { name: /send reset link|anfordern|link/i }).click();
  await expect(page.getByText(/E-Mail mit Anweisungen|email with instructions/i)).toBeVisible();

  // --- Passwort zurücksetzen ---
  await gotoPage(page, '/reset-password?token=abc123');
  await page.getByLabel(/new password|neues passwort/i).fill('Passw0rt!');
  await page.getByLabel(/confirm password|passwort bestätigen/i).fill('Passw0rt!');
  await page.getByRole('button', { name: /reset password|zurücksetzen/i }).click();
  await expect(page.getByText(/erfolgreich zurückgesetzt|successfully reset/i)).toBeVisible();
});
