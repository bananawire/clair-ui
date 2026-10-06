import { createSignOutCommand } from './sign-out.command';
import { createAccessToken } from '../valueobjects/access-token.value-object';

describe('createSignOutCommand', () => {
  it('empaqueta el accessToken y es inmutable', () => {
    const accessToken = createAccessToken('access-123');

    const command = createSignOutCommand(accessToken);

    expect(command.accessToken).toBe(accessToken);
    expect(Object.isFrozen(command)).toBe(true);
  });
});