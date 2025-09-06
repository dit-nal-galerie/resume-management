import { test, expect } from '@playwright/test';

test.describe('Profil', () => {
  test('Neues Profil anlegen', async ({ page }) => {
    await page.route('**/me', (route) => route.fulfill({ status: 200, body: 'null' }));
    await page.route('**/createOrUpdateUser', (route) =>
      route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
    );

    await page.goto('/profile?isNew=1');
    await page.getByLabel(/Anrede/i).selectOption('1');
    await page.getByLabel(/Name/i).fill('Max Mustermann');
    await page.getByLabel(/E-?Mail/i).fill('max@example.com');
    await page.getByLabel(/Stadt/i).fill('Stuttgart');
    await page.getByLabel(/Straße/i).fill('Königstraße');
    await page.getByLabel(/Hausnummer/i).fill('1');
    await page.getByLabel(/Postleitzahl/i).fill('70173');
    await page.getByLabel(/Telefon/i).fill('0711 123456');
    await page.getByLabel(/Mobil/i).fill('0176 111111');
    await page.getByRole('button', { name: /speichern|anlegen/i }).click();
    await expect(page.getByText(/Profil.*gespeichert|save/i)).toBeVisible();
  });

  test('Zugangsdaten ändern', async ({ page }) => {
    await page.route('**/me', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ loginname: 'demo', email: 'demo@example.com', name: 'Demo' }),
      })
    );
    await page.route('**/changeAccessData', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          user: { loginname: 'maxi', email: 'max@example.com', name: 'Max' },
        }),
      })
    );

    await page.goto('/changeaccess');
    await page.getByLabel(/Loginname/i).fill('maxi');
    // Checkbox "Passwort bearbeiten" (Text kann variieren)
    const toggle = page.getByText(/Passwort.*bearbeiten|ändern/i);

    if (await toggle.isVisible()) await toggle.click();
    await page.getByLabel(/Neues Passwort/i).fill('Passw0rt!');
    await page.getByLabel(/Passwort wiederholen/i).fill('Passw0rt!');
    await page.getByLabel(/E-?Mail/i).fill('max@example.com');
    await page.getByRole('button', { name: /speichern|ändern/i }).click();
    await expect(page.getByText(/Profil.*gespeichert|updated/i)).toBeVisible();
  });
});
