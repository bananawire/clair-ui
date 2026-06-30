import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { TrendPoint } from '../../../domain/model/valueobjects/trend-point.value-object';
import { calculateChartPoints, calculateChartFillPoints, formatDelta } from '../../rest/transform/analytics-page.transform';

@Component({
  selector: 'app-trend-chart-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  template: `
    <div class="kpi-card trend-card">
      <div class="kpi-header">
        <span class="kpi-title">{{ 'analytics.trendChart.titlePrefix' | translate }} ({{ title | uppercase }})</span>
      </div>

      <div class="trend-chart-wrapper">
        <div *ngIf="points.length === 0" class="chart-empty-state">
          <p>{{ 'analytics.trendChart.empty' | translate }}</p>
        </div>

        <svg *ngIf="points.length > 0" viewBox="0 0 500 150" class="trend-svg"
          preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"></stop>
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"></stop>
            </linearGradient>
          </defs>
          <line x1="20" y1="20" x2="480" y2="20" stroke="#222" stroke-width="1"></line>
          <line x1="20" y1="52.5" x2="480" y2="52.5" stroke="#222" stroke-width="1"></line>
          <line x1="20" y1="85" x2="480" y2="85" stroke="#222" stroke-width="1"></line>
          <line x1="20" y1="117.5" x2="480" y2="117.5" stroke="#222" stroke-width="1"></line>
          <line x1="20" y1="130" x2="480" y2="130" stroke="#222" stroke-width="1"></line>

          <path [attr.d]="chartFillPoints" fill="url(#chartGlow)"></path>
          <path [attr.d]="chartPoints" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round"></path>
        </svg>
      </div>

      <div class="kpi-footer">
        <div class="trend-delta" [class.negative]="!isDeltaPositive">
          <ng-container *ngIf="formattedDelta !== null">
            <mat-icon>{{ isDeltaPositive ? 'trending_up' : 'trending_down' }}</mat-icon>
            <span>{{ formattedDelta }}</span>
          </ng-container>
          <span *ngIf="formattedDelta === null" class="delta-null">{{ 'analytics.trendChart.deltaNull' | translate }}</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./trend-chart-card.component.css'],
})
export class TrendChartCardComponent {
  @Input() title = '';
  @Input() points: TrendPoint[] = [];
  @Input() metric = '';
  @Input() delta: number | null = null;

  get chartPoints(): string {
    return calculateChartPoints(this.points, this.metric);
  }

  get chartFillPoints(): string {
    return calculateChartFillPoints(this.chartPoints, this.points);
  }

  get isDeltaPositive(): boolean {
    return this.delta !== null && this.delta >= 0;
  }

  get formattedDelta(): string | null {
    return formatDelta(this.delta);
  }
}
