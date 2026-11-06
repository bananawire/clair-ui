import { createCreateDeviceThresholdCommand } from './create-device-threshold.command';
import { createDeviceId } from '../valueobjects/device-id.value-object';

const deviceId = createDeviceId('device-1');

describe('createCreateDeviceThresholdCommand', () => {
  it('crea el value object ThresholdValue, convierte enabled y es inmutable', () => {
    const command = createCreateDeviceThresholdCommand(deviceId, 'CO2', 1000, true);

    expect(command.deviceId).toBe(deviceId);
    expect(command.metric).toBe('CO2');
    expect(command.value.value).toBe(1000);
    expect(command.enabled).toBe(true);
    expect(Object.isFrozen(command)).toBe(true);
  });

  it('convierte enabled con Boolean()', () => {
    expect(createCreateDeviceThresholdCommand(deviceId, 'CO2', 1000, 0 as unknown as boolean).enabled).toBe(false);
    expect(createCreateDeviceThresholdCommand(deviceId, 'CO2', 1000, 1 as unknown as boolean).enabled).toBe(true);
  });

  it.each([null, undefined])('rechaza un deviceId nulo (%j)', (value) => {
    expect(() => createCreateDeviceThresholdCommand(value as never, 'CO2', 1000, true)).toThrow(
      'Device ID is required',
    );
  });

  it.each([null, undefined, ''] as unknown[])('rechaza una métrica vacía (%j)', (value) => {
    expect(() => createCreateDeviceThresholdCommand(deviceId, value as never, 1000, true)).toThrow(
      'Metric is required',
    );
  });

  it.each([0, -1, NaN])('propaga el error de createThresholdValue con el valor %s', (value) => {
    expect(() => createCreateDeviceThresholdCommand(deviceId, 'CO2', value, true)).toThrow();
  });
});