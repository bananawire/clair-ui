import { test, expect } from './fixtures/auth';
import type { Page } from '@playwright/test';
import { DEVICE_ID, mockDeviceTree, type DeviceTreeOptions, type MockResponse } from './fixtures/device-tree';

const metrics = {
  aqiValue: 42,
  aqiCategory: 'GOOD',
  averageCo2: 801,
  averagePm2_5: 12.5,
  averageTemperature: 23.4,
  averageHumidity: 55,
  co2DeltaPercentage: 2.5,
  pm2_5DeltaPercentage: -1.2,
  temperatureDeltaPercentage: 0.5,
  humidityDeltaPercentage: 1.1,
  calculatedAt: new Date().toISOString(),
};

const trends = {
  dataPoints: [0, 1, 2, 3].map((i) => ({
    timestamp: new Date(Date.now() - (3 - i) * 60_000).toISOString(),
    aqiValue: 40 + i,
    co2: 800 + i,
    pm2_5: 12 + i,
    temperature: 23,
    humidity: 55,
  })),
};

type Options = DeviceTreeOptions & {
  live?: MockResponse;
  historical?: MockResponse;
  trends?: MockResponse;
};

async function mockAnalyticsApi(page: Page, options: Options = {}): Promise<string[]> {
  const requests: string[] = [];
  const ok = (json: unknown) => ({ status: 200, json });

  await mockDeviceTree(page, options);
  await page.route('**/api/v1/analytics/devices/*/live/stream**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: 'event: connected\ndata: ok\n\n',
    }),
  );
  await page.route('**/api/v1/analytics/devices/*/live', (route) => {
    requests.push(new URL(route.request().url()).pathname);
    return route.fulfill(options.live ?? ok(metrics));
  });
  await page.route('**/api/v1/analytics/devices/*/historical**', (route) => {
    const url = new URL(route.request().url());
    requests.push(`${url.pathname}?${url.searchParams.toString()}`);
    return route.fulfill(options.historical ?? ok(metrics));
  });
  await page.route('**/api/v1/analytics/devices/*/trends**', (route) => {
    const url = new URL(route.request().url());
    requests.push(`${url.pathname}?${url.searchParams.toString()}`);
    return route.fulfill(options.trends ?? ok(trends));
  });

  return requests;
}

test.describe('Analytics', () => {
  test('carga la jerarquía organización > espacio > dispositivo y muestra las métricas en LIVE', async ({
    authenticatedPage: page,
  }) => {
    const requests = await mockAnalyticsApi(page);

    await page.goto('/analytics');

    await expect(page.getByRole('heading', { name: 'Air Quality', level: 1 })).toBeVisible();
    const selects = page.getByRole('combobox');
    await expect(selects.nth(0)).toContainText('Clair Org');
    await expect(selects.nth(1)).toContainText('Main Office');
    await expect(selects.nth(2)).toContainText('Sensor Norte');

    await expect(page.getByText('AIR QUALITY INDEX')).toBeVisible();
    await expect(page.getByText('801.00', { exact: true })).toBeVisible();
    await expect(page.getByText('12.50', { exact: true })).toBeVisible();
    await expect(page.getByText('23.40', { exact: true })).toBeVisible();
    await expect(page.getByText('55.00', { exact: true })).toBeVisible();
    await expect(page.getByText('TREND (AQI)')).toBeVisible();
    await expect(page.getByText('No measurements available')).toBeHidden();

    expect(requests).toContain(`/api/v1/analytics/devices/${DEVICE_ID}/live`);
    expect(requests.some((r) => r.includes(`/devices/${DEVICE_ID}/trends?period=DAY`))).toBe(true);
  });

  test('cambiar el rango a Week consulta el histórico con el periodo correcto', async ({
    authenticatedPage: page,
  }) => {
    const requests = await mockAnalyticsApi(page);

    await page.goto('/analytics');
    await expect(page.getByText('AIR QUALITY INDEX')).toBeVisible();

    await page.getByRole('button', { name: 'Week', exact: true }).click();

    await expect
      .poll(() => requests.some((r) => r.includes(`/devices/${DEVICE_ID}/historical?period=Week`)))
      .toBe(true);
    expect(requests.some((r) => r.includes(`/devices/${DEVICE_ID}/trends?period=WEEK`))).toBe(true);
    await expect(page.getByText('AIR QUALITY INDEX')).toBeVisible();
  });

  test('seleccionar una métrica cambia el título de la gráfica de tendencia', async ({
    authenticatedPage: page,
  }) => {
    await mockAnalyticsApi(page);

    await page.goto('/analytics');
    await expect(page.getByText('TREND (AQI)')).toBeVisible();

    await page.getByText('CO₂', { exact: true }).click();

    await expect(page.getByText('TREND (CO2)')).toBeVisible();
  });

  test('LIVE no disponible (404) muestra el mensaje de la API con el nombre del dispositivo', async ({
    authenticatedPage: page,
  }) => {
    await mockAnalyticsApi(page, {
      live: { status: 404, json: { message: `No live data for device ${DEVICE_ID}` } },
      trends: { status: 200, json: { dataPoints: [] } },
    });

    await page.goto('/analytics');

    await expect(page.getByText('No live data for device "Sensor Norte"')).toBeVisible();
  });

  test('sin mediciones muestra el estado vacío', async ({ authenticatedPage: page }) => {
    await mockAnalyticsApi(page, {
      live: { status: 500, json: { message: 'Internal error' } },
      trends: { status: 200, json: { dataPoints: [] } },
    });

    await page.goto('/analytics');

    await expect(page.getByText('No measurements available')).toBeVisible();
    await expect(page.getByText('AIR QUALITY INDEX')).toBeHidden();
  });

  test('sin organizaciones muestra el estado vacío y no consulta analytics', async ({
    authenticatedPage: page,
  }) => {
    const requests = await mockAnalyticsApi(page, { organizations: { status: 200, json: [] } });

    await page.goto('/analytics');

    await expect(page.getByText('No measurements available')).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  test('error al cargar organizaciones (500) muestra el mensaje de error', async ({
    authenticatedPage: page,
  }) => {
    await mockAnalyticsApi(page, {
      organizations: { status: 500, json: { message: 'Internal error' } },
    });

    await page.goto('/analytics');

    await expect(page.getByText('Failed to load organizations. Please try again.')).toBeVisible();
  });

  test('error al cargar espacios (500) muestra el mensaje de error', async ({
    authenticatedPage: page,
  }) => {
    await mockAnalyticsApi(page, { spaces: { status: 500, json: { message: 'Internal error' } } });

    await page.goto('/analytics');

    await expect(page.getByText('Failed to load spaces.')).toBeVisible();
  });

  test('error al cargar dispositivos (500) muestra el mensaje de error', async ({
    authenticatedPage: page,
  }) => {
    await mockAnalyticsApi(page, { devices: { status: 500, json: { message: 'Internal error' } } });

    await page.goto('/analytics');

    await expect(page.getByText('Failed to load devices.')).toBeVisible();
  });
});
