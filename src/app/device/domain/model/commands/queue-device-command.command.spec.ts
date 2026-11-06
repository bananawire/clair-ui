import { createQueueDeviceCommand } from './queue-device-command.command';
import { createDeviceId } from '../valueobjects/device-id.value-object';
import { createDeviceCommandType } from '../valueobjects/device-command-type.value-object';

const deviceId = createDeviceId('device-1');
const type = createDeviceCommandType('RESTART');

describe('createQueueDeviceCommand', () => {
  it('sin payload lo deja como undefined y es inmutable', () => {
    const command = createQueueDeviceCommand(deviceId, type);

    expect(command.deviceId).toBe(deviceId);
    expect(command.type).toBe(type);
    expect(command.payload).toBeUndefined();
    expect(Object.isFrozen(command)).toBe(true);
  });

  it('con payload válido lo recorta', () => {
    const command = createQueueDeviceCommand(deviceId, type, '  {"force":true}  ');

    expect(command.payload).toBe('{"force":true}');
  });

  it.each(['', '   '])('rechaza un payload vacío (%j)', (value) => {
    expect(() => createQueueDeviceCommand(deviceId, type, value)).toThrow(
      'Payload must be a non-empty string when provided',
    );
  });
});