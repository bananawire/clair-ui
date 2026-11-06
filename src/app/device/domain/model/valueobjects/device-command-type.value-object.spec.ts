import { createDeviceCommandType } from './device-command-type.value-object';

describe('createDeviceCommandType', () => {
  it.each(['STANDBY', 'WAKE', 'RESTART'] as const)('acepta %s', (type) => {
    expect(createDeviceCommandType(type)).toBe(type);
  });

  it('normaliza a mayúsculas y recorta espacios', () => {
    expect(createDeviceCommandType('  wake  ')).toBe('WAKE');
    expect(createDeviceCommandType('Restart')).toBe('RESTART');
  });

  it.each(['', '   ', 'SHUTDOWN', 'ON'])('rechaza el valor inválido "%s"', (value) => {
    expect(() => createDeviceCommandType(value)).toThrow(`Invalid DeviceCommandType: ${value}`);
  });
});