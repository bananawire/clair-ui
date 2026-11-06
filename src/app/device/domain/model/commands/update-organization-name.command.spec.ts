import { createUpdateOrganizationNameCommand } from './update-organization-name.command';
import { createOrganizationId } from '../valueobjects/organization-id.value-object';

const organizationId = createOrganizationId('org-1');

describe('createUpdateOrganizationNameCommand', () => {
  it('recorta el nombre, conserva el organizationId y es inmutable', () => {
    const command = createUpdateOrganizationNameCommand(organizationId, '  Clair Org  ');

    expect(command.organizationId).toBe(organizationId);
    expect(command.name).toBe('Clair Org');
    expect(Object.isFrozen(command)).toBe(true);
  });

  it.each(['', '   ', null, undefined])('rechaza un nombre vacío (%j)', (value) => {
    expect(() => createUpdateOrganizationNameCommand(organizationId, value as unknown as string)).toThrow(
      'Organization name must not be empty',
    );
  });
});