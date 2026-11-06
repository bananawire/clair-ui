import { deviceResourceToDomain, devicePageResourceToDomain } from './device.transform';
import { DeviceResource } from '../resources/device.resource';

const resource: DeviceResource = {
  id: 'device-1',
  serialNumber: 'SN-0001',
  name: 'Sensor Norte',
  status: 'ONLINE',
  spaceId: 'space-1',
  ownerUserId: 'user-1',
  configuration: { samplingIntervalSeconds: 30 },
  thresholds: [],
  hardwareId: 'CLAIR-0KBG',
  deviceType: 'AIR_QUALITY_SENSOR',
  activatedAt: '2026-10-04T08:00:00Z',
  lastSeenAt: '2026-10-04T09:59:00Z',
  createdAt: '2026-10-04T07:00:00Z',
  updatedAt: '2026-10-04T09:59:00Z',
} as unknown as DeviceResource;

describe('deviceResourceToDomain', () => {
  it('convierte los campos principales y congela el resultado', () => {
    const device = deviceResourceToDomain(resource);

    expect(device.id.value).toBe('device-1');
    expect(device.serialNumber).toBe('SN-0001');
    expect(device.name).toBe('Sensor Norte');
    expect(device.status).toBe('ONLINE');
    expect(device.spaceId?.value).toBe('space-1');
    expect(device.ownerUserId?.value).toBe('user-1');
    expect(device.hardwareId.value).toBe('CLAIR-0KBG');
    expect(Object.isFrozen(device)).toBe(true);
  });

  it('spaceId y ownerUserId nulos se preservan como null', () => {
    const device = deviceResourceToDomain({
      ...resource,
      spaceId: null,
      ownerUserId: null,
    } as unknown as DeviceResource);

    expect(device.spaceId).toBeNull();
    expect(device.ownerUserId).toBeNull();
  });

  it('configuration se copia y se congela (no comparte referencia)', () => {
    const config = { samplingIntervalSeconds: 30 };
    const device = deviceResourceToDomain({ ...resource, configuration: config } as unknown as DeviceResource);

    expect(device.configuration).toEqual(config);
    expect(Object.isFrozen(device.configuration)).toBe(true);
    expect(device.configuration).not.toBe(config);
  });

  it('sin thresholds en el resource → array vacío congelado', () => {
    const device = deviceResourceToDomain({ ...resource, thresholds: undefined } as unknown as DeviceResource);

    expect(device.thresholds).toEqual([]);
    expect(Object.isFrozen(device.thresholds)).toBe(true);
  });

  it('con thresholds → array congelado con los items transformados', () => {
    const device = deviceResourceToDomain({
      ...resource,
      thresholds: [
        {
          id: 't-1',
          deviceId: 'device-1',
          metric: 'CO2',
          metricLabel: 'CO₂',
          metricUnit: 'ppm',
          value: 1000,
          enabled: true,
        },
      ],
    } as unknown as DeviceResource);

    expect(device.thresholds).toHaveLength(1);
    expect(device.thresholds[0].metric).toBe('CO2');
    expect(Object.isFrozen(device.thresholds)).toBe(true);
  });

  it('propaga el error si el hardwareId es inválido', () => {
    expect(() =>
      deviceResourceToDomain({ ...resource, hardwareId: 'INVALID' } as unknown as DeviceResource),
    ).toThrow('Hardware ID must match CLAIR-0KBG or HW-0001');
  });
});

describe('devicePageResourceToDomain', () => {
  const pageResource = {
    content: [resource],
    totalElements: 42,
    totalPages: 3,
    size: 20,
    number: 1,
  };

  it('mapea cada device y conserva la paginación, congelando todo', () => {
    const page = devicePageResourceToDomain(pageResource as never);

    expect(page.content).toHaveLength(1);
    expect(page.content[0].id.value).toBe('device-1');
    expect(page.totalElements).toBe(42);
    expect(page.totalPages).toBe(3);
    expect(page.size).toBe(20);
    expect(page.number).toBe(1);
    expect(Object.isFrozen(page)).toBe(true);
    expect(Object.isFrozen(page.content)).toBe(true);
  });

  it('página vacía deja el content vacío pero congelado', () => {
    const page = devicePageResourceToDomain({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 20,
      number: 0,
    } as never);

    expect(page.content).toEqual([]);
    expect(Object.isFrozen(page.content)).toBe(true);
  });
});