import { LocalTokenStorageGateway } from './local-token-storage.gateway';

describe('LocalTokenStorageGateway', () => {
  let gateway: LocalTokenStorageGateway;

  beforeEach(() => {
    localStorage.clear();
    gateway = new LocalTokenStorageGateway();
  });

  afterEach(() => localStorage.clear());

  it('getAccessToken devuelve null si no hay token', () => {
    expect(gateway.getAccessToken()).toBeNull();
  });

  it('getRefreshToken devuelve null si no hay token', () => {
    expect(gateway.getRefreshToken()).toBeNull();
  });

  it('setTokens guarda ambos tokens en localStorage', () => {
    gateway.setTokens('access-1', 'refresh-1');

    expect(localStorage.getItem('accessToken')).toBe('access-1');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-1');
  });

  it('getAccessToken y getRefreshToken leen los valores guardados', () => {
    gateway.setTokens('access-1', 'refresh-1');

    expect(gateway.getAccessToken()).toBe('access-1');
    expect(gateway.getRefreshToken()).toBe('refresh-1');
  });

  it('setTokens sobrescribe tokens previos', () => {
    gateway.setTokens('old-access', 'old-refresh');
    gateway.setTokens('new-access', 'new-refresh');

    expect(gateway.getAccessToken()).toBe('new-access');
    expect(gateway.getRefreshToken()).toBe('new-refresh');
  });

  it('clearTokens borra ambos tokens', () => {
    gateway.setTokens('access-1', 'refresh-1');
    gateway.clearTokens();

    expect(gateway.getAccessToken()).toBeNull();
    expect(gateway.getRefreshToken()).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('clearTokens no falla si no había tokens', () => {
    expect(() => gateway.clearTokens()).not.toThrow();
  });
});