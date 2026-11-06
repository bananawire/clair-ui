import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ConversationMessage } from '../../../domain/model/valueobjects/conversation-message.value-object';
import { FeedbackRating } from '../../../domain/model/valueobjects/feedback-rating.value-object';

/**
 * One chat bubble. The content is rendered through text interpolation only, never innerHTML, so a
 * model answer cannot inject markup into the page.
 */
@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageComponent {
  @Input({ required: true }) message!: ConversationMessage;
  @Input() ratingDisabled = false;
  @Output() rate = new EventEmitter<FeedbackRating>();

  get isAssistant(): boolean {
    return this.message.role === 'ASSISTANT';
  }

  onRate(rating: FeedbackRating): void {
    if (!this.ratingDisabled && this.message.feedback !== rating) {
      this.rate.emit(rating);
    }
  }
}
