import { createGetDeviceThresholdsByDeviceQuery } from './get-device-thresholds-by-device.query';
import { createDeviceId } from '../valueobjects/device-id.value-object';

describe('createGetDeviceThresholdsByDeviceQuery', () => {
  it('empaqueta el deviceId y es inmutable', () => {
    const deviceId = createDeviceId('device-1');

    const query = createGetDeviceThresholdsByDeviceQuery(deviceId);

    expect(query.deviceId).toBe(deviceId);
    expect(Object.isFrozen(query)).toBe(true);
  });

  it.each([null, undefined])('rechaza un deviceId nulo (%j)', (value) => {
    expect(() => createGetDeviceThresholdsByDeviceQuery(value as never)).toThrow(
      'Device ID is required',
    );
  });
});