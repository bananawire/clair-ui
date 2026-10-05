import { test, expect } from './fixtures/auth';
import type { Page } from '@playwright/test';

const makeAlert = (overrides: Record<string, unknown> = {}) => ({
  id: 'a0000000-0000-0000-0000-000000000001',
  deviceId: 'd0000000-0000-0000-0000-000000000001',
  spaceId: 's0000000-0000-0000-0000-000000000001',
  spaceName: 'Main Office',
  deviceName: 'Sensor Norte',
  metric: 'CO2',
  metricLabel: 'CO2',
  metricUnit: 'ppm',
  thresholdValue: 1000,
  actualValue: 1450,
  message: 'High CO2 levels',
  status: 'ACTIVE',
  severity: 'CRITICAL',
  occurredAt: new Date().toISOString(),
  resolvedAt: null,
  createdAt: new Date().toISOString(),
  ...overrides,
});

const pageOf = (content: unknown[], totalPages = 1, number = 0) => ({
  content,
  totalElements: content.length,
  totalPages,
  size: 20,
  number,
});

const dailySummary = [
  { date: '2026-10-03', count: 2 },
  { date: '2026-10-04', count: 5 },
];

type AlertsRequest = { page: string | null; status: string[] };

async function mockAlertsApi(
  page: Page,
  handler: (req: AlertsRequest) => { status: number; json: unknown },
): Promise<AlertsRequest[]> {
  const requests: AlertsRequest[] = [];

  await page.route('**/api/v1/alerts/daily-summary**', (route) =>
    route.fulfill({ status: 200, json: dailySummary }),
  );
  await page.route('**/api/v1/alerts?**', (route) => {
    const url = new URL(route.request().url());
    const req = { page: url.searchParams.get('page'), status: url.searchParams.getAll('status') };
    requests.push(req);
    return route.fulfill(handler(req));
  });

  return requests;
}

test.describe('Alerts', () => {
  test('Active Alerts pide los estados ACTIVE y ACKNOWLEDGED y muestra las alertas', async ({
    authenticatedPage: page,
  }) => {
    const requests = await mockAlertsApi(page, () => ({
      status: 200,
      json: pageOf([
        makeAlert(),
        makeAlert({
          id: 'a0000000-0000-0000-0000-000000000002',
          deviceName: 'Sensor Sur',
          spaceName: null,
          metric: 'PM25',
          severity: 'WARNING',
          status: 'ACKNOWLEDGED',
        }),
      ]),
    }));

    await page.goto('/alerts');

    await expect(page.getByRole('heading', { name: 'Alerts', level: 1 })).toBeVisible();
    await expect(page.getByText('Sensor Norte')).toBeVisible();
    await expect(page.getByText('Sensor Sur')).toBeVisible();
    await expect(page.getByText('Main Office')).toBeVisible();
    await expect(page.getByText('CRITICAL', { exact: true })).toBeVisible();
    await expect(page.getByText('WARNING', { exact: true })).toBeVisible();
    await expect(page.getByText('ACKNOWLEDGED', { exact: true })).toBeVisible();
    await expect(page.getByText('No alerts found')).toBeHidden();

    expect(requests[0].page).toBe('0');
    expect(requests[0].status.sort()).toEqual(['ACKNOWLEDGED', 'ACTIVE']);
  });

  test('muestra estado vacío cuando no hay alertas', async ({ authenticatedPage: page }) => {
    await mockAlertsApi(page, () => ({ status: 200, json: pageOf([]) }));

    await page.goto('/alerts');

    await expect(page.getByText('No alerts found')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeHidden();
  });

  test('la pestaña History pide solo el estado RESOLVED', async ({ authenticatedPage: page }) => {
    const requests = await mockAlertsApi(page, (req) => ({
      status: 200,
      json: pageOf(
        req.status.includes('RESOLVED')
          ? [makeAlert({ deviceName: 'Sensor Historico', status: 'RESOLVED', severity: 'LOW' })]
          : [],
      ),
    }));

    await page.goto('/alerts');
    await page.getByRole('button', { name: 'History' }).click();

    await expect(page.getByText('Sensor Historico')).toBeVisible();
    await expect(page.getByText('RESOLVED', { exact: true })).toBeVisible();
    expect(requests.at(-1)?.status).toEqual(['RESOLVED']);
  });

  test('la paginación pide la página siguiente y la anterior', async ({ authenticatedPage: page }) => {
    const requests = await mockAlertsApi(page, (req) => ({
      status: 200,
      json: pageOf([makeAlert({ deviceName: `Sensor pag ${req.page}` })], 2, Number(req.page)),
    }));

    await page.goto('/alerts');

    await expect(page.getByText('Page 1 of 2')).toBeVisible();
    await expect(page.getByRole('button', { name: /Previous/ })).toBeDisabled();

    await page.getByRole('button', { name: /Next/ }).click();
    await expect(page.getByText('Sensor pag 1')).toBeVisible();
    await expect(page.getByText('Page 2 of 2')).toBeVisible();
    await expect(page.getByRole('button', { name: /Next/ })).toBeDisabled();
    expect(requests.at(-1)?.page).toBe('1');

    await page.getByRole('button', { name: /Previous/ }).click();
    await expect(page.getByText('Page 1 of 2')).toBeVisible();
    expect(requests.at(-1)?.page).toBe('0');
  });

  test('cuando la API falla (500) no se muestran alertas y la página sigue en pie', async ({
    authenticatedPage: page,
  }) => {
    await mockAlertsApi(page, () => ({ status: 500, json: { message: 'Internal error' } }));

    await page.goto('/alerts');

    await expect(page.getByRole('heading', { name: 'Alerts', level: 1 })).toBeVisible();
    await expect(page.getByText('Sensor Norte')).toBeHidden();
    await expect(page.getByText('No alerts found')).toBeVisible();
  });
});
