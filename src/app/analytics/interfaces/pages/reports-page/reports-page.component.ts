import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ExternalDeviceService } from '../../../application/internal/outboundservices/acl/external-device.service';
import {
  FacadeOrganization,
  FacadeSpace,
  FacadeDevice,
} from '../../../../device/interfaces/acl/device-context-facade';
import { REPORT_QUERY_SERVICE, ReportQueryService } from '../../../domain/services/report-query-service';
import { createGetDailyReportQuery } from '../../../domain/model/queries/get-daily-report.query';
import { createGetMonthlyReportQuery } from '../../../domain/model/queries/get-monthly-report.query';
import { DeviceReport, ReportPeriodType } from '../../../domain/model/valueobjects/report.value-object';
import {
  REPORT_METRICS,
  RANGE_METRICS,
  ReportMetricKey,
  TrendPointInput,
  buildReportCsv,
  formatAqi,
  formatStat,
  formatDeltaPct,
  reportCsvFilename,
  reportMetricTrendValue,
  categoryLabel,
  formatCount,
  formatPeakAt,
} from '../../rest/transform/report-page.transform';
import { ReportDonutCardComponent } from '../../components/report-donut-card/report-donut-card.component';
import { ReportRangesCardComponent, RangeMetricRow } from '../../components/report-ranges-card/report-ranges-card.component';
import { ReportTrendCardComponent } from '../../components/report-trend-card/report-trend-card.component';

import { TOKEN_STORAGE_GATEWAY, TokenStorageGateway } from '../../../../iam/infrastructure/storage/token-storage.gateway';
import { BillingQueryServiceImpl } from '../../../../billing/application/internal/queryservices/billing-query-service.impl';
import { createUserId } from '../../../../billing/domain/model/valueobjects/user-id.value-object';
import { createGetUserPlanQuery } from '../../../../billing/domain/model/queries/get-user-plan.query';

type AccessTokenPayload = { sub: string };

const DAILY_WINDOW = 30;
const MONTHLY_WINDOW = 12;

@Component({
  selector: 'app-reports-page',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslatePipe,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    ReportDonutCardComponent,
    ReportRangesCardComponent,
    ReportTrendCardComponent,
  ],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.css',
})
export class ReportsPageComponent implements OnInit, OnDestroy {
  private readonly deviceAclService = inject(ExternalDeviceService);
  private readonly reportQueryService = inject(REPORT_QUERY_SERVICE) as ReportQueryService;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  readonly metrics = REPORT_METRICS;
  readonly rangeMetrics = RANGE_METRICS;

  // Dropdown data
  organizations: FacadeOrganization[] = [];
  spaces: FacadeSpace[] = [];
  devices: FacadeDevice[] = [];

  // Dropdown selections
  selectedOrgId = '';
  selectedSpaceId = '';
  selectedDeviceId = '';

  // Controls
  periodType: ReportPeriodType = 'DAILY';
  selectedMetric: ReportMetricKey = 'aqiValue';
  selectedDate: Date | null = null;
  selectedMonth: Date | null = null;

  // State
  loading = false;
  error: string | null = null;
  notFound = false;
  showUpsell = false;

  isPremium = false;
  private planLoaded = false;

  // Data
  report: DeviceReport | null = null;
  private trendReports: { label: string; report: DeviceReport | null }[] = [];

  constructor(
    @Inject(TOKEN_STORAGE_GATEWAY) private readonly tokenStorage: TokenStorageGateway,
    private readonly billingQueryService: BillingQueryServiceImpl
  ) {}

