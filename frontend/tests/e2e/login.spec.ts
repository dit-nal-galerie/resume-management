import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/login', async route => {
      const req = route.request();
      const body = await req.postDataJSON();
      if (body.loginname === 'demo' && body.password === 'demo') {
        return route.fulfill({ status: 200, body: JSON.stringify({ success: true, token: 'jwt-demo' }) });
      }
      return route.fulfill({ status: 401, body: JSON.stringify({ success: false, error: 'login.invalidCredentials' }) });
    });
  });

  test('erfolgreich -> Resumeliste', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/Benutzername|Loginname/i).fill('demo');
    await page.getByLabel(/Passwort/i).fill('demo');
    await page.getByRole('button', { name: /anmelden/i }).click();
    await expect(page).toHaveURL(/resumes/);
    await expect(page.getByText(/Bewerbungen|Resumes/i)).toBeVisible();
  });

  test('Fehlerhafte Daten zeigen Fehlermeldung', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/Benutzername|Loginname/i).fill('demo');
    await page.getByLabel(/Passwort/i).fill('x');
    await page.getByRole('button', { name: /anmelden/i }).click();
    await expect(page.getByText(/ungültig|invalid/i)).toBeVisible();
  });
});
