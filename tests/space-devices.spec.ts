import { test, expect } from './fixtures/auth';
import type { Page, Route } from '@playwright/test';
import { DEVICE_ID, ORG_ID, SPACE_ID, device, organization, space } from './fixtures/device-tree';

type Mutation = { method: string; path: string; body: unknown };

type State = {
  organizations: Record<string, unknown>[];
  spaces: Record<string, unknown>[];
  devices: Record<string, unknown>[];
};

type Options = {
  organizations?: Record<string, unknown>[];
  spaces?: Record<string, unknown>[];
  devices?: Record<string, unknown>[];
  devicesStatus?: number;
};

const timestamps = { createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' };

async function mockSpaceDevicesApi(
  page: Page,
  options: Options = {},
): Promise<{ state: State; mutations: Mutation[] }> {
  const state: State = {
    organizations: options.organizations ?? [organization],
    spaces: options.spaces ?? [space],
    devices: options.devices ?? [device],
  };
  const mutations: Mutation[] = [];

  const record = (route: Route) => {
    const request = route.request();
    const mutation = {
      method: request.method(),
      path: new URL(request.url()).pathname,
      body: request.postDataJSON() as unknown,
    };
    mutations.push(mutation);
    return mutation;
  };
  const idFrom = (route: Route, segment: string) =>
    new URL(route.request().url()).pathname.split('/').at(segment === 'last' ? -1 : -2)!;

  await page.route('**/api/v1/organizations', (route) => {
    if (route.request().method() === 'POST') {
      const { body } = record(route) as { body: { name: string } };
      const created = { ...organization, id: 'o-new', name: body.name };
      state.organizations.push(created);
      return route.fulfill({ status: 201, json: created });
    }
    return route.fulfill({ status: 200, json: state.organizations });
  });
  await page.route('**/api/v1/organizations/*', (route) => {
    record(route);
    state.organizations = state.organizations.filter((o) => o['id'] !== idFrom(route, 'last'));
    return route.fulfill({ status: 204 });
  });
  await page.route('**/api/v1/organizations/*/name', (route) => {
    const { body } = record(route) as { body: { name: string } };
    const id = idFrom(route, 'prev');
    state.organizations = state.organizations.map((o) =>
      o['id'] === id ? { ...o, name: body.name } : o,
    );
    return route.fulfill({ status: 204 });
  });

  await page.route('**/api/v1/spaces?**', (route) => {
    if (route.request().method() === 'POST') {
      const { body } = record(route) as { body: { name: string } };
      const created = { ...space, id: 's-new', name: body.name };
      state.spaces.push(created);
      return route.fulfill({ status: 201, json: created });
    }
    return route.fulfill({ status: 200, json: state.spaces });
  });
  await page.route('**/api/v1/spaces/*', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 200, json: state.spaces[0] });
    }
    record(route);
    return route.fulfill({ status: 204 });
  });
  await page.route('**/api/v1/spaces/*/name', (route) => {
    record(route);
    return route.fulfill({ status: 204 });
  });

  await page.route('**/api/v1/devices?**', (route) => {
    if (options.devicesStatus && options.devicesStatus >= 400) {
      return route.fulfill({ status: options.devicesStatus, json: { message: 'Internal error' } });
    }
    return route.fulfill({
      status: 200,
      json: {
        content: state.devices,
        totalElements: state.devices.length,
        totalPages: 1,
        size: 20,
        number: 0,
      },
    });
  });

  await page.route('**/api/v1/devices/*', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 200, json: state.devices[0] });
    }
    record(route);
    return route.fulfill({ status: 204 });
  });
  await page.route('**/api/v1/devices/claim', (route) => {
    record(route);
    return route.fulfill({ status: 201, json: { ...device, id: 'd-claimed', name: 'Sensor Nuevo' } });
  });
  await page.route('**/api/v1/devices/pair', (route) => {
    record(route);
    return route.fulfill({ status: 200, json: { deviceId: 'd-paired', claimToken: 'AB45-F3B1' } });
  });
  await page.route('**/api/v1/devices/*/name', (route) => {
    record(route);
    return route.fulfill({ status: 204 });
  });
  await page.route('**/api/v1/devices/*/thresholds', (route) =>
    route.fulfill({ status: 200, json: [] }),
  );
  await page.route('**/api/v1/evaluations/devices/*/latest', (route) =>
    route.fulfill({ status: 404, json: { message: 'No evaluations' } }),
  );

  return { state, mutations };
}

async function openSpace(page: Page, orgName = 'Clair Org', spaceName = 'Main Office'): Promise<void> {
  await page.goto('/space-devices');
  await page.getByRole('button', { name: orgName }).click();
  await page.getByRole('button', { name: new RegExp(spaceName) }).click();
}

