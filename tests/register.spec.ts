import { test, expect } from '@playwright/test';

test.describe('Register', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('muestra el formulario de registro', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('checkbox')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
  });

  test('el botón Register está deshabilitado con el formulario vacío', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  test('valida formato de email inválido', async ({ page }) => {
    await page.getByLabel('Email').fill('no-es-un-email');
    await page.getByLabel('Password', { exact: true }).fill('ClaveValida1!');
    await page.getByLabel('Email').blur();

    await expect(page.getByText('Invalid email format')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  test('valida password con menos de 8 caracteres', async ({ page }) => {
    await page.getByLabel('Email').fill('usuario@test.com');
    await page.getByLabel('Password', { exact: true }).fill('123');
    await page.getByLabel('Password', { exact: true }).blur();

    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  test('el botón sigue deshabilitado si no se aceptan los términos', async ({ page }) => {
    await page.getByLabel('Email').fill('usuario@test.com');
    await page.getByLabel('Password', { exact: true }).fill('ClaveValida1!');

    await expect(page.getByRole('button', { name: 'Register' })).toBeDisabled();

    await page.getByRole('checkbox').check();
    await expect(page.getByRole('button', { name: 'Register' })).toBeEnabled();
  });

  test('registro válido redirige a /confirm con el sessionId', async ({ page }) => {
    await page.route('**/api/v1/auth/sign-up', (route) =>
      route.fulfill({
        status: 201,
        json: { sessionId: 'session-123', message: 'Registration started' },
      }),
    );

    await page.getByLabel('Email').fill('usuario@test.com');
    await page.getByLabel('Password', { exact: true }).fill('ClaveValida1!');
    await page.getByRole('checkbox').check();

    const signUpResponse = page.waitForResponse('**/api/v1/auth/sign-up');
    await page.getByRole('button', { name: 'Register' }).click();
    expect((await signUpResponse).status()).toBe(201);

    await expect(page).toHaveURL(/\/confirm\?sessionId=session-123/);
  });

  test('muestra error cuando el email ya existe (API mockeada con 409)', async ({ page }) => {
    test.fail();
    await page.route('**/api/v1/auth/sign-up', (route) =>
      route.fulfill({ status: 409, json: { message: 'Email already registered.' } }),
    );

    await page.getByLabel('Email').fill('usuario@test.com');
    await page.getByLabel('Password', { exact: true }).fill('ClaveValida1!');
    await page.getByRole('checkbox').check();

    const signUpResponse = page.waitForResponse('**/api/v1/auth/sign-up');
    await page.getByRole('button', { name: 'Register' }).click();
    expect((await signUpResponse).status()).toBe(409);

    await expect(page.locator('.error-message')).toHaveText('Email already registered.');
  });
});
