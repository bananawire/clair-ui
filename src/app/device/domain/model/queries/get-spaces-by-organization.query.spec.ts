import { createGetSpacesByOrganizationQuery } from './get-spaces-by-organization.query';
import { createOrganizationId } from '../valueobjects/organization-id.value-object';

describe('createGetSpacesByOrganizationQuery', () => {
  it('empaqueta el organizationId y es inmutable', () => {
    const organizationId = createOrganizationId('org-1');

    const query = createGetSpacesByOrganizationQuery(organizationId);

    expect(query.organizationId).toBe(organizationId);
    expect(Object.isFrozen(query)).toBe(true);
  });
});