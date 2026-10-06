import { createGetDeviceStatusByIdQuery } from './get-device-status-by-id.query';
import { createDeviceId } from '../valueobjects/device-id.value-object';

describe('createGetDeviceStatusByIdQuery', () => {
  it('empaqueta el deviceId y es inmutable', () => {
    const deviceId = createDeviceId('device-1');

    const query = createGetDeviceStatusByIdQuery(deviceId);

    expect(query.deviceId).toBe(deviceId);
    expect(Object.isFrozen(query)).toBe(true);
  });
});