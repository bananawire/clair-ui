import {
  confirmRegistrationCommandToResource,
  refreshTokenCommandToResource,
  signInCommandToResource,
  signInWithGoogleCommandToResource,
  signUpCommandToResource,
} from './auth-transform';
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

describe('signUpCommandToResource', () => {
  it('extrae los .value del email y password y es inmutable', () => {
    const command = createSignUpCommand(
      createEmail('Usuario@Test.com'),
      createPassword('Clave1!A'),
    );

    const resource = signUpCommandToResource(command);

    expect(resource).toEqual({ email: 'usuario@test.com', password: 'Clave1!A' });
    expect(Object.isFrozen(resource)).toBe(true);
  });
});

describe('signInCommandToResource', () => {
  it('extrae los .value del email y password y es inmutable', () => {
    const command = createSignInCommand(
      createEmail('  usuario@test.com  '),
      createPassword('Clave1!A'),
    );

    const resource = signInCommandToResource(command);

    expect(resource).toEqual({ email: 'usuario@test.com', password: 'Clave1!A' });
    expect(Object.isFrozen(resource)).toBe(true);
  });
});

describe('refreshTokenCommandToResource', () => {
  it('extrae el .value del refreshToken y es inmutable', () => {
    const command = createRefreshTokenCommand(createRefreshToken('refresh-abc'));

    const resource = refreshTokenCommandToResource(command);

    expect(resource).toEqual({ refreshToken: 'refresh-abc' });
    expect(Object.isFrozen(resource)).toBe(true);
  });
});

describe('confirmRegistrationCommandToResource', () => {
  it('renombra code como verificationCode y conserva el sessionId', () => {
    const command = createConfirmRegistrationCommand(
      '  session-1  ',
      createVerificationCode('ABCD-1234'),
    );

    const resource = confirmRegistrationCommandToResource(command);

    expect(resource).toEqual({
      sessionId: 'session-1',
      verificationCode: 'ABCD-1234',
    });
    expect(Object.isFrozen(resource)).toBe(true);
  });
});

describe('signInWithGoogleCommandToResource', () => {
  it('extrae el .value del idToken y es inmutable', () => {
    const command = createSignInWithGoogleCommand(createGoogleIdToken('google-token-123'));

    const resource = signInWithGoogleCommandToResource(command);

    expect(resource).toEqual({ idToken: 'google-token-123' });
    expect(Object.isFrozen(resource)).toBe(true);
  });
});