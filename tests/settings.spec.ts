import { test, expect } from './fixtures/auth';

test.describe('Settings', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/settings');
  });

  test('carga la página con el título, el selector de idioma y el botón de logout', async ({ authenticatedPage: page }) => {
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByLabel('Language')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  test('cambiar el idioma a español guarda clair-language y cambia los textos', async ({ authenticatedPage: page }) => {
    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: 'Spanish' }).click();

    await expect(page.getByRole('heading', { name: 'Configuración' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('clair-language'))).toBe('es');
  });
});
