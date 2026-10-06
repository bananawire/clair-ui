import { pairDeviceCommandToResource } from './pair-device.transform';
import { createPairDeviceCommand } from '../../../domain/model/commands/pair-device.command';
import { createHardwareId } from '../../../domain/model/valueobjects/hardware-id.value-object';

describe('pairDeviceCommandToResource', () => {
  it('extrae hardwareId.value', () => {
    const command = createPairDeviceCommand(createHardwareId('CLAIR-0KBG'));

    const resource = pairDeviceCommandToResource(command);

    expect(resource).toEqual({ hardwareId: 'CLAIR-0KBG' });
  });
});