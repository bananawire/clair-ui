import { createGetOrganizationByIdQuery } from './get-organization-by-id.query';
import { createOrganizationId } from '../valueobjects/organization-id.value-object';

describe('createGetOrganizationByIdQuery', () => {
  it('empaqueta el organizationId y es inmutable', () => {
    const organizationId = createOrganizationId('org-1');

    const query = createGetOrganizationByIdQuery(organizationId);

    expect(query.organizationId).toBe(organizationId);
    expect(Object.isFrozen(query)).toBe(true);
  });
});