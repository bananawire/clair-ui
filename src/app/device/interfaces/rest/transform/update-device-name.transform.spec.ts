import { updateDeviceNameCommandToResource } from './update-device-name.transform';
import { createUpdateDeviceNameCommand } from '../../../domain/model/commands/update-device-name.command';
import { createDeviceId } from '../../../domain/model/valueobjects/device-id.value-object';

describe('updateDeviceNameCommandToResource', () => {
  it('extrae solo el name (el deviceId va en la URL)', () => {
    const command = createUpdateDeviceNameCommand(createDeviceId('device-1'), 'Sensor Norte');

    const resource = updateDeviceNameCommandToResource(command);

    expect(resource).toEqual({ name: 'Sensor Norte' });
  });
});