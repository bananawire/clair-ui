import { updateOrganizationNameCommandToResource } from './update-organization-name.transform';
import { createUpdateOrganizationNameCommand } from '../../../domain/model/commands/update-organization-name.command';
import { createOrganizationId } from '../../../domain/model/valueobjects/organization-id.value-object';

describe('updateOrganizationNameCommandToResource', () => {
  it('extrae solo el name (el organizationId va en la URL)', () => {
    const command = createUpdateOrganizationNameCommand(createOrganizationId('org-1'), 'Clair Org');

    const resource = updateOrganizationNameCommandToResource(command);

    expect(resource).toEqual({ name: 'Clair Org' });
  });
});