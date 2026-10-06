import { DeviceThresholdsCardComponent } from './device-thresholds-card.component';
import { createComponent } from '../../../../testing/component-test-utils';
import { DeviceThreshold } from '../../../domain/services/device-threshold-query-service';

const threshold = (metric: string, value = 100): DeviceThreshold =>
  ({ metric, value, enabled: true }) as DeviceThreshold;

describe('DeviceThresholdsCardComponent', () => {
  const build = () => createComponent(DeviceThresholdsCardComponent);

  it('expone las 4 métricas', () => {
    const component = build();
    expect(component.metrics).toEqual(['PM25', 'CO2', 'TEMPERATURE', 'HUMIDITY']);
  });

  it.each([
    ['PM25', 'pm25'],
    ['CO2', 'co2'],
    ['TEMPERATURE', 'temperature'],
    ['HUMIDITY', 'humidity'],
  ] as const)('getMetricTranslationKey(%s) → "%s"', (metric, key) => {
    const component = build();
    expect(component.getMetricTranslationKey(metric)).toBe(key);
  });

  describe('thresholdFor', () => {
    it('sin thresholds (null) devuelve null', () => {
      const component = build();
      component.thresholds = null;
      expect(component.thresholdFor('CO2')).toBeNull();
    });

    it('sin thresholds (array vacío) devuelve null', () => {
      const component = build();
      component.thresholds = [];
      expect(component.thresholdFor('CO2')).toBeNull();
    });

    it('encuentra el threshold por métrica', () => {
      const component = build();
      const t = threshold('CO2', 1000);
      component.thresholds = [threshold('PM25', 35), t, threshold('HUMIDITY', 80)];
      expect(component.thresholdFor('CO2')).toBe(t);
    });

    it('con la métrica ausente devuelve null', () => {
      const component = build();
      component.thresholds = [threshold('CO2'), threshold('PM25')];
      expect(component.thresholdFor('TEMPERATURE')).toBeNull();
    });
  });

  describe('editThresholds', () => {
    it('emite editRequested', () => {
      const component = build();
      const emit = vi.fn();
      component.editRequested.subscribe(emit);

      component.editThresholds();

      expect(emit).toHaveBeenCalledOnce();
    });
  });

  it('deviceId por defecto es string vacío', () => {
    expect(build().deviceId).toBe('');
  });

  it('telemetry por defecto es null', () => {
    expect(build().telemetry).toBeNull();
  });
});