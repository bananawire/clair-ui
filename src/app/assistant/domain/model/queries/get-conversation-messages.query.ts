import { ConversationId } from '../valueobjects/conversation-id.value-object';

export type GetConversationMessagesQuery = Readonly<{
  conversationId: ConversationId;
}>;

export const createGetConversationMessagesQuery = (
  conversationId: ConversationId,
): GetConversationMessagesQuery => {
  if (!conversationId) throw new Error('Conversation ID is required');
  return Object.freeze({ conversationId });
};
