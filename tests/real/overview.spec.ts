import { test, expect } from '@playwright/test';

test.describe('Sistema real: /overview (solo lectura)', () => {
  test('muestra la estructura del resumen con contenido', async ({ page }) => {
    await page.goto('/overview');

    await expect(page.getByText('Loading overview...')).toBeHidden();
    await expect(page.getByText('Unable to load overview right now.')).toBeHidden();

    await expect(page.locator('app-aqi-card')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pollutants' })).toBeVisible();
    await expect(page.getByText('Updates every minute')).toBeVisible();
    await expect(page.locator('app-pollutant-card')).toHaveCount(4);
    for (const label of ['PM2.5', 'CO₂', 'TEMP', 'HUMIDITY']) {
      await expect(page.locator('app-pollutant-card').getByText(label, { exact: true })).toBeVisible();
    }
    await expect(page.locator('app-alerts-card')).toBeVisible();
    await expect(page.locator('app-organizations-card')).toBeVisible();

    expect((await page.locator('app-aqi-card').innerText()).trim().length).toBeGreaterThan(0);
  });
});
