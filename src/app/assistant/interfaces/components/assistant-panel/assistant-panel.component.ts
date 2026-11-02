import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ASSISTANT_COMMAND_SERVICE,
  AssistantCommandService,
} from '../../../domain/services/assistant-command-service';
import {
  ASSISTANT_QUERY_SERVICE,
  AssistantQueryService,
} from '../../../domain/services/assistant-query-service';
import { createSendAssistantMessageCommand } from '../../../domain/model/commands/send-assistant-message.command';
import { createRateAssistantMessageCommand } from '../../../domain/model/commands/rate-assistant-message.command';
import { createGetConversationMessagesQuery } from '../../../domain/model/queries/get-conversation-messages.query';
import { createGetConversationsQuery } from '../../../domain/model/queries/get-conversations.query';
import {
  AssistantUsage,
  isUsageExhausted,
} from '../../../domain/model/valueobjects/assistant-usage.value-object';
import { ConversationId } from '../../../domain/model/valueobjects/conversation-id.value-object';
import {
  ConversationMessage,
  withFeedback,
} from '../../../domain/model/valueobjects/conversation-message.value-object';
import { Conversation } from '../../../domain/model/valueobjects/conversation.value-object';
import { FeedbackRating } from '../../../domain/model/valueobjects/feedback-rating.value-object';
import { LanguageService } from '../../../../shared/interfaces/services/language.service';
import { ChatComposerComponent } from '../chat-composer/chat-composer.component';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { SuggestedPromptsComponent } from '../suggested-prompts/suggested-prompts.component';
import { UsageIndicatorComponent } from '../usage-indicator/usage-indicator.component';

type AssistantBanner = 'quota' | 'unavailable' | 'error' | 'load' | null;
type PanelView = 'chat' | 'history';

/**
 * The assistant as a companion chat that slides in from the right of any screen. It stays mounted
 * while closed, so reopening it keeps the current conversation and any unsent draft.
 */
