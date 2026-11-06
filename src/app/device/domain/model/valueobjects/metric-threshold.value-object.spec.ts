import {
  METRIC_THRESHOLDS,
  NON_THRESHOLD_OUTDOOR_STATUS_FIELDS,
  getMetricThresholdDetails,
} from './metric-threshold.value-object';

describe('METRIC_THRESHOLDS', () => {
  it('incluye rainfall/water level y excluye battery/solar', () => {
    expect(METRIC_THRESHOLDS).toEqual([
      'PM25',
      'CO2',
      'TEMPERATURE',
      'HUMIDITY',
      'RAINFALL',
      'WATER_LEVEL',
    ]);
    expect(METRIC_THRESHOLDS).not.toContain('BATTERY' as never);
    expect(NON_THRESHOLD_OUTDOOR_STATUS_FIELDS).toEqual(['batteryPercent', 'solarCharging']);
  });
});

describe('getMetricThresholdDetails', () => {
  it.each([
    ['PM25', 'PM2.5', 'µg/m³'],
    ['CO2', 'CO₂', 'ppm'],
    ['TEMPERATURE', 'TEMP', '°C'],
    ['HUMIDITY', 'HUMIDITY', '%'],
    ['RAINFALL', 'RAIN', 'mm'],
    ['WATER_LEVEL', 'WATER', 'cm'],
  ] as const)('%s devuelve label "%s" y unit "%s"', (metric, label, unit) => {
    expect(getMetricThresholdDetails(metric)).toEqual({ label, unit });
  });
});
