import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      [class]="computedClass"
      role="img"
      [attr.aria-label]="'icon.aiAssistant' | translate"
    >
      <path
        d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z"
        [attr.fill]="fill"
        [attr.stroke]="stroke"
        [attr.stroke-width]="strokeWidth"
        stroke-linejoin="round"
      />
      <path
        d="M12 5L13.2 7.8L16 9L13.2 10.2L12 13L10.8 10.2L8 9L10.8 7.8L12 5Z"
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
export class AiAssistantComponent {
  /**
   * Tailwind classes applied to the root SVG element.
   * Use sizing utilities (e.g. 'w-32 h-auto') and color utilities
   * (e.g. 'text-white' or 'text-primary') since fill/stroke default to currentColor.
   */
  @Input() class = '';

  /** Fill color for the paths. Accepts Tailwind colors when combined with currentColor. */
  @Input() fill: string = 'currentColor';

  /** Stroke color for the paths. Accepts Tailwind colors when combined with currentColor. */
  @Input() stroke: string = 'currentColor';

  /** Stroke width for the paths. */
  @Input() strokeWidth: number | string = 0.5;

  get computedClass(): string {
    return ['block', this.class].join(' ').trim();
  }
}
