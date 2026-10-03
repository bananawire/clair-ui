import { test, expect } from './fixtures/auth';

test.describe('Auth guard', () => {
  test('sin token, entrar a /overview redirige a /login', async ({ page }) => {
    await page.goto('/overview');

    await expect(page).toHaveURL(/\/login/);
  });

  test('con token válido mockeado, entra a /overview', async ({ authenticatedPage: page }) => {
    await page.goto('/overview');

    await expect(page).toHaveURL(/\/overview/);
  });
});
