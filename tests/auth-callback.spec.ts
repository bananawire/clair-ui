import { test, expect } from '@playwright/test';

test.describe('Auth callback', () => {
  test('con token y refreshToken en la URL, guarda tokens y redirige a /overview', async ({ page }) => {
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

    await page.goto('/auth/callback?token=fake-access-token&refreshToken=fake-refresh-token');

    await expect(page).toHaveURL(/\/overview/);
    expect(await page.evaluate(() => localStorage.getItem('accessToken'))).toBe('fake-access-token');
    expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBe('fake-refresh-token');
  });

  // DEFECTO CONOCIDO: igual que en /confirm (ver tests/confirm.spec.ts), el componente llama
  // translate.instant() en el constructor, antes de que terminen de cargar las traducciones,
  // así que se muestra la clave cruda en vez del texto.
  test('con reason=google_oauth_failed muestra error de Google', async ({ page }) => {
    test.fail();
    await page.goto('/auth/callback?reason=google_oauth_failed');

    await expect(page.locator('.error-message')).toContainText('Google authentication failed. Please try again.');
    await expect(page.getByRole('link', { name: 'Back to Login' })).toBeVisible();
  });

  // DEFECTO CONOCIDO: igual que el anterior (translate.instant() antes de cargar traducciones).
  test('sin tokens en la URL muestra error de autenticación incompleta', async ({ page }) => {
    test.fail();
    await page.goto('/auth/callback');

    await expect(page.locator('.error-message')).toContainText('Authentication incomplete. Missing tokens.');
    await expect(page.getByRole('link', { name: 'Back to Login' })).toBeVisible();
  });
});
