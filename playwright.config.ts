import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'devices',
      testMatch: /devices\.spec\.ts/,
      use: {
        // Un solo test con login incluido: el video cubre todo el recorrido y queda en el
        // reporte HTML (npx playwright show-report).
        video: 'on',
        trace: 'on',
        launchOptions: { slowMo: 1000 },
      },
    },
  ],
  // Front local contra el backend real (proxy de /api a clair-api.giks.net).
  webServer: {
    command: 'npx ng serve --configuration production --proxy-config tests/proxy.conf.json',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
