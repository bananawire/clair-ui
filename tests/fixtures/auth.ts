import type { Page } from '@playwright/test';
import { test as base, expect } from './base';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.route('**/api/v1/auth/verify', (route) =>
      route.fulfill({
        status: 200,
        json: {
          valid: true,
          email: 'usuario@test.com',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
      }),
    );

    await page.addInitScript(() => {
      window.localStorage.setItem('accessToken', 'fake-access-token');
      window.localStorage.setItem('refreshToken', 'fake-refresh-token');
    });

    await use(page);
  },
});

export { expect };
