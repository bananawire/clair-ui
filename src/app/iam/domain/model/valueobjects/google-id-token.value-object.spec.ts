import { createGoogleIdToken } from './google-id-token.value-object';

describe('createGoogleIdToken', () => {
  it('acepta un token válido y lo congela', () => {
    const token = createGoogleIdToken('google-id-token-123');

    expect(token.value).toBe('google-id-token-123');
    expect(Object.isFrozen(token)).toBe(true);
  });

  it('preserva el valor tal cual, sin recortar espacios', () => {
    expect(createGoogleIdToken('  token  ').value).toBe('  token  ');
  });

  it.each([null, undefined, ''])('rechaza un token vacío (%j)', (value) => {
    expect(() => createGoogleIdToken(value as unknown as string)).toThrow('Google ID token is required');
  });

  it.each([123, true, {}, []])('rechaza un valor que no es string (%j)', (value) => {
    expect(() => createGoogleIdToken(value as unknown as string)).toThrow('Google ID token is required');
  });
});