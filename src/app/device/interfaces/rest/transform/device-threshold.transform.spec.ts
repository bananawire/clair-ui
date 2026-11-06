import { deviceThresholdResourceToDomain } from './device-threshold.transform';
import { DeviceThresholdResource } from '../resources/device-threshold.resource';

const resource: DeviceThresholdResource = {
  id: 'threshold-1',
  deviceId: 'device-1',
  metric: 'CO2',
  metricLabel: 'CO₂',
  metricUnit: 'ppm',
  value: 1000,
  enabled: true,
  createdAt: '2026-10-04T10:00:00Z',
  updatedAt: '2026-10-04T11:00:00Z',
};

describe('deviceThresholdResourceToDomain', () => {
  it('mapea todos los campos cuando están presentes', () => {
    const threshold = deviceThresholdResourceToDomain(resource);

    expect(threshold.id).toBe('threshold-1');
    expect(threshold.deviceId.value).toBe('device-1');
    expect(threshold.metric).toBe('CO2');
    expect(threshold.metricLabel).toBe('CO₂');
    expect(threshold.metricUnit).toBe('ppm');
    expect(threshold.value).toBe(1000);
    expect(threshold.enabled).toBe(true);
    expect(threshold.createdAt).toBe('2026-10-04T10:00:00Z');
    expect(threshold.updatedAt).toBe('2026-10-04T11:00:00Z');
  });

  it.each([undefined, null])('createdAt ausente (%j) se normaliza a null', (value) => {
    const threshold = deviceThresholdResourceToDomain({
      ...resource,
      createdAt: value as unknown as string,
    });

    expect(threshold.createdAt).toBeNull();
  });

  it.each([undefined, null])('updatedAt ausente (%j) se normaliza a null', (value) => {
    const threshold = deviceThresholdResourceToDomain({
      ...resource,
      updatedAt: value as unknown as string,
    });

    expect(threshold.updatedAt).toBeNull();
  });

  it('propaga el error si el deviceId es inválido', () => {
    expect(() => deviceThresholdResourceToDomain({ ...resource, deviceId: '' })).toThrow(
      'Device ID must not be empty',
    );
  });

  // DEFECTO CONOCIDO: este transform no congela el resultado (Object.freeze),
  // a diferencia de los demás transforms de device.
  it('el resultado NO está congelado (defecto: inconsistente con otros transforms)', () => {
    const threshold = deviceThresholdResourceToDomain(resource);

    expect(Object.isFrozen(threshold)).toBe(false);
  });
});