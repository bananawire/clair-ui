import { createDeleteDeviceThresholdCommand } from './delete-device-threshold.command';
import { createDeviceId } from '../valueobjects/device-id.value-object';

const deviceId = createDeviceId('device-1');

describe('createDeleteDeviceThresholdCommand', () => {
  it('empaqueta deviceId y metric y es inmutable', () => {
    const command = createDeleteDeviceThresholdCommand(deviceId, 'CO2');

    expect(command.deviceId).toBe(deviceId);
    expect(command.metric).toBe('CO2');
    expect(Object.isFrozen(command)).toBe(true);
  });

  it.each([null, undefined])('rechaza un deviceId nulo (%j)', (value) => {
    expect(() => createDeleteDeviceThresholdCommand(value as never, 'CO2')).toThrow(
      'Device ID is required',
    );
  });

  it.each([null, undefined, ''] as unknown[])('rechaza una métrica vacía (%j)', (value) => {
    expect(() => createDeleteDeviceThresholdCommand(deviceId, value as never)).toThrow(
      'Metric is required',
    );
  });
});