import { test, expect } from './fixtures/auth';

const fullOverviewResponse = {
  core: {
    aqiValue: 42,
    aqiCategory: 'GOOD',
    averageCo2: 450,
    averagePm2_5: 12.5,
    averageTemperature: 23.4,
    averageHumidity: 55,
    co2DeltaPercentage: 2.5,
    pm2_5DeltaPercentage: -1.2,
    temperatureDeltaPercentage: 0.5,
    humidityDeltaPercentage: 1.1,
    recordedAt: new Date().toISOString(),
    organizationCount: 1,
    spaceCount: 1,
    deviceCount: 3,
    dataFreshness: 'LIVE',
  },
  organizations: [
    {
      organizationId: 'org-1',
      organizationName: 'Clair Org',
      spaces: [
        {
          spaceId: 'space-1',
          organizationId: 'org-1',
          spaceName: 'Main Office',
          aqiValue: 42,
          aqiCategory: 'GOOD',
          recordedAt: new Date().toISOString(),
          deviceCount: 3,
          dataFreshness: 'LIVE',
        },
      ],
    },
  ],
  alerts: [
    {
      alertId: 'alert-1',
      deviceId: 'device-1',
      spaceId: 'space-1',
      deviceName: 'Sensor 1',
      spaceName: 'Main Office',
      message: 'High CO2 levels',
      severity: 'HIGH',
      status: 'OPEN',
      occurredAt: new Date().toISOString(),
    },
  ],
  updatedAt: new Date().toISOString(),
};

const emptyOverviewResponse = {
  core: {
    aqiValue: null,
    aqiCategory: null,
    averageCo2: null,
    averagePm2_5: null,
    averageTemperature: null,
    averageHumidity: null,
    co2DeltaPercentage: null,
    pm2_5DeltaPercentage: null,
    temperatureDeltaPercentage: null,
    humidityDeltaPercentage: null,
    recordedAt: null,
    organizationCount: 0,
    spaceCount: 0,
    deviceCount: 0,
    dataFreshness: 'NO_DATA',
  },
  organizations: [],
  alerts: [],
  updatedAt: new Date().toISOString(),
};

test.describe('Overview', () => {
  test('muestra las tarjetas de resumen con datos mockeados', async ({ authenticatedPage: page }) => {
    await page.route('**/api/v1/analytics/overview**', (route) =>
      route.fulfill({ status: 200, json: fullOverviewResponse }),
    );

    await page.goto('/overview');

    await expect(page.locator('app-aqi-card').getByText('42', { exact: true })).toBeVisible();
    await expect(page.locator('app-aqi-card').getByText('Good', { exact: true })).toBeVisible();
    await expect(page.getByText('3 devices')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Main Office' })).toBeVisible();
  });

  // DEFECTO CONOCIDO: igual que en /confirm (ver tests/confirm.spec.ts), aca
  // en alerts-card.component.ts y organization-card.component.ts, ngOnInit llama
  // translate.instant() antes de que terminen de cargar las traducciones, así que se
  // muestran las claves crudas en vez del texto. Se retrasa la
  // respuesta de las traducciones a propósito para forzar la carrera de forma determinista.
  test('muestra estado vacío cuando no hay mediciones', async ({ authenticatedPage: page }) => {
    test.fail();
    await page.route('**/*/en.json', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.continue();
    });
    await page.route('**/api/v1/analytics/overview**', (route) =>
      route.fulfill({ status: 200, json: emptyOverviewResponse }),
    );

    await page.goto('/overview');

    await expect(page.getByText('No alerts available')).toBeVisible();
    await expect(page.getByText('No organizations available')).toBeVisible();
  });

  test('muestra error cuando la API falla (500)', async ({ authenticatedPage: page }) => {
    await page.route('**/api/v1/analytics/overview**', (route) =>
      route.fulfill({ status: 500, json: { message: 'Internal error' } }),
    );

    await page.goto('/overview');

    await expect(page.getByText('Unable to load overview right now.')).toBeVisible();
  });
});
