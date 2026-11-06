export type MetricType = 'PM25' | 'CO2' | 'TEMPERATURE' | 'HUMIDITY' | 'RAINFALL' | 'WATER_LEVEL';

export const MetricTypes: readonly MetricType[] = [
  'PM25',
  'CO2',
  'TEMPERATURE',
  'HUMIDITY',
  'RAINFALL',
  'WATER_LEVEL',
];

export const isValidMetricType = (value: string): value is MetricType => {
  return (MetricTypes as readonly string[]).includes(value);
};

export const createMetricType = (value: string): MetricType => {
  if (!isValidMetricType(value)) {
    throw new Error(`Invalid metric type: ${value}`);
  }
  return value;
};

export const metricTypeLabel = (metric: MetricType): string => {
  switch (metric) {
    case 'PM25': return 'PM2.5';
    case 'CO2': return 'CO2';
    case 'TEMPERATURE': return 'Temperature';
    case 'HUMIDITY': return 'Humidity';
    case 'RAINFALL': return 'Rainfall';
    case 'WATER_LEVEL': return 'Water level';
  }
};

export const metricTypeUnit = (metric: MetricType): string => {
  switch (metric) {
    case 'PM25': return 'µg/m³';
    case 'CO2': return 'ppm';
    case 'TEMPERATURE': return '°C';
    case 'HUMIDITY': return '%';
    case 'RAINFALL': return 'mm';
    case 'WATER_LEVEL': return 'cm';
  }
};

export const metricTypeIcon = (metric: MetricType): string => {
  switch (metric) {
    case 'PM25': return 'cloud';
    case 'CO2': return 'co2';
    case 'TEMPERATURE': return 'thermostat';
    case 'HUMIDITY': return 'water_drop';
    case 'RAINFALL': return 'rainy';
    case 'WATER_LEVEL': return 'flood';
  }
};
