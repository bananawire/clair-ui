import { createUpdateDeviceNameCommand } from './update-device-name.command';
import { createDeviceId } from '../valueobjects/device-id.value-object';

const deviceId = createDeviceId('device-1');

describe('createUpdateDeviceNameCommand', () => {
  it('recorta el nombre, conserva el deviceId y es inmutable', () => {
    const command = createUpdateDeviceNameCommand(deviceId, '  Sensor Norte  ');

    expect(command.deviceId).toBe(deviceId);
    expect(command.name).toBe('Sensor Norte');
    expect(Object.isFrozen(command)).toBe(true);
  });

  it.each(['', '   ', null, undefined])('rechaza un nombre vacío (%j)', (value) => {
    expect(() => createUpdateDeviceNameCommand(deviceId, value as unknown as string)).toThrow(
      'Device name must not be empty',
    );
  });
});