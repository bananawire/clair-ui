import { createDeleteSpaceCommand } from './delete-space.command';
import { createSpaceId } from '../valueobjects/space-id.value-object';

describe('createDeleteSpaceCommand', () => {
  it('empaqueta el spaceId y es inmutable', () => {
    const spaceId = createSpaceId('space-1');

    const command = createDeleteSpaceCommand(spaceId);

    expect(command.spaceId).toBe(spaceId);
    expect(Object.isFrozen(command)).toBe(true);
  });
});