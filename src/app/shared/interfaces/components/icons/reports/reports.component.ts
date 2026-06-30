import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <svg
      viewBox="0 0 16 20"
      xmlns="http://www.w3.org/2000/svg"
      [class]="computedClass"
      role="img"
      [attr.aria-label]="'icon.reports' | translate"
    >
      <path
        d="M10 0H2C0.9 0 0.0100002 0.9 0.0100002 2L0 18C0 19.1 0.89 20 1.99 20H14C15.1 20 16 19.1 16 18V6L10 0ZM2 18V2H9V7H14V18H2Z"
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
export class ReportsComponent {
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
