import { createClaimDeviceCommand } from './claim-device.command';
import { createSpaceId } from '../valueobjects/space-id.value-object';

const spaceId = createSpaceId('space-1');

describe('createClaimDeviceCommand', () => {
  it('normaliza el claimToken a uppercase, conserva el spaceId y es inmutable', () => {
    const command = createClaimDeviceCommand('  ab45-f3b1  ', spaceId);

    expect(command.claimToken).toBe('AB45-F3B1');
    expect(command.spaceId).toBe(spaceId);
    expect(Object.isFrozen(command)).toBe(true);
  });

  it.each(['', '   '])('rechaza un claimToken vacío (%j)', (value) => {
    expect(() => createClaimDeviceCommand(value, spaceId)).toThrow('Claim token must not be empty');
  });
});
