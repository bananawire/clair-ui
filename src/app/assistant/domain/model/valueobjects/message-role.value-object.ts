export type MessageRole = 'USER' | 'ASSISTANT';

export const MessageRoles: readonly MessageRole[] = ['USER', 'ASSISTANT'];

export const isValidMessageRole = (value: string): value is MessageRole => {
  return (MessageRoles as readonly string[]).includes(value);
};

export const createMessageRole = (value: string): MessageRole => {
  if (!isValidMessageRole(value)) {
    throw new Error(`Invalid message role: ${value}`);
  }
  return value;
};
