import { test, expect } from './fixtures/base';

test.describe('Confirm', () => {
  test('muestra el formulario con un sessionId válido en la URL', async ({ page }) => {
    await page.goto('/confirm?sessionId=session-123');

    await expect(page.getByRole('heading', { name: 'Verify Account' })).toBeVisible();
    await expect(page.getByLabel('Verification Code')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verify' })).toBeVisible();
  });

  // DEFECTO CONOCIDO: al navegar directo a /confirm sin sessionId, ngOnInit llama a
  // translate.instant() de forma síncrona antes de que las traducciones terminen de cargar,
  // así que se muestra la clave cruda ("confirm.error.invalidSession") en vez del texto.
  test('sin sessionId en la URL muestra error de sesión inválida', async ({ page }) => {
    test.fail();
    await page.goto('/confirm');

    await expect(page.locator('.error-message')).toHaveText('Invalid registration session. Please register again.');
  });

  test('el botón Verify está deshabilitado con el código vacío', async ({ page }) => {
    await page.goto('/confirm?sessionId=session-123');
    await expect(page.getByRole('button', { name: 'Verify' })).toBeDisabled();
  });

  test('valida el formato del código de verificación', async ({ page }) => {
    await page.goto('/confirm?sessionId=session-123');

    await page.getByLabel('Verification Code').fill('abc123');
    await page.getByLabel('Verification Code').blur();

    await expect(page.getByText('Code must be in format XXXX-XXXX')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verify' })).toBeDisabled();
  });

  test('código correcto confirma la cuenta y redirige a /login', async ({ page }) => {
    await page.goto('/confirm?sessionId=session-123');

    await page.route('**/api/v1/auth/confirm', (route) =>
      route.fulfill({ status: 200, json: { id: 'user-1', email: 'usuario@test.com' } }),
    );

    await page.getByLabel('Verification Code').fill('ABCD-1234');

    const confirmResponse = page.waitForResponse('**/api/v1/auth/confirm');
    await page.getByRole('button', { name: 'Verify' }).click();
    expect((await confirmResponse).status()).toBe(200);

    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('muestra codigo incorrecto (API mockeada con 400)', async ({ page }) => {
    test.fail();
    await page.goto('/confirm?sessionId=session-123');

    await page.route('**/api/v1/auth/confirm', (route) =>
      route.fulfill({ status: 400, json: { message: 'Invalid verification code. Please try again.' } }),
    );

    await page.getByLabel('Verification Code').fill('ABCD-1234');

    const confirmResponse = page.waitForResponse('**/api/v1/auth/confirm');
    await page.getByRole('button', { name: 'Verify' }).click();
    expect((await confirmResponse).status()).toBe(400);

    await expect(page.locator('.error-message')).toHaveText('Invalid verification code. Please try again.');
  });
});
