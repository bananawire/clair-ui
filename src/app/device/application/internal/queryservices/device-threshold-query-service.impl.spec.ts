import { firstValueFrom, of, throwError } from 'rxjs';
import { DeviceThresholdQueryServiceImpl } from './device-threshold-query-service.impl';
import { DeviceThresholdHttpGateway } from '../../../infrastructure/api/gateways/device-threshold-http.gateway';
import { createGetDeviceThresholdsByDeviceQuery } from '../../../domain/model/queries/get-device-thresholds-by-device.query';
import { createDeviceId } from '../../../domain/model/valueobjects/device-id.value-object';

const deviceId = createDeviceId('device-1');

const thresholdResource = {
  id: 't-1',
  deviceId: 'device-1',
  metric: 'CO2' as const,
  metricLabel: 'CO₂',
  metricUnit: 'ppm',
  value: 1000,
  enabled: true,
  createdAt: '2026-10-04T10:00:00Z',
  updatedAt: null,
};

describe('DeviceThresholdQueryServiceImpl', () => {
  const gateway = { getThresholds: vi.fn() };
  const service = new DeviceThresholdQueryServiceImpl(gateway as unknown as DeviceThresholdHttpGateway);

  beforeEach(() => vi.resetAllMocks());

  it('consulta los thresholds del device y mapea cada uno a dominio', async () => {
    gateway.getThresholds.mockReturnValue(of([thresholdResource]));

    const result = await firstValueFrom(
      service.handleGetDeviceThresholdsByDevice(createGetDeviceThresholdsByDeviceQuery(deviceId)),
    );

    expect(gateway.getThresholds).toHaveBeenCalledWith('device-1');
    expect(result).toHaveLength(1);
    expect(result[0].metric).toBe('CO2');
    expect(result[0].deviceId.value).toBe('device-1');
  });

  it('sin thresholds devuelve un array vacío', async () => {
    gateway.getThresholds.mockReturnValue(of([]));

    const result = await firstValueFrom(
      service.handleGetDeviceThresholdsByDevice(createGetDeviceThresholdsByDeviceQuery(deviceId)),
    );

    expect(result).toEqual([]);
  });

  it('propaga errores del gateway', async () => {
    gateway.getThresholds.mockReturnValue(throwError(() => new Error('500')));

    await expect(
      firstValueFrom(service.handleGetDeviceThresholdsByDevice(createGetDeviceThresholdsByDeviceQuery(deviceId))),
    ).rejects.toThrow('500');
  });
});