import { createCreateOrganizationCommand } from './create-organization.command';

describe('createCreateOrganizationCommand', () => {
  it('recorta el nombre y es inmutable', () => {
    const command = createCreateOrganizationCommand('  Clair Org  ');

    expect(command.name).toBe('Clair Org');
    expect(Object.isFrozen(command)).toBe(true);
  });

  it.each(['', '   ', null, undefined])('rechaza un nombre vacío (%j)', (value) => {
    expect(() => createCreateOrganizationCommand(value as unknown as string)).toThrow(
      'Organization name must not be empty',
    );
  });
});