import { DeviceCardComponent } from './device-card.component';
import { Device } from '../../../domain/services/device-query-service';
import { createDeviceId } from '../../../domain/model/valueobjects/device-id.value-object';
import { createSpaceId } from '../../../domain/model/valueobjects/space-id.value-object';
import { createUserId } from '../../../domain/model/valueobjects/user-id.value-object';
import { createHardwareId } from '../../../domain/model/valueobjects/hardware-id.value-object';
import { createDeviceStatus } from '../../../domain/model/valueobjects/device-status.value-object';
import { DeviceTelemetrySnapshot } from '../../../application/internal/outboundservices/acl/external-telemetry-evaluation.service';

const device = (overrides: Partial<Device> = {}): Device =>
  ({
    id: createDeviceId('device-1'),
    serialNumber: 'SN-001',
    name: 'Sensor Norte',
    status: createDeviceStatus('ONLINE'),
    spaceId: createSpaceId('space-1'),
    ownerUserId: createUserId('user-1'),
    configuration: {},
    thresholds: [],
    hardwareId: createHardwareId('CLAIR-0KBG'),
    deviceType: 'AIR',
    activatedAt: '2026-10-04T08:00:00Z',
    lastSeenAt: '2026-10-04T09:59:00Z',
    createdAt: '2026-10-04T07:00:00Z',
    updatedAt: '2026-10-04T09:59:00Z',
    ...overrides,
  }) as Device;

const telemetry = (overrides: Partial<DeviceTelemetrySnapshot> = {}): DeviceTelemetrySnapshot => ({
  connectivityStatus: 'CONNECTED',
  connectivitySignalStrength: -50,
  uptime: 1,
  healthStatus: 1,
  lastUpdateMinutes: 0,
  network: null,
  location: null,
  ...overrides,
});

describe('DeviceCardComponent', () => {
  let component: DeviceCardComponent;

  beforeEach(() => {
    component = new DeviceCardComponent();
  });

  describe('statusColor', () => {
    it.each([
      ['ONLINE', '#10b981'],
      ['STANDBY', '#6b7280'],
      ['OFFLINE', '#6b7280'],
      ['MAINTENANCE', '#f59e0b'],
      ['ERROR', '#ef4444'],
      ['DECOMMISSIONED', '#ef4444'],
      ['UNKNOWN', '#6b7280'],
    ])('el status %s usa %s', (status, color) => {
      expect(component.statusColor(status)).toBe(color);
    });
  });

  describe('powerIndicatorColor', () => {
    it.each([
      ['ONLINE', '#10b981'],
      ['MAINTENANCE', '#f59e0b'],
      ['ERROR', '#ef4444'],
      ['DECOMMISSIONED', '#ef4444'],
      ['OFFLINE', '#6b7280'],
      ['STANDBY', '#6b7280'],
    ] as const)('el device en %s usa %s', (status, color) => {
      component.device = device({ status: createDeviceStatus(status) });

      expect(component.powerIndicatorColor()).toBe(color);
    });
  });

  describe('connectivityIndicatorColor', () => {
    it('sin telemetría usa el gris neutro', () => {
      component.telemetry = null;

      expect(component.connectivityIndicatorColor()).toBe('#9ca3af');
    });

    it('conectado con buena señal usa verde', () => {
      component.telemetry = telemetry({ connectivitySignalStrength: -50 });

      expect(component.connectivityIndicatorColor()).toBe('#10b981');
    });

    it('conectado con señal mala usa rojo', () => {
      component.telemetry = telemetry({ connectivitySignalStrength: -100 });

      expect(component.connectivityIndicatorColor()).toBe('#ef4444');
    });
  });

  describe('onDeviceClick', () => {
    it('emite deviceSelected con el device actual', () => {
      const testDevice = device();
      component.device = testDevice;
      const emit = vi.fn();
      component.deviceSelected.subscribe(emit);

      component.onDeviceClick();

      expect(emit).toHaveBeenCalledWith(testDevice);
      expect(emit).toHaveBeenCalledOnce();
    });
  });

  describe('valores por defecto', () => {
    it('viewMode empieza en "grid"', () => {
      expect(component.viewMode).toBe('grid');
    });

    it('telemetry empieza en null', () => {
      expect(component.telemetry).toBeNull();
    });
  });
});