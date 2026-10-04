import { test, expect } from '@playwright/test';

test.describe('Sistema real: /plans (solo lectura)', () => {
  test('muestra las tarjetas Free y Premium sin pulsar botones de compra', async ({ page }) => {
    await page.goto('/plans');
    await expect(page.getByRole('heading', { name: 'Select your plan' })).toBeVisible();
    await expect(page.locator('app-free-plan-card').getByRole('heading', { name: 'Free' })).toBeVisible();
    await expect(page.locator('app-premium-plan-card').getByRole('heading', { name: 'Mesh Network' })).toBeVisible();
  });
});
