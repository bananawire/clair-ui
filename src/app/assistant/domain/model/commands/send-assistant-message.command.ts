import { AssistantLocale, createAssistantLocale } from '../valueobjects/assistant-locale.value-object';
import { ConversationId } from '../valueobjects/conversation-id.value-object';

export const ASSISTANT_MESSAGE_MAX_LENGTH = 1000;

export type SendAssistantMessageCommand = Readonly<{
  content: string;
  locale: AssistantLocale;
  conversationId: ConversationId | null;
}>;

export const createSendAssistantMessageCommand = (
  content: string,
  locale: string,
  conversationId: ConversationId | null = null,
): SendAssistantMessageCommand => {
  const trimmed = typeof content === 'string' ? content.trim() : '';
  if (trimmed.length === 0) {
    throw new Error('Message content is required');
  }
  if (trimmed.length > ASSISTANT_MESSAGE_MAX_LENGTH) {
    throw new Error(`Message content must be at most ${ASSISTANT_MESSAGE_MAX_LENGTH} characters`);
  }
  return Object.freeze({
    content: trimmed,
    locale: createAssistantLocale(locale),
    conversationId,
  });
};
