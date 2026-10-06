import { createSignInWithGoogleCommand } from './sign-in-with-google.command';
import { createGoogleIdToken } from '../valueobjects/google-id-token.value-object';

describe('createSignInWithGoogleCommand', () => {
  it('empaqueta el idToken y es inmutable', () => {
    const idToken = createGoogleIdToken('google-token-123');

    const command = createSignInWithGoogleCommand(idToken);

    expect(command.idToken).toBe(idToken);
    expect(Object.isFrozen(command)).toBe(true);
  });
});