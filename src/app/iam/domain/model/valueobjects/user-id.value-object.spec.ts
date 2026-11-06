import { createUserId } from './user-id.value-object';

describe('createUserId', () => {
  it('acepta un id válido, lo recorta y lo congela', () => {
    const id = createUserId('  user-1  ');

    expect(id.value).toBe('user-1');
    expect(Object.isFrozen(id)).toBe(true);
  });

  it.each(['', '   ', null, undefined])('rechaza un id vacío (%j)', (value) => {
    expect(() => createUserId(value as unknown as string)).toThrow('User ID is required');
  });
});