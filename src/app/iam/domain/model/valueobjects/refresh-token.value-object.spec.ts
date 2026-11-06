import { createRefreshToken } from './refresh-token.value-object';

describe('createRefreshToken', () => {
  it('acepta un token válido y lo congela', () => {
    const token = createRefreshToken('refresh-abc-123');

    expect(token.value).toBe('refresh-abc-123');
    expect(Object.isFrozen(token)).toBe(true);
  });

  it('preserva el valor tal cual, sin recortar espacios', () => {
    expect(createRefreshToken('  token  ').value).toBe('  token  ');
  });

  it.each([null, undefined, ''])('rechaza un token vacío (%j)', (value) => {
    expect(() => createRefreshToken(value as unknown as string)).toThrow('Refresh token is required');
  });
});