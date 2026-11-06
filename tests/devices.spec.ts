import { test, expect } from '@playwright/test';

// Hardware ID del seed del backend (SN-0003). El claim token no está en el seed: se obtiene al
// emparejar el hardware.
const HARDWARE_ID = 'CLAIR-0003';

// Cuenta del sistema real usada solo por las pruebas E2E.
const E2E_EMAIL = 'fafox59733@findize.com';
const E2E_PASSWORD = 'SecurePass123!';

const EMPTY_SPACE = 'No devices registered in this space.';

test('crea org/espacio, reclama el sensor del seed, lo configura y lo borra todo', async ({
  page,
}) => {
  test.setTimeout(300_000);

  // Nombres únicos: la prueba solo borra al final lo que ella misma creó.
  const suffix = Date.now();
  const orgName = `E2E Org ${suffix}`;
  const spaceName = `E2E Space ${suffix}`;

  // Login real (IAM).
  await page.goto('/login');
  await page.getByLabel('Email').fill(E2E_EMAIL);
  await page.getByLabel('Password', { exact: true }).fill(E2E_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));

  await page.goto('/space-devices');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Organizations', level: 2 })).toBeVisible();
  await expect(
    page.locator('.org-group').first().or(page.getByText('No organizations found.')),
  ).toBeVisible({ timeout: 20_000 });

  // Crear la organización.
  await page.getByRole('button', { name: 'Add Organization' }).click();
  await page.getByRole('dialog').getByLabel('Organization Name').fill(orgName);
  await page.getByRole('dialog').getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Organization created')).toBeVisible({ timeout: 20_000 });

  const orgGroup = page.locator('.org-group').filter({ has: page.getByText(orgName, { exact: true }) });
  await expect(orgGroup).toHaveCount(1);

  // Crear el espacio dentro de la organización.
  await orgGroup.getByRole('button', { name: 'Add space' }).click();
  await page.getByRole('dialog').getByLabel('Space Name').fill(spaceName);
  await page.getByRole('dialog').getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Space created')).toBeVisible({ timeout: 20_000 });

  // Se expande la org (si no lo está) para seleccionar el espacio.
  if ((await orgGroup.locator('.chevron.expanded').count()) === 0) {
    await orgGroup.locator('.org-row--organization').click();
  }
  const spaceButton = orgGroup.getByRole('button', { name: new RegExp(spaceName) });
  await expect(spaceButton).toBeVisible({ timeout: 20_000 });
  await spaceButton.click();
  await expect(page.getByText(EMPTY_SPACE)).toBeVisible({ timeout: 20_000 });

  // Crear el dispositivo: pairing del hardware del seed; el claim token sale del snackbar.
  await page.getByRole('button', { name: 'Pair sensor hardware' }).click();
  await page.getByRole('dialog').getByLabel('Hardware ID').fill(HARDWARE_ID);
  await page.getByRole('dialog').getByRole('button', { name: 'Pair', exact: true }).click();
  const pairedMessage = page.getByText(/Sensor paired\..*Claim token: /);
  await expect(pairedMessage).toBeVisible({ timeout: 20_000 });
  const claimToken = (await pairedMessage.innerText()).match(/Claim token: (\S+)/)![1];

  await page.getByRole('button', { name: 'Claim sensor' }).click();
  await page.getByRole('dialog').getByLabel('Claim Token').fill(claimToken);
  await page.getByRole('dialog').getByRole('button', { name: 'Claim', exact: true }).click();
  await expect(page.getByText('Sensor claimed')).toBeVisible({ timeout: 20_000 });

  // Configurar el dispositivo: renombrarlo y ajustar sus umbrales.
  await page.getByRole('button', { name: 'Go to device' }).click();
  await page.getByRole('button', { name: 'More options' }).click();
  await page.getByRole('menuitem', { name: 'Edit Device' }).click();
  await page.getByRole('dialog').getByLabel('Device Name').fill('E2E Sensor');
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Device updated')).toBeVisible({ timeout: 20_000 });

  await page.getByRole('button', { name: 'Edit thresholds' }).click();
  const sliders = page.getByRole('slider');
  await expect(sliders).toHaveCount(4);
  await expect(page.getByText('Loading thresholds...')).toBeHidden({ timeout: 20_000 });
  for (let i = 0; i < 4; i++) {
    // Los sliders responden a mousedown/mousemove: se arrastra hasta ~60 % de cada barra.
    const box = (await sliders.nth(i).boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();
  }
  await page.getByRole('button', { name: 'SAVE' }).click();
  await expect(page.getByText('Thresholds saved')).toBeVisible({ timeout: 20_000 });

  // Borrar todo. "Delete Device" en la app resetea la asignación: libera el sensor del seed
  // para que la prueba se pueda repetir.
  await page.getByRole('button', { name: 'More options' }).click();
  await page.getByRole('menuitem', { name: 'Delete Device' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Device deleted')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(EMPTY_SPACE)).toBeVisible({ timeout: 20_000 });

  await page.getByRole('button', { name: 'More options' }).click();
  await page.getByRole('menuitem', { name: 'Delete Space' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Space deleted')).toBeVisible({ timeout: 20_000 });
  await expect(spaceButton).toHaveCount(0);

  await orgGroup.getByRole('button', { name: 'Delete organization' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Organization deleted')).toBeVisible({ timeout: 20_000 });
  await expect(orgGroup).toHaveCount(0);
});
