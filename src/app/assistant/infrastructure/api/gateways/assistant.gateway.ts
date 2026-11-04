import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AssistantReplyResource } from '../../../interfaces/rest/resources/assistant-reply.resource';
import { AssistantUsageResource } from '../../../interfaces/rest/resources/assistant-usage.resource';
import { ConversationMessageResource } from '../../../interfaces/rest/resources/conversation-message.resource';
import { ConversationPageResource } from '../../../interfaces/rest/resources/conversation-page.resource';
import { RateAssistantMessageResource } from '../../../interfaces/rest/resources/rate-assistant-message.resource';
import { SendAssistantMessageResource } from '../../../interfaces/rest/resources/send-assistant-message.resource';

export interface AssistantGateway {
  sendMessage(resource: SendAssistantMessageResource): Observable<AssistantReplyResource>;
  getConversations(page: number, size: number): Observable<ConversationPageResource>;
  getConversationMessages(conversationId: string): Observable<ConversationMessageResource[]>;
  getUsage(): Observable<AssistantUsageResource>;
  rateMessage(messageId: string, resource: RateAssistantMessageResource): Observable<void>;
}

export const ASSISTANT_GATEWAY = new InjectionToken<AssistantGateway>('ASSISTANT_GATEWAY');
