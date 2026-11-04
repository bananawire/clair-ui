import { AssistantUsageResource } from './assistant-usage.resource';
import { ConversationMessageResource } from './conversation-message.resource';

export type AssistantReplyResource = {
  conversationId: string;
  userMessage: ConversationMessageResource;
  assistantMessage: ConversationMessageResource;
  usage: AssistantUsageResource;
};
