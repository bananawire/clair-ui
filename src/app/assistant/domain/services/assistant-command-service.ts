import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { RateAssistantMessageCommand } from '../model/commands/rate-assistant-message.command';
import { SendAssistantMessageCommand } from '../model/commands/send-assistant-message.command';
import { AssistantReply } from '../model/valueobjects/assistant-reply.value-object';

export interface AssistantCommandService {
  handleSendAssistantMessage(command: SendAssistantMessageCommand): Observable<AssistantReply>;
  handleRateAssistantMessage(command: RateAssistantMessageCommand): Observable<void>;
}

export const ASSISTANT_COMMAND_SERVICE = new InjectionToken<AssistantCommandService>(
  'ASSISTANT_COMMAND_SERVICE',
);
