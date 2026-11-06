import { createGetDeviceByIdQuery } from './get-device-by-id.query';
import { createDeviceId } from '../valueobjects/device-id.value-object';

describe('createGetDeviceByIdQuery', () => {
  it('empaqueta el deviceId y es inmutable', () => {
    const deviceId = createDeviceId('device-1');

    const query = createGetDeviceByIdQuery(deviceId);

    expect(query.deviceId).toBe(deviceId);
    expect(Object.isFrozen(query)).toBe(true);
  });
});