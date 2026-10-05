import { test, expect } from './fixtures/auth';

test.describe('Layout', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/overview');
  });

  test('muestra el sidebar y el header', async ({ authenticatedPage: page }) => {
    await expect(page.getByRole('link', { name: 'Overview icon Overview' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Air quality icon Air Quality' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Alerts actions icon Alerts & Actions' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Reports icon Reports' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Space devices icon Space & Devices' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();

    await expect(page.getByRole('img', { name: 'Clair lyrics' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Notifications' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'User profile' })).toBeVisible();
  });

  test('navega entre secciones usando el sidebar', async ({ authenticatedPage: page }) => {
    await page.getByRole('link', { name: 'Air quality icon Air Quality' }).click();
    await expect(page).toHaveURL(/\/analytics/);

    await page.getByRole('link', { name: 'Reports icon Reports' }).click();
    await expect(page).toHaveURL(/\/reports/);

    await page.getByRole('link', { name: 'Overview icon Overview' }).click();
    await expect(page).toHaveURL(/\/overview/);
  });

  test('cambiar el idioma desde settings actualiza los textos del sidebar', async ({ authenticatedPage: page }) => {
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/\/settings/);

    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'Spanish' }).click();

    await expect(page.getByRole('link', { name: 'Icono de resumen Resumen' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('clair-language'))).toBe('es');
  });
});
