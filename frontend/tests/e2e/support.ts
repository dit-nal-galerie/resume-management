import { Page } from '@playwright/test';

export const DEV_ORIGIN = 'http://localhost:3000';

// Nur API-Abrufe mocken (anderer Origin als der Dev-Server) – niemals die
// Seitennavigation selbst, sonst liefert die Route JSON statt des HTML-Dokuments.
export const apiPath = (path: string) => (url: URL) =>
  url.origin !== DEV_ORIGIN && url.pathname === path;

// Das React-Query-Devtools-Panel liegt im Dev-Server über dem Formular und
// blockiert Klicks. Nach jedem Navigieren ausblenden.
export const gotoPage = async (page: Page, path: string) => {
  await page.goto(path);
  await page.addStyleTag({
    content: '.tsqd-parent-container { display: none !important; }',
  });
};
