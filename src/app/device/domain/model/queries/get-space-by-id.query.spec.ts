import { createGetSpaceByIdQuery } from './get-space-by-id.query';
import { createSpaceId } from '../valueobjects/space-id.value-object';

describe('createGetSpaceByIdQuery', () => {
  it('empaqueta el spaceId y es inmutable', () => {
    const spaceId = createSpaceId('space-1');

    const query = createGetSpaceByIdQuery(spaceId);

    expect(query.spaceId).toBe(spaceId);
    expect(Object.isFrozen(query)).toBe(true);
  });
});