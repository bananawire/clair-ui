import { Inject } from '@angular/core';
import { ALERT_QUERY_SERVICE, AlertQueryService } from '../../../domain/services/alert-query-service';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Alert, AlertPage, DailyAlertCount } from '../../../domain/services/alert-query-service';
import { AlertStatus_ACTIVE, AlertStatus_ACKNOWLEDGED, AlertStatus_RESOLVED } from '../../../domain/model/valueobjects/alert-status.value-object';
import { createGetAlertDailySummaryQuery } from '../../../domain/model/queries/get-alert-daily-summary.query';
import { createGetAlertsQuery } from '../../../domain/model/queries/get-alerts.query';
import { AlertDailyChartComponent } from '../../components/alert-daily-chart/alert-daily-chart.component';
import { AlertTableComponent } from '../../components/alert-table/alert-table.component';

type AlertTab = 'active' | 'history';

@Component({
  selector: 'app-alerts-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    MatIconModule,
    AlertDailyChartComponent,
    AlertTableComponent,
  ],
  templateUrl: './alerts-page.component.html',
  styleUrl: './alerts-page.component.css',
})
export class AlertsPageComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor(@Inject(ALERT_QUERY_SERVICE) private readonly alertQueryService: AlertQueryService,
    private readonly cdr: ChangeDetectorRef,
    private readonly translate: TranslateService
  ) {}

  // Daily chart
  dailySummary: DailyAlertCount[] | null = null;
  loadingSummary = false;

  // Tabs & alerts
  activeTab: AlertTab = 'active';
  activeAlertsPage: AlertPage | null = null;
  historyAlertsPage: AlertPage | null = null;
  loadingAlerts = false;
  errorAlerts = '';

  // Pagination
  currentPage = 0;
  pageSize = 20;

  // Seconds counter for "Updated X seconds ago"
  secondsSinceUpdate = 0;
  private secondsCounterSubscription?: any;

  ngOnInit(): void {
    this.loadInitialAlertsView();
    this.startSecondsCounter();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.secondsCounterSubscription) {
      clearInterval(this.secondsCounterSubscription);
    }
  }

  setTab(tab: AlertTab): void {
    this.activeTab = tab;
    this.currentPage = 0;
    this.loadAlertsForTab();
  }

  private loadInitialAlertsView(): void {
    this.clearData();
    this.loadDailySummary();
    this.loadAlertsForTab();
    this.cdr.markForCheck();
  }

  private loadDailySummary(): void {
    this.loadingSummary = true;
    this.cdr.markForCheck();

    const query = createGetAlertDailySummaryQuery(30);
    this.alertQueryService.handleGetDailySummary(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary: DailyAlertCount[]) => {
          this.dailySummary = summary;
          this.loadingSummary = false;
          this.secondsSinceUpdate = 0;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Failed to load daily summary', err);
          this.loadingSummary = false;
          this.cdr.markForCheck();
        },
      });
  }

  private loadAlertsForTab(): void {
    this.loadingAlerts = true;
    this.errorAlerts = '';
    this.cdr.markForCheck();

    const statusFilter = this.activeTab === 'active'
      ? [AlertStatus_ACTIVE, AlertStatus_ACKNOWLEDGED]
      : [AlertStatus_RESOLVED];

    const query = createGetAlertsQuery(this.currentPage, this.pageSize);
    this.alertQueryService.handleGetAlerts(query, statusFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page: AlertPage) => {
          this.setAlertsPage(page);
          this.loadingAlerts = false;
          this.secondsSinceUpdate = 0;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error(this.translate.instant('alerts.errorLoad'), err);
          this.errorAlerts = this.translate.instant('alerts.errorLoad');
          this.loadingAlerts = false;
          this.cdr.markForCheck();
        },
      });
  }

  private setAlertsPage(page: AlertPage): void {
    if (this.activeTab === 'active') {
      this.activeAlertsPage = page;
    } else {
      this.historyAlertsPage = page;
    }
  }

  get currentAlerts(): readonly Alert[] | null {
    return this.activeTab === 'active'
      ? this.activeAlertsPage?.content ?? null
      : this.historyAlertsPage?.content ?? null;
  }

  get showPagination(): boolean {
    const page = this.activeTab === 'active' ? this.activeAlertsPage : this.historyAlertsPage;
    return !!page && page.totalPages > 1;
  }

  get totalPages(): number {
    const page = this.activeTab === 'active' ? this.activeAlertsPage : this.historyAlertsPage;
    return page?.totalPages ?? 1;
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadAlertsForTab();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadAlertsForTab();
    }
  }

  get formattedUpdateTime(): string {
    if (this.secondsSinceUpdate < 5) return this.translate.instant('alerts.updatedTime.justNow');
    return this.translate.instant('alerts.updatedTime.secondsAgo', { seconds: this.secondsSinceUpdate });
  }

  private startSecondsCounter(): void {
    this.secondsCounterSubscription = setInterval(() => {
      this.secondsSinceUpdate++;
      this.cdr.markForCheck();
    }, 1000);
  }

  private clearData(): void {
    this.dailySummary = null;
    this.activeAlertsPage = null;
    this.historyAlertsPage = null;
    this.errorAlerts = '';
    this.currentPage = 0;
  }
}
