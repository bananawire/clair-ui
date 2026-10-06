import { createGetDevicesBySpaceQuery } from './get-devices-by-space.query';
import { createSpaceId } from '../valueobjects/space-id.value-object';

const spaceId = createSpaceId('space-1');

describe('createGetDevicesBySpaceQuery', () => {
  it('empaqueta spaceId, page y size, y es inmutable', () => {
    const query = createGetDevicesBySpaceQuery(spaceId, 0, 20);

    expect(query.spaceId).toBe(spaceId);
    expect(query.page).toBe(0);
    expect(query.size).toBe(20);
    expect(Object.isFrozen(query)).toBe(true);
  });

  it('acepta los extremos válidos', () => {
    expect(createGetDevicesBySpaceQuery(spaceId, 0, 1).size).toBe(1);
    expect(createGetDevicesBySpaceQuery(spaceId, 999, 100).page).toBe(999);
  });

  it.each([-1, -100])('rechaza la página negativa %s', (page) => {
    expect(() => createGetDevicesBySpaceQuery(spaceId, page, 20)).toThrow(
      'Page must be non-negative',
    );
  });

  it.each([0, -1])('rechaza el size %s', (size) => {
    expect(() => createGetDevicesBySpaceQuery(spaceId, 0, size)).toThrow('Size must be at least 1');
  });

  // DEFECTO CONOCIDO: la validación de page y size no cubre NaN ni decimales.
  // Ejemplo: createGetDevicesBySpaceQuery(spaceId, NaN, 20) no falla.
  it('con NaN en page no lanza (defecto: la validación no cubre NaN)', () => {
    expect(() => createGetDevicesBySpaceQuery(spaceId, NaN, 20)).not.toThrow();
  });
});