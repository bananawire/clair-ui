import { createUpdateSpaceNameCommand } from './update-space-name.command';
import { createSpaceId } from '../valueobjects/space-id.value-object';

const spaceId = createSpaceId('space-1');

describe('createUpdateSpaceNameCommand', () => {
  it('recorta el nombre, conserva el spaceId y es inmutable', () => {
    const command = createUpdateSpaceNameCommand(spaceId, '  Sala 1  ');

    expect(command.spaceId).toBe(spaceId);
    expect(command.name).toBe('Sala 1');
    expect(Object.isFrozen(command)).toBe(true);
  });

  it.each(['', '   ', null, undefined])('rechaza un nombre vacío (%j)', (value) => {
    expect(() => createUpdateSpaceNameCommand(spaceId, value as unknown as string)).toThrow(
      'Space name must not be empty',
    );
  });
});