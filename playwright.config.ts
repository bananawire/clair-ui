import { defineConfig, devices } from '@playwright/test';

try {
  process.loadEnvFile('.env');
} catch {
}

const AUTH_FILE = 'playwright/.auth/user.json';

const projectArgs = process.argv
  .map((a, i, all) => (a.startsWith('--project=') ? a.slice(10) : a === '--project' ? all[i + 1] : ''))
  .filter(Boolean);
const needsWebServer = projectArgs.length === 0 || projectArgs.includes('mocked');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: process.env.E2E_BASE_URL, trace: 'off', screenshot: 'off' },
    },
    {
      name: 'mocked',
      testIgnore: [/real\//, /\.real\.spec\.ts/, /auth\.setup\.ts/],
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4200' },
    },
    {
      name: 'real',
      testMatch: [/real\/.*\.spec\.ts/, /\.real\.spec\.ts/],
      dependencies: ['setup'],
      fullyParallel: false,
      workers: 1,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.E2E_BASE_URL,
        storageState: AUTH_FILE,
        trace: 'off',
        screenshot: 'off',
        video: 'off',
      },
    },
  ],
  webServer: needsWebServer
    ? {
        command: 'npx ng serve --configuration production',
        url: 'http://localhost:4200',
        reuseExistingServer: true,
        timeout: 240_000,
      }
    : undefined,
});
