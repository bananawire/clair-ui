import { createPairDeviceCommand } from './pair-device.command';
import { createHardwareId } from '../valueobjects/hardware-id.value-object';

describe('createPairDeviceCommand', () => {
  it('empaqueta el hardwareId y es inmutable', () => {
    const hardwareId = createHardwareId('CLAIR-0KBG');

    const command = createPairDeviceCommand(hardwareId);

    expect(command.hardwareId).toBe(hardwareId);
    expect(Object.isFrozen(command)).toBe(true);
  });
});