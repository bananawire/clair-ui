import { createSignUpCommand } from './sign-up.command';
import { createEmail } from '../valueobjects/email.value-object';
import { createPassword } from '../valueobjects/password.value-object';

describe('createSignUpCommand', () => {
  it('empaqueta email y password y es inmutable', () => {
    const email = createEmail('usuario@test.com');
    const password = createPassword('Clave1!A');

    const command = createSignUpCommand(email, password);

    expect(command.email).toBe(email);
    expect(command.password).toBe(password);
    expect(Object.isFrozen(command)).toBe(true);
  });
});