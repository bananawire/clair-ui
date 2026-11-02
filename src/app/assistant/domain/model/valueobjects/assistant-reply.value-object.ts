import { AssistantUsage } from './assistant-usage.value-object';
import { ConversationId } from './conversation-id.value-object';
import { ConversationMessage } from './conversation-message.value-object';

export type AssistantReply = Readonly<{
  conversationId: ConversationId;
  userMessage: ConversationMessage;
  assistantMessage: ConversationMessage;
  usage: AssistantUsage;
}>;
