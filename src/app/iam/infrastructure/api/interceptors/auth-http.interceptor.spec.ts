import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthHttpInterceptor } from './auth-http.interceptor';
import { TOKEN_STORAGE_GATEWAY } from '../../storage/token-storage.gateway';
import { API_CONFIG } from '../../../../api.config';

describe('AuthHttpInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  const router = { navigate: vi.fn() };
  const tokenStorage = {
    getAccessToken: vi.fn<() => string | null>(() => null),
    getRefreshToken: vi.fn<() => string | null>(() => null),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
  };

  const baseUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.iam;
  const privateUrl = `${API_CONFIG.baseUrl}/v1/devices`;

  beforeEach(() => {
    vi.resetAllMocks();
    tokenStorage.getAccessToken.mockReturnValue(null);
    tokenStorage.getRefreshToken.mockReturnValue(null);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
        { provide: Router, useValue: router },
        { provide: TOKEN_STORAGE_GATEWAY, useValue: tokenStorage },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  describe('rutas públicas', () => {
    it.each([
      `${baseUrl}/sign-up`,
      `${baseUrl}/sign-in`,
      `${baseUrl}/confirm`,
      `${baseUrl}/refresh`,
    ])('no añade Authorization en %s', (url) => {
      tokenStorage.getAccessToken.mockReturnValue('token-1');

      http.get(url).subscribe();

      const req = httpTesting.expectOne(url);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  describe('rutas privadas', () => {
    it('no añade Authorization si no hay token', () => {
      http.get(privateUrl).subscribe();

      const req = httpTesting.expectOne(privateUrl);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('añade Authorization: Bearer <token> si hay token', () => {
      tokenStorage.getAccessToken.mockReturnValue('token-1');

      http.get(privateUrl).subscribe();

      const req = httpTesting.expectOne(privateUrl);
      expect(req.request.headers.get('Authorization')).toBe('Bearer token-1');
      req.flush({});
    });
  });

  describe('manejo de 401', () => {
    it('refresca el token y reintenta la petición', () => {
      tokenStorage.getAccessToken.mockReturnValue('old-token');
      tokenStorage.getRefreshToken.mockReturnValue('refresh-1');

      http.get(privateUrl).subscribe();

      // 1) primera petición con token viejo
      const first = httpTesting.expectOne(privateUrl);
      expect(first.request.headers.get('Authorization')).toBe('Bearer old-token');
      first.flush({}, { status: 401, statusText: 'Unauthorized' });

      // 2) llamada al endpoint de refresh
      const refresh = httpTesting.expectOne(`${baseUrl}/refresh`);
      expect(refresh.request.method).toBe('POST');
      expect(refresh.request.body).toEqual({ refreshToken: 'refresh-1' });
      refresh.flush({ token: 'new-token', refreshToken: 'new-refresh' });

      // 3) reintento con el token nuevo
      const retry = httpTesting.expectOne(privateUrl);
      expect(retry.request.headers.get('Authorization')).toBe('Bearer new-token');
      retry.flush({});

      // 4) el storage se actualizó
      expect(tokenStorage.setTokens).toHaveBeenCalledWith('new-token', 'new-refresh');
    });

    it('si no hay refresh token hace logout y navega a /login', () => {
      tokenStorage.getAccessToken.mockReturnValue('old-token');
      tokenStorage.getRefreshToken.mockReturnValue(null);

      http.get(privateUrl).subscribe({ error: () => {} });

      const req = httpTesting.expectOne(privateUrl);
      req.flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(tokenStorage.clearTokens).toHaveBeenCalledOnce();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('si el refresh falla hace logout y propaga el error', () => {
      tokenStorage.getAccessToken.mockReturnValue('old-token');
      tokenStorage.getRefreshToken.mockReturnValue('refresh-1');

      let caughtError: unknown;
      http.get(privateUrl).subscribe({ error: (e) => (caughtError = e) });

      const first = httpTesting.expectOne(privateUrl);
      first.flush({}, { status: 401, statusText: 'Unauthorized' });

      const refresh = httpTesting.expectOne(`${baseUrl}/refresh`);
      refresh.flush({}, { status: 500, statusText: 'Server Error' });

      expect(tokenStorage.clearTokens).toHaveBeenCalledOnce();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(caughtError).toBeTruthy();
    });

    it('no intenta refresh si el 401 llega sin token previo', () => {
      tokenStorage.getAccessToken.mockReturnValue(null);

      let caughtError: unknown;
      http.get(privateUrl).subscribe({ error: (e) => (caughtError = e) });

      const req = httpTesting.expectOne(privateUrl);
      req.flush({}, { status: 401, statusText: 'Unauthorized' });

      // No hay llamada a /refresh
      httpTesting.expectNone(`${baseUrl}/refresh`);
      expect(caughtError).toBeTruthy();
      expect(tokenStorage.clearTokens).not.toHaveBeenCalled();
    });
  });

  describe('errores distintos a 401', () => {
    it('los propaga sin tocar el storage ni el router', () => {
      tokenStorage.getAccessToken.mockReturnValue('token-1');

      let caughtError: unknown;
      http.get(privateUrl).subscribe({ error: (e) => (caughtError = e) });

      const req = httpTesting.expectOne(privateUrl);
      req.flush({}, { status: 500, statusText: 'Server Error' });

      expect(caughtError).toBeTruthy();
      expect(tokenStorage.clearTokens).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});