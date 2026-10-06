import { createDeviceStatus } from './device-status.value-object';

describe('createDeviceStatus', () => {
  it.each([
    'OFFLINE',
    'ONLINE',
    'STANDBY',
    'ERROR',
    'MAINTENANCE',
    'DECOMMISSIONED',
  ] as const)('acepta %s', (status) => {
    expect(createDeviceStatus(status)).toBe(status);
  });

  it.each([
    ['online', 'ONLINE'],
    ['Error', 'ERROR'],
    ['Decommissioned', 'DECOMMISSIONED'],
  ])('normaliza "%s" a %s', (input, expected) => {
    expect(createDeviceStatus(input)).toBe(expected);
  });

  it.each(['', 'PENDING', 'UNKNOWN', 'active'])('rechaza el valor inválido "%s"', (value) => {
    expect(() => createDeviceStatus(value)).toThrow(`Invalid device status: ${value}`);
  });

  it('un valor con espacios no se recorta (solo se pasa a mayúsculas)', () => {
    // createDeviceStatus no hace trim, así que " ONLINE " no es válido
    expect(() => createDeviceStatus(' ONLINE ')).toThrow('Invalid device status:  ONLINE ');
  });
});