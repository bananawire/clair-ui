import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

export interface OrganizationAqiItem {
  organizationName?: string | null;
  spaceName: string | null;
  aqiValue: number | null;
  aqiCategory?: string | null;
}

const toCamelCase = (value: string): string =>
  value.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

@Component({
  selector: 'app-organizations-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organization-card.component.html',
  styleUrls: ['./organization-card.component.css'],
})
export class OrganizationCardComponent {
  @Input() title = '';
  @Input() organizations: OrganizationAqiItem[] = [];
  @Input() emptyLabel = '';

  private readonly translate = inject(TranslateService);

  get hasOrganizations(): boolean {
    return Array.isArray(this.organizations) && this.organizations.length > 0;
  }

  ngOnInit(): void {
    if (!this.title) {
      this.title = this.translate.instant('organizationCard.title');
    }
    if (!this.emptyLabel) {
      this.emptyLabel = this.translate.instant('organizationCard.empty');
    }
  }

  private normalizeCategory(raw: string): string {
    return raw
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_')
      .replace(/_+/g, '_');
  }

  getAqiValue(value: number | null): string | number {
    return value === null || !Number.isFinite(value) ? '--' : Math.round(value);
  }

  getAqiToneClass(value: number | null, category?: string | null): string {
    const raw = (category || '').trim();
    const key = raw ? this.normalizeCategory(raw) : '';
    if (key === 'GOOD') return 'good';
    if (key === 'MODERATE') return 'moderate';
    if (key === 'UNHEALTHY_FOR_SENSITIVE') return 'sensitive';
    if (key === 'UNHEALTHY_FOR_SENSITIVE_GROUPS') return 'sensitive';
    if (key === 'UNHEALTHY') return 'unhealthy';
    if (key === 'VERY_UNHEALTHY') return 'very-unhealthy';
    if (key === 'HAZARDOUS') return 'hazardous';

    if (value === null || !Number.isFinite(value)) return 'neutral';
    const v = Math.round(value);
    if (v <= 50) return 'good';
    if (v <= 100) return 'moderate';
    if (v <= 150) return 'sensitive';
    if (v <= 200) return 'unhealthy';
    if (v <= 300) return 'very-unhealthy';
    return 'hazardous';
  }

  getSpaceName(name: string | null): string {
    return name && name.trim().length > 0 ? name : this.translate.instant('organizationCard.noName');
  }

  getAqiCategory(category: string | null | undefined): string {
    if (!category || category.trim().length === 0) {
      return this.translate.instant('organizationCard.noName');
    }
    const key = this.normalizeCategory(category);
    return this.translate.instant(`aqiCategories.${toCamelCase(key)}`);
  }
}
