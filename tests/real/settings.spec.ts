import { test, expect } from '@playwright/test';

test.describe('Sistema real: /settings (solo lectura)', () => {
  test('carga la página y cambia el idioma (no toca logout)', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Language' })).toBeVisible();

    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'Spanish' }).click();
    await expect(page.getByRole('heading', { name: 'Configuración' })).toBeVisible();


    await page.getByRole('combobox', { name: 'Idioma' }).click();
    await page.getByRole('option', { name: 'Inglés' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });
});
