import { updateSpaceNameCommandToResource } from './update-space-name.transform';
import { createUpdateSpaceNameCommand } from '../../../domain/model/commands/update-space-name.command';
import { createSpaceId } from '../../../domain/model/valueobjects/space-id.value-object';

describe('updateSpaceNameCommandToResource', () => {
  it('extrae solo el name (el spaceId va en la URL)', () => {
    const command = createUpdateSpaceNameCommand(createSpaceId('space-1'), 'Sala 2');

    const resource = updateSpaceNameCommandToResource(command);

    expect(resource).toEqual({ name: 'Sala 2' });
  });
});