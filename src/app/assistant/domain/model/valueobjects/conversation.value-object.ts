import { ConversationId } from './conversation-id.value-object';

export type Conversation = Readonly<{
  id: ConversationId;
  title: string;
  lastMessageAt: string;
  createdAt: string;
}>;

export type ConversationPage = Readonly<{
  content: readonly Conversation[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}>;

export const createConversation = (conversation: Conversation): Conversation => {
  if (!conversation.id) throw new Error('Conversation ID is required');
  if (typeof conversation.title !== 'string' || conversation.title.trim().length === 0) {
    throw new Error('Conversation title is required');
  }
  return Object.freeze({ ...conversation });
};
