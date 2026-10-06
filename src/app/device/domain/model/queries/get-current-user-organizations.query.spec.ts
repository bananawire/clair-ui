
import { createGetCurrentUserOrganizationsQuery } from './get-current-user-organizations.query';

describe('createGetCurrentUserOrganizationsQuery', () => {
  it('devuelve un objeto vacío congelado', () => {
    const query = createGetCurrentUserOrganizationsQuery();

    expect(query).toEqual({});
    expect(Object.isFrozen(query)).toBe(true);
  });
});