import { ANALYTICS_QUERY_SERVICE } from '../../../domain/services/analytics-query-service';
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Subscription, interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ExternalDeviceService } from '../../../application/internal/outboundservices/acl/external-device.service';
import { AnalyticsQueryService, DashboardMetrics, LiveTelemetry } from '../../../domain/services/analytics-query-service';
import {
  FacadeOrganization,
  FacadeSpace,
  FacadeDevice,
} from '../../../../device/interfaces/acl/device-context-facade';
import { TrendPoint, createTrendPoint } from '../../../domain/model/valueobjects/trend-point.value-object';
import { createGetDashboardMetricsQuery } from '../../../domain/model/queries/get-dashboard-metrics.query';
import { createGetTrendsQuery } from '../../../domain/model/queries/get-trends.query';
import {
  getAqiColor,
  getProgressOffset,
  getPm25StatusColor,
  getCo2StatusColor,
  getTempStatusColor,
  getHumidityStatusColor,
  getActiveMetricDelta,
} from '../../rest/transform/analytics-page.transform';

// Reusable Components
import { AqiGaugeCardComponent } from '../../components/aqi-gauge-card/aqi-gauge-card.component';
import { MetricCardComponent } from '../../components/metric-card/metric-card.component';
import { TrendChartCardComponent } from '../../components/trend-chart-card/trend-chart-card.component';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    AqiGaugeCardComponent,
    MetricCardComponent,
    TrendChartCardComponent,
  ],
  templateUrl: './analytics-page.component.html',
  styleUrl: './analytics-page.component.css',
})
export class AnalyticsPageComponent implements OnInit, OnDestroy {
  private readonly deviceAclService = inject(ExternalDeviceService);
  private readonly analyticsQueryService = inject(ANALYTICS_QUERY_SERVICE) as AnalyticsQueryService;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();
  loading = false;
  error: string | null = null;
  liveUnavailable = false;
  liveUnavailableMessage = '';

  // Dropdown data
  organizations: FacadeOrganization[] = [];
  spaces: FacadeSpace[] = [];
  devices: FacadeDevice[] = [];

  // Dropdown selections
  selectedOrgId = '';
  selectedSpaceId = '';
  selectedDeviceId = '';

  // Telemetry & analytics data
  liveData: DashboardMetrics | null = null;
  trendDataPoints: TrendPoint[] = [];

  // Controls
  selectedPeriod = 'LIVE';
  selectedMetric = 'aqiValue';

  // Custom Date range
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Refresher tracking
  secondsSinceUpdate = 0;
  private refreshSubscription?: Subscription;
  private secondsCounterSubscription?: Subscription;
  private liveStreamSubscription?: Subscription;

  ngOnInit(): void {
    this.loadOrganizations();
    this.startSecondsCounter();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopPolling();
    if (this.secondsCounterSubscription) {
      this.secondsCounterSubscription.unsubscribe();
    }
  }

