import { test, expect } from '@playwright/test';

test.describe('Resume anlegen & editieren', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/getStates', r => r.fulfill({ status: 200, body: JSON.stringify([
      { stateid: 1, text: 'Eingetragen' }, { stateid: 2, text: 'Gesendet' }
    ])}));
    await page.route('**/companies**', r => r.fulfill({ status: 200, body: JSON.stringify([])}));
    await page.route('**/contacts**', r => r.fulfill({ status: 200, body: JSON.stringify([])}));
    await page.route('**/updateOrCreateResume', r => r.fulfill({ status: 200, body: JSON.stringify({ resumeId: 123 })}));
  });

  test('Neues Resume inkl. neuer Firma & neuem Kontakt', async ({ page }) => {
    await page.goto('/resume/0');
    await page.getByLabel(/Position/i).fill('Frontend Entwickler');
    // "Status auswählen" könnte Label- oder Placeholdertext sein
    const statusSelect = page.getByLabel(/Status auswählen|Status/i).or(page.getByRole('combobox'));

    await statusSelect.selectOption({ label: 'Eingetragen' });
    await page.getByLabel(/Link/i).fill('https://example.com/jobs/123');
    await page.getByLabel(/Kommentar/i).fill('Klingt spannend');

    // Firma
    await page.getByRole('button', { name: /firma auswählen/i }).click();
    await page.getByRole('button', { name: /neue firma/i }).click();
    await page.getByLabel(/Firmenname/i).fill('Neue GmbH');
    await page.getByLabel(/Stadt/i).fill('Stuttgart');
    await page.getByLabel(/Straße/i).fill('Königstraße');
    await page.getByLabel(/Hausnummer/i).fill('1');
    await page.getByRole('button', { name: /speichern/i }).click();
    await expect(page.getByText(/Neue GmbH/)).toBeVisible();

    // Kontakt
    await page.getByRole('button', { name: /kontakt auswählen/i }).click();
    await page.getByRole('button', { name: /neuer kontakt/i }).click();
    await page.getByLabel(/Name/i).fill('Frau Beispiel');
    await page.getByLabel(/E-?Mail/i).fill('frau@example.com');
    await page.getByRole('button', { name: /speichern/i }).click();
    await expect(page.getByText(/Frau Beispiel/)).toBeVisible();

    // Speichern
    await page.getByRole('button', { name: /speichern|save/i }).click();
    await expect(page).toHaveURL(/\/resume\/123/);
  });
});
