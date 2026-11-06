import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RateAssistantMessageCommand } from '../../../domain/model/commands/rate-assistant-message.command';
import { SendAssistantMessageCommand } from '../../../domain/model/commands/send-assistant-message.command';
import { AssistantReply } from '../../../domain/model/valueobjects/assistant-reply.value-object';
import { AssistantCommandService } from '../../../domain/services/assistant-command-service';
import {
  ASSISTANT_GATEWAY,
  AssistantGateway,
} from '../../../infrastructure/api/gateways/assistant.gateway';
import {
  assistantReplyResourceToDomain,
  sendAssistantMessageCommandToResource,
} from '../../../interfaces/rest/transform/assistant.transform';

@Injectable({ providedIn: 'root' })
export class AssistantCommandServiceImpl implements AssistantCommandService {
  constructor(@Inject(ASSISTANT_GATEWAY) private readonly assistantGateway: AssistantGateway) {}

  handleSendAssistantMessage(command: SendAssistantMessageCommand): Observable<AssistantReply> {
    return this.assistantGateway
      .sendMessage(sendAssistantMessageCommandToResource(command))
      .pipe(map(assistantReplyResourceToDomain));
  }

  handleRateAssistantMessage(command: RateAssistantMessageCommand): Observable<void> {
    return this.assistantGateway.rateMessage(command.messageId.value, { rating: command.rating });
  }
}