  private loadOrganizations(): void {
    this.loading = true;
    this.deviceAclService
      .fetchOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orgs) => {
          this.organizations = orgs;
          if (orgs.length > 0) {
            this.selectedOrgId = orgs[0].id;
            this.onOrgChange();
          } else {
            this.loading = false;
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          this.error = this.translate.instant('analytics.error.loadOrganizations');
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onOrgChange(): void {
    this.resetSelections('ORG');
    if (!this.selectedOrgId) {
      this.cdr.markForCheck();
      return;
    }

    this.deviceAclService
      .fetchSpacesByOrganization(this.selectedOrgId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (spaces) => {
          this.spaces = spaces;
          if (spaces.length > 0) {
            this.selectedSpaceId = spaces[0].id;
            this.onSpaceChange();
          } else {
            this.loading = false;
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          this.error = this.translate.instant('analytics.error.loadSpaces');
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onSpaceChange(): void {
    this.resetSelections('SPACE');
    if (!this.selectedSpaceId) {
      this.cdr.markForCheck();
      return;
    }

    this.deviceAclService
      .fetchDevicesBySpace(this.selectedSpaceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (devices) => {
          this.devices = devices;
          if (devices.length > 0) {
            this.selectedDeviceId = devices[0].id;
            this.onDeviceChange();
          } else {
            this.loading = false;
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          this.error = this.translate.instant('analytics.error.loadDevices');
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onDeviceChange(): void {
    this.resetSelections('DEVICE');
    if (!this.selectedDeviceId) {
      this.cdr.markForCheck();
      return;
    }

    this.fetchData();
    this.startPolling();
  }

  private resetSelections(level: 'ORG' | 'SPACE' | 'DEVICE'): void {
    if (level === 'ORG') {
      this.spaces = [];
      this.selectedSpaceId = '';
    }
    if (level === 'ORG' || level === 'SPACE') {
      this.devices = [];
      this.selectedDeviceId = '';
    }
    this.liveData = null;
    this.trendDataPoints = [];
    this.liveUnavailable = false;
    this.liveUnavailableMessage = '';
    this.stopPolling();
  }

  fetchData(): void {
    if (!this.selectedDeviceId) return;

    this.loading = true;
    this.error = null;
    this.liveUnavailable = false;

    const startIso = this.selectedPeriod === 'CUSTOM' && this.startDate ? this.startDate.toISOString() : undefined;
    const endIso = this.selectedPeriod === 'CUSTOM' && this.endDate ? this.endDate.toISOString() : undefined;
    const apiPeriod = this.selectedPeriod === 'CUSTOM' ? undefined : this.selectedPeriod;

    // Metrics
    const metricsQuery = createGetDashboardMetricsQuery(this.selectedDeviceId, apiPeriod, startIso, endIso);
    this.analyticsQueryService
      .handleGetDashboardMetrics(metricsQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics) => {
          this.liveData = metrics;
          this.secondsSinceUpdate = 0;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.liveData = null;
          if (err?.status === 404) {
            this.liveUnavailable = true;
            const deviceName = this.devices.find((d) => d.id === this.selectedDeviceId)?.name || this.translate.instant('reports.csv.fallbackDeviceName');
            this.liveUnavailableMessage = (err?.error?.message || this.translate.instant('analytics.liveUnavailable')).replace(this.selectedDeviceId, `"${deviceName}"`);
          }
          this.cdr.markForCheck();
        },
      });

    // Trends
    const apiTrendPeriod = this.selectedPeriod === 'LIVE' ? 'DAY' : this.selectedPeriod === 'CUSTOM' ? undefined : this.selectedPeriod.toUpperCase();
    const trendsQuery = createGetTrendsQuery(this.selectedDeviceId, apiTrendPeriod, startIso, endIso);
    this.analyticsQueryService
      .handleGetTrends(trendsQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (trends) => {
          this.trendDataPoints = trends;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.trendDataPoints = [];
          this.loading = false;
          this.cdr.markForCheck();
        },
      });


  }

  private startPolling(): void {
    this.stopPolling();
    if (this.selectedPeriod === 'LIVE') {
      this.startLiveStream();
    } else {
      this.refreshSubscription = interval(30000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.fetchData());
    }
  }

  private stopPolling(): void {
    this.refreshSubscription?.unsubscribe();
    this.refreshSubscription = undefined;
    this.liveStreamSubscription?.unsubscribe();
    this.liveStreamSubscription = undefined;
  }

  private startLiveStream(): void {
    if (!this.selectedDeviceId) return;

    this.liveStreamSubscription?.unsubscribe();
    this.liveStreamSubscription = this.analyticsQueryService
      .handleStreamLiveTelemetry(this.selectedDeviceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (telemetry) => {
          const calculatedAqi = calculateAqiFromPm25(telemetry.pm2_5, this.translate);
          if (this.liveData) {
            this.liveData = {
              ...this.liveData,
              aqi: {
                value: calculatedAqi.value,
                category: calculatedAqi.category
              },
              co2: {
                ...this.liveData.co2,
                value: telemetry.co2
              },
              pm2_5: {
                ...this.liveData.pm2_5,
                value: telemetry.pm2_5
              },
              temperature: {
                ...this.liveData.temperature,
                value: telemetry.temperature
              },
              humidity: {
                ...this.liveData.humidity,
                value: telemetry.humidity
              },
              calculatedAt: telemetry.timestamp
            };
          } else {
            this.liveData = {
              aqi: { value: calculatedAqi.value, category: calculatedAqi.category },
              co2: { value: telemetry.co2, deltaPercentage: null },
              pm2_5: { value: telemetry.pm2_5, deltaPercentage: null },
              temperature: { value: telemetry.temperature, deltaPercentage: null },
              humidity: { value: telemetry.humidity, deltaPercentage: null },
              calculatedAt: telemetry.timestamp
            };
          }



          const newPoint = createTrendPoint(
            telemetry.timestamp,
            calculatedAqi.value,
            telemetry.co2,
            telemetry.pm2_5,
            telemetry.temperature,
            telemetry.humidity
          );

          if (this.trendDataPoints.length > 0) {
            const limit = Math.max(30, this.trendDataPoints.length);
            this.trendDataPoints = [...this.trendDataPoints, newPoint].slice(-limit);
          } else {
            this.trendDataPoints = [newPoint];
          }

          this.secondsSinceUpdate = 0;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error in live telemetry stream:', err);
        }
      });
  }

  private startSecondsCounter(): void {
    this.secondsCounterSubscription = interval(1000).subscribe(() => {
      this.secondsSinceUpdate++;
      this.cdr.markForCheck();
    });
  }

  selectPeriod(period: string): void {
    this.selectedPeriod = period;
    this.startDate = null;
    this.endDate = null;
    this.fetchData();
    this.startPolling();
  }

  onStartDateChange(event: any): void {
    this.startDate = event.value;
  }

  onEndDateChange(event: any): void {
    this.endDate = event.value;
    if (this.startDate && this.endDate) {
      this.selectedPeriod = 'CUSTOM';
      this.fetchData();
      this.startPolling();
    }
  }

  selectMetric(metric: string): void {
    this.selectedMetric = metric;
    this.cdr.markForCheck();
  }

  // Getters using transformers
  get aqiValue(): number | string {
    return this.liveData?.aqi.value ?? '--';
  }

  get aqiCategory(): string {
    const category = this.liveData?.aqi.category;
    if (!category) {
      return this.translate.instant('analytics.aqiGauge.noMeasurements');
    }
    const key = category
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_')
      .replace(/_+/g, '_');
    const camelCaseKey = key.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    return this.translate.instant(`aqiCategories.${camelCaseKey}`);
  }

  get formattedUpdateTime(): string {
    if (this.secondsSinceUpdate < 5) {
      return this.translate.instant('analytics.updatedTime.justNow');
    }
    return this.translate.instant('analytics.updatedTime.secondsAgo', { seconds: this.secondsSinceUpdate });
  }

  get pm25StatusColor(): string {
    return getPm25StatusColor(this.liveData?.pm2_5.value);
  }

  get co2StatusColor(): string {
    return getCo2StatusColor(this.liveData?.co2.value);
  }

  get tempStatusColor(): string {
    return getTempStatusColor(this.liveData?.temperature.value);
  }

  get humidityStatusColor(): string {
    return getHumidityStatusColor(this.liveData?.humidity.value);
  }

  get activeMetricDelta(): number | null {
    return getActiveMetricDelta(this.liveData, this.selectedMetric);
  }
}

function calculateAqiFromPm25(pm2_5: number, translate: TranslateService): { value: number; category: string } {
  let aqi: number;
  if (pm2_5 <= 12.0) {
    aqi = ((50 - 0) / (12.0 - 0.0)) * (pm2_5 - 0.0) + 0;
  } else if (pm2_5 <= 35.4) {
    aqi = ((100 - 51) / (35.4 - 12.1)) * (pm2_5 - 12.1) + 51;
  } else if (pm2_5 <= 55.4) {
    aqi = ((150 - 101) / (55.4 - 35.5)) * (pm2_5 - 35.5) + 101;
  } else if (pm2_5 <= 150.4) {
    aqi = ((200 - 151) / (150.4 - 55.5)) * (pm2_5 - 55.5) + 151;
  } else if (pm2_5 <= 250.4) {
    aqi = ((300 - 201) / (250.4 - 150.5)) * (pm2_5 - 150.5) + 201;
  } else if (pm2_5 <= 350.4) {
    aqi = ((400 - 301) / (350.4 - 250.5)) * (pm2_5 - 250.5) + 301;
  } else {
    aqi = ((500 - 401) / (500.4 - 350.5)) * (pm2_5 - 350.5) + 401;
  }

  aqi = Math.round(aqi);
  let categoryKey = 'good';
  if (aqi <= 50) categoryKey = 'good';
  else if (aqi <= 100) categoryKey = 'moderate';
  else if (aqi <= 150) categoryKey = 'unhealthyForSensitive';
  else if (aqi <= 200) categoryKey = 'unhealthy';
  else if (aqi <= 300) categoryKey = 'veryUnhealthy';
  else categoryKey = 'hazardous';

  return { value: aqi, category: translate.instant(`aqiCategories.${categoryKey}`) };
}
