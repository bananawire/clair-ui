import { createGetConversationsQuery } from './get-conversations.query';
import { createGetConversationMessagesQuery } from './get-conversation-messages.query';
import { createConversationId } from '../valueobjects/conversation-id.value-object';

describe('createGetConversationsQuery', () => {
  it('usa la primera página de 20 por defecto y es inmutable', () => {
    const query = createGetConversationsQuery();

    expect(query).toEqual({ page: 0, size: 20 });
    expect(Object.isFrozen(query)).toBe(true);
  });

  it.each([-1, 1.5])('rechaza la página %j', (page) => {
    expect(() => createGetConversationsQuery(page, 20)).toThrow('non-negative integer');
  });

  it.each([0, 51])('rechaza el tamaño %j', (size) => {
    expect(() => createGetConversationsQuery(0, size)).toThrow('between 1 and 50');
  });
});

describe('createGetConversationMessagesQuery', () => {
  it('guarda el id de la conversación', () => {
    const conversationId = createConversationId('conv-1');

    expect(createGetConversationMessagesQuery(conversationId).conversationId).toBe(conversationId);
  });

  it('rechaza un id nulo', () => {
    expect(() => createGetConversationMessagesQuery(null as never)).toThrow(
      'Conversation ID is required',
    );
  });
});
