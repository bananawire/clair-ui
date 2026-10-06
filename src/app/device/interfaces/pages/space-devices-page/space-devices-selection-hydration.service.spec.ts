import { firstValueFrom, of } from 'rxjs';
import { SpaceDevicesSelectionHydrationService } from './space-devices-selection-hydration.service';
import { DeviceQueryService } from '../../../domain/services/device-query-service';
import { createDeviceId } from '../../../domain/model/valueobjects/device-id.value-object';
import { createSpaceId } from '../../../domain/model/valueobjects/space-id.value-object';

describe('SpaceDevicesSelectionHydrationService', () => {
  const queryService = {
    handleGetDeviceById: vi.fn(),
    handleGetSpaceById: vi.fn(),
  };
  const service = new SpaceDevicesSelectionHydrationService(
    queryService as unknown as DeviceQueryService,
  );

  beforeEach(() => vi.resetAllMocks());

  describe('hydrateFromDeviceId', () => {
    it('con id inválido devuelve null sin llamar al query service', async () => {
      const result = await firstValueFrom(service.hydrateFromDeviceId(''));

      expect(result).toBeNull();
      expect(queryService.handleGetDeviceById).not.toHaveBeenCalled();
    });

    it('con device inexistente devuelve null', async () => {
      queryService.handleGetDeviceById.mockReturnValue(of(null));

      const result = await firstValueFrom(service.hydrateFromDeviceId('device-1'));

      expect(result).toBeNull();
    });

    it('con device sin space devuelve { device, space: null }', async () => {
      queryService.handleGetDeviceById.mockReturnValue(
        of({ id: createDeviceId('device-1'), spaceId: null }),
      );

      const result = await firstValueFrom(service.hydrateFromDeviceId('device-1'));

      expect(result?.space).toBeNull();
      expect(result?.device.id.value).toBe('device-1');
    });

    it('con device con space hidrata ambos', async () => {
      const space = { id: createSpaceId('space-1'), name: 'Sala' };
      queryService.handleGetDeviceById.mockReturnValue(
        of({ id: createDeviceId('device-1'), spaceId: createSpaceId('space-1') }),
      );
      queryService.handleGetSpaceById.mockReturnValue(of(space));

      const result = await firstValueFrom(service.hydrateFromDeviceId('device-1'));

      expect(result?.space).toBe(space);
      expect(result?.device.id.value).toBe('device-1');
    });
  });

  describe('hydrateFromSpaceId', () => {
    it('con id inválido devuelve null', async () => {
      const result = await firstValueFrom(service.hydrateFromSpaceId(''));
      expect(result).toBeNull();
    });

    it('delega al query service con el space id parseado', async () => {
      const space = { id: createSpaceId('space-1') };
      queryService.handleGetSpaceById.mockReturnValue(of(space));

      const result = await firstValueFrom(service.hydrateFromSpaceId('space-1'));

      expect(result).toBe(space);
      expect(queryService.handleGetSpaceById).toHaveBeenCalledWith(
        expect.objectContaining({ spaceId: expect.objectContaining({ value: 'space-1' }) }),
      );
    });
  });
});