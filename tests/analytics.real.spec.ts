import { test, expect } from '@playwright/test';

test.describe('Sistema real: /analytics (solo lectura)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analytics');
  });

  test('muestra título, rangos de tiempo y selectores de organización, espacio y dispositivo', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Air Quality', level: 1 })).toBeVisible();
    for (const name of ['LIVE', 'Day', 'Week', 'Month', 'Calendar']) {
      await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
    }
    await expect(page.getByText('ORGANIZATION', { exact: true })).toBeVisible();
    await expect(page.getByText('SPACES', { exact: true })).toBeVisible();
    await expect(page.getByText('DEVICE', { exact: true })).toBeVisible();
    await expect(page.getByRole('combobox')).toHaveCount(3);
  });

  test('muestra el índice de calidad del aire y los contaminantes con contenido', async ({ page }) => {
    await expect(page.getByText('AIR QUALITY INDEX')).toBeVisible();
    for (const label of ['PM2.5', 'CO₂', 'TEMP', 'HUMIDITY']) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(page.getByText('TREND (AQI)')).toBeVisible();
  });

  test('cambiar el rango a Day mantiene la vista con datos (solo lectura)', async ({ page }) => {
    await page.getByRole('button', { name: 'Day', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Air Quality', level: 1 })).toBeVisible();
    await expect(page.getByText('AIR QUALITY INDEX')).toBeVisible();
    await expect(page.getByText('PM2.5', { exact: true })).toBeVisible();
  });
});
