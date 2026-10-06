import { spaceResourceToDomain } from './space.transform';
import { SpaceResource } from '../resources/space.resource';

const resource: SpaceResource = {
  id: 'space-1',
  name: 'Sala 1',
  organizationId: 'org-1',
  ownerUserId: 'user-1',
  createdAt: '2026-10-04T10:00:00Z',
  updatedAt: '2026-10-04T11:00:00Z',
};

describe('spaceResourceToDomain', () => {
  it('convierte id, organizationId y ownerUserId en value objects y congela', () => {
    const space = spaceResourceToDomain(resource);

    expect(space.id.value).toBe('space-1');
    expect(space.name).toBe('Sala 1');
    expect(space.organizationId.value).toBe('org-1');
    expect(space.ownerUserId.value).toBe('user-1');
    expect(Object.isFrozen(space)).toBe(true);
  });

  it.each([
    ['id', { id: '' }, 'Space ID must not be empty'],
    ['organizationId', { organizationId: '' }, 'Organization ID must not be empty'],
    ['ownerUserId', { ownerUserId: '' }, 'User ID must not be empty'],
  ])('propaga el error cuando %s es inválido', (_label, override, message) => {
    expect(() => spaceResourceToDomain({ ...resource, ...override })).toThrow(message);
  });
});