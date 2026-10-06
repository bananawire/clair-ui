import { firstValueFrom, of } from 'rxjs';
import { DeviceContextFacadeImpl } from './device-context-facade.impl';
import { DeviceQueryService } from '../../domain/services/device-query-service';
import { createOrganizationId } from '../../domain/model/valueobjects/organization-id.value-object';
import { createSpaceId } from '../../domain/model/valueobjects/space-id.value-object';
import { createDeviceId } from '../../domain/model/valueobjects/device-id.value-object';
import { createUserId } from '../../domain/model/valueobjects/user-id.value-object';

describe('DeviceContextFacadeImpl', () => {
  const queryService = {
    handleGetCurrentUserOrganizations: vi.fn(),
    handleGetSpacesByOrganization: vi.fn(),
    handleGetDevicesBySpace: vi.fn(),
  };
  const facade = new DeviceContextFacadeImpl(queryService as unknown as DeviceQueryService);

  beforeEach(() => vi.resetAllMocks());

  describe('getOrganizations', () => {
    it('aplana cada organización a { id, name }', async () => {
      queryService.handleGetCurrentUserOrganizations.mockReturnValue(
        of([
          { id: createOrganizationId('org-1'), name: 'Org 1' },
          { id: createOrganizationId('org-2'), name: 'Org 2' },
        ]),
      );

      const result = await firstValueFrom(facade.getOrganizations());

      expect(queryService.handleGetCurrentUserOrganizations).toHaveBeenCalledOnce();
      expect(result).toEqual([
        { id: 'org-1', name: 'Org 1' },
        { id: 'org-2', name: 'Org 2' },
      ]);
    });
  });

  describe('getSpacesByOrganization', () => {
    it('crea la query con organizationId y aplana cada space', async () => {
      queryService.handleGetSpacesByOrganization.mockReturnValue(
        of([
          {
            id: createSpaceId('space-1'),
            name: 'Sala 1',
            organizationId: createOrganizationId('org-1'),
            ownerUserId: createUserId('user-1'),
            createdAt: 'x',
            updatedAt: 'y',
          },
        ]),
      );

      const result = await firstValueFrom(facade.getSpacesByOrganization('org-1'));

      expect(queryService.handleGetSpacesByOrganization).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: expect.objectContaining({ value: 'org-1' }) }),
      );
      expect(result).toEqual([
        { id: 'space-1', name: 'Sala 1', organizationId: 'org-1' },
      ]);
    });
  });

  describe('getDevicesBySpace', () => {
    it('pide page 0 y size 100 y aplana el content', async () => {
      queryService.handleGetDevicesBySpace.mockReturnValue(
        of({
          content: [
            {
              id: createDeviceId('device-1'),
              name: 'Sensor Norte',
              serialNumber: 'SN-001',
            },
          ],
          totalElements: 1,
          totalPages: 1,
          size: 100,
          number: 0,
        }),
      );

      const result = await firstValueFrom(facade.getDevicesBySpace('space-1'));

      expect(queryService.handleGetDevicesBySpace).toHaveBeenCalledWith(
        expect.objectContaining({ page: 0, size: 100 }),
      );
      expect(result).toEqual([
        { id: 'device-1', name: 'Sensor Norte', serialNumber: 'SN-001' },
      ]);
    });
  });
});