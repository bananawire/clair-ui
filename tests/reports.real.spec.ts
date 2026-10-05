import { test, expect } from '@playwright/test';

test.describe('Sistema real: /reports (solo lectura)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
  });

  test('muestra título, periodo, selectores y botones de métrica', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Reports', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Daily', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Monthly', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select period' })).toBeVisible();
    await expect(page.getByRole('combobox')).toHaveCount(3);
    for (const name of ['AQI', 'PM2.5', 'CO₂', 'Temp', 'Humidity']) {
      await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
    }

    await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();
  });

  test('muestra el resumen y las tablas de estadísticas con filas', async ({ page }) => {
    await expect(page.getByText('AVERAGE AQI')).toBeVisible();
    await expect(page.getByText('READINGS', { exact: true })).toBeVisible();
    await expect(page.getByText('METRIC STATISTICS')).toBeVisible();
    await expect(page.getByText('AQI CATEGORY DISTRIBUTION')).toBeVisible();

    const tables = page.getByRole('table');
    await expect(tables).toHaveCount(2);
    await expect(tables.first().getByRole('columnheader', { name: 'Metric' })).toBeVisible();
    await expect(tables.last().getByRole('columnheader', { name: 'Category' })).toBeVisible();
    expect(await tables.first().getByRole('row').count()).toBeGreaterThan(1);
    expect(await tables.last().getByRole('row').count()).toBeGreaterThan(1);
  });
});
