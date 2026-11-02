import {
  assistantReplyResourceToDomain,
  conversationPageResourceToDomain,
  sendAssistantMessageCommandToResource,
} from './assistant.transform';
import { createSendAssistantMessageCommand } from '../../../domain/model/commands/send-assistant-message.command';
import { createConversationId } from '../../../domain/model/valueobjects/conversation-id.value-object';

describe('assistant.transform', () => {
  it('convierte el comando en el body del POST', () => {
    const command = createSendAssistantMessageCommand('Hola', 'es', createConversationId('conv-1'));

    expect(sendAssistantMessageCommandToResource(command)).toEqual({
      conversationId: 'conv-1',
      content: 'Hola',
      locale: 'es',
    });
    expect(
      sendAssistantMessageCommandToResource(createSendAssistantMessageCommand('Hola', 'en'))
        .conversationId,
    ).toBeNull();
  });

  it('convierte la respuesta del asistente al dominio', () => {
    const reply = assistantReplyResourceToDomain({
      conversationId: 'conv-1',
      userMessage: {
        id: 'm-1',
        conversationId: 'conv-1',
        role: 'USER',
        content: 'Hola',
        feedback: null,
        createdAt: '2026-11-01T20:00:00Z',
      },
      assistantMessage: {
        id: 'm-2',
        conversationId: 'conv-1',
        role: 'ASSISTANT',
        content: 'Hola, ¿en qué te ayudo?',
        feedback: 'UP',
        createdAt: '2026-11-01T20:00:01Z',
      },
      usage: { used: 3, limit: 10, remaining: 7, resetsAt: '2026-11-02T05:00:00Z', plan: 'FREEMIUM' },
    });

    expect(reply.conversationId.value).toBe('conv-1');
    expect(reply.userMessage.role).toBe('USER');
    expect(reply.assistantMessage.id.value).toBe('m-2');
    expect(reply.assistantMessage.feedback).toBe('UP');
    expect(reply.usage).toEqual({
      used: 3,
      limit: 10,
      remaining: 7,
      resetsAt: '2026-11-02T05:00:00Z',
      plan: 'FREEMIUM',
    });
  });

  it('convierte la página de conversaciones', () => {
    const page = conversationPageResourceToDomain({
      content: [
        { id: 'c-1', title: '¿Debo ventilar?', lastMessageAt: '2026-11-01T20:00:00Z', createdAt: '2026-11-01T19:00:00Z' },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 20,
      number: 0,
    });

    expect(page.content[0].id.value).toBe('c-1');
    expect(page.content[0].title).toBe('¿Debo ventilar?');
    expect(page.totalElements).toBe(1);
  });
});
