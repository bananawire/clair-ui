import { createVerifyTokenQuery } from './verify-token.query';
import { createAccessToken } from '../valueobjects/access-token.value-object';

describe('createVerifyTokenQuery', () => {
  it('empaqueta el accessToken y es inmutable', () => {
    const accessToken = createAccessToken('access-123');

    const query = createVerifyTokenQuery(accessToken);

    expect(query.accessToken).toBe(accessToken);
    expect(Object.isFrozen(query)).toBe(true);
  });
});