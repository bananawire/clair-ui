import type { Page } from '@playwright/test';

export const ORG_ID = 'o0000000-0000-0000-0000-000000000001';
export const SPACE_ID = 's0000000-0000-0000-0000-000000000001';
export const DEVICE_ID = 'd0000000-0000-0000-0000-000000000001';

export const organization = {
  id: ORG_ID,
  name: 'Clair Org',
  ownerUserId: 'u-1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

export const space = {
  id: SPACE_ID,
  name: 'Main Office',
  organizationId: ORG_ID,
  ownerUserId: 'u-1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

export const device = {
  id: DEVICE_ID,
  serialNumber: 'SN-001',
  name: 'Sensor Norte',
  status: 'ONLINE',
  spaceId: SPACE_ID,
  ownerUserId: 'u-1',
  configuration: {},
  thresholds: [],
  hardwareId: 'CLAIR-0001',
  deviceType: 'AIR_QUALITY',
  activatedAt: null,
  lastSeenAt: null,
  createdAt: null,
  updatedAt: null,
};

export type MockResponse = { status: number; json: unknown };

export type DeviceTreeOptions = {
  organizations?: MockResponse;
  spaces?: MockResponse;
  devices?: MockResponse;
};

export async function mockDeviceTree(page: Page, options: DeviceTreeOptions = {}): Promise<void> {
  const ok = (json: unknown) => ({ status: 200, json });

  await page.route('**/api/v1/organizations', (route) =>
    route.fulfill(options.organizations ?? ok([organization])),
  );
  await page.route('**/api/v1/spaces?**', (route) =>
    route.fulfill(options.spaces ?? ok([space])),
  );
  await page.route('**/api/v1/devices?**', (route) =>
    route.fulfill(
      options.devices ??
        ok({ content: [device], totalElements: 1, totalPages: 1, size: 20, number: 0 }),
    ),
  );
}
