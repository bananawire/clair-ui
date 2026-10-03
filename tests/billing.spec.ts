import { test, expect } from './fixtures/auth';

test.describe('Billing', () => {
  test.describe('/plans', () => {
    test.beforeEach(async ({ authenticatedPage: page }) => {
      await page.goto('/plans');
    });

    test('muestra las tarjetas Free y Premium', async ({ authenticatedPage: page }) => {
      await expect(page.getByRole('heading', { name: 'Select your plan' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Free' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Mesh Network' })).toBeVisible();
    });

    test('seleccionar el plan premium lleva a /checkout-premium', async ({ authenticatedPage: page }) => {
      await page.locator('app-premium-plan-card').getByRole('button', { name: 'Try Clair' }).click();
      await expect(page).toHaveURL(/\/checkout-premium/);
    });
  });

  test('/select-plan (alias de /plans) también carga las tarjetas', async ({ authenticatedPage: page }) => {
    await page.goto('/select-plan');
    await expect(page.getByRole('heading', { name: 'Select your plan' })).toBeVisible();
  });

  test.describe('/checkout', () => {
    test.beforeEach(async ({ authenticatedPage: page }) => {
      // Stripe.js real se bloquea.
      await page.route('**js.stripe.com**', (route) => route.abort());
      await page.goto('/checkout');
    });

    test('muestra el resumen del plan Mesh Network', async ({ authenticatedPage: page }) => {
      await expect(page.getByRole('heading', { name: 'Proceed with payout' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Mesh Network' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add payment method' })).toBeVisible();
    });

    test('abrir el modal de pago muestra el formulario de tarjeta (mockeado, sin ingresar datos reales)', async ({ authenticatedPage: page }) => {
      await page.getByRole('button', { name: 'Add payment method' }).click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText('Payment method')).toBeVisible();
      await expect(dialog.getByPlaceholder('Name')).toBeVisible();
      await expect(dialog.getByRole('button', { name: 'Add' })).toBeVisible();
    });
  });

  test('/checkout-premium (alias de /checkout) también carga el resumen del plan', async ({ authenticatedPage: page }) => {
    await page.route('**js.stripe.com**', (route) => route.abort());
    await page.goto('/checkout-premium');
    await expect(page.getByRole('heading', { name: 'Proceed with payout' })).toBeVisible();
  });
});
