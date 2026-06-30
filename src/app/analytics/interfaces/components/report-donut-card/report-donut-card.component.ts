import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CategoryShare } from '../../../domain/model/valueobjects/report.value-object';
import {
  DonutSegment,
  buildDonutSegments,
  categoryLabel,
  formatAqi,
} from '../../rest/transform/report-page.transform';

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

@Component({
  selector: 'app-report-donut-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="kpi-card donut-card">
      <div class="kpi-header">
        <span class="kpi-title">{{ 'reports.donutCard.title' | translate }}</span>
      </div>

      <div *ngIf="segments.length === 0" class="chart-empty-state">
        <p>{{ 'reports.donutCard.empty' | translate }}</p>
      </div>

      <div *ngIf="segments.length > 0" class="donut-body">
        <svg viewBox="0 0 160 160" class="donut-svg">
          <circle cx="80" cy="80" [attr.r]="radius" fill="none" stroke="#222" stroke-width="18"></circle>
          <circle
            *ngFor="let seg of segments"
            cx="80"
            cy="80"
            [attr.r]="radius"
            fill="none"
            [attr.stroke]="seg.color"
            stroke-width="18"
            [attr.stroke-dasharray]="seg.dashArray"
            [attr.stroke-dashoffset]="seg.dashOffset"
            transform="rotate(-90 80 80)"
            stroke-linecap="butt">
          </circle>
          <text x="80" y="74" text-anchor="middle" class="donut-center-value">{{ formattedAqi }}</text>
          <text x="80" y="92" text-anchor="middle" class="donut-center-label">{{ 'reports.donutCard.avgAqi' | translate }}</text>
        </svg>

        <ul class="donut-legend">
          <li *ngFor="let seg of segments">
            <span class="legend-dot" [style.background-color]="seg.color"></span>
            <span class="legend-label">{{ seg.label }}</span>
            <span class="legend-pct">{{ seg.percentage | number: '1.0-1' }}%</span>
          </li>
        </ul>
      </div>

      <div class="kpi-footer">
        <span class="dominant-label">{{ 'reports.donutCard.dominant' | translate: { category: dominantLabel } }}</span>
      </div>
    </div>
  `,
  styleUrls: ['./report-donut-card.component.css'],
})
export class ReportDonutCardComponent {
  @Input() categoryShares: CategoryShare[] = [];
  @Input() dominantCategory: CategoryShare['category'] | null = null;
  @Input() averageAqi: number | null = null;

  private readonly translate = inject(TranslateService);
  readonly radius = RADIUS;

  get segments(): DonutSegment[] {
    return buildDonutSegments(this.categoryShares, CIRCUMFERENCE, this.translate);
  }

  get formattedAqi(): string {
    return formatAqi(this.averageAqi);
  }

  get dominantLabel(): string {
    return categoryLabel(this.dominantCategory, this.translate);
  }
}
