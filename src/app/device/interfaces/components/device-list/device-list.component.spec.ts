import { DeviceListComponent } from './device-list.component';
import { Device } from '../../../domain/services/device-query-service';
import { createDeviceId } from '../../../domain/model/valueobjects/device-id.value-object';

const device = (overrides: Partial<Device> = {}): Device =>
  ({
    id: createDeviceId('device-1'),
    name: 'Sensor Norte',
    serialNumber: 'SN-001',
    ...overrides,
  }) as Device;

describe('DeviceListComponent', () => {
  let component: DeviceListComponent;

  beforeEach(() => {
    component = new DeviceListComponent();
  });

  describe('trackByDeviceId', () => {
    it('devuelve el value del id del device', () => {
      const d = device({ id: createDeviceId('device-abc') });

      expect(component.trackByDeviceId(0, d)).toBe('device-abc');
    });

    it('el índice no afecta al resultado', () => {
      const d = device({ id: createDeviceId('device-abc') });

      expect(component.trackByDeviceId(99, d)).toBe('device-abc');
    });
  });

  describe('setViewMode', () => {
    it('emite viewModeChanged con el modo recibido', () => {
      const emit = vi.fn();
      component.viewModeChanged.subscribe(emit);

      component.setViewMode('list');

      expect(emit).toHaveBeenCalledWith('list');
      expect(emit).toHaveBeenCalledOnce();
    });

    it('emite "grid" también', () => {
      const emit = vi.fn();
      component.viewModeChanged.subscribe(emit);

      component.setViewMode('grid');

      expect(emit).toHaveBeenCalledWith('grid');
    });
  });

  describe('onDeviceSelected', () => {
    it('emite deviceSelected con el device recibido', () => {
      const d = device();
      const emit = vi.fn();
      component.deviceSelected.subscribe(emit);

      component.onDeviceSelected(d);

      expect(emit).toHaveBeenCalledWith(d);
    });
  });

  describe('valores por defecto', () => {
    it('viewMode empieza en "grid"', () => {
      expect(component.viewMode).toBe('grid');
    });

    it('loadingDevices empieza en false', () => {
      expect(component.loadingDevices).toBe(false);
    });

    it('errorDevices empieza como string vacío', () => {
      expect(component.errorDevices).toBe('');
    });

    it('selectedSpace empieza en null', () => {
      expect(component.selectedSpace).toBeNull();
    });

    it('devicesPage empieza en null', () => {
      expect(component.devicesPage).toBeNull();
    });

    it('telemetryByDeviceId empieza como objeto vacío', () => {
      expect(component.telemetryByDeviceId).toEqual({});
    });
  });
});