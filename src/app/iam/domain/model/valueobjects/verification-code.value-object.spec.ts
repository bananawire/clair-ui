import { createVerificationCode } from './verification-code.value-object';

describe('createVerificationCode', () => {
  it('acepta un código válido, lo recorta y lo congela', () => {
    const code = createVerificationCode('  ABCD-1234  ');

    expect(code.value).toBe('ABCD-1234');
    expect(Object.isFrozen(code)).toBe(true);
  });

  it.each([null, undefined, ''])('rechaza un código vacío (%j)', (value) => {
    expect(() => createVerificationCode(value as unknown as string)).toThrow('Verification code is required');
  });

  it.each([
    'abcd-1234',        // minúsculas
    'ABCD_1234',        // separador incorrecto
    'ABCD1234',         // sin separador
    'ABC-1234',         // primera parte corta
    'ABCD-123',         // segunda parte corta
    'ABCD-12345',       // segunda parte larga
    'ABCD -1234',       // espacio
    'ABCD-123!',        // símbolo no alfanumérico
    '  ',               // solo espacios: cae en formato, no en required
  ])('rechaza el formato inválido %j', (value) => {
    expect(() => createVerificationCode(value)).toThrow(
      'Verification code must be in format XXXX-XXXX (uppercase alphanumeric)',
    );
  });
});