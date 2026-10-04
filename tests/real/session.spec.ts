import { test, expect } from '@playwright/test';

test.describe('Sistema real: sesión y guard (solo lectura)', () => {
  test('con sesión guardada, /overview carga sin redirigir a /login', async ({ page }) => {
    await page.goto('/overview');
    await expect(page).toHaveURL(/\/overview/);
    await expect(page.getByRole('button', { name: 'User profile' })).toBeVisible();
  });

  test.describe('sin sesión', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('entrar a /overview redirige a /login', async ({ page }) => {
      await page.goto('/overview');
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole('heading', { name: 'Login to Clair' })).toBeVisible();
    });
  });
});
