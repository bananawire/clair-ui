import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { TrendPointInput, buildTrendPaths } from '../../rest/transform/report-page.transform';

@Component({
  selector: 'app-report-trend-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="kpi-card trend-card">
      <div class="kpi-header">
        <span class="kpi-title">{{ 'reports.trendCard.titlePrefix' | translate: { metric: (title | uppercase) } }}</span>
        <span class="kpi-subtitle">{{ subtitle }}</span>
      </div>

      <div class="trend-chart-wrapper">
        <div *ngIf="!hasData" class="chart-empty-state">
          <p>{{ 'reports.trendCard.empty' | translate }}</p>
        </div>

        <svg *ngIf="hasData" viewBox="0 0 500 150" class="trend-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="reportTrendGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"></stop>
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"></stop>
            </linearGradient>
          </defs>
          <line x1="20" y1="20" x2="480" y2="20" stroke="#222" stroke-width="1"></line>
          <line x1="20" y1="52.5" x2="480" y2="52.5" stroke="#222" stroke-width="1"></line>
          <line x1="20" y1="85" x2="480" y2="85" stroke="#222" stroke-width="1"></line>
          <line x1="20" y1="117.5" x2="480" y2="117.5" stroke="#222" stroke-width="1"></line>
          <line x1="20" y1="130" x2="480" y2="130" stroke="#222" stroke-width="1"></line>

          <path [attr.d]="paths.fillPath" fill="url(#reportTrendGlow)"></path>
          <path [attr.d]="paths.linePath" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round"></path>
        </svg>
      </div>

      <div class="trend-axis" *ngIf="hasData">
        <span>{{ firstLabel }}</span>
        <span>{{ lastLabel }}</span>
      </div>
    </div>
  `,
  styleUrls: ['./report-trend-card.component.css'],
})
export class ReportTrendCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() points: TrendPointInput[] = [];

  get paths() {
    return buildTrendPaths(this.points);
  }

  get hasData(): boolean {
    return this.points.some((p) => p.value !== null && Number.isFinite(p.value));
  }

  get firstLabel(): string {
    return this.points[0]?.label ?? '';
  }

  get lastLabel(): string {
    return this.points[this.points.length - 1]?.label ?? '';
  }
}
