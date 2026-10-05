import { test as base, expect } from '@playwright/test';

// Los tests mockeados no deben depender de internet ni del backend: Google Fonts y el SDK
// de OneSignal retrasan el evento "load" (y con carga en paralelo provocan timeouts en goto).
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/fonts\.googleapis\.com/, (route) =>
      route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
    );
    await page.route(/(fonts\.gstatic|onesignal)\.com/, (route) => route.abort());
    await page.route('**/api/v1/notifications/push**', (route) =>
      route.fulfill({
        status: 200,
        json: { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 },
      }),
    );
    await use(page);
  },
});

export { expect };
