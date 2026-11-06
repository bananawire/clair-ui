import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { GetConversationMessagesQuery } from '../model/queries/get-conversation-messages.query';
import { GetConversationsQuery } from '../model/queries/get-conversations.query';
import { AssistantUsage } from '../model/valueobjects/assistant-usage.value-object';
import { ConversationMessage } from '../model/valueobjects/conversation-message.value-object';
import { ConversationPage } from '../model/valueobjects/conversation.value-object';

export interface AssistantQueryService {
  handleGetConversationMessages(
    query: GetConversationMessagesQuery,
  ): Observable<readonly ConversationMessage[]>;
  handleGetConversations(query: GetConversationsQuery): Observable<ConversationPage>;
  handleGetUsage(): Observable<AssistantUsage>;
}

export const ASSISTANT_QUERY_SERVICE = new InjectionToken<AssistantQueryService>(
  'ASSISTANT_QUERY_SERVICE',
);
