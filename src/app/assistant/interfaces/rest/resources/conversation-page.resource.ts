export type ConversationResource = {
  id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
};

export type ConversationPageResource = {
  content: ConversationResource[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};
