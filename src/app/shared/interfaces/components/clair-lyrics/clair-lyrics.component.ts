import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-clair-lyrics',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <svg
      viewBox="0 0 604 75"
      xmlns="http://www.w3.org/2000/svg"
      [class]="computedClass"
      role="img"
      [attr.aria-label]="'icon.clairLyrics' | translate"
    >
      <path
        d="M515.138 0.159545C524.664 -0.181461 536.554 0.130407 546.272 0.12939L603.711 0.177571C603.63 7.54633 604.679 26.7815 603.191 32.9663C602.535 35.7228 601.142 38.2492 599.159 40.2759C593.578 45.8951 582.102 44.4041 574.153 44.4255C583.997 54.1557 593.778 63.9479 603.497 73.8019C596.256 73.8552 589.012 73.8457 581.772 73.7738C579.052 71.6299 575.034 67.2907 572.426 64.6759L555.534 47.6764L551.947 44.4329C544.918 44.2137 537.102 44.3684 530.012 44.3613L529.998 73.8068L515.163 73.7903C515.388 59.2548 515.184 44.1843 515.184 29.6057L558.837 29.6523C566.189 29.659 573.542 29.7884 580.888 29.5071C590.223 29.1498 588.981 21.8297 588.928 14.8935L548.648 14.9201C544.152 14.9222 538.979 14.7518 534.536 14.9212C523.488 15.3427 516.598 11.9105 515.138 0.159545Z"
        [attr.fill]="fill"
        [attr.stroke]="stroke"
        [attr.stroke-width]="strokeWidth"
        stroke-linejoin="round"
      />
      <path
        d="M294.528 29.6258C323.496 29.2124 353.879 29.5844 382.9 29.6514L382.91 73.7708C378.028 73.8707 372.971 73.8038 368.075 73.8038L368.047 59.2953L368.04 44.3622L309.198 44.3762L309.17 73.8055L294.517 73.7985L294.528 29.6258Z"
        [attr.fill]="fill"
        [attr.stroke]="stroke"
        [attr.stroke-width]="strokeWidth"
        stroke-linejoin="round"
      />
      <path
        d="M147.192 0.14091C152.09 0.0632759 157.214 0.154095 162.13 0.167245L162.111 59.1623L235.803 59.196C235.191 64.131 234.422 65.643 231.392 69.5815C227.061 73.6746 222.572 73.8668 216.865 73.8594C210.806 73.8514 204.739 73.8226 198.681 73.8174L147.231 73.8089L147.192 0.14091Z"
        [attr.fill]="fill"
        [attr.stroke]="stroke"
        [attr.stroke-width]="strokeWidth"
        stroke-linejoin="round"
      />
      <path
        d="M0.158141 29.6021L14.8164 29.6252C14.9133 35.4509 13.3125 53.219 17.0201 56.9541C18.359 58.3031 20.1138 58.775 21.9462 58.9973C28.7661 59.8252 36.31 59.1383 43.2075 59.1337L88.3948 59.1944C87.9698 64.5159 87.1528 66.0394 83.6614 69.9758C77.7382 75.3197 66.6615 73.8358 58.9365 73.8442L23.5378 73.8466C16.8804 73.84 9.43616 74.8214 4.41144 69.6711C-0.938268 64.1876 0.068645 55.8541 0.0861931 48.8141L0.158141 29.6021Z"
        [attr.fill]="fill"
        [attr.stroke]="stroke"
        [attr.stroke-width]="strokeWidth"
        stroke-linejoin="round"
      />
      <path
        d="M0.149214 0.154627C11.2326 -0.0517654 22.9979 0.134008 34.1314 0.131834L88.3803 0.181556C87.9753 5.54512 87.2621 7.04555 83.6567 10.9465C81.9577 12.5886 79.5919 14.1774 77.2229 14.4243C68.8644 15.2946 59.8832 14.8906 51.4847 14.8924L0.130615 14.8489L0.149214 0.154627Z"
        [attr.fill]="fill"
        [attr.stroke]="stroke"
        [attr.stroke-width]="strokeWidth"
        stroke-linejoin="round"
      />
      <path
        d="M294.44 0.170099C297.974 0.0672183 301.617 0.114838 305.162 0.134299C331.122 0.276978 357.132 -0.104669 383.089 0.197731C382.278 5.05026 381.762 6.72742 378.632 10.4878C376.235 12.7617 373.508 14.5785 370.061 14.6503C349.277 15.083 328.248 15.1342 307.474 14.6416C299.539 14.4533 295.078 7.58335 294.44 0.170099Z"
        [attr.fill]="fill"
        [attr.stroke]="stroke"
        [attr.stroke-width]="strokeWidth"
        stroke-linejoin="round"
      />
      <path
        d="M441.798 0.149126C446.648 0.074403 451.692 0.153194 456.556 0.160839L456.542 73.7639C451.699 73.8943 446.627 73.8032 441.767 73.7849L441.798 0.149126Z"
        [attr.fill]="fill"
        [attr.stroke]="stroke"
        [attr.stroke-width]="strokeWidth"
        stroke-linejoin="round"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClairLyricsComponent {
  /**
   * Tailwind classes applied to the root SVG element.
   * Use sizing utilities (e.g. 'w-32 h-auto') and color utilities
   * (e.g. 'text-white' or 'text-primary') since fill/stroke default to currentColor.
   */
  @Input() class = '';

  /** Fill color for all paths. Accepts Tailwind colors when combined with currentColor. */
  @Input() fill: string = 'currentColor';

  /** Stroke color for all paths. Accepts Tailwind colors when combined with currentColor. */
  @Input() stroke: string = 'currentColor';

  /** Stroke width for all paths. */
  @Input() strokeWidth: number | string = 2;

  get computedClass(): string {
    return ['block', this.class].join(' ').trim();
  }
}
