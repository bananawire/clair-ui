import { claimDeviceCommandToResource } from './claim-device.transform';
import { createClaimDeviceCommand } from '../../../domain/model/commands/claim-device.command';
import { createSpaceId } from '../../../domain/model/valueobjects/space-id.value-object';

describe('claimDeviceCommandToResource', () => {
  it('extrae claimToken y spaceId.value', () => {
    const command = createClaimDeviceCommand('claim-abc', createSpaceId('space-1'));

    const resource = claimDeviceCommandToResource(command);

    expect(resource).toEqual({ claimToken: 'claim-abc', spaceId: 'space-1' });
  });
});