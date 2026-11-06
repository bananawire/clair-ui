import { ConversationId } from './conversation-id.value-object';
import { FeedbackRating } from './feedback-rating.value-object';
import { MessageId } from './message-id.value-object';
import { MessageRole } from './message-role.value-object';

export type ConversationMessage = Readonly<{
  id: MessageId;
  conversationId: ConversationId;
  role: MessageRole;
  content: string;
  feedback: FeedbackRating | null;
  createdAt: string;
}>;

export const createConversationMessage = (message: ConversationMessage): ConversationMessage => {
  if (!message.id) throw new Error('Message ID is required');
  if (!message.conversationId) throw new Error('Conversation ID is required');
  if (typeof message.content !== 'string' || message.content.trim().length === 0) {
    throw new Error('Message content is required');
  }
  if (message.role === 'USER' && message.feedback !== null) {
    throw new Error('Only assistant messages can be rated');
  }
  return Object.freeze({ ...message });
};

/** Returns a copy of an assistant message with the user's verdict. */
export const withFeedback = (
  message: ConversationMessage,
  feedback: FeedbackRating,
): ConversationMessage => {
  if (message.role !== 'ASSISTANT') {
    throw new Error('Only assistant messages can be rated');
  }
  return Object.freeze({ ...message, feedback });
};
