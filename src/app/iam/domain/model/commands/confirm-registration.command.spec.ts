import { createConfirmRegistrationCommand } from './confirm-registration.command';
import { createVerificationCode } from '../valueobjects/verification-code.value-object';

const code = createVerificationCode('ABCD-1234');

describe('createConfirmRegistrationCommand', () => {
  it('empaqueta sessionId y code, recorta espacios y es inmutable', () => {
    const command = createConfirmRegistrationCommand('  session-1  ', code);

    expect(command.sessionId).toBe('session-1');
    expect(command.code).toBe(code);
    expect(Object.isFrozen(command)).toBe(true);
  });

  it.each(['', '   ', null, undefined])('rechaza un sessionId vacío (%j)', (value) => {
    expect(() => createConfirmRegistrationCommand(value as unknown as string, code)).toThrow(
      'Session ID is required',
    );
  });
});