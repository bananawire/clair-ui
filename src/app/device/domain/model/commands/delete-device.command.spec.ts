import { createDeleteDeviceCommand } from './delete-device.command';
import { createDeviceId } from '../valueobjects/device-id.value-object';

describe('createDeleteDeviceCommand', () => {
  it('empaqueta el deviceId y es inmutable', () => {
    const deviceId = createDeviceId('device-1');

    const command = createDeleteDeviceCommand(deviceId);

    expect(command.deviceId).toBe(deviceId);
    expect(Object.isFrozen(command)).toBe(true);
  });
});