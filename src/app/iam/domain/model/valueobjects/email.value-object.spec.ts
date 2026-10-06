import { createEmail } from './email.value-object';

describe('createEmail', () => {
  it('acepta un email válido, lo normaliza a minúsculas y lo congela', () => {
    const email = createEmail('Usuario@Example.COM');

    expect(email.value).toBe('usuario@example.com');
    expect(Object.isFrozen(email)).toBe(true);
  });

  it('recorta los espacios antes de validar', () => {
    expect(createEmail('  usuario@example.com  ').value).toBe('usuario@example.com');
  });

  it.each(['', '   ', null, undefined])('rechaza un email vacío (%j)', (value) => {
    expect(() => createEmail(value as unknown as string)).toThrow('Email is required');
  });

  it.each([
    'noemail',
    'sin@dominio',
    '@ejemplo.com',
    'usuario@',
    'usuario @ejemplo.com',
    'usuario@ ejemplo.com',
    'usuario@@ejemplo.com',
  ])('rechaza el formato inválido %j', (value) => {
    expect(() => createEmail(value)).toThrow('Email format is invalid');
  });
});