test.describe('Space & Devices', () => {
  test.describe('lectura', () => {
    test('lista organizaciones, sus espacios y los dispositivos del espacio elegido', async ({
      authenticatedPage: page,
    }) => {
      await mockSpaceDevicesApi(page);

      await openSpace(page);

      await expect(page.getByRole('heading', { name: 'Organizations', level: 2 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Main Office', level: 1 })).toBeVisible();
      await expect(page.getByText('Sensor Norte')).toBeVisible();
      await expect(page.getByText('SN-001')).toBeVisible();
    });

    test('sin organizaciones muestra el estado vacío', async ({ authenticatedPage: page }) => {
      await mockSpaceDevicesApi(page, { organizations: [] });

      await page.goto('/space-devices');

      await expect(page.getByText('No organizations found.')).toBeVisible();
      await expect(
        page.getByText('Select an organization with spaces to view devices.'),
      ).toBeVisible();
    });

    test('espacio sin dispositivos muestra el estado vacío', async ({ authenticatedPage: page }) => {
      await mockSpaceDevicesApi(page, { devices: [] });

      await openSpace(page);

      await expect(page.getByText('No devices registered in this space.')).toBeVisible();
    });

    test('error al cargar dispositivos (500) muestra el mensaje de error', async ({
      authenticatedPage: page,
    }) => {
      await mockSpaceDevicesApi(page, { devicesStatus: 500 });

      await openSpace(page);

      await expect(page.getByText('Failed to load devices')).toBeVisible();
    });

    test('cambiar entre vista Grid y List mantiene los dispositivos visibles', async ({
      authenticatedPage: page,
    }) => {
      await mockSpaceDevicesApi(page);
      await openSpace(page);

      await page.getByRole('button', { name: 'List view' }).click();
      await expect(page.locator('.device-list-item')).toBeVisible();

      await page.getByRole('button', { name: 'Grid view' }).click();
      await expect(page.locator('app-device-card mat-card')).toBeVisible();
      await expect(page.getByText('Sensor Norte')).toBeVisible();
    });

    test('abrir un dispositivo muestra su detalle y volver regresa a la lista', async ({
      authenticatedPage: page,
    }) => {
      await mockSpaceDevicesApi(page);
      await openSpace(page);

      await page.getByRole('button', { name: 'Go to device' }).click();

      await expect(page.locator('app-device-detail-panel')).toBeVisible();
      await expect(page.getByText('Thresholds')).toBeVisible();

      await page.getByRole('button', { name: 'Go back' }).click();
      await expect(page.locator('app-device-list')).toBeVisible();
    });
  });

  test.describe('organizaciones', () => {
    test('Add Organization: Create queda deshabilitado sin nombre y crea la organización', async ({
      authenticatedPage: page,
    }) => {
      const { mutations } = await mockSpaceDevicesApi(page);
      await page.goto('/space-devices');

      await page.getByRole('button', { name: 'Add Organization' }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('button', { name: 'Create' })).toBeDisabled();

      await dialog.getByLabel('Organization Name').fill('Nueva Org');
      await dialog.getByRole('button', { name: 'Create' }).click();

      await expect(page.getByText('Organization created')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Nueva Org' })).toBeVisible();
      expect(mutations).toContainEqual({
        method: 'POST',
        path: '/api/v1/organizations',
        body: { name: 'Nueva Org' },
      });
    });

    test('Add Organization: Cancel no crea nada', async ({ authenticatedPage: page }) => {
      const { mutations } = await mockSpaceDevicesApi(page);
      await page.goto('/space-devices');

      await page.getByRole('button', { name: 'Add Organization' }).click();
      await page.getByRole('dialog').getByLabel('Organization Name').fill('No guardar');
      await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

      await expect(page.getByRole('dialog')).toBeHidden();
      expect(mutations).toHaveLength(0);
    });

    test('Edit organization: renombra con PATCH', async ({ authenticatedPage: page }) => {
      const { mutations } = await mockSpaceDevicesApi(page);
      await page.goto('/space-devices');

      await page.getByRole('button', { name: 'Edit organization' }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Organization Name').fill('Org Renombrada');
      await dialog.getByRole('button', { name: 'Save' }).click();

      await expect(page.getByText('Organization updated')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Org Renombrada' })).toBeVisible();
      expect(mutations).toContainEqual({
        method: 'PATCH',
        path: `/api/v1/organizations/${ORG_ID}/name`,
        body: { name: 'Org Renombrada' },
      });
    });

    test('Delete organization: pide confirmación y elimina con DELETE', async ({
      authenticatedPage: page,
    }) => {
      const { mutations } = await mockSpaceDevicesApi(page);
      await page.goto('/space-devices');

      await page.getByRole('button', { name: 'Delete organization' }).click();
      await expect(page.getByText('Are you sure you want to delete this organization?')).toBeVisible();
      await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();

      await expect(page.getByText('Organization deleted')).toBeVisible();
      await expect(page.getByText('No organizations found.')).toBeVisible();
      expect(mutations.map((m) => `${m.method} ${m.path}`)).toContain(
        `DELETE /api/v1/organizations/${ORG_ID}`,
      );
    });

    test('Delete organization: Cancel no elimina', async ({ authenticatedPage: page }) => {
      const { mutations } = await mockSpaceDevicesApi(page);
      await page.goto('/space-devices');

      await page.getByRole('button', { name: 'Delete organization' }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

      await expect(page.getByRole('button', { name: 'Clair Org' })).toBeVisible();
      expect(mutations).toHaveLength(0);
    });
  });

  test.describe('espacios', () => {
    test('Add space crea el espacio dentro de la organización', async ({
      authenticatedPage: page,
    }) => {
      const { mutations } = await mockSpaceDevicesApi(page);
      await page.goto('/space-devices');

      await page.getByRole('button', { name: 'Add space' }).click();
      await page.getByRole('dialog').getByLabel('Space Name').fill('Sala Nueva');
      await page.getByRole('dialog').getByRole('button', { name: 'Create' }).click();

      await expect(page.getByText('Space created')).toBeVisible();
      expect(mutations).toContainEqual({
        method: 'POST',
        path: '/api/v1/spaces',
        body: { name: 'Sala Nueva' },
      });
    });

    test('Delete Space: confirma y elimina con DELETE', async ({ authenticatedPage: page }) => {
      const { mutations } = await mockSpaceDevicesApi(page);
      await openSpace(page);

      await page.getByRole('button', { name: 'More options' }).click();
      await page.getByRole('menuitem', { name: 'Delete Space' }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();

      await expect(page.getByText('Space deleted')).toBeVisible();
      expect(mutations.map((m) => `${m.method} ${m.path}`)).toContain(
        `DELETE /api/v1/spaces/${SPACE_ID}`,
      );
    });
  });

  test.describe('dispositivos', () => {
    test('Claim sensor: valida el formato del token y reclama el dispositivo', async ({
      authenticatedPage: page,
    }) => {
      const { mutations } = await mockSpaceDevicesApi(page);
      await openSpace(page);

      await page.getByRole('button', { name: 'Claim sensor' }).click();
      const dialog = page.getByRole('dialog');
      const claim = dialog.getByRole('button', { name: 'Claim', exact: true });

      await dialog.getByLabel('Claim Token').fill('x');
      await expect(claim).toBeDisabled();

      await dialog.getByLabel('Claim Token').fill('AB45-F3B1');
      await expect(claim).toBeEnabled();
      await claim.click();

      await expect(page.getByText('Sensor claimed')).toBeVisible();
      expect(mutations).toContainEqual({
        method: 'POST',
        path: '/api/v1/devices/claim',
        body: { claimToken: 'AB45-F3B1', spaceId: SPACE_ID },
      });
    });

    test('Pair sensor hardware: valida el Hardware ID y muestra el claim token', async ({
      authenticatedPage: page,
    }) => {
      const { mutations } = await mockSpaceDevicesApi(page);
      await openSpace(page);

      await page.getByRole('button', { name: 'Pair sensor hardware' }).click();
      const dialog = page.getByRole('dialog');
      const pair = dialog.getByRole('button', { name: 'Pair', exact: true });

      await dialog.getByLabel('Hardware ID').fill('INVALID');
      await expect(pair).toBeDisabled();

      await dialog.getByLabel('Hardware ID').fill('CLAIR-0001');
      await expect(pair).toBeEnabled();
      await pair.click();

      await expect(page.getByText('Sensor paired')).toBeVisible();
      expect(mutations).toContainEqual({
        method: 'POST',
        path: '/api/v1/devices/pair',
        body: { hardwareId: 'CLAIR-0001' },
      });
    });

    test('Delete Device desde el detalle: confirma y elimina con DELETE', async ({
      authenticatedPage: page,
    }) => {
      const { mutations } = await mockSpaceDevicesApi(page);
      await openSpace(page);
      await page.getByRole('button', { name: 'Go to device' }).click();

      await page.getByRole('button', { name: 'More options' }).click();
      await page.getByRole('menuitem', { name: 'Delete Device' }).click();
      await expect(page.getByRole('dialog')).toContainText('Sensor Norte');
      await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();

      await expect(page.getByText('Device deleted')).toBeVisible();
      expect(mutations.map((m) => `${m.method} ${m.path}`)).toContain(
        `DELETE /api/v1/devices/${DEVICE_ID}`,
      );
    });
  });
});
