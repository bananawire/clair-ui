import {
  METRIC_THRESHOLDS,
  getMetricThresholdDetails,
} from './metric-threshold.value-object';

describe('METRIC_THRESHOLDS', () => {
  it('contiene las 4 métricas en orden', () => {
    expect(METRIC_THRESHOLDS).toEqual(['PM25', 'CO2', 'TEMPERATURE', 'HUMIDITY']);
  });
});

describe('getMetricThresholdDetails', () => {
  it.each([
    ['PM25', 'PM2.5', 'µg/m³'],
    ['CO2', 'CO₂', 'ppm'],
    ['TEMPERATURE', 'TEMP', '°C'],
    ['HUMIDITY', 'HUMIDITY', '%'],
  ] as const)('%s devuelve label "%s" y unit "%s"', (metric, label, unit) => {
    expect(getMetricThresholdDetails(metric)).toEqual({ label, unit });
  });
});