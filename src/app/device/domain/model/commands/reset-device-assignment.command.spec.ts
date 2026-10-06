import { createResetDeviceAssignmentCommand } from './reset-device-assignment.command';
import { createDeviceId } from '../valueobjects/device-id.value-object';

describe('createResetDeviceAssignmentCommand', () => {
  it('empaqueta el deviceId y es inmutable', () => {
    const deviceId = createDeviceId('device-1');

    const command = createResetDeviceAssignmentCommand(deviceId);

    expect(command.deviceId).toBe(deviceId);
    expect(Object.isFrozen(command)).toBe(true);
  });
});