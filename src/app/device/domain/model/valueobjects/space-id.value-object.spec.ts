import { createSpaceId } from './space-id.value-object';

describe('createSpaceId', () => {
  it('acepta un id válido, lo recorta y lo congela', () => {
    const id = createSpaceId('  space-1  ');

    expect(id.value).toBe('space-1');
    expect(Object.isFrozen(id)).toBe(true);
  });

  it.each(['', '   ', null, undefined])('rechaza un id vacío (%j)', (value) => {
    expect(() => createSpaceId(value as unknown as string)).toThrow('Space ID must not be empty');
  });
});