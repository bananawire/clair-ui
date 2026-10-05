import { test as setup } from '@playwright/test';

const AUTH_FILE = 'playwright/.auth/user.json';

// Cuenta del sistema real usada solo por las pruebas E2E.
const E2E_EMAIL = "fafox59733@findize.com";
const E2E_PASSWORD = "SecurePass123!";

setup('inicia sesión en el sistema real y guarda la sesión', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(E2E_EMAIL);
  await page.getByLabel('Password', { exact: true }).fill(E2E_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL((url) => !url.pathname.startsWith('/login'));

  await page.context().storageState({ path: AUTH_FILE });
});
