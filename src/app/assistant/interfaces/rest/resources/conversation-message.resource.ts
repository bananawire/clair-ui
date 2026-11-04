export type ConversationMessageResource = {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  feedback: string | null;
  createdAt: string;
};
