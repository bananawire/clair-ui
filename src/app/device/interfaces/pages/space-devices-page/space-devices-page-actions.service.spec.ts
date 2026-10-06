import { firstValueFrom, of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { SpaceDevicesPageActionsService } from './space-devices-page-actions.service';
import { DeviceCommandService } from '../../../domain/services/device-command-service';
import { DeviceQueryService } from '../../../domain/services/device-query-service';
import { DeviceStatusQueryService } from '../../../domain/services/device-status-query-service';
import { DeviceThresholdQueryService } from '../../../domain/services/device-threshold-query-service';
import { ExternalTelemetryEvaluationService } from '../../../application/internal/outboundservices/acl/external-telemetry-evaluation.service';
import { createSpaceId } from '../../../domain/model/valueobjects/space-id.value-object';
import { createDeviceId } from '../../../domain/model/valueobjects/device-id.value-object';
import { createHardwareId } from '../../../domain/model/valueobjects/hardware-id.value-object';

const translate = { instant: (key: string) => key } as unknown as TranslateService;

describe('SpaceDevicesPageActionsService', () => {
  const commandService = {
    handleClaimDevice: vi.fn(),
    handlePairDevice: vi.fn(),
    handleUpdateSpaceName: vi.fn(),
    handleDeleteSpace: vi.fn(),
    handleUpdateDeviceName: vi.fn(),
    handleDeleteDevice: vi.fn(),
    handleQueueDeviceCommand: vi.fn(),
  };
  const queryService = { handleGetDevicesBySpace: vi.fn() };
  const statusService = { handleGetDeviceStatusById: vi.fn() };
  const thresholdService = { handleGetDeviceThresholdsByDevice: vi.fn() };
  const externalTelemetry = { fetchLatestTelemetryByDevice: vi.fn() };
  const dialog = { open: vi.fn() };
  const snackBar = { open: vi.fn() };

  const service = new SpaceDevicesPageActionsService(
    commandService as unknown as DeviceCommandService,
    queryService as unknown as DeviceQueryService,
    statusService as unknown as DeviceStatusQueryService,
    thresholdService as unknown as DeviceThresholdQueryService,
    externalTelemetry as unknown as ExternalTelemetryEvaluationService,
    dialog as unknown as MatDialog,
    snackBar as unknown as MatSnackBar,
    translate,
  );

  const dialogRef = (result: unknown) => ({
    afterClosed: () => of(result),
  });

  beforeEach(() => vi.resetAllMocks());

  describe('delegaciones simples', () => {
    it('loadDevices crea la query y delega', async () => {
      queryService.handleGetDevicesBySpace.mockReturnValue(of({ content: [] }));

      await firstValueFrom(service.loadDevices(createSpaceId('space-1'), 0, 50));

      expect(queryService.handleGetDevicesBySpace).toHaveBeenCalledWith(
        expect.objectContaining({ page: 0, size: 50 }),
      );
    });

    it('loadLatestTelemetry delega al external telemetry service', async () => {
      externalTelemetry.fetchLatestTelemetryByDevice.mockReturnValue(of(null));

      await firstValueFrom(service.loadLatestTelemetry('device-1'));

      expect(externalTelemetry.fetchLatestTelemetryByDevice).toHaveBeenCalledWith('device-1');
    });

    it('loadDeviceThresholds delega al threshold service', async () => {
      thresholdService.handleGetDeviceThresholdsByDevice.mockReturnValue(of([]));

      await firstValueFrom(service.loadDeviceThresholds('device-1'));

      expect(thresholdService.handleGetDeviceThresholdsByDevice).toHaveBeenCalledOnce();
    });
  });

  describe('loadLatestTelemetryByDevices', () => {
    it('sin devices devuelve {}', async () => {
      const result = await firstValueFrom(service.loadLatestTelemetryByDevices([]));
      expect(result).toEqual({});
    });

    it('con devices combina los snapshots por id', async () => {
      externalTelemetry.fetchLatestTelemetryByDevice
        .mockReturnValueOnce(of({ connectivityStatus: 'CONNECTED' }))
        .mockReturnValueOnce(of(null));

      const result = await firstValueFrom(
        service.loadLatestTelemetryByDevices([
          { id: createDeviceId('d-1') },
          { id: createDeviceId('d-2') },
        ] as never),
      );

      expect(result['d-1']).toEqual({ connectivityStatus: 'CONNECTED' });
      expect(result['d-2']).toBeNull();
    });

    it('un error en un device no rompe el resto', async () => {
      externalTelemetry.fetchLatestTelemetryByDevice
        .mockReturnValueOnce(throwError(() => new Error('boom')))
        .mockReturnValueOnce(of({ connectivityStatus: 'CONNECTED' }));

      const result = await firstValueFrom(
        service.loadLatestTelemetryByDevices([
          { id: createDeviceId('d-1') },
          { id: createDeviceId('d-2') },
        ] as never),
      );

      expect(result['d-1']).toBeNull();
      expect(result['d-2']).toEqual({ connectivityStatus: 'CONNECTED' });
    });
  });

  describe('runClaimDeviceFlow', () => {
    it('cancelar el diálogo no llama al command service', async () => {
      dialog.open.mockReturnValue(dialogRef(undefined));

      const result = await firstValueFrom(
        service.runClaimDeviceFlow({ id: createSpaceId('space-1') } as never),
      );

      expect(result).toBeUndefined();
      expect(commandService.handleClaimDevice).not.toHaveBeenCalled();
    });

    it('confirmar el diálogo llama a handleClaimDevice', async () => {
      dialog.open.mockReturnValue(dialogRef({ claimToken: 'claim-1' }));
      commandService.handleClaimDevice.mockReturnValue(of({}));

      await firstValueFrom(
        service.runClaimDeviceFlow({ id: createSpaceId('space-1') } as never),
      );

      expect(commandService.handleClaimDevice).toHaveBeenCalledWith(
        expect.objectContaining({ claimToken: 'claim-1' }),
      );
      expect(snackBar.open).toHaveBeenCalled();
    });
  });

  describe('runPairDeviceFlow', () => {
    it('cancelar devuelve null', async () => {
      dialog.open.mockReturnValue(dialogRef(undefined));

      const result = await firstValueFrom(service.runPairDeviceFlow());

      expect(result).toBeNull();
    });

    it('confirmar devuelve el claimToken del pairing', async () => {
      dialog.open.mockReturnValue(dialogRef({ hardwareId: 'CLAIR-0KBG' }));
      commandService.handlePairDevice.mockReturnValue(of({ claimToken: 'abc-123' }));

      const result = await firstValueFrom(service.runPairDeviceFlow());

      expect(result).toEqual({ claimToken: 'abc-123' });
      expect(commandService.handlePairDevice).toHaveBeenCalledWith(
        expect.objectContaining({ hardwareId: expect.objectContaining({ value: 'CLAIR-0KBG' }) }),
      );
    });

    it('sin claimToken en el pairing, devuelve null', async () => {
      dialog.open.mockReturnValue(dialogRef({ hardwareId: 'CLAIR-0KBG' }));
      commandService.handlePairDevice.mockReturnValue(of({ claimToken: null }));

      const result = await firstValueFrom(service.runPairDeviceFlow());

      expect(result).toEqual({ claimToken: null });
    });
  });

  describe('runEditSpaceNameFlow', () => {
    it('cancelar devuelve null', async () => {
      dialog.open.mockReturnValue(dialogRef(undefined));

      const result = await firstValueFrom(
        service.runEditSpaceNameFlow({ id: createSpaceId('space-1'), name: 'Sala' } as never),
      );

      expect(result).toBeNull();
    });

    it('confirmar llama a handleUpdateSpaceName y devuelve el nombre', async () => {
      dialog.open.mockReturnValue(dialogRef('Sala 2'));
      commandService.handleUpdateSpaceName.mockReturnValue(of(undefined));

      const result = await firstValueFrom(
        service.runEditSpaceNameFlow({ id: createSpaceId('space-1'), name: 'Sala' } as never),
      );

      expect(result).toBe('Sala 2');
      expect(commandService.handleUpdateSpaceName).toHaveBeenCalledOnce();
    });
  });

  describe('runDeleteSpaceFlow', () => {
    it('cancelar devuelve false sin llamar al comando', async () => {
      dialog.open.mockReturnValue(dialogRef(false));

      const result = await firstValueFrom(service.runDeleteSpaceFlow(createSpaceId('space-1')));

      expect(result).toBe(false);
      expect(commandService.handleDeleteSpace).not.toHaveBeenCalled();
    });

    it('confirmar llama a handleDeleteSpace y devuelve true', async () => {
      dialog.open.mockReturnValue(dialogRef(true));
      commandService.handleDeleteSpace.mockReturnValue(of(undefined));

      const result = await firstValueFrom(service.runDeleteSpaceFlow(createSpaceId('space-1')));

      expect(result).toBe(true);
      expect(commandService.handleDeleteSpace).toHaveBeenCalledOnce();
    });
  });

  describe('runDeleteDeviceFlow', () => {
    it('cancelar devuelve false', async () => {
      dialog.open.mockReturnValue(dialogRef(false));

      const result = await firstValueFrom(
        service.runDeleteDeviceFlow({ id: createDeviceId('device-1'), name: 'Sensor' } as never),
      );

      expect(result).toBe(false);
    });

    it('confirmar llama a handleDeleteDevice', async () => {
      dialog.open.mockReturnValue(dialogRef(true));
      commandService.handleDeleteDevice.mockReturnValue(of(undefined));

      const result = await firstValueFrom(
        service.runDeleteDeviceFlow({ id: createDeviceId('device-1'), name: 'Sensor' } as never),
      );

      expect(result).toBe(true);
    });
  });

  describe('runToggleDevicePowerFlow', () => {
    it('con device DECOMMISSIONED no llama al command service', async () => {
      const device = {
        id: createDeviceId('device-1'),
        status: 'DECOMMISSIONED',
      };

      await firstValueFrom(service.runToggleDevicePowerFlow(device as never, 'STANDBY'));

      expect(commandService.handleQueueDeviceCommand).not.toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalled();
    });

    it('con device no DECOMMISSIONED encola el comando', async () => {
      const device = { id: createDeviceId('device-1'), status: 'ONLINE' };
      commandService.handleQueueDeviceCommand.mockReturnValue(of({ type: 'STANDBY' }));

      await firstValueFrom(service.runToggleDevicePowerFlow(device as never, 'STANDBY'));

      expect(commandService.handleQueueDeviceCommand).toHaveBeenCalledOnce();
    });
  });
});