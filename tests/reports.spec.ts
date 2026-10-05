import { test, expect } from './fixtures/auth';
import type { Page } from '@playwright/test';
import { DEVICE_ID, mockDeviceTree, type DeviceTreeOptions, type MockResponse } from './fixtures/device-tree';

const dailyReport = {
  deviceId: DEVICE_ID,
  date: '2026-10-04',
  co2: { avg: 801.2, min: 600.1, max: 1010.9 },
  pm2_5: { avg: 12.5, min: 3.1, max: 35.4 },
  temperature: { avg: 23.4, min: 20.2, max: 26.8 },
  humidity: { avg: 55.5, min: 40.3, max: 70.7 },
  peakPm2_5: 35.4,
  peakPm2_5At: '2026-10-04T14:30:00Z',
  averageAqi: 42,
  dominantAqiCategory: 'GOOD',
  categoryShares: [
    { category: 'GOOD', count: 1000, percentage: 80 },
    { category: 'MODERATE', count: 250, percentage: 20 },
  ],
  readingCount: 1250,
  aqiDeltaPct: 3.2,
};

const monthlyReport = {
  ...Object.fromEntries(Object.entries(dailyReport).filter(([key]) => key !== 'date')),
  month: '2026-09',
  daysCovered: 30,
  readingCount: 43200,
};

const base64Url = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
const fakeJwt = `${base64Url({ alg: 'none' })}.${base64Url({ sub: 'user-1' })}.signature`;

type Options = DeviceTreeOptions & {
  daily?: MockResponse;
  monthly?: MockResponse;
};

async function mockReportsApi(page: Page, options: Options = {}): Promise<string[]> {
  const requests: string[] = [];

  await mockDeviceTree(page, options);
  await page.route('**/api/v1/analytics/devices/*/reports/daily**', (route) => {
    requests.push(new URL(route.request().url()).pathname);
    return route.fulfill(options.daily ?? { status: 200, json: dailyReport });
  });
  await page.route('**/api/v1/analytics/devices/*/reports/monthly**', (route) => {
    requests.push(new URL(route.request().url()).pathname);
    return route.fulfill(options.monthly ?? { status: 200, json: monthlyReport });
  });

  return requests;
}

async function mockPlan(page: Page, plan: 'FREEMIUM' | 'PREMIUM'): Promise<void> {
  await page.addInitScript((token) => {
    window.localStorage.setItem('accessToken', token);
  }, fakeJwt);
  await page.route('**/api/v1/subscriptions/plans/*', (route) =>
    route.fulfill({
      status: 200,
      json: {
        userId: 'user-1',
        plan,
        subscriptionStatus: plan === 'PREMIUM' ? 'COMPLETED' : null,
      },
    }),
  );
}

