import { createCreateSpaceCommand } from './create-space.command';
import { createOrganizationId } from '../valueobjects/organization-id.value-object';

const organizationId = createOrganizationId('org-1');

describe('createCreateSpaceCommand', () => {
  it('recorta el nombre, conserva organizationId y es inmutable', () => {
    const command = createCreateSpaceCommand('  Sala 1  ', organizationId);

    expect(command.name).toBe('Sala 1');
    expect(command.organizationId).toBe(organizationId);
    expect(Object.isFrozen(command)).toBe(true);
  });

  it.each(['', '   ', null, undefined])('rechaza un nombre vacío (%j)', (value) => {
    expect(() => createCreateSpaceCommand(value as unknown as string, organizationId)).toThrow(
      'Space name must not be empty',
    );
  });
});