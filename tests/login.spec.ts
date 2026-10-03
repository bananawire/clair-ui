import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('muestra el formulario de login', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Login to Clair' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
  });

  test('el botón Login está deshabilitado con el formulario vacío', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Login' })).toBeDisabled();
  });

  // DEFECTO CONOCIDO: la app es zoneless y errorMessage es un campo normal (no signal),
  // la vista no se repinta tras el error (spinner permanente, sin mensaje) y la consola muestra NG0100.
  test('muestra error con credenciales inválidas (API mockeada con 401)', async ({ page }) => {
    test.fail();
    await page.route('**/api/v1/auth/sign-in', (route) =>
      route.fulfill({ status: 401, json: { message: 'Unauthorized' } }),
    );

    await page.getByLabel('Email').fill('usuario@test.com');
    await page.getByLabel('Password', { exact: true }).fill('ClaveIncorrecta1!');

    const signInResponse = page.waitForResponse('**/api/v1/auth/sign-in');
    await page.getByRole('button', { name: 'Login' }).click();
    expect((await signInResponse).status()).toBe(401);

    await expect(page.locator('.error-message')).toHaveText('Invalid email or password.');
  });

  test('el enlace Register lleva a /register', async ({ page }) => {
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('login exitoso redirige a /overview', async ({ page }) => {
    await page.route('**/api/v1/auth/sign-in', (route) =>
      route.fulfill({
        status: 200,
        json: {
          id: 'user-1',
          email: 'usuario@test.com',
          token: 'fake-access-token',
          refreshToken: 'fake-refresh-token',
        },
      }),
    );
    await page.route('**/api/v1/auth/verify', (route) =>
      route.fulfill({
        status: 200,
        json: {
          valid: true,
          email: 'usuario@test.com',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
      }),
    );

    await page.getByLabel('Email').fill('usuario@test.com');
    await page.getByLabel('Password', { exact: true }).fill('ClaveCorrecta1!');

    const signInResponse = page.waitForResponse('**/api/v1/auth/sign-in');
    await page.getByRole('button', { name: 'Login' }).click();
    expect((await signInResponse).status()).toBe(200);

    await expect(page).toHaveURL(/\/overview/);
    expect(await page.evaluate(() => localStorage.getItem('accessToken'))).toBe('fake-access-token');
    expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBe('fake-refresh-token');
  });

  // DEFECTO CONOCIDO: mismo problema que el 401 (ver comentario arriba), la vista no refleja errorMessage.
  test('muestra error con fallo de servidor (API mockeada con 500)', async ({ page }) => {
    test.fail();
    await page.route('**/api/v1/auth/sign-in', (route) =>
      route.fulfill({ status: 500, json: { message: 'Internal error' } }),
    );

    await page.getByLabel('Email').fill('usuario@test.com');
    await page.getByLabel('Password', { exact: true }).fill('ClaveCorrecta1!');

    const signInResponse = page.waitForResponse('**/api/v1/auth/sign-in');
    await page.getByRole('button', { name: 'Login' }).click();
    expect((await signInResponse).status()).toBe(500);

    await expect(page.locator('.error-message')).toHaveText('An unexpected error occurred. Please try again.');
  });

  // DEFECTO CONOCIDO: mismo problema que el 401 (ver comentario arriba), la vista no refleja errorMessage.
  test('muestra error de red cuando la API no responde', async ({ page }) => {
    test.fail();
    await page.route('**/api/v1/auth/sign-in', (route) => route.abort('failed'));

    await page.getByLabel('Email').fill('usuario@test.com');
    await page.getByLabel('Password', { exact: true }).fill('ClaveCorrecta1!');

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('.error-message')).toHaveText('Cannot connect to server. Is the backend running?');
  });
});
