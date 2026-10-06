import { resolveDeviceConnectivityColor } from './device-connectivity-color.transform';
import { DeviceTelemetrySnapshot } from '../../../application/internal/outboundservices/acl/external-telemetry-evaluation.service';

const snapshot = (
  overrides: Partial<DeviceTelemetrySnapshot> = {},
): DeviceTelemetrySnapshot =>
  ({
    connectivityStatus: 'CONNECTED',
    connectivitySignalStrength: -50,
    ...overrides,
  }) as DeviceTelemetrySnapshot;

describe('resolveDeviceConnectivityColor', () => {
  it('sin telemetría devuelve el gris neutro', () => {
    expect(resolveDeviceConnectivityColor(null)).toBe('#9ca3af');
  });

  it('sin status devuelve el gris neutro', () => {
    expect(resolveDeviceConnectivityColor(snapshot({ connectivityStatus: null }))).toBe('#9ca3af');
    expect(resolveDeviceConnectivityColor(snapshot({ connectivityStatus: '  ' }))).toBe('#9ca3af');
  });

  it('con status OFFLINE devuelve gris oscuro', () => {
    expect(resolveDeviceConnectivityColor(snapshot({ connectivityStatus: 'OFFLINE' }))).toBe('#6b7280');
  });

  // DEFECTO CONOCIDO: 'DISCONNECTED'.includes('CONNECTED') === true, así que
  // el matcher de substring clasifica DISCONNECTED como conectado.
  // Reportado al equipo. Cuando lo arreglen, este test debe pasar.
  it.fails('con status DISCONNECTED debería devolver gris oscuro (defecto)', () => {
    expect(resolveDeviceConnectivityColor(snapshot({ connectivityStatus: 'DISCONNECTED' }))).toBe(
      '#6b7280',
    );
  });

  it.each([
    ['CONNECTED', '#10b981'],
    ['connected', '#10b981'],
    ['ONLINE', '#10b981'],
    ['online', '#10b981'],
    ['UP', '#10b981'],
    [' connected ', '#10b981'],
  ])('detecta el status %j como conectado', (status, expected) => {
    expect(resolveDeviceConnectivityColor(snapshot({ connectivityStatus: status }))).toBe(expected);
  });

  it('conectado sin señal devuelve verde (sin dato de intensidad)', () => {
    expect(
      resolveDeviceConnectivityColor(
        snapshot({ connectivityStatus: 'CONNECTED', connectivitySignalStrength: null }),
      ),
    ).toBe('#10b981');
  });

  it.each([
    [-50, '#10b981'],
    [-70, '#10b981'],
    [-71, '#f59e0b'],
    [-85, '#f59e0b'],
    [-86, '#ef4444'],
    [-100, '#ef4444'],
  ])('conectado con señal %s devuelve %s', (strength, expected) => {
    expect(
      resolveDeviceConnectivityColor(
        snapshot({ connectivityStatus: 'CONNECTED', connectivitySignalStrength: strength }),
      ),
    ).toBe(expected);
  });
});