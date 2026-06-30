import { TranslateService } from '@ngx-translate/core';
import {
  AqiCategory,
  CategoryShare,
  DeviceReport,
  MetricStats,
} from '../../../domain/model/valueobjects/report.value-object';

export type ReportMetricKey = 'aqiValue' | 'pm2_5' | 'co2' | 'temperature' | 'humidity';

export interface ReportMetricMeta {
  key: ReportMetricKey;
  labelKey: string;
  unitKey: string;
}

export const REPORT_METRICS: ReportMetricMeta[] = [
  { key: 'aqiValue', labelKey: 'reports.metricLabels.aqi', unitKey: '' },
  { key: 'pm2_5', labelKey: 'reports.metricLabels.pm25', unitKey: 'reports.metricUnits.pm25' },
  { key: 'co2', labelKey: 'reports.metricLabels.co2', unitKey: 'reports.metricUnits.co2' },
  { key: 'temperature', labelKey: 'reports.metricLabels.temperature', unitKey: 'reports.metricUnits.temperature' },
  { key: 'humidity', labelKey: 'reports.metricLabels.humidity', unitKey: 'reports.metricUnits.humidity' },
];

/** Metrics that expose min/avg/max ranges (AQI only has an average). */
export const RANGE_METRICS: ReportMetricMeta[] = REPORT_METRICS.filter((m) => m.key !== 'aqiValue');

interface AqiCategoryMeta {
  labelKey: string;
  color: string;
}

export const AQI_CATEGORY_META: Record<AqiCategory, AqiCategoryMeta> = {
  GOOD: { labelKey: 'aqiCategories.good', color: '#10b981' },
  MODERATE: { labelKey: 'aqiCategories.moderate', color: '#f59e0b' },
  UNHEALTHY_FOR_SENSITIVE: { labelKey: 'aqiCategories.unhealthyForSensitive', color: '#f97316' },
  UNHEALTHY: { labelKey: 'aqiCategories.unhealthy', color: '#ef4444' },
  VERY_UNHEALTHY: { labelKey: 'aqiCategories.veryUnhealthy', color: '#8b5cf6' },
  HAZARDOUS: { labelKey: 'aqiCategories.hazardous', color: '#7f1d1d' },
};

export const aqiCategoryToLabelKey = (category: AqiCategory | null): string | null =>
  category ? AQI_CATEGORY_META[category].labelKey : null;

export const categoryLabel = (category: AqiCategory | null, translate: TranslateService): string =>
  category ? translate.instant(AQI_CATEGORY_META[category].labelKey) : '—';

export const categoryColor = (category: AqiCategory | null): string =>
  category ? AQI_CATEGORY_META[category].color : '#3a3a3c';

// --- Value access ------------------------------------------------------------

export const reportMetricStats = (
  report: DeviceReport,
  key: Exclude<ReportMetricKey, 'aqiValue'>
): MetricStats => report[key];

/** The headline value plotted in the trend strip for a given metric. */
export const reportMetricTrendValue = (
  report: DeviceReport | null,
  key: ReportMetricKey
): number | null => {
  if (!report) return null;
  if (key === 'aqiValue') return report.averageAqi;
  return report[key].avg;
};

// --- Formatting --------------------------------------------------------------

export const formatStat = (value: number | null | undefined): string =>
  value === null || value === undefined || !Number.isFinite(value) ? '—' : Number(value).toFixed(1);

export const formatAqi = (value: number | null | undefined): string =>
  value === null || value === undefined || !Number.isFinite(value) ? '—' : String(Math.round(value));

export const formatCount = (
  value: number | null | undefined,
  lang: string | undefined = 'en'
): string =>
  value === null || value === undefined ? '—' : Number(value).toLocaleString(lang || 'en');

