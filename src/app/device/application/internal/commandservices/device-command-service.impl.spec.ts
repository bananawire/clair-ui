import { firstValueFrom, of, throwError } from 'rxjs';
import { DeviceCommandServiceImpl } from './device-command-service.impl';
import { DeviceHttpGateway } from '../../../infrastructure/api/gateways/device-http.gateway';
import { createCreateOrganizationCommand } from '../../../domain/model/commands/create-organization.command';
import { createCreateSpaceCommand } from '../../../domain/model/commands/create-space.command';
import { createClaimDeviceCommand } from '../../../domain/model/commands/claim-device.command';
import { createPairDeviceCommand } from '../../../domain/model/commands/pair-device.command';
import { createDeleteOrganizationCommand } from '../../../domain/model/commands/delete-organization.command';
import { createDeleteSpaceCommand } from '../../../domain/model/commands/delete-space.command';
import { createDeleteDeviceCommand } from '../../../domain/model/commands/delete-device.command';
import { createResetDeviceAssignmentCommand } from '../../../domain/model/commands/reset-device-assignment.command';
import { createUpdateSpaceNameCommand } from '../../../domain/model/commands/update-space-name.command';
import { createUpdateOrganizationNameCommand } from '../../../domain/model/commands/update-organization-name.command';
import { createUpdateDeviceNameCommand } from '../../../domain/model/commands/update-device-name.command';
import { createQueueDeviceCommand } from '../../../domain/model/commands/queue-device-command.command';
import { createOrganizationId } from '../../../domain/model/valueobjects/organization-id.value-object';
import { createSpaceId } from '../../../domain/model/valueobjects/space-id.value-object';
import { createDeviceId } from '../../../domain/model/valueobjects/device-id.value-object';
import { createHardwareId } from '../../../domain/model/valueobjects/hardware-id.value-object';
import { createDeviceCommandType } from '../../../domain/model/valueobjects/device-command-type.value-object';

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
const pairingResource = {
  deviceId: 'device-1',
  claimToken: 'claim-abc',
};
const commandResource = {
  id: 'cmd-1',
  deviceId: 'device-1',
  type: 'RESTART',
  status: 'PENDING',
  payload: null,
  sentAt: null,
  executedAt: null,
  failureReason: null,
  createdAt: '2026-10-04T10:00:00Z',
};

