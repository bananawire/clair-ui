import { FeedbackRating, createFeedbackRating } from '../valueobjects/feedback-rating.value-object';
import { MessageId } from '../valueobjects/message-id.value-object';

export type RateAssistantMessageCommand = Readonly<{
  messageId: MessageId;
  rating: FeedbackRating;
}>;

export const createRateAssistantMessageCommand = (
  messageId: MessageId,
  rating: string,
): RateAssistantMessageCommand => {
  if (!messageId) throw new Error('Message ID is required');
  return Object.freeze({ messageId, rating: createFeedbackRating(rating) });
};
