import { DeviceInfoCardComponent } from './device-info-card.component';
import { createComponent } from '../../../../testing/component-test-utils';
import { Device } from '../../../domain/services/device-query-service';
import { createDeviceId } from '../../../domain/model/valueobjects/device-id.value-object';
import { createDeviceStatus } from '../../../domain/model/valueobjects/device-status.value-object';
import { DeviceTelemetrySnapshot } from '../../../application/internal/outboundservices/acl/external-telemetry-evaluation.service';

const device = (status = 'ONLINE'): Device =>
  ({ id: createDeviceId('device-1'), status: createDeviceStatus(status) }) as Device;

const telemetry = (overrides: Partial<DeviceTelemetrySnapshot> = {}): DeviceTelemetrySnapshot => ({
  connectivityStatus: 'CONNECTED',
  connectivitySignalStrength: -50,
  uptime: 0,
  healthStatus: 1,
  lastUpdateMinutes: 0,
  network: null,
  location: null,
  ...overrides,
});

describe('DeviceInfoCardComponent', () => {
  const build = () => createComponent(DeviceInfoCardComponent);

  describe('emisiones', () => {
    it.each([
      ['goBack', 'backRequested'],
      ['togglePower', 'powerToggleRequested'],
      ['editDevice', 'editRequested'],
      ['deleteDevice', 'deleteRequested'],
    ] as const)('%s emite %s', (method, event) => {
      const component = build();
      const emit = vi.fn();
      (component[event] as { subscribe: (fn: typeof emit) => void }).subscribe(emit);

      (component[method] as () => void)();

      expect(emit).toHaveBeenCalledOnce();
    });
  });

  describe('getStatusColor', () => {
    it.each([
      ['ONLINE', '#10b981'],
      ['STANDBY', '#6b7280'],
      ['OFFLINE', '#6b7280'],
      ['MAINTENANCE', '#f59e0b'],
      ['ERROR', '#ef4444'],
      ['DECOMMISSIONED', '#ef4444'],
    ] as const)('%s → %s', (status, color) => {
      const component = build();
      component.device = device(status);
      expect(component.getStatusColor()).toBe(color);
    });
  });

  describe('getPowerButtonVariant', () => {
    it('ONLINE → "on"', () => {
      const component = build();
      component.device = device('ONLINE');
      expect(component.getPowerButtonVariant()).toBe('on');
    });

    it.each(['OFFLINE', 'STANDBY', 'MAINTENANCE', 'ERROR', 'DECOMMISSIONED'] as const)(
      '%s → "off"',
      (status) => {
        const component = build();
        component.device = device(status);
        expect(component.getPowerButtonVariant()).toBe('off');
      },
    );
  });

  describe('getConnectivityColor', () => {
    it('sin telemetría devuelve gris neutro', () => {
      const component = build();
      component.telemetry = null;
      expect(component.getConnectivityColor()).toBe('#9ca3af');
    });

    it('conectado con buena señal devuelve verde', () => {
      const component = build();
      component.telemetry = telemetry({ connectivitySignalStrength: -50 });
      expect(component.getConnectivityColor()).toBe('#10b981');
    });
  });

  describe('getConnectivityValue', () => {
    it('sin telemetría devuelve null', () => {
      const component = build();
      component.telemetry = null;
      expect(component.getConnectivityValue()).toBeNull();
    });

    it('con señal devuelve el número', () => {
      const component = build();
      component.telemetry = telemetry({ connectivitySignalStrength: -72 });
      expect(component.getConnectivityValue()).toBe(-72);
    });

    it('con señal null devuelve null', () => {
      const component = build();
      component.telemetry = telemetry({ connectivitySignalStrength: null });
      expect(component.getConnectivityValue()).toBeNull();
    });
  });

  describe('formatUptime', () => {
    it('sin uptime devuelve "--"', () => {
      const component = build();
      component.telemetry = null;
      expect(component.formatUptime()).toBe('--');
    });

    it('con menos de 60 segundos usa la clave seconds', () => {
      const component = build();
      component.telemetry = telemetry({ uptime: 30 });
      expect(component.formatUptime()).toBe('deviceInfoCard.uptime.seconds:{"seconds":30}');
    });

    it('con minutos usa la clave minutes', () => {
      const component = build();
      component.telemetry = telemetry({ uptime: 120 });
      expect(component.formatUptime()).toBe('deviceInfoCard.uptime.minutes:{"minutes":2}');
    });

    it('con horas usa la clave hours con minutos restantes', () => {
      const component = build();
      component.telemetry = telemetry({ uptime: 3700 }); // 1h 1m
      expect(component.formatUptime()).toBe(
        'deviceInfoCard.uptime.hours:{"hours":1,"minutes":1}',
      );
    });

    it('con días usa la clave days con horas restantes', () => {
      const component = build();
      component.telemetry = telemetry({ uptime: 90000 }); // 1d 1h
      expect(component.formatUptime()).toBe(
        'deviceInfoCard.uptime.days:{"days":1,"hours":1}',
      );
    });
  });
});