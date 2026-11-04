export type ConversationId = Readonly<{
  value: string;
}>;

export const createConversationId = (value: string): ConversationId => {
  if (!value || value.trim().length === 0) {
    throw new Error('Conversation ID is required');
  }
  return Object.freeze({ value: value.trim() });
};
