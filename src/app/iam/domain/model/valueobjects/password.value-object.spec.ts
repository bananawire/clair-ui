import { createPassword } from './password.value-object';

const VALID_PASSWORD = 'Clave1!A';

describe('createPassword', () => {
  it('acepta una contraseña válida y la congela', () => {
    const password = createPassword(VALID_PASSWORD);

    expect(password.value).toBe(VALID_PASSWORD);
    expect(Object.isFrozen(password)).toBe(true);
  });

  it.each([null, undefined, ''])('rechaza una contraseña vacía (%j)', (value) => {
    expect(() => createPassword(value as unknown as string)).toThrow('Password is required');
  });

  it.each([7, 129])('rechaza una longitud de %s caracteres', (length) => {
    // Genera una contraseña válida y la ajusta a la longitud pedida.
    const base = 'Aa1!aaaa';
    const value = base.padEnd(length, 'a').slice(0, length);

    expect(() => createPassword(value)).toThrow('Password must be between 8 and 128 characters');
  });

  it('acepta exactamente 8 y 128 caracteres', () => {
    const eight = 'Aa1!aaaa';
    const oneTwentyEight = 'Aa1!' + 'a'.repeat(124);

    expect(createPassword(eight).value).toBe(eight);
    expect(createPassword(oneTwentyEight).value).toBe(oneTwentyEight);
  });

  it.each([
    ['sin mayúscula', 'clave1!a'],
    ['sin minúscula', 'CLAVE1!A'],
    ['sin número', 'ClaveSegura!'],
    ['sin carácter especial', 'ClaveSegura1'],
    ['sin carácter especial permitido (# no cuenta)', 'ClaveSegura1#'],
  ])('rechaza una contraseña %s', (_label, value) => {
    expect(() => createPassword(value)).toThrow(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    );
  });

  it.each(['@', '$', '!', '%', '*', '?', '&'])('acepta el carácter especial "%s"', (special) => {
    expect(createPassword(`Clave1A${special}`).value).toBe(`Clave1A${special}`);
  });
});