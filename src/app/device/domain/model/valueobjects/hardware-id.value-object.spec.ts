import { createHardwareId } from './hardware-id.value-object';

describe('createHardwareId', () => {
  it.each([
    'CLAIR-0KBG',
    'CLAIR-AAAA',
    'CLAIR-1234',
    'CLAIR-Z999',
    'HW-0001',
    'HW-9999',
  ])('acepta el formato válido %s', (value) => {
    const id = createHardwareId(value);

    expect(id.value).toBe(value);
    expect(Object.isFrozen(id)).toBe(true);
  });

  it('normaliza a mayúsculas y recorta espacios', () => {
    expect(createHardwareId('  clair-0kbg  ').value).toBe('CLAIR-0KBG');
    expect(createHardwareId('hw-0001').value).toBe('HW-0001');
  });

  it.each(['', '   '])('rechaza un id vacío (%j)', (value) => {
    expect(() => createHardwareId(value)).toThrow('Hardware ID must not be empty');
  });

  it.each([
    'CLAIR-0KB',      // 3 caracteres tras el guion
    'CLAIR-0KBGG',    // 5 caracteres
    'CLAIR0KBG',      // sin guion
    'HW-1',           // legacy con menos de 4 dígitos
    'HW-12345',       // legacy con más de 4 dígitos
    'HW-ABCD',        // legacy con letras
    'XXXX-0001',      // prefijo incorrecto
    'clair0kbg',      // sin guion (después de uppercase sigue inválido)
  ])('rechaza el formato inválido %s', (value) => {
    expect(() => createHardwareId(value)).toThrow('Hardware ID must match CLAIR-0KBG or HW-0001');
  });
});