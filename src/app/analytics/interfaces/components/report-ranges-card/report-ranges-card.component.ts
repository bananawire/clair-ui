import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MetricStats } from '../../../domain/model/valueobjects/report.value-object';
import { formatStat, hasRange, rangePosition } from '../../rest/transform/report-page.transform';

export interface RangeMetricRow {
  label: string;
  unit: string;
  stats: MetricStats;
}

@Component({
  selector: 'app-report-ranges-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="kpi-card ranges-card">
      <div class="kpi-header">
        <span class="kpi-title">{{ 'reports.rangesCard.title' | translate }}</span>
      </div>

      <div class="ranges-body">
        <div class="range-row" *ngFor="let row of rows">
          <div class="range-top">
            <span class="range-label">{{ row.label }}</span>
            <span class="range-avg">{{ format(row.stats.avg) }}<span class="range-unit">{{ row.unit }}</span></span>
          </div>

          <div class="range-track">
            <ng-container *ngIf="showMarker(row.stats); else noData">
              <div class="range-fill"></div>
              <div class="range-marker" [style.left.%]="position(row.stats)" [title]="'reports.rangesCard.markerTitle' | translate: { value: format(row.stats.avg) }"></div>
            </ng-container>
            <ng-template #noData>
              <div class="range-empty"></div>
            </ng-template>
          </div>

          <div class="range-bounds">
            <span>{{ 'reports.rangesCard.min' | translate: { value: format(row.stats.min) } }}</span>
            <span>{{ 'reports.rangesCard.max' | translate: { value: format(row.stats.max) } }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./report-ranges-card.component.css'],
})
export class ReportRangesCardComponent {
  @Input() rows: RangeMetricRow[] = [];

  private readonly translate = inject(TranslateService);

  format(value: number | null): string {
    return formatStat(value);
  }

  position(stats: MetricStats): number {
    return rangePosition(stats);
  }

  showMarker(stats: MetricStats): boolean {
    return hasRange(stats);
  }
}
