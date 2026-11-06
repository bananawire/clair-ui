import { createAccessToken } from './access-token.value-object';

describe('createAccessToken', () => {
  it('acepta un token válido y lo congela', () => {
    const token = createAccessToken('eyJhbGciOiJIUzI1NiJ9');

    expect(token.value).toBe('eyJhbGciOiJIUzI1NiJ9');
    expect(Object.isFrozen(token)).toBe(true);
  });

  it('preserva el valor tal cual, sin recortar espacios', () => {
    // A diferencia de email o user-id, este VO no hace trim.
    expect(createAccessToken('  token-1  ').value).toBe('  token-1  ');
  });

  it.each([null, undefined, ''])('rechaza un token vacío (%j)', (value) => {
    expect(() => createAccessToken(value as unknown as string)).toThrow('Access token is required');
  });
});