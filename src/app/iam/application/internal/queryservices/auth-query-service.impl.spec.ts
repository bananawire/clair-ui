import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthQueryServiceImpl } from './auth-query-service.impl';
import { AuthGateway } from '../../../infrastructure/api/gateways/auth.gateway';

describe('AuthQueryServiceImpl', () => {
  const gateway = { verifyToken: vi.fn() };
  const service = new AuthQueryServiceImpl(gateway as unknown as AuthGateway);

  beforeEach(() => vi.resetAllMocks());

  it('devuelve los metadatos del token y los congela', async () => {
    gateway.verifyToken.mockReturnValue(
      of({ valid: true, email: 'usuario@test.com', expiresAt: '2026-10-04T10:00:00Z' }),
    );

    const result = await firstValueFrom(service.handleVerifyToken());

    expect(gateway.verifyToken).toHaveBeenCalledOnce();
    expect(result).toEqual({
      valid: true,
      email: 'usuario@test.com',
      expiresAt: '2026-10-04T10:00:00Z',
    });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('un token inválido también se mapea correctamente', async () => {
    gateway.verifyToken.mockReturnValue(
      of({ valid: false, email: null, expiresAt: null } as unknown as {
        valid: boolean;
        email: string;
        expiresAt: string;
      }),
    );

    const result = await firstValueFrom(service.handleVerifyToken());

    expect(result.valid).toBe(false);
  });

  it('propaga errores del gateway', async () => {
    gateway.verifyToken.mockReturnValue(throwError(() => new Error('500')));

    await expect(firstValueFrom(service.handleVerifyToken())).rejects.toThrow('500');
  });
});