import { test, expect } from '@playwright/test';

test.describe('Sistema real: /alerts (solo lectura)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/alerts');
  });

  test('muestra título, rango de fechas y pestañas', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Alerts', level: 1 })).toBeVisible();
    await expect(page.getByText('Last 30 days')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Active Alerts' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'History' })).toBeVisible();
  });

  test('la pestaña Active Alerts muestra alertas o el estado vacío', async ({ page }) => {
    await expect(page.getByText('Loading', { exact: false })).toBeHidden();
    await expect(page.getByText('No alerts found')).toBeVisible();
  });

  test('la pestaña History muestra el listado con paginación (solo lectura)', async ({ page }) => {
    await page.getByRole('button', { name: 'History' }).click();
    await expect(page.getByText(/Page \d+ of \d+|No alerts found/)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Alerts', level: 1 })).toBeVisible();
  });
});