export const formatDeltaPct = (value: number | null | undefined): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded}%`;
};

export const formatPeakAt = (
  iso: string | null | undefined,
  lang: string | undefined = 'en'
): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(lang || 'en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// --- Donut geometry ----------------------------------------------------------

export interface DonutSegment {
  category: AqiCategory;
  label: string;
  color: string;
  percentage: number;
  count: number;
  dashArray: string;
  dashOffset: number;
}

/**
 * Builds stroke-dasharray/offset segments for an SVG ring of the given
 * circumference. Segments are laid out clockwise from the top.
 */
export const buildDonutSegments = (
  shares: CategoryShare[],
  circumference: number,
  translate: TranslateService
): DonutSegment[] => {
  const total = shares.reduce((sum, s) => sum + (s.percentage || 0), 0);
  const denom = total > 0 ? total : 100;
  let accumulated = 0;

  return shares
    .filter((s) => s.percentage > 0)
    .map((s) => {
      const length = (s.percentage / denom) * circumference;
      const segment: DonutSegment = {
        category: s.category,
        label: translate.instant(AQI_CATEGORY_META[s.category].labelKey),
        color: AQI_CATEGORY_META[s.category].color,
        percentage: s.percentage,
        count: s.count,
        dashArray: `${length} ${circumference - length}`,
        dashOffset: -accumulated,
      };
      accumulated += length;
      return segment;
    });
};

// --- Range bar position (avg within [min,max]) -------------------------------

/** Position of the average within the [min,max] range, as a 0–100 percentage. */
export const rangePosition = (stats: MetricStats): number => {
  const { avg, min, max } = stats;
  if (avg === null || min === null || max === null) return 50;
  if (max <= min) return 50;
  const pct = ((avg - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, pct));
};

export const hasRange = (stats: MetricStats): boolean =>
  stats.avg !== null && stats.min !== null && stats.max !== null;

// --- Trend sparkline ---------------------------------------------------------

export interface TrendPointInput {
  label: string;
  value: number | null;
}

const TREND_WIDTH = 500;
const TREND_HEIGHT = 150;
const TREND_PADDING = 20;

export interface TrendPaths {
  linePath: string;
  fillPath: string;
}

/**
 * Builds line + fill SVG paths for the trend strip. Null values (404 gaps) are
 * skipped, the surrounding points are connected across the gap.
 */
export const buildTrendPaths = (points: TrendPointInput[]): TrendPaths => {
  const indexed = points
    .map((p, index) => ({ value: p.value, index }))
    .filter((p): p is { value: number; index: number } => p.value !== null && Number.isFinite(p.value));

  if (indexed.length === 0) return { linePath: '', fillPath: '' };

  const values = indexed.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const span = points.length > 1 ? points.length - 1 : 1;

  const coords = indexed.map((p) => {
    const x = TREND_PADDING + (p.index / span) * (TREND_WIDTH - 2 * TREND_PADDING);
    const y =
      TREND_HEIGHT - TREND_PADDING - ((p.value - minVal) / range) * (TREND_HEIGHT - 2 * TREND_PADDING);
    return { x, y };
  });

  if (coords.length === 1) {
    const only = coords[0];
    const line = `M ${TREND_PADDING} ${only.y} L ${TREND_WIDTH - TREND_PADDING} ${only.y}`;
    return {
      linePath: line,
      fillPath: `${line} L ${TREND_WIDTH - TREND_PADDING} ${TREND_HEIGHT - TREND_PADDING} L ${TREND_PADDING} ${TREND_HEIGHT - TREND_PADDING} Z`,
    };
  }

  let line = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const xc = (curr.x + next.x) / 2;
    const yc = (curr.y + next.y) / 2;
    line += ` Q ${curr.x} ${curr.y}, ${xc} ${yc}`;
  }
  const last = coords[coords.length - 1];
  line += ` L ${last.x} ${last.y}`;

  const fill = `${line} L ${last.x} ${TREND_HEIGHT - TREND_PADDING} L ${coords[0].x} ${TREND_HEIGHT - TREND_PADDING} Z`;
  return { linePath: line, fillPath: fill };
};

// --- CSV export --------------------------------------------------------------

const csvCell = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const statsRow = (label: string, stats: MetricStats): string =>
  [label, stats.avg, stats.min, stats.max].map(csvCell).join(',');

/** Serialises a report's stats + category shares to CSV text. */
export const buildReportCsv = (report: DeviceReport, translate: TranslateService): string => {
  const lines: string[] = [];
  lines.push(`${translate.instant('reports.csv.header.report')},${csvCell(report.periodType)}`);
  lines.push(`${translate.instant('reports.csv.header.device')},${csvCell(report.deviceId)}`);
  lines.push(`${translate.instant('reports.csv.header.period')},${csvCell(report.periodLabel)}`);
  lines.push(`${translate.instant('reports.csv.header.averageAqi')},${csvCell(report.averageAqi)}`);
  lines.push(`${translate.instant('reports.csv.header.dominantCategory')},${csvCell(report.dominantAqiCategory)}`);
  lines.push(`${translate.instant('reports.csv.header.peakPm25')},${csvCell(report.peakPm2_5)}`);
  lines.push(`${translate.instant('reports.csv.header.peakPm25At')},${csvCell(report.peakPm2_5At)}`);
  lines.push(`${translate.instant('reports.csv.header.aqiDeltaPct')},${csvCell(report.aqiDeltaPct)}`);
  lines.push(`${translate.instant('reports.csv.header.readings')},${csvCell(report.readingCount)}`);
  if (report.daysCovered !== null) {
    lines.push(`${translate.instant('reports.csv.header.daysCovered')},${csvCell(report.daysCovered)}`);
  }
  lines.push('');
  lines.push(translate.instant('reports.csv.header.metricAvgMinMax'));
  lines.push(statsRow('pm2_5', report.pm2_5));
  lines.push(statsRow('co2', report.co2));
  lines.push(statsRow('temperature', report.temperature));
  lines.push(statsRow('humidity', report.humidity));
  lines.push('');
  lines.push(translate.instant('reports.csv.header.categoryCountPercentage'));
  for (const share of report.categoryShares) {
    lines.push([share.category, share.count, share.percentage].map(csvCell).join(','));
  }
  return lines.join('\n');
};

export const reportCsvFilename = (
  report: DeviceReport,
  deviceName: string,
  translate: TranslateService
): string => {
  const fallback = translate.instant('reports.csv.fallbackDeviceName');
  const prefix = translate.instant('reports.csv.filenamePrefix');
  const safeName = (deviceName || fallback).replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
  return `${prefix}-${safeName}-${report.periodType.toLowerCase()}-${report.periodLabel}.csv`;
};
