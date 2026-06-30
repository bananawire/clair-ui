import { TrendPoint } from '../../../domain/model/valueobjects/trend-point.value-object';
import { DashboardMetrics } from '../../../domain/services/analytics-query-service';

export const getAqiColor = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '#3a3a3c';
  if (value <= 50) return '#10b981';
  if (value <= 100) return '#f59e0b';
  if (value <= 150) return '#f97316';
  return '#ef4444';
};

export const getProgressOffset = (value: number | undefined | null): number => {
  if (value === undefined || value === null) return 251.2;
  const maxAqi = 150;
  const percent = Math.min(Math.max(value / maxAqi, 0), 1);
  const circumference = 251.2;
  return circumference * (1 - percent);
};

export const getPm25StatusColor = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '#3a3a3c';
  if (value <= 25) return '#10b981';
  if (value <= 60) return '#f59e0b';
  return '#ef4444';
};

export const getCo2StatusColor = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '#3a3a3c';
  if (value <= 700) return '#10b981';
  if (value <= 1000) return '#f59e0b';
  return '#ef4444';
};

export const getTempStatusColor = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '#3a3a3c';
  if (value <= 26) return '#10b981';
  return '#ef4444';
};

export const getHumidityStatusColor = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '#3a3a3c';
  if (value <= 60) return '#10b981';
  if (value <= 85) return '#f59e0b';
  return '#ef4444';
};

export const formatDelta = (delta: number | null | undefined): string | null => {
  if (delta === null || delta === undefined) return null;
  const absVal = Math.abs(delta).toFixed(1);
  return `${absVal}%`;
};

export const formatValue = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '--';
  return Number(val).toFixed(2);
};

export const getMetricValue = (point: TrendPoint, metric: string): number => {
  switch (metric) {
    case 'aqiValue':
      return point.aqiValue;
    case 'co2':
      return point.co2;
    case 'pm2_5':
      return point.pm2_5;
    case 'temperature':
      return point.temperature;
    case 'humidity':
      return point.humidity;
    default:
      return point.aqiValue;
  }
};

export const calculateChartPoints = (
  trendDataPoints: TrendPoint[],
  selectedMetric: string
): string => {
  if (trendDataPoints.length === 0) return '';

  const width = 500;
  const height = 150;
  const padding = 20;

  const values = trendDataPoints.map((p) => getMetricValue(p, selectedMetric));
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = maxVal - minVal || 1;

  const points = trendDataPoints.map((p, index) => {
    const x = padding + (index / (trendDataPoints.length - 1)) * (width - 2 * padding);
    const val = getMetricValue(p, selectedMetric);
    const y = height - padding - ((val - minVal) / valRange) * (height - 2 * padding);
    return { x, y };
  });

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y} L ${width - padding} ${points[0].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const xc = (curr.x + next.x) / 2;
    const yc = (curr.y + next.y) / 2;
    d += ` Q ${curr.x} ${curr.y}, ${xc} ${yc}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;

  return d;
};

export const calculateChartFillPoints = (
  linePath: string,
  trendDataPoints: TrendPoint[]
): string => {
  if (!linePath || trendDataPoints.length === 0) return '';

  const width = 500;
  const height = 150;
  const padding = 20;
  const points = trendDataPoints.map((p, index) => {
    const x = padding + (index / (trendDataPoints.length - 1)) * (width - 2 * padding);
    return x;
  });

  const firstX = points[0];
  const lastX = points[points.length - 1] ?? width - padding;

  return `${linePath} L ${lastX} ${height - padding} L ${firstX} ${height - padding} Z`;
};

export const getActiveMetricDelta = (
  liveData: DashboardMetrics | null,
  selectedMetric: string
): number | null => {
  if (!liveData) return null;
  switch (selectedMetric) {
    case 'aqiValue':
      return liveData.pm2_5.deltaPercentage;
    case 'co2':
      return liveData.co2.deltaPercentage;
    case 'pm2_5':
      return liveData.pm2_5.deltaPercentage;
    case 'temperature':
      return liveData.temperature.deltaPercentage;
    case 'humidity':
      return liveData.humidity.deltaPercentage;
    default:
      return null;
  }
};


