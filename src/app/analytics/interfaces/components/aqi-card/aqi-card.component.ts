import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-aqi-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './aqi-card.component.html',
  styleUrl: './aqi-card.component.css',
})
export class AqiCardComponent {
  @Input() aqiValue: number | null = null;
  @Input() aqiCategory: string | null = null;
  @Input() updatedAt: string | null = null;
  @Input() deviceCount: number | null = null;
  @Input() maxAqiValue = 100;

  private readonly translate = inject(TranslateService);

  private normalizeCategory(raw: string): string {
    return raw
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_')
      .replace(/_+/g, '_');
  }

  private toCamelCase(value: string): string {
    return value.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private getCategoryKey(): string | null {
    const raw = (this.aqiCategory || '').trim();
    if (raw) return this.normalizeCategory(raw);
    if (this.aqiValue === null || !Number.isFinite(this.aqiValue)) return null;
    const value = Math.round(this.aqiValue);
    if (value <= 50) return 'GOOD';
    if (value <= 100) return 'MODERATE';
    if (value <= 150) return 'UNHEALTHY_FOR_SENSITIVE';
    if (value <= 200) return 'UNHEALTHY';
    if (value <= 300) return 'VERY_UNHEALTHY';
    return 'HAZARDOUS';
  }

  get displayAqiValue(): string | number {
    return this.aqiValue === null || !Number.isFinite(this.aqiValue)
      ? '--'
      : Math.round(this.aqiValue);
  }

  get displayCategory(): string {
    const key = this.getCategoryKey();
    if (!key) return '--';
    return this.translate.instant(`aqiCategories.${this.toCamelCase(key)}`);
  }

  get toneClass(): string {
    const key = this.getCategoryKey();
    if (!key) return 'neutral';
    if (key === 'GOOD') return 'good';
    if (key === 'MODERATE') return 'moderate';
    if (key === 'UNHEALTHY_FOR_SENSITIVE') return 'sensitive';
    if (key === 'UNHEALTHY_FOR_SENSITIVE_GROUPS') return 'sensitive';
    if (key === 'UNHEALTHY') return 'unhealthy';
    if (key === 'VERY_UNHEALTHY') return 'very-unhealthy';
    if (key === 'HAZARDOUS') return 'hazardous';
    return 'neutral';
  }

  get progressPercent(): number {
    if (this.aqiValue === null || !Number.isFinite(this.aqiValue)) {
      return 0;
    }
    const max = this.maxAqiValue > 0 ? this.maxAqiValue : 100;
    return Math.min(100, Math.max(0, Math.round((this.aqiValue / max) * 100)));
  }

  get deviceLabel(): string {
    if (this.deviceCount === null || this.deviceCount === undefined) {
      return this.translate.instant('aqiCard.deviceLabel.zero');
    }
    if (this.deviceCount === 0) {
      return this.translate.instant('aqiCard.deviceLabel.zero');
    }
    if (this.deviceCount === 1) {
      return this.translate.instant('aqiCard.deviceLabel.one');
    }
    return this.translate.instant('aqiCard.deviceLabel.many', { count: this.deviceCount });
  }

  get updatedLabel(): string {
    if (!this.updatedAt) {
      return this.translate.instant('aqiCard.updated.now');
    }
    const parsed = new Date(this.updatedAt);
    if (Number.isNaN(parsed.getTime())) {
      return this.translate.instant('aqiCard.updated.now');
    }
    const diffSeconds = Math.max(
      0,
      Math.floor((Date.now() - parsed.getTime()) / 1000),
    );
    return this.translate.instant('aqiCard.updated.secondsAgo', { seconds: diffSeconds });
  }
}
