import { environment } from '../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiBaseUrl,
  endpoints: {
    iam: '/v1/auth',
    subscriptions: '/v1/subscriptions',
    notifications: '/v1/notifications',
    organizations: '/v1/organizations',
    spaces: '/v1/spaces',
    devices: '/v1/devices',
    evaluations: '/v1/evaluations',
    analytics: '/v1/analytics',
    assistant: '/v1/assistant'
  }
} as const;
