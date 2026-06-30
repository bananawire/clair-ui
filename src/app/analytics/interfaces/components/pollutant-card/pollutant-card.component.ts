import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

type PollutantTone = 'warning' | 'success' | 'info' | 'muted';

@Component({
  selector: 'app-pollutant-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './pollutant-card.component.html',
  styleUrls: ['./pollutant-card.component.css'],
})
export class PollutantCardComponent {
  @Input() label = '';
  @Input() value: number | null = null;
  @Input() unit = '';
  @Input() deltaLabel: string | null = null;
  @Input() tone: PollutantTone = 'success';

  private readonly translate = inject(TranslateService);

  private parseDeltaNumber(value: string | null): number | null {
    if (!value) return null;
    const cleaned = value.trim().replace('%', '');
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  get displayValue(): string | number {
    return this.value === null || !Number.isFinite(this.value)
      ? this.translate.instant('pollutantCard.noValue')
      : this.value;
  }

  get displayUnit(): string {
    return this.unit || '';
  }

  get displayDelta(): string {
    return this.deltaLabel && this.deltaLabel.trim().length > 0
      ? this.deltaLabel
      : this.translate.instant('pollutantCard.noDelta');
  }

  get deltaClass(): string {
    const delta = this.parseDeltaNumber(this.deltaLabel);
    if (delta === null) return 'delta-null';
    if (delta < 0) return 'delta negative';
    return 'delta positive';
  }

  get deltaIcon(): string {
    const delta = this.parseDeltaNumber(this.deltaLabel);
    if (delta === null || delta === 0) return '';
    return delta > 0 ? 'trending_up' : 'trending_down';
  }

  get dotClass(): string {
    return this.tone ? `dot ${this.tone}` : 'dot';
  }
}
