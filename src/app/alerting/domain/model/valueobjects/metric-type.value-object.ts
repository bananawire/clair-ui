export type MetricType = 'PM25' | 'CO2' | 'TEMPERATURE' | 'HUMIDITY';

export const MetricTypes: readonly MetricType[] = ['PM25', 'CO2', 'TEMPERATURE', 'HUMIDITY'];

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
  }
};

export const metricTypeUnit = (metric: MetricType): string => {
  switch (metric) {
    case 'PM25': return 'µg/m³';
    case 'CO2': return 'ppm';
    case 'TEMPERATURE': return '°C';
    case 'HUMIDITY': return '%';
  }
};
