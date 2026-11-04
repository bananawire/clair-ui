export type MessageId = Readonly<{
  value: string;
}>;

export const createMessageId = (value: string): MessageId => {
  if (!value || value.trim().length === 0) {
    throw new Error('Message ID is required');
  }
  return Object.freeze({ value: value.trim() });
};
