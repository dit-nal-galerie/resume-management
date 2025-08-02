// tests/e2e/login.spec.ts
import { test, expect, Page } from '@playwright/test';

test('zeigt Login-Seite', async ({ page }: { page: Page }) => {
  await page.goto('http://localhost:3000'); // Oder dein Dev-Server
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible(); // Falls vorhanden
});
