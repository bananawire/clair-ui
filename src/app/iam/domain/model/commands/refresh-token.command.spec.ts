import { createRefreshTokenCommand } from './refresh-token.command';
import { createRefreshToken } from '../valueobjects/refresh-token.value-object';

describe('createRefreshTokenCommand', () => {
  it('empaqueta el refreshToken y es inmutable', () => {
    const refreshToken = createRefreshToken('refresh-123');

    const command = createRefreshTokenCommand(refreshToken);

    expect(command.refreshToken).toBe(refreshToken);
    expect(Object.isFrozen(command)).toBe(true);
  });
});