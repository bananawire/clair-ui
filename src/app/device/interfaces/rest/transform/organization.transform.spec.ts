import { organizationResourceToDomain } from './organization.transform';
import { OrganizationResource } from '../resources/organization.resource';

const resource: OrganizationResource = {
  id: 'org-1',
  name: 'Clair Org',
  ownerUserId: 'user-1',
  createdAt: '2026-10-04T10:00:00Z',
  updatedAt: '2026-10-04T11:00:00Z',
};

describe('organizationResourceToDomain', () => {
  it('convierte id y ownerUserId en value objects y congela el resultado', () => {
    const org = organizationResourceToDomain(resource);

    expect(org.id.value).toBe('org-1');
    expect(org.ownerUserId.value).toBe('user-1');
    expect(org.name).toBe('Clair Org');
    expect(org.createdAt).toBe('2026-10-04T10:00:00Z');
    expect(org.updatedAt).toBe('2026-10-04T11:00:00Z');
    expect(Object.isFrozen(org)).toBe(true);
  });

  it('propaga los errores del value object si el id es inválido', () => {
    expect(() => organizationResourceToDomain({ ...resource, id: '' })).toThrow(
      'Organization ID must not be empty',
    );
  });
});