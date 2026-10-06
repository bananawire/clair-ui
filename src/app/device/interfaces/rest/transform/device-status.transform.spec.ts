import { deviceStatusResourceToDomain } from './device-status.transform';
import { DeviceStatusResource } from '../resources/device-status.resource';

const resource: DeviceStatusResource = {
  deviceId: 'device-1',
  status: 'ONLINE',
  lastSeenAt: '2026-10-04T09:59:00Z',
};

describe('deviceStatusResourceToDomain', () => {
  it('convierte deviceId y status, conserva lastSeenAt y congela', () => {
    const snapshot = deviceStatusResourceToDomain(resource);

    expect(snapshot.deviceId.value).toBe('device-1');
    expect(snapshot.status).toBe('ONLINE');
    expect(snapshot.lastSeenAt).toBe('2026-10-04T09:59:00Z');
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it('normaliza el status a mayúsculas', () => {
    expect(deviceStatusResourceToDomain({ ...resource, status: 'online' }).status).toBe('ONLINE');
  });

  it.each([
    ['deviceId inválido', { deviceId: '' }, 'Device ID must not be empty'],
    ['status inválido', { status: 'UNKNOWN' }, 'Invalid device status: UNKNOWN'],
  ])('propaga el error cuando %s', (_label, override, message) => {
    expect(() => deviceStatusResourceToDomain({ ...resource, ...override })).toThrow(message);
  });
});