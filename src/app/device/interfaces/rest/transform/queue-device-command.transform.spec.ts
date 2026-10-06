import { queueDeviceCommandToResource } from './queue-device-command.transform';
import { createQueueDeviceCommand } from '../../../domain/model/commands/queue-device-command.command';
import { createDeviceId } from '../../../domain/model/valueobjects/device-id.value-object';
import { createDeviceCommandType } from '../../../domain/model/valueobjects/device-command-type.value-object';

const deviceId = createDeviceId('device-1');
const type = createDeviceCommandType('RESTART');

describe('queueDeviceCommandToResource', () => {
  it('incluye type y payload cuando hay payload', () => {
    const command = createQueueDeviceCommand(deviceId, type, '{"force":true}');

    const resource = queueDeviceCommandToResource(command);

    expect(resource).toEqual({ type: 'RESTART', payload: '{"force":true}' });
  });

  it('payload es undefined cuando no se indicó', () => {
    const command = createQueueDeviceCommand(deviceId, type);

    const resource = queueDeviceCommandToResource(command);

    expect(resource.type).toBe('RESTART');
    expect(resource.payload).toBeUndefined();
  });
});