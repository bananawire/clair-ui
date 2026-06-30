import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <svg
      viewBox="0 0 17 17"
      xmlns="http://www.w3.org/2000/svg"
      [class]="computedClass"
      role="img"
      [attr.aria-label]="'icon.overview' | translate"
    >
      <path
        d="M9.74998 5.49996V0H16.9999V5.49996H9.74998V5.49996M0 8.99993V0H7.24995V8.99993H0V8.99993M9.74998 16.9999V8H16.9999V16.9999H9.74998V16.9999M0 16.9999V11.5H7.24995V16.9999H0V16.9999M1.49996 7.49996H5.74998V1.49996H1.49996V7.49996V7.49996M11.2499 15.5H15.5V9.49996H11.2499V15.5V15.5M11.2499 4H15.5V1.49996H11.2499V4V4M1.49996 15.5H5.74998V12.9999H1.49996V15.5V15.5M5.74998 7.49996V7.49996V7.49996V7.49996V7.49996V7.49996M11.2499 4V4V4V4V4V4M11.2499 9.49996V9.49996V9.49996V9.49996V9.49996V9.49996M5.74998 12.9999V12.9999V12.9999V12.9999V12.9999V12.9999"
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
export class OverviewComponent {
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
