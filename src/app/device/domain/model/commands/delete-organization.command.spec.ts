import { createDeleteOrganizationCommand } from './delete-organization.command';
import { createOrganizationId } from '../valueobjects/organization-id.value-object';

describe('createDeleteOrganizationCommand', () => {
  it('empaqueta el organizationId y es inmutable', () => {
    const organizationId = createOrganizationId('org-1');

    const command = createDeleteOrganizationCommand(organizationId);

    expect(command.organizationId).toBe(organizationId);
    expect(Object.isFrozen(command)).toBe(true);
  });
});