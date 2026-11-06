export type FeedbackRating = 'UP' | 'DOWN';

export const FeedbackRatings: readonly FeedbackRating[] = ['UP', 'DOWN'];

export const isValidFeedbackRating = (value: string): value is FeedbackRating => {
  return (FeedbackRatings as readonly string[]).includes(value);
};

export const createFeedbackRating = (value: string): FeedbackRating => {
  if (!isValidFeedbackRating(value)) {
    throw new Error(`Invalid feedback rating: ${value}`);
  }
  return value;
};
