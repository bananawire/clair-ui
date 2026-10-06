import { createOrganizationCommandToResource } from './create-organization.transform';
import { createCreateOrganizationCommand } from '../../../domain/model/commands/create-organization.command';

describe('createOrganizationCommandToResource', () => {
  it('extrae el name del command', () => {
    const command = createCreateOrganizationCommand('Clair Org');

    const resource = createOrganizationCommandToResource(command);

    expect(resource).toEqual({ name: 'Clair Org' });
  });
});