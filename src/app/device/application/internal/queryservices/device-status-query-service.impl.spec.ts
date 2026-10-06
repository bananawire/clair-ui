import { firstValueFrom, of, throwError } from 'rxjs';
import { DeviceStatusQueryServiceImpl } from './device-status-query-service.impl';
import { DeviceHttpGateway } from '../../../infrastructure/api/gateways/device-http.gateway';
import { createGetDeviceStatusByIdQuery } from '../../../domain/model/queries/get-device-status-by-id.query';
import { createDeviceId } from '../../../domain/model/valueobjects/device-id.value-object';

const deviceId = createDeviceId('device-1');

describe('DeviceStatusQueryServiceImpl', () => {
  const gateway = { getDeviceStatus: vi.fn() };
  const service = new DeviceStatusQueryServiceImpl(gateway as unknown as DeviceHttpGateway);

  beforeEach(() => vi.resetAllMocks());

  it('consulta el status del device y lo mapea a dominio', async () => {
    gateway.getDeviceStatus.mockReturnValue(
      of({ deviceId: 'device-1', status: 'ONLINE', lastSeenAt: '2026-10-04T09:59:00Z' }),
    );

    const result = await firstValueFrom(
      service.handleGetDeviceStatusById(createGetDeviceStatusByIdQuery(deviceId)),
    );

    expect(gateway.getDeviceStatus).toHaveBeenCalledWith('device-1');
    expect(result?.deviceId.value).toBe('device-1');
    expect(result?.status).toBe('ONLINE');
  });

  it('un error del gateway devuelve null (no propaga)', async () => {
    gateway.getDeviceStatus.mockReturnValue(throwError(() => new Error('404')));

    const result = await firstValueFrom(
      service.handleGetDeviceStatusById(createGetDeviceStatusByIdQuery(deviceId)),
    );

    expect(result).toBeNull();
  });
});