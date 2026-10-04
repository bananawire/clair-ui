import { test as setup, expect } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';

setup('inicia sesión en el sistema real y guarda la sesión', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  expect(email, 'falta E2E_EMAIL').toBeTruthy();
  expect(password, 'falta E2E_PASSWORD').toBeTruthy();

  await page.goto('/login');
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Password', { exact: true }).fill(password!);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL((url) => !url.pathname.startsWith('/login'));

  await page.context().storageState({ path: AUTH_FILE });
});
