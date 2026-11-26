import { test, expect } from '@playwright/test';
import { apiPath, gotoPage } from './support';

test.describe('Resume anlegen & editieren', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(apiPath('/getStates'), (r) =>
      r.fulfill({
        status: 200,
        body: JSON.stringify([
          { stateid: 1, text: 'Eingetragen' },
          { stateid: 2, text: 'Gesendet' },
        ]),
      })
    );
    await page.route(apiPath('/companies'), (r) =>
      r.fulfill({ status: 200, body: JSON.stringify([]) })
    );
    await page.route(apiPath('/contacts'), (r) =>
      r.fulfill({ status: 200, body: JSON.stringify([]) })
    );
    await page.route(apiPath('/updateOrCreateResume'), (r) =>
      r.fulfill({ status: 200, body: JSON.stringify({ resumeId: 123 }) })
    );
  });

  test('Neues Resume inkl. neuer Firma & neuem Kontakt', async ({ page }) => {
    await gotoPage(page, '/resume/0');

    await page.getByLabel(/^Position$/i).fill('Frontend Entwickler');
    // Zweites #status-Element gibt es nicht – der Sprachumschalter heißt anders
    await page.locator('#status').selectOption({ label: 'Eingetragen' });
    await page.getByLabel(/^Link$/i).fill('https://example.com/jobs/123');
    await page.getByLabel(/^Kommentar$/i).fill('Klingt spannend');

    // Es gibt zwei Firmen-Sektionen ("Recruiter" und "Firma") – gezielt die
    // "Firma"-Sektion nehmen, sonst ist der Button-locator nicht eindeutig.
    const companySection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'Firma', exact: true }) });

    await companySection.getByRole('button', { name: /neue firma/i }).click();

    // Modal "Neues Unternehmen" (Speichern nur innerhalb des Modals, weil
    // hinter dem Overlay ebenfalls ein "Speichern"-Button liegt)
    const companyModal = page.locator('div.fixed.inset-0');

    await companyModal.getByLabel(/^Name$/i).fill('Neue GmbH');
    await companyModal.getByLabel(/^Stadt$/i).fill('Stuttgart');
    await companyModal.getByLabel(/^Straße$/i).fill('Königstraße');
    await companyModal.getByLabel(/^Hausnummer$/i).fill('1');
    await companyModal.getByRole('button', { name: /^Speichern$/i }).click();
    await expect(companySection.getByText('Neue GmbH')).toBeVisible();

    // Kontakt-Buttons erscheinen erst, wenn eine Firma gesetzt ist
    const contactSection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'Firmenkontakt', exact: true }) });

    await contactSection.getByRole('button', { name: /neuer kontakt/i }).click();

    const contactModal = page.locator('div.fixed.inset-0');

    await contactModal.getByLabel(/^Name$/i).fill('Frau Beispiel');
    await contactModal.getByLabel(/^E-?Mail$/i).fill('frau@example.com');
    await contactModal.getByRole('button', { name: /^Speichern$/i }).click();

    // Modal schließt sich wieder (lokaler Speicher der App)
    await expect(contactModal).toBeHidden();

    // Resume speichern: Erfolgs-Alert (auto-dismiss) + Redirect zur Liste
    await page.getByRole('button', { name: /^Speichern$/i }).click();
    await expect(page).toHaveURL(/\/resumes/);
  });
});