@Component({
  selector: 'app-assistant-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    TranslatePipe,
    ChatComposerComponent,
    ChatMessageComponent,
    SuggestedPromptsComponent,
    UsageIndicatorComponent,
  ],
  templateUrl: './assistant-panel.component.html',
  styleUrl: './assistant-panel.component.css',
})
export class AssistantPanelComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Output() closeRequested = new EventEmitter<void>();

  private readonly destroy$ = new Subject<void>();

  @ViewChild(ChatComposerComponent) private composer?: ChatComposerComponent;
  @ViewChild('messageList') private messageList?: ElementRef<HTMLElement>;

  readonly suggestionKeys: readonly string[] = [
    'assistant.suggestions.status',
    'assistant.suggestions.co2',
    'assistant.suggestions.alerts',
    'assistant.suggestions.ventilation',
  ];

  view: PanelView = 'chat';
  messages: ConversationMessage[] = [];
  conversations: readonly Conversation[] = [];
  activeConversationId: ConversationId | null = null;
  usage: AssistantUsage | null = null;
  draft = '';
  pendingQuestion: string | null = null;
  sending = false;
  loadingConversation = false;
  banner: AssistantBanner = null;
  ratingMessageId: string | null = null;

  constructor(
    @Inject(ASSISTANT_COMMAND_SERVICE) private readonly commandService: AssistantCommandService,
    @Inject(ASSISTANT_QUERY_SERVICE) private readonly queryService: AssistantQueryService,
    private readonly languageService: LanguageService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      // Usage and history can change elsewhere (another tab, a plan upgrade), so refresh on open.
      this.loadUsage();
      this.loadConversations();
      this.focusComposer();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.close();
  }

  get quotaReached(): boolean {
    return this.usage ? isUsageExhausted(this.usage) : false;
  }

  get composerDisabled(): boolean {
    return this.sending || this.loadingConversation || this.quotaReached;
  }

  get isEmpty(): boolean {
    return this.messages.length === 0 && this.pendingQuestion === null;
  }

  get isFreemium(): boolean {
    return this.usage?.plan === 'FREEMIUM';
  }

  close(): void {
    this.closeRequested.emit();
  }

  toggleHistory(): void {
    this.view = this.view === 'history' ? 'chat' : 'history';
    if (this.view === 'chat') this.focusComposer();
  }

  send(content: string): void {
    if (this.composerDisabled) return;

    let command;
    try {
      command = createSendAssistantMessageCommand(
        content,
        this.languageService.getCurrentLanguage(),
        this.activeConversationId,
      );
    } catch {
      return;
    }

    this.sending = true;
    this.banner = null;
    this.pendingQuestion = command.content;
    this.draft = '';
    this.scrollToBottom();

    this.commandService
      .handleSendAssistantMessage(command)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reply) => {
          this.messages = [...this.messages, reply.userMessage, reply.assistantMessage];
          this.activeConversationId = reply.conversationId;
          this.usage = reply.usage;
          this.pendingQuestion = null;
          this.sending = false;
          this.loadConversations();
          this.cdr.markForCheck();
          this.scrollToBottom();
          this.focusComposer();
        },
        error: (error: unknown) => {
          // The question is not stored on any failure, so it goes back into the composer.
          this.draft = this.pendingQuestion ?? content;
          this.pendingQuestion = null;
          this.sending = false;
          this.banner = this.bannerFor(error);
          if (this.banner === 'quota') {
            this.loadUsage();
          }
          this.cdr.markForCheck();
        },
      });
  }

  rate(message: ConversationMessage, rating: FeedbackRating): void {
    const previous = message;
    this.ratingMessageId = message.id.value;
    this.replaceMessage(withFeedback(message, rating));

    this.commandService
      .handleRateAssistantMessage(createRateAssistantMessageCommand(message.id, rating))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.ratingMessageId = null;
          this.cdr.markForCheck();
        },
        error: () => {
          this.ratingMessageId = null;
          this.replaceMessage(previous);
          this.cdr.markForCheck();
        },
      });
  }

  openConversation(conversation: Conversation): void {
    if (this.sending) return;
    this.view = 'chat';
    if (this.activeConversationId?.value === conversation.id.value) return;

    this.activeConversationId = conversation.id;
    this.messages = [];
    this.banner = null;
    this.loadingConversation = true;
    this.cdr.markForCheck();

    this.queryService
      .handleGetConversationMessages(createGetConversationMessagesQuery(conversation.id))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          this.messages = [...messages];
          this.loadingConversation = false;
          this.cdr.markForCheck();
          this.scrollToBottom();
        },
        error: () => {
          this.loadingConversation = false;
          this.banner = 'load';
          this.cdr.markForCheck();
        },
      });
  }

  newConversation(): void {
    if (this.sending) return;
    this.view = 'chat';
    this.activeConversationId = null;
    this.messages = [];
    this.banner = null;
    this.focusComposer();
  }

  isActive(conversation: Conversation): boolean {
    return this.activeConversationId?.value === conversation.id.value;
  }

  trackMessage(_: number, message: ConversationMessage): string {
    return message.id.value;
  }

  trackConversation(_: number, conversation: Conversation): string {
    return conversation.id.value;
  }

  private loadUsage(): void {
    this.queryService
      .handleGetUsage()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usage) => {
          this.usage = usage;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Failed to load assistant usage', err),
      });
  }

  private loadConversations(): void {
    this.queryService
      .handleGetConversations(createGetConversationsQuery(0, 20))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          this.conversations = page.content;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Failed to load assistant conversations', err),
      });
  }

  private bannerFor(error: unknown): AssistantBanner {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    if (status === 429) return 'quota';
    if (status === 503) return 'unavailable';
    return 'error';
  }

  private replaceMessage(updated: ConversationMessage): void {
    this.messages = this.messages.map((m) => (m.id.value === updated.id.value ? updated : m));
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const list = this.messageList?.nativeElement;
      if (list) list.scrollTop = list.scrollHeight;
    });
  }

  private focusComposer(): void {
    setTimeout(() => this.composer?.focus(), 250);
  }
}
