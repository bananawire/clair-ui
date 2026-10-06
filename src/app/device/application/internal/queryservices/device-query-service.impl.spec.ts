import { firstValueFrom, of, throwError } from 'rxjs';
import { DeviceQueryServiceImpl } from './device-query-service.impl';
import { DeviceHttpGateway } from '../../../infrastructure/api/gateways/device-http.gateway';
import { createGetCurrentUserOrganizationsQuery } from '../../../domain/model/queries/get-current-user-organizations.query';
import { createGetOrganizationByIdQuery } from '../../../domain/model/queries/get-organization-by-id.query';
import { createGetSpacesByOrganizationQuery } from '../../../domain/model/queries/get-spaces-by-organization.query';
import { createGetSpaceByIdQuery } from '../../../domain/model/queries/get-space-by-id.query';
import { createGetDevicesBySpaceQuery } from '../../../domain/model/queries/get-devices-by-space.query';
import { createGetDeviceByIdQuery } from '../../../domain/model/queries/get-device-by-id.query';
import { createOrganizationId } from '../../../domain/model/valueobjects/organization-id.value-object';
import { createSpaceId } from '../../../domain/model/valueobjects/space-id.value-object';
import { createDeviceId } from '../../../domain/model/valueobjects/device-id.value-object';

const orgResource = {
  id: 'org-1',
  name: 'Clair Org',
  ownerUserId: 'user-1',
  createdAt: '2026-10-04T10:00:00Z',
  updatedAt: '2026-10-04T11:00:00Z',
};
const spaceResource = {
  id: 'space-1',
  name: 'Sala 1',
  organizationId: 'org-1',
  ownerUserId: 'user-1',
  createdAt: '2026-10-04T10:00:00Z',
  updatedAt: '2026-10-04T11:00:00Z',
};
const deviceResource = {
  id: 'device-1',
  serialNumber: 'SN-0001',
  name: 'Sensor',
  status: 'ONLINE',
  spaceId: 'space-1',
  ownerUserId: 'user-1',
  configuration: {},
  thresholds: [],
  hardwareId: 'CLAIR-0KBG',
  deviceType: 'AIR',
  activatedAt: '2026-10-04T08:00:00Z',
  lastSeenAt: '2026-10-04T09:59:00Z',
  createdAt: '2026-10-04T07:00:00Z',
  updatedAt: '2026-10-04T09:59:00Z',
};

describe('DeviceQueryServiceImpl', () => {
  const gateway = {
    getOrganizations: vi.fn(),
    getOrganizationById: vi.fn(),
    getSpacesByOrganization: vi.fn(),
    getSpaceById: vi.fn(),
    getDevicesBySpace: vi.fn(),
    getDeviceById: vi.fn(),
  };
  const service = new DeviceQueryServiceImpl(gateway as unknown as DeviceHttpGateway);

  beforeEach(() => vi.resetAllMocks());

  describe('handleGetCurrentUserOrganizations', () => {
    it('mapea cada organización', async () => {
      gateway.getOrganizations.mockReturnValue(of([orgResource]));

      const result = await firstValueFrom(
        service.handleGetCurrentUserOrganizations(createGetCurrentUserOrganizationsQuery()),
      );

      expect(gateway.getOrganizations).toHaveBeenCalledOnce();
      expect(result).toHaveLength(1);
      expect(result[0].id.value).toBe('org-1');
    });
  });

  describe('handleGetOrganizationById', () => {
    it('devuelve la organización mapeada', async () => {
      gateway.getOrganizationById.mockReturnValue(of(orgResource));

      const result = await firstValueFrom(
        service.handleGetOrganizationById(createGetOrganizationByIdQuery(createOrganizationId('org-1'))),
      );

      expect(gateway.getOrganizationById).toHaveBeenCalledWith('org-1');
      expect(result?.id.value).toBe('org-1');
    });

    it('un error del gateway devuelve null', async () => {
      gateway.getOrganizationById.mockReturnValue(throwError(() => new Error('404')));

      const result = await firstValueFrom(
        service.handleGetOrganizationById(createGetOrganizationByIdQuery(createOrganizationId('org-1'))),
      );

      expect(result).toBeNull();
    });
  });

  describe('handleGetSpacesByOrganization', () => {
    it('mapea cada espacio', async () => {
      gateway.getSpacesByOrganization.mockReturnValue(of([spaceResource]));

      const result = await firstValueFrom(
        service.handleGetSpacesByOrganization(
          createGetSpacesByOrganizationQuery(createOrganizationId('org-1')),
        ),
      );

      expect(gateway.getSpacesByOrganization).toHaveBeenCalledWith('org-1');
      expect(result[0].id.value).toBe('space-1');
    });
  });

  describe('handleGetSpaceById', () => {
    it('devuelve el space mapeado', async () => {
      gateway.getSpaceById.mockReturnValue(of(spaceResource));

      const result = await firstValueFrom(
        service.handleGetSpaceById(createGetSpaceByIdQuery(createSpaceId('space-1'))),
      );

      expect(result?.id.value).toBe('space-1');
    });

    it('un error del gateway devuelve null', async () => {
      gateway.getSpaceById.mockReturnValue(throwError(() => new Error('404')));

      const result = await firstValueFrom(
        service.handleGetSpaceById(createGetSpaceByIdQuery(createSpaceId('space-1'))),
      );

      expect(result).toBeNull();
    });
  });

  describe('handleGetDevicesBySpace', () => {
    it('pasa spaceId, page y size y mapea la página', async () => {
      gateway.getDevicesBySpace.mockReturnValue(
        of({
          content: [deviceResource],
          totalElements: 1,
          totalPages: 1,
          size: 20,
          number: 0,
        }),
      );

      const result = await firstValueFrom(
        service.handleGetDevicesBySpace(
          createGetDevicesBySpaceQuery(createSpaceId('space-1'), 0, 20),
        ),
      );

      expect(gateway.getDevicesBySpace).toHaveBeenCalledWith('space-1', 0, 20);
      expect(result.content).toHaveLength(1);
      expect(result.totalElements).toBe(1);
    });
  });

  describe('handleGetDeviceById', () => {
    it('devuelve el device mapeado', async () => {
      gateway.getDeviceById.mockReturnValue(of(deviceResource));

      const result = await firstValueFrom(
        service.handleGetDeviceById(createGetDeviceByIdQuery(createDeviceId('device-1'))),
      );

      expect(result?.id.value).toBe('device-1');
    });

    it('un error del gateway devuelve null', async () => {
      gateway.getDeviceById.mockReturnValue(throwError(() => new Error('404')));

      const result = await firstValueFrom(
        service.handleGetDeviceById(createGetDeviceByIdQuery(createDeviceId('device-1'))),
      );

      expect(result).toBeNull();
    });
  });
});