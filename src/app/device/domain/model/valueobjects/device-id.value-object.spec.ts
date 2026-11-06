import { createDeviceId } from './device-id.value-object';

describe('createDeviceId', () => {
  it('acepta un id válido, lo recorta y lo congela', () => {
    const id = createDeviceId('  device-1  ');

    expect(id.value).toBe('device-1');
    expect(Object.isFrozen(id)).toBe(true);
  });

  it.each(['', '   ', null, undefined])('rechaza un id vacío (%j)', (value) => {
    expect(() => createDeviceId(value as unknown as string)).toThrow('Device ID must not be empty');
  });
});