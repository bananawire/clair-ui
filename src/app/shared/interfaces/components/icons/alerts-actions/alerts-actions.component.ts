import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-alerts-actions',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <svg
      viewBox="0 0 20 16"
      xmlns="http://www.w3.org/2000/svg"
      [class]="computedClass"
      role="img"
      [attr.aria-label]="'icon.alertsActions' | translate"
    >
      <path
        d="M10 3.77L16.39 14H3.61L10 3.77ZM10 0L0 16H20L10 0Z"
        [attr.fill]="fill"
        [attr.stroke]="stroke"
        [attr.stroke-width]="strokeWidth"
        stroke-linejoin="round"
      />
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      width: 18px;
      height: 18px;
      color: inherit;
      flex: 0 0 18px;
    }

    svg {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsActionsComponent {
  /**
   * Tailwind classes applied to the root SVG element.
   * Use sizing utilities (e.g. 'w-32 h-auto') and color utilities
   * (e.g. 'text-white' or 'text-primary') since fill/stroke default to currentColor.
   */
  @Input() class = '';

  /** Fill color for the path. Accepts Tailwind colors when combined with currentColor. */
  @Input() fill: string = 'currentColor';

  /** Stroke color for the path. Accepts Tailwind colors when combined with currentColor. */
  @Input() stroke: string = 'currentColor';

  /** Stroke width for the path. */
  @Input() strokeWidth: number | string = 0.5;

  get computedClass(): string {
    return ['block', this.class].join(' ').trim();
  }
}
