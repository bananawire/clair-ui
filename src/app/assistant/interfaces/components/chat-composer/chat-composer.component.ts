import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ASSISTANT_MESSAGE_MAX_LENGTH } from '../../../domain/model/commands/send-assistant-message.command';

/** Enter sends, Shift+Enter adds a line break. The page owns the draft so it survives a failed send. */
@Component({
  selector: 'app-chat-composer',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './chat-composer.component.html',
  styleUrl: './chat-composer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComposerComponent {
  @Input() value = '';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() send = new EventEmitter<string>();

  @ViewChild('input') private input?: ElementRef<HTMLTextAreaElement>;

  readonly maxLength = ASSISTANT_MESSAGE_MAX_LENGTH;

  get canSend(): boolean {
    const length = this.value.trim().length;
    return !this.disabled && length > 0 && length <= this.maxLength;
  }

  onInput(event: Event): void {
    this.value = (event.target as HTMLTextAreaElement).value;
    this.valueChange.emit(this.value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.submit();
    }
  }

  submit(): void {
    if (this.canSend) {
      this.send.emit(this.value.trim());
    }
  }

  focus(): void {
    this.input?.nativeElement.focus();
  }
}