test.describe('Reports', () => {
  test('muestra el reporte diario con resumen y tablas de estadísticas', async ({
    authenticatedPage: page,
  }) => {
    const requests = await mockReportsApi(page);

    await page.goto('/reports');

    await expect(page.getByRole('heading', { name: 'Reports', level: 1 })).toBeVisible();
    const selects = page.getByRole('combobox');
    await expect(selects.nth(0)).toContainText('Clair Org');
    await expect(selects.nth(1)).toContainText('Main Office');
    await expect(selects.nth(2)).toContainText('Sensor Norte');

    await expect(page.getByText('2026-10-04', { exact: true })).toBeVisible();
    await expect(page.getByText('AVERAGE AQI')).toBeVisible();
    await expect(page.getByText('PEAK PM2.5')).toBeVisible();
    await expect(page.getByText('1,250', { exact: true })).toBeVisible();
    await expect(page.getByText('+3.2%')).toBeVisible();
    await expect(page.getByText('vs previous day')).toBeVisible();

    const statsTable = page.locator('table').first();
    await expect(statsTable.getByRole('row', { name: /CO₂/ })).toContainText('801.2');
    await expect(statsTable.getByRole('row', { name: /CO₂/ })).toContainText('600.1');
    await expect(statsTable.getByRole('row', { name: /CO₂/ })).toContainText('1010.9');

    const categoryTable = page.locator('table').nth(1);
    await expect(categoryTable.getByRole('row', { name: /Good/ })).toContainText('80.0%');
    await expect(categoryTable.getByRole('row', { name: /Moderate/ })).toContainText('20.0%');

    expect(requests.some((r) => r.includes(`/devices/${DEVICE_ID}/reports/daily`))).toBe(true);
  });

  test('sin reporte para el periodo (404) muestra el estado vacío', async ({
    authenticatedPage: page,
  }) => {
    await mockReportsApi(page, { daily: { status: 404, json: { message: 'Not found' } } });

    await page.goto('/reports');

    await expect(page.getByText('No report available')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export CSV' })).toBeDisabled();
  });

  test('error del servidor (500) al cargar el reporte muestra el mensaje de error', async ({
    authenticatedPage: page,
  }) => {
    await mockReportsApi(page, { daily: { status: 500, json: { message: 'Internal error' } } });

    await page.goto('/reports');

    await expect(page.getByText('Failed to load the report. Please try again.')).toBeVisible();
  });

  test('acceso denegado (403) al reporte muestra el mensaje de permisos', async ({
    authenticatedPage: page,
  }) => {
    await mockReportsApi(page, { daily: { status: 403, json: { message: 'Forbidden' } } });

    await page.goto('/reports');

    await expect(page.getByText("You do not have access to this device's reports.")).toBeVisible();
  });

  test('usuario Free: el reporte mensual muestra el upsell y no consulta la API mensual', async ({
    authenticatedPage: page,
  }) => {
    await mockPlan(page, 'FREEMIUM');
    const requests = await mockReportsApi(page);

    await page.goto('/reports');
    await expect(page.getByText('AVERAGE AQI')).toBeVisible();

    await page.getByRole('button', { name: 'Monthly' }).click();

    await expect(page.getByText('Monthly reports are a premium feature')).toBeVisible();
    await expect(page.locator('app-reports-page').getByRole('link', { name: 'Upgrade Plan' })).toHaveAttribute(
      'href',
      '/select-plan',
    );
    expect(requests.some((r) => r.includes('/reports/monthly'))).toBe(false);
  });

  test('usuario Premium: el reporte mensual consulta la API mensual y muestra los días cubiertos', async ({
    authenticatedPage: page,
  }) => {
    await mockPlan(page, 'PREMIUM');
    const requests = await mockReportsApi(page);

    await page.goto('/reports');
    await expect(page.getByText('AVERAGE AQI')).toBeVisible();

    await page.getByRole('button', { name: 'Monthly' }).click();

    await expect(page.getByText('2026-09', { exact: true })).toBeVisible();
    await expect(page.getByText('30 days covered')).toBeVisible();
    await expect(page.getByText('43,200', { exact: true })).toBeVisible();
    await expect(page.getByText('vs previous month')).toBeVisible();
    await expect(page.getByText('Monthly reports are a premium feature')).toBeHidden();
    expect(requests.some((r) => r.includes(`/devices/${DEVICE_ID}/reports/monthly`))).toBe(true);
  });

  test('Export CSV descarga un archivo con el contenido del reporte', async ({
    authenticatedPage: page,
  }) => {
    await mockReportsApi(page);

    await page.goto('/reports');
    const exportButton = page.getByRole('button', { name: 'Export CSV' });
    await expect(exportButton).toBeEnabled();

    const [download] = await Promise.all([page.waitForEvent('download'), exportButton.click()]);

    expect(download.suggestedFilename()).toMatch(/^report.*\.csv$/);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const csv = Buffer.concat(chunks).toString('utf-8');
    expect(csv).toContain('Report,DAILY');
    expect(csv).toContain(`Device,${DEVICE_ID}`);
    expect(csv).toContain('Period,2026-10-04');
    expect(csv).toContain('co2,801.2,600.1,1010.9');
    expect(csv).toContain('GOOD,1000,80');
  });

  test('error al cargar organizaciones (500) muestra el mensaje de error', async ({
    authenticatedPage: page,
  }) => {
    await mockReportsApi(page, {
      organizations: { status: 500, json: { message: 'Internal error' } },
    });

    await page.goto('/reports');

    await expect(page.getByText('Failed to load organizations. Please try again.')).toBeVisible();
  });
});
