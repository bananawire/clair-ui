import { test, expect } from '@playwright/test';

test.describe('Sistema real: /space-devices (solo lectura)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/space-devices');
  });

  test('muestra el panel de organizaciones y sus acciones (sin pulsarlas)', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Organizations', level: 2 })).toBeVisible();
    // Solo se comprueba que existen: Add / Edit / Delete modifican datos y no se tocan.
    await expect(page.getByRole('button', { name: 'Add Organization' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit organization' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete organization' })).toBeVisible();
  });

  test('sin espacio seleccionado indica que se elija una organización', async ({ page }) => {
    await expect(page.getByText('Select an organization with spaces to view devices.')).toBeVisible();
  });
});
