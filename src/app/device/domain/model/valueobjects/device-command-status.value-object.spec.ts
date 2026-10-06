import { createDeviceCommandStatus } from './device-command-status.value-object';

describe('createDeviceCommandStatus', () => {
  it.each([
    'PENDING',
    'SENT',
    'EXECUTED',
    'FAILED',
    'EXPIRED',
  ] as const)('acepta %s', (status) => {
    expect(createDeviceCommandStatus(status)).toBe(status);
  });

  it('normaliza a mayúsculas y recorta espacios', () => {
    expect(createDeviceCommandStatus('  sent  ')).toBe('SENT');
    expect(createDeviceCommandStatus('Executed')).toBe('EXECUTED');
  });

  it.each(['', '   ', 'OPEN', 'UNKNOWN'])('rechaza el valor inválido "%s"', (value) => {
    expect(() => createDeviceCommandStatus(value)).toThrow(`Invalid DeviceCommandStatus: ${value}`);
  });
});