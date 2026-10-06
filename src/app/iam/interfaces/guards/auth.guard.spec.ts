import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { authGuard } from './auth.guard';
import { AUTH_QUERY_SERVICE } from '../../domain/services/auth-query-service';

describe('authGuard', () => {
  const router = { navigate: vi.fn() };
  const authQueryService = { handleVerifyToken: vi.fn() };

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      firstValueFrom(
        authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as never,
      ),
    );

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AUTH_QUERY_SERVICE, useValue: authQueryService },
      ],
    });
  });

  it('permite el acceso cuando el token es válido', async () => {
    authQueryService.handleVerifyToken.mockReturnValue(of({ valid: true }));

    const result = await runGuard();

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirige a /login y bloquea el acceso cuando el token falla', async () => {
    authQueryService.handleVerifyToken.mockReturnValue(throwError(() => new Error('401')));

    const result = await runGuard();

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('cualquier error dispara la redirección, no solo 401', async () => {
    authQueryService.handleVerifyToken.mockReturnValue(throwError(() => new Error('500')));

    await runGuard();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});