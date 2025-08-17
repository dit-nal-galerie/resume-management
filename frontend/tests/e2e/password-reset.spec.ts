import { test, expect } from '@playwright/test';

test('Passwort anfordern & zurücksetzen', async ({ page }) => {
  await page.route('**/request-password-reset', route =>
    route.fulfill({ status: 200, body: JSON.stringify({ success: true, message: 'ok' }) })
  );

  await page.goto('/restore');
  await page.getByLabel(/Username|Loginname/i).fill('demo');
  await page.getByLabel(/Email|E-Mail/i).fill('demo@example.com');
  await page.getByRole('button', { name: /send reset link|anfordern|link/i }).click();
  await expect(page.getByText(/ok|erfolg|success/i)).toBeVisible();

  await page.goto('/reset-password?token=abc123');
  await page.getByLabel(/new password|neues passwort/i).fill('Passw0rt!');
  await page.getByLabel(/confirm password|passwort wiederholen/i).fill('Passw0rt!');
  await page.getByRole('button', { name: /reset password|zurücksetzen/i }).click();
  await expect(page.getByText(/erfolgreich zurückgesetzt|success/i)).toBeVisible();
});
