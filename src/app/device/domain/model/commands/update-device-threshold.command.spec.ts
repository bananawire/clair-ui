import { createUpdateDeviceThresholdCommand } from './update-device-threshold.command';
import { createDeviceId } from '../valueobjects/device-id.value-object';

const deviceId = createDeviceId('device-1');

describe('createUpdateDeviceThresholdCommand', () => {
  it('crea el value object ThresholdValue, convierte enabled y es inmutable', () => {
    const command = createUpdateDeviceThresholdCommand(deviceId, 'PM25', 35, false);

    expect(command.deviceId).toBe(deviceId);
    expect(command.metric).toBe('PM25');
    expect(command.value.value).toBe(35);
    expect(command.enabled).toBe(false);
    expect(Object.isFrozen(command)).toBe(true);
  });

  it.each([null, undefined])('rechaza un deviceId nulo (%j)', (value) => {
    expect(() => createUpdateDeviceThresholdCommand(value as never, 'PM25', 35, true)).toThrow(
      'Device ID is required',
    );
  });

  it.each([null, undefined, ''] as unknown[])('rechaza una métrica vacía (%j)', (value) => {
    expect(() => createUpdateDeviceThresholdCommand(deviceId, value as never, 35, true)).toThrow(
      'Metric is required',
    );
  });
});