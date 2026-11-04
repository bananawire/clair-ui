import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

/** Starter questions shown while the conversation is empty. Inputs are translation keys. */
@Component({
  selector: 'app-suggested-prompts',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './suggested-prompts.component.html',
  styleUrl: './suggested-prompts.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestedPromptsComponent {
  @Input() promptKeys: readonly string[] = [];
  @Input() disabled = false;
  @Output() select = new EventEmitter<string>();

  constructor(private readonly translate: TranslateService) {}

  choose(key: string): void {
    if (!this.disabled) {
      this.select.emit(this.translate.instant(key));
    }
  }
}
