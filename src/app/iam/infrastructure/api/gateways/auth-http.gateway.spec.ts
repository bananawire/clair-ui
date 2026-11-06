import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthHttpGateway } from './auth-http.gateway';
import { API_CONFIG } from '../../../../api.config';

describe('AuthHttpGateway', () => {
  let gateway: AuthHttpGateway;
  let http: HttpTestingController;

  const baseUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.iam;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    gateway = TestBed.inject(AuthHttpGateway);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('signUp', () => {
    it('hace POST a /sign-up con el body', () => {
      const body = { email: 'usuario@test.com', password: 'Clave1!A' };

      gateway.signUp(body).subscribe();

      const request = http.expectOne(`${baseUrl}/sign-up`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(body);
      request.flush({ sessionId: 's-1', message: 'ok' });
    });
  });

  describe('signIn', () => {
    it('hace POST a /sign-in con el body', () => {
      const body = { email: 'usuario@test.com', password: 'Clave1!A' };

      gateway.signIn(body).subscribe();

      const request = http.expectOne(`${baseUrl}/sign-in`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(body);
      request.flush({ token: 'a', refreshToken: 'r' });
    });
  });

  describe('refreshToken', () => {
    it('hace POST a /refresh con el body', () => {
      const body = { refreshToken: 'refresh-1' };

      gateway.refreshToken(body).subscribe();

      const request = http.expectOne(`${baseUrl}/refresh`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(body);
      request.flush({ token: 'a', refreshToken: 'r' });
    });
  });

  describe('confirmRegistration', () => {
    it('hace POST a /confirm con sessionId y verificationCode', () => {
      const body = { sessionId: 'session-1', verificationCode: 'ABCD-1234' };

      gateway.confirmRegistration(body).subscribe();

      const request = http.expectOne(`${baseUrl}/confirm`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(body);
      request.flush({ id: 'user-1', email: 'usuario@test.com' });
    });
  });

  describe('verifyToken', () => {
    it('hace GET a /verify', () => {
      gateway.verifyToken().subscribe();

      const request = http.expectOne(`${baseUrl}/verify`);
      expect(request.request.method).toBe('GET');
      request.flush({ valid: true, email: 'usuario@test.com', expiresAt: '2026-10-04T10:00:00Z' });
    });
  });

  describe('signOut', () => {
    it('hace DELETE a /sign-out', () => {
      gateway.signOut().subscribe();

      const request = http.expectOne(`${baseUrl}/sign-out`);
      expect(request.request.method).toBe('DELETE');
      request.flush(null);
    });
  });

  describe('googleSignIn', () => {
    it('hace POST a /google/sign-in con el idToken', () => {
      const body = { idToken: 'google-token-123' };

      gateway.googleSignIn(body).subscribe();

      const request = http.expectOne(`${baseUrl}/google/sign-in`);
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(body);
      request.flush({ token: 'a', refreshToken: 'r' });
    });
  });

  describe('getGoogleAuthorizeUrl', () => {
    it('devuelve la URL de autorización de Google', () => {
      expect(gateway.getGoogleAuthorizeUrl()).toBe(`${baseUrl}/google/authorize`);
    });
  });
});