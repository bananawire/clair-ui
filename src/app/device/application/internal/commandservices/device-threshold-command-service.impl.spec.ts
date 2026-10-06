import { firstValueFrom, of, throwError } from 'rxjs';
import { DeviceThresholdCommandServiceImpl } from './device-threshold-command-service.impl';
import { DeviceThresholdHttpGateway } from '../../../infrastructure/api/gateways/device-threshold-http.gateway';
import { createCreateDeviceThresholdCommand } from '../../../domain/model/commands/create-device-threshold.command';
import { createUpdateDeviceThresholdCommand } from '../../../domain/model/commands/update-device-threshold.command';
import { createDeleteDeviceThresholdCommand } from '../../../domain/model/commands/delete-device-threshold.command';
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

describe('DeviceThresholdCommandServiceImpl', () => {
  const gateway = {
    createThreshold: vi.fn(),
    updateThreshold: vi.fn(),
    deleteThreshold: vi.fn(),
  };
  const service = new DeviceThresholdCommandServiceImpl(gateway as unknown as DeviceThresholdHttpGateway);

  beforeEach(() => vi.resetAllMocks());

  describe('handleCreateDeviceThreshold', () => {
    it('envía deviceId y resource, mapea el threshold', async () => {
      gateway.createThreshold.mockReturnValue(of(thresholdResource));

      const result = await firstValueFrom(
        service.handleCreateDeviceThreshold(
          createCreateDeviceThresholdCommand(deviceId, 'CO2', 1000, true),
        ),
      );

      expect(gateway.createThreshold).toHaveBeenCalledWith('device-1', {
        metric: 'CO2',
        value: 1000,
        enabled: true,
      });
      expect(result.metric).toBe('CO2');
    });
  });

  describe('handleUpdateDeviceThreshold', () => {
    it('envía deviceId y resource, mapea el threshold', async () => {
      gateway.updateThreshold.mockReturnValue(of({ ...thresholdResource, value: 1200 }));

      const result = await firstValueFrom(
        service.handleUpdateDeviceThreshold(
          createUpdateDeviceThresholdCommand(deviceId, 'CO2', 1200, true),
        ),
      );

      expect(gateway.updateThreshold).toHaveBeenCalledWith('device-1', {
        metric: 'CO2',
        value: 1200,
        enabled: true,
      });
      expect(result.value).toBe(1200);
    });
  });

  describe('handleDeleteDeviceThreshold', () => {
    it('envía deviceId y metric', async () => {
      gateway.deleteThreshold.mockReturnValue(of(undefined));

      await firstValueFrom(
        service.handleDeleteDeviceThreshold(createDeleteDeviceThresholdCommand(deviceId, 'PM25')),
      );

      expect(gateway.deleteThreshold).toHaveBeenCalledWith('device-1', 'PM25');
    });
  });

  it('propaga errores del gateway', async () => {
    gateway.createThreshold.mockReturnValue(throwError(() => new Error('500')));

    await expect(
      firstValueFrom(
        service.handleCreateDeviceThreshold(
          createCreateDeviceThresholdCommand(deviceId, 'CO2', 1000, true),
        ),
      ),
    ).rejects.toThrow('500');
  });
});