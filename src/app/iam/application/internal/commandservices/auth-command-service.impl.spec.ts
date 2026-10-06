import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthCommandServiceImpl } from './auth-command-service.impl';
import { AuthGateway } from '../../../infrastructure/api/gateways/auth.gateway';
import { createSignUpCommand } from '../../../domain/model/commands/sign-up.command';
import { createSignInCommand } from '../../../domain/model/commands/sign-in.command';
import { createRefreshTokenCommand } from '../../../domain/model/commands/refresh-token.command';
import { createConfirmRegistrationCommand } from '../../../domain/model/commands/confirm-registration.command';
import { createSignInWithGoogleCommand } from '../../../domain/model/commands/sign-in-with-google.command';
import { createEmail } from '../../../domain/model/valueobjects/email.value-object';
import { createPassword } from '../../../domain/model/valueobjects/password.value-object';
import { createRefreshToken } from '../../../domain/model/valueobjects/refresh-token.value-object';
import { createVerificationCode } from '../../../domain/model/valueobjects/verification-code.value-object';
import { createGoogleIdToken } from '../../../domain/model/valueobjects/google-id-token.value-object';

describe('AuthCommandServiceImpl', () => {
  const gateway = {
    signUp: vi.fn(),
    signIn: vi.fn(),
    refreshToken: vi.fn(),
    confirmRegistration: vi.fn(),
    signOut: vi.fn(),
    googleSignIn: vi.fn(),
    getGoogleAuthorizeUrl: vi.fn(),
  };
  const service = new AuthCommandServiceImpl(gateway as unknown as AuthGateway);

  beforeEach(() => vi.resetAllMocks());

  describe('handleSignUp', () => {
    it('envía el recurso del transform y devuelve sessionId + message', async () => {
      gateway.signUp.mockReturnValue(of({ sessionId: 'session-1', message: 'Registration started' }));

      const command = createSignUpCommand(createEmail('usuario@test.com'), createPassword('Clave1!A'));
      const result = await firstValueFrom(service.handleSignUp(command));

      expect(gateway.signUp).toHaveBeenCalledWith({ email: 'usuario@test.com', password: 'Clave1!A' });
      expect(result).toEqual({ sessionId: 'session-1', message: 'Registration started' });
    });
  });

  describe('handleSignIn', () => {
    it('mapea la respuesta a value objects AccessToken y RefreshToken', async () => {
      gateway.signIn.mockReturnValue(of({ token: 'access-1', refreshToken: 'refresh-1' }));

      const command = createSignInCommand(createEmail('usuario@test.com'), createPassword('Clave1!A'));
      const result = await firstValueFrom(service.handleSignIn(command));

      expect(gateway.signIn).toHaveBeenCalledWith({ email: 'usuario@test.com', password: 'Clave1!A' });
      expect(result.accessToken.value).toBe('access-1');
      expect(result.refreshToken.value).toBe('refresh-1');
    });
  });

  describe('handleRefreshToken', () => {
    it('renueva los tokens y los envuelve como value objects', async () => {
      gateway.refreshToken.mockReturnValue(of({ token: 'new-access', refreshToken: 'new-refresh' }));

      const command = createRefreshTokenCommand(createRefreshToken('old-refresh'));
      const result = await firstValueFrom(service.handleRefreshToken(command));

      expect(gateway.refreshToken).toHaveBeenCalledWith({ refreshToken: 'old-refresh' });
      expect(result.accessToken.value).toBe('new-access');
      expect(result.refreshToken.value).toBe('new-refresh');
    });
  });

  describe('handleConfirmRegistration', () => {
    it('mapea el id a UserId y conserva el email', async () => {
      gateway.confirmRegistration.mockReturnValue(of({ id: 'user-1', email: 'usuario@test.com' }));

      const command = createConfirmRegistrationCommand('session-1', createVerificationCode('ABCD-1234'));
      const result = await firstValueFrom(service.handleConfirmRegistration(command));

      expect(gateway.confirmRegistration).toHaveBeenCalledWith({
        sessionId: 'session-1',
        verificationCode: 'ABCD-1234',
      });
      expect(result.userId.value).toBe('user-1');
      expect(result.email).toBe('usuario@test.com');
    });
  });

  describe('handleSignOut', () => {
    it('delega en el gateway y propaga el void', async () => {
      gateway.signOut.mockReturnValue(of(undefined));

      await expect(firstValueFrom(service.handleSignOut())).resolves.toBeUndefined();
      expect(gateway.signOut).toHaveBeenCalledOnce();
    });
  });

  describe('handleGoogleSignIn', () => {
    it('envía el idToken y devuelve los tokens como value objects', async () => {
      gateway.googleSignIn.mockReturnValue(of({ token: 'g-access', refreshToken: 'g-refresh' }));

      const command = createSignInWithGoogleCommand(createGoogleIdToken('id-token'));
      const result = await firstValueFrom(service.handleGoogleSignIn(command));

      expect(gateway.googleSignIn).toHaveBeenCalledWith({ idToken: 'id-token' });
      expect(result.accessToken.value).toBe('g-access');
      expect(result.refreshToken.value).toBe('g-refresh');
    });
  });

  describe('getGoogleAuthorizeUrl', () => {
    it('devuelve la URL del gateway', () => {
      gateway.getGoogleAuthorizeUrl.mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth');

      expect(service.getGoogleAuthorizeUrl()).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    });
  });

  describe('propagación de errores', () => {
    it('propaga los errores del gateway', async () => {
      gateway.signIn.mockReturnValue(throwError(() => new Error('401')));

      const command = createSignInCommand(createEmail('usuario@test.com'), createPassword('Clave1!A'));

      await expect(firstValueFrom(service.handleSignIn(command))).rejects.toThrow('401');
    });
  });
});