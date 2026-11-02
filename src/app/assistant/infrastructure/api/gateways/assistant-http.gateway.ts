import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../../api.config';
import { AssistantGateway } from './assistant.gateway';
import { AssistantReplyResource } from '../../../interfaces/rest/resources/assistant-reply.resource';
import { AssistantUsageResource } from '../../../interfaces/rest/resources/assistant-usage.resource';
import { ConversationMessageResource } from '../../../interfaces/rest/resources/conversation-message.resource';
import { ConversationPageResource } from '../../../interfaces/rest/resources/conversation-page.resource';
import { RateAssistantMessageResource } from '../../../interfaces/rest/resources/rate-assistant-message.resource';
import { SendAssistantMessageResource } from '../../../interfaces/rest/resources/send-assistant-message.resource';

@Injectable({ providedIn: 'root' })
export class AssistantHttpGateway implements AssistantGateway {
  private readonly baseUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.assistant;

  constructor(private readonly http: HttpClient) {}

  sendMessage(resource: SendAssistantMessageResource): Observable<AssistantReplyResource> {
    return this.http.post<AssistantReplyResource>(`${this.baseUrl}/messages`, resource);
  }

  getConversations(page: number, size: number): Observable<ConversationPageResource> {
    const params = new HttpParams().set('page', String(page)).set('size', String(size));
    return this.http.get<ConversationPageResource>(`${this.baseUrl}/conversations`, { params });
  }

  getConversationMessages(conversationId: string): Observable<ConversationMessageResource[]> {
    return this.http.get<ConversationMessageResource[]>(
      `${this.baseUrl}/conversations/${conversationId}/messages`,
    );
  }

  getUsage(): Observable<AssistantUsageResource> {
    return this.http.get<AssistantUsageResource>(`${this.baseUrl}/usage`);
  }

  rateMessage(messageId: string, resource: RateAssistantMessageResource): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/messages/${messageId}/feedback`, resource);
  }
}
