import {
  MetricTypes,
  createMetricType,
  metricTypeIcon,
  metricTypeLabel,
  metricTypeUnit,
} from './metric-type.value-object';

describe('MetricTypes', () => {
  it('incluye rainfall y water level además de las métricas indoor', () => {
    expect(MetricTypes).toEqual([
      'PM25',
      'CO2',
      'TEMPERATURE',
      'HUMIDITY',
      'RAINFALL',
      'WATER_LEVEL',
    ]);
  });
});

describe('createMetricType', () => {
  it('acepta RAINFALL y WATER_LEVEL', () => {
    expect(createMetricType('RAINFALL')).toBe('RAINFALL');
    expect(createMetricType('WATER_LEVEL')).toBe('WATER_LEVEL');
  });

  it('rechaza battery/solar porque no son alertables', () => {
    expect(() => createMetricType('BATTERY')).toThrow();
    expect(() => createMetricType('SOLAR_CHARGING')).toThrow();
  });
});

describe('metricType helpers', () => {
  it('expone labels/units/icons outdoor', () => {
    expect(metricTypeLabel('RAINFALL')).toBe('Rainfall');
    expect(metricTypeUnit('RAINFALL')).toBe('mm');
    expect(metricTypeIcon('RAINFALL')).toBe('rainy');

    expect(metricTypeLabel('WATER_LEVEL')).toBe('Water level');
    expect(metricTypeUnit('WATER_LEVEL')).toBe('cm');
    expect(metricTypeIcon('WATER_LEVEL')).toBe('flood');
  });
});