describe('DeviceCommandServiceImpl', () => {
  const gateway = {
    createOrganization: vi.fn(),
    createSpace: vi.fn(),
    claimDevice: vi.fn(),
    pairDevice: vi.fn(),
    createDeviceCommand: vi.fn(),
    deleteOrganization: vi.fn(),
    deleteSpace: vi.fn(),
    deleteDevice: vi.fn(),
    updateSpaceName: vi.fn(),
    updateOrganizationName: vi.fn(),
    updateDeviceName: vi.fn(),
  };
  const service = new DeviceCommandServiceImpl(gateway as unknown as DeviceHttpGateway);

  beforeEach(() => vi.resetAllMocks());

  describe('handleCreateOrganization', () => {
    it('envía el recurso del transform y mapea el response', async () => {
      gateway.createOrganization.mockReturnValue(of(orgResource));

      const result = await firstValueFrom(
        service.handleCreateOrganization(createCreateOrganizationCommand('Clair Org')),
      );

      expect(gateway.createOrganization).toHaveBeenCalledWith({ name: 'Clair Org' });
      expect(result.id.value).toBe('org-1');
    });
  });

  describe('handleCreateSpace', () => {
    it('pasa organizationId.value como primer argumento', async () => {
      gateway.createSpace.mockReturnValue(of(spaceResource));

      const result = await firstValueFrom(
        service.handleCreateSpace(
          createCreateSpaceCommand('Sala 1', createOrganizationId('org-1')),
        ),
      );

      expect(gateway.createSpace).toHaveBeenCalledWith('org-1', { name: 'Sala 1' });
      expect(result.id.value).toBe('space-1');
    });
  });

  describe('handleClaimDevice', () => {
    it('envía el recurso y mapea el device', async () => {
      gateway.claimDevice.mockReturnValue(of(deviceResource));

      const result = await firstValueFrom(
        service.handleClaimDevice(createClaimDeviceCommand('claim-abc', createSpaceId('space-1'))),
      );

      expect(gateway.claimDevice).toHaveBeenCalledWith({
        claimToken: 'claim-abc',
        spaceId: 'space-1',
      });
      expect(result.id.value).toBe('device-1');
    });
  });

  describe('handlePairDevice', () => {
    it('envía el resource y mapea el pairing', async () => {
      gateway.pairDevice.mockReturnValue(of(pairingResource));

      const result = await firstValueFrom(
        service.handlePairDevice(createPairDeviceCommand(createHardwareId('CLAIR-0KBG'))),
      );

      expect(gateway.pairDevice).toHaveBeenCalledWith({ hardwareId: 'CLAIR-0KBG' });
      expect(result).toBeTruthy();
    });
  });

  describe('handleQueueDeviceCommand', () => {
    it('pasa deviceId y resource, mapea el command', async () => {
      gateway.createDeviceCommand.mockReturnValue(of(commandResource));

      const result = await firstValueFrom(
        service.handleQueueDeviceCommand(
          createQueueDeviceCommand(
            createDeviceId('device-1'),
            createDeviceCommandType('RESTART'),
            '{"force":true}',
          ),
        ),
      );

      expect(gateway.createDeviceCommand).toHaveBeenCalledWith('device-1', {
        type: 'RESTART',
        payload: '{"force":true}',
      });
      expect(result.id).toBe('cmd-1');
    });
  });

  describe('métodos que devuelven void', () => {
    it('handleDeleteOrganization delega al gateway', async () => {
      gateway.deleteOrganization.mockReturnValue(of(undefined));

      await firstValueFrom(
        service.handleDeleteOrganization(createDeleteOrganizationCommand(createOrganizationId('org-1'))),
      );

      expect(gateway.deleteOrganization).toHaveBeenCalledWith('org-1');
    });

    it('handleDeleteSpace delega al gateway', async () => {
      gateway.deleteSpace.mockReturnValue(of(undefined));

      await firstValueFrom(
        service.handleDeleteSpace(createDeleteSpaceCommand(createSpaceId('space-1'))),
      );

      expect(gateway.deleteSpace).toHaveBeenCalledWith('space-1');
    });

    it('handleDeleteDevice delega al gateway', async () => {
      gateway.deleteDevice.mockReturnValue(of(undefined));

      await firstValueFrom(
        service.handleDeleteDevice(createDeleteDeviceCommand(createDeviceId('device-1'))),
      );

      expect(gateway.deleteDevice).toHaveBeenCalledWith('device-1');
    });

    it('handleResetDeviceAssignment delega al gateway', async () => {
      gateway.deleteDevice.mockReturnValue(of(undefined));

      await firstValueFrom(
        service.handleResetDeviceAssignment(
          createResetDeviceAssignmentCommand(createDeviceId('device-1')),
        ),
      );

      expect(gateway.deleteDevice).toHaveBeenCalledWith('device-1');
    });

    it('handleUpdateSpaceName delega al gateway', async () => {
      gateway.updateSpaceName.mockReturnValue(of(undefined));

      await firstValueFrom(
        service.handleUpdateSpaceName(
          createUpdateSpaceNameCommand(createSpaceId('space-1'), 'Sala 2'),
        ),
      );

      expect(gateway.updateSpaceName).toHaveBeenCalledWith('space-1', { name: 'Sala 2' });
    });

    it('handleUpdateOrganizationName delega al gateway', async () => {
      gateway.updateOrganizationName.mockReturnValue(of(undefined));

      await firstValueFrom(
        service.handleUpdateOrganizationName(
          createUpdateOrganizationNameCommand(createOrganizationId('org-1'), 'Nuevo nombre'),
        ),
      );

      expect(gateway.updateOrganizationName).toHaveBeenCalledWith('org-1', { name: 'Nuevo nombre' });
    });

    it('handleUpdateDeviceName delega al gateway', async () => {
      gateway.updateDeviceName.mockReturnValue(of(undefined));

      await firstValueFrom(
        service.handleUpdateDeviceName(
          createUpdateDeviceNameCommand(createDeviceId('device-1'), 'Sensor Norte'),
        ),
      );

      expect(gateway.updateDeviceName).toHaveBeenCalledWith('device-1', { name: 'Sensor Norte' });
    });
  });

  it('propaga errores del gateway', async () => {
    gateway.createOrganization.mockReturnValue(throwError(() => new Error('500')));

    await expect(
      firstValueFrom(service.handleCreateOrganization(createCreateOrganizationCommand('Org'))),
    ).rejects.toThrow('500');
  });
});