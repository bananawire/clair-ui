import { createSpaceCommandToResource } from './create-space.transform';
import { createCreateSpaceCommand } from '../../../domain/model/commands/create-space.command';
import { createOrganizationId } from '../../../domain/model/valueobjects/organization-id.value-object';

describe('createSpaceCommandToResource', () => {
  it('extrae solo el name (el organizationId va en la URL)', () => {
    const command = createCreateSpaceCommand('Sala 1', createOrganizationId('org-1'));

    const resource = createSpaceCommandToResource(command);

    expect(resource).toEqual({ name: 'Sala 1' });
  });
});