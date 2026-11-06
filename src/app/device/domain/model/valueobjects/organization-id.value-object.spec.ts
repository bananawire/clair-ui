import { createOrganizationId } from './organization-id.value-object';

describe('createOrganizationId', () => {
  it('acepta un id válido, lo recorta y lo congela', () => {
    const id = createOrganizationId('  org-1  ');

    expect(id.value).toBe('org-1');
    expect(Object.isFrozen(id)).toBe(true);
  });

  it.each(['', '   ', null, undefined])('rechaza un id vacío (%j)', (value) => {
    expect(() => createOrganizationId(value as unknown as string)).toThrow(
      'Organization ID must not be empty',
    );
  });
});