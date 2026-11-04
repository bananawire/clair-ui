import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GetConversationMessagesQuery } from '../../../domain/model/queries/get-conversation-messages.query';
import {
  createGetConversationsQuery,
  GetConversationsQuery,
} from '../../../domain/model/queries/get-conversations.query';
import { AssistantUsage } from '../../../domain/model/valueobjects/assistant-usage.value-object';
import { ConversationMessage } from '../../../domain/model/valueobjects/conversation-message.value-object';
import { ConversationPage } from '../../../domain/model/valueobjects/conversation.value-object';
import { AssistantQueryService } from '../../../domain/services/assistant-query-service';
import {
  ASSISTANT_GATEWAY,
  AssistantGateway,
} from '../../../infrastructure/api/gateways/assistant.gateway';
import {
  assistantUsageResourceToDomain,
  conversationMessageResourceToDomain,
  conversationPageResourceToDomain,
} from '../../../interfaces/rest/transform/assistant.transform';

@Injectable({ providedIn: 'root' })
export class AssistantQueryServiceImpl implements AssistantQueryService {
  constructor(@Inject(ASSISTANT_GATEWAY) private readonly assistantGateway: AssistantGateway) {}

  handleGetConversationMessages(
    query: GetConversationMessagesQuery,
  ): Observable<readonly ConversationMessage[]> {
    return this.assistantGateway
      .getConversationMessages(query.conversationId.value)
      .pipe(map((resources) => Object.freeze(resources.map(conversationMessageResourceToDomain))));
  }

  handleGetConversations(query: GetConversationsQuery): Observable<ConversationPage> {
    const normalizedQuery = createGetConversationsQuery(query.page, query.size);
    return this.assistantGateway
      .getConversations(normalizedQuery.page, normalizedQuery.size)
      .pipe(map(conversationPageResourceToDomain));
  }

  handleGetUsage(): Observable<AssistantUsage> {
    return this.assistantGateway.getUsage().pipe(map(assistantUsageResourceToDomain));
  }
}