  ngOnInit(): void {
    this.loadUserPlan();
    this.loadOrganizations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Plan -----------------------------------------------------------------

  private loadUserPlan(): void {
    const token = this.tokenStorage.getAccessToken();
    if (!token) {
      this.planLoaded = true;
      return;
    }
    try {
      const payload = jwtDecode<AccessTokenPayload>(token);
      if (!payload.sub) {
        this.planLoaded = true;
        return;
      }
      const query = createGetUserPlanQuery(createUserId(payload.sub));
      this.billingQueryService
        .handleGetUserPlan(query)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (domainPlan) => {
            this.isPremium = domainPlan.plan !== 'FREEMIUM';
            this.planLoaded = true;
            this.cdr.markForCheck();
          },
          error: () => {
            this.planLoaded = true;
          },
        });
    } catch {
      this.planLoaded = true;
    }
  }

  // --- Cascade --------------------------------------------------------------

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
        error: () => {
          this.error = this.translate.instant('reports.error.loadOrganizations');
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
        error: () => {
          this.error = this.translate.instant('reports.error.loadSpaces');
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
        error: () => {
          this.error = this.translate.instant('reports.error.loadDevices');
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
    this.loadReport();
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
    this.report = null;
    this.trendReports = [];
    this.notFound = false;
    this.error = null;
    this.showUpsell = false;
  }

  // --- Period / metric controls --------------------------------------------

  selectPeriodType(type: ReportPeriodType): void {
    if (this.periodType === type) return;
    this.periodType = type;
    this.selectedDate = null;
    this.selectedMonth = null;
    this.loadReport();
  }

  onDailyDateChange(event: { value: Date | null }): void {
    this.selectedDate = event.value;
    this.loadReport();
  }

  onMonthSelected(date: Date, picker: { close: () => void }): void {
    this.selectedMonth = date;
    picker.close();
    this.loadReport();
  }

  selectMetric(metric: ReportMetricKey): void {
    this.selectedMetric = metric;
    this.cdr.markForCheck();
  }

  // --- Data fetching --------------------------------------------------------

  loadReport(): void {
    if (!this.selectedDeviceId) return;

    this.error = null;
    this.notFound = false;
    this.showUpsell = false;
    this.report = null;
    this.trendReports = [];

    if (this.periodType === 'MONTHLY' && !this.isPremium) {
      this.showUpsell = true;
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;

    const request$ =
      this.periodType === 'DAILY'
        ? this.reportQueryService.handleGetDailyReport(
            createGetDailyReportQuery(this.selectedDeviceId, this.toDateParam(this.selectedDate))
          )
        : this.reportQueryService.handleGetMonthlyReport(
            createGetMonthlyReportQuery(this.selectedDeviceId, this.toMonthParam(this.selectedMonth))
          );

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (report) => {
        this.report = report;
        this.notFound = report === null;
        this.loading = false;
        if (report) {
          this.loadTrend(report.periodLabel);
        }
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        this.loading = false;
        this.report = null;
        if (err instanceof HttpErrorResponse && err.status === 403) {
          if (!this.isPremium && this.periodType === 'MONTHLY') {
            this.showUpsell = true;
          } else {
            this.error = this.translate.instant('reports.error.forbidden');
          }
        } else {
          this.error = this.translate.instant('reports.error.loadReport');
        }
        this.cdr.markForCheck();
      },
    });
  }

  private loadTrend(anchorLabel: string): void {
    const deviceId = this.selectedDeviceId;
    const window =
      this.periodType === 'DAILY'
        ? this.buildDailyWindow(anchorLabel.slice(0, 10), DAILY_WINDOW)
        : this.buildMonthlyWindow(anchorLabel.slice(0, 7), MONTHLY_WINDOW);

    const requests = window.map((w) =>
      this.periodType === 'DAILY'
        ? this.reportQueryService.handleGetDailyReport(createGetDailyReportQuery(deviceId, w.param))
        : this.reportQueryService.handleGetMonthlyReport(createGetMonthlyReportQuery(deviceId, w.param))
    );

    forkJoin(requests.length ? requests : [of(null)])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reports) => {
          this.trendReports = window.map((w, i) => ({ label: w.label, report: reports[i] ?? null }));
          this.cdr.markForCheck();
        },
        error: () => {
          this.trendReports = [];
          this.cdr.markForCheck();
        },
      });
  }

  // --- Export ---------------------------------------------------------------

  exportCsv(): void {
    if (!this.report) return;
    const deviceName = this.devices.find((d) => d.id === this.selectedDeviceId)?.name || this.translate.instant('reports.csv.fallbackDeviceName');
    const csv = buildReportCsv(this.report, this.translate);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = reportCsvFilename(this.report, deviceName, this.translate);
    link.click();
    URL.revokeObjectURL(url);
  }

  // --- Derived view data ----------------------------------------------------

  get rangeRows(): RangeMetricRow[] {
    if (!this.report) return [];
    return this.rangeMetrics.map((m) => ({
      label: this.translate.instant(m.labelKey),
      unit: m.unitKey ? this.translate.instant(m.unitKey) : '',
      stats: this.report![m.key as Exclude<ReportMetricKey, 'aqiValue'>],
    }));
  }

  get trendPoints(): TrendPointInput[] {
    return this.trendReports.map((t) => ({
      label: t.label,
      value: reportMetricTrendValue(t.report, this.selectedMetric),
    }));
  }

  get trendTitle(): string {
    const meta = this.metrics.find((m) => m.key === this.selectedMetric);
    return meta ? this.translate.instant(meta.labelKey) : 'AQI';
  }

  get trendSubtitle(): string {
    return this.periodType === 'DAILY'
      ? this.translate.instant('reports.periodLabel.latestDay')
      : this.translate.instant('reports.periodLabel.previousMonth');
  }

  get selectedPeriodLabel(): string {
    if (this.report) return this.report.periodLabel;
    if (this.periodType === 'DAILY') return this.selectedDate ? this.toDateParam(this.selectedDate)! : this.translate.instant('reports.periodLabel.latestDay');
    return this.selectedMonth ? this.toMonthParam(this.selectedMonth)! : this.translate.instant('reports.periodLabel.previousMonth');
  }

  // Formatting passthroughs for the template
  formatAqi = formatAqi;
  formatStat = formatStat;
  formatCount = (value: number | null | undefined): string => formatCount(value, this.translate.getCurrentLang() || undefined);
  formatDeltaPct = formatDeltaPct;
  formatPeakAt = (iso: string | null | undefined): string => formatPeakAt(iso, this.translate.getCurrentLang() || undefined);
  categoryLabel = (category: Parameters<typeof categoryLabel>[0]): string => categoryLabel(category, this.translate);

  get aqiDeltaPositive(): boolean {
    return (this.report?.aqiDeltaPct ?? 0) >= 0;
  }

  // --- Date helpers ---------------------------------------------------------

  private toDateParam(date: Date | null): string | undefined {
    if (!date) return undefined;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private toMonthParam(date: Date | null): string | undefined {
    if (!date) return undefined;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  private buildDailyWindow(anchor: string, n: number): { param: string; label: string }[] {
    const base = new Date(`${anchor}T00:00:00Z`);
    if (Number.isNaN(base.getTime())) return [];
    const out: { param: string; label: string }[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(base.getTime() - i * 86400000);
      const param = d.toISOString().slice(0, 10);
      out.push({ param, label: param.slice(5) });
    }
    return out;
  }

  private buildMonthlyWindow(anchor: string, n: number): { param: string; label: string }[] {
    const [yStr, mStr] = anchor.split('-');
    const year = Number(yStr);
    const month = Number(mStr);
    if (!Number.isFinite(year) || !Number.isFinite(month)) return [];
    const out: { param: string; label: string }[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(year, month - 1 - i, 1));
      const param = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString(this.translate.getCurrentLang() || 'en', { month: 'short', timeZone: 'UTC' });
      out.push({ param, label });
    }
    return out;
  }
}
