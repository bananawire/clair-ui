import { firstValueFrom, of } from 'rxjs';
import { AssistantQueryServiceImpl } from './assistant-query-service.impl';
import { AssistantGateway } from '../../../infrastructure/api/gateways/assistant.gateway';
import { createGetConversationMessagesQuery } from '../../../domain/model/queries/get-conversation-messages.query';
import { createGetConversationsQuery } from '../../../domain/model/queries/get-conversations.query';
import { createConversationId } from '../../../domain/model/valueobjects/conversation-id.value-object';

describe('AssistantQueryServiceImpl', () => {
  const gateway = {
    sendMessage: vi.fn(),
    getConversations: vi.fn(),
    getConversationMessages: vi.fn(),
    getUsage: vi.fn(),
    rateMessage: vi.fn(),
  };
  const service = new AssistantQueryServiceImpl(gateway as unknown as AssistantGateway);

  beforeEach(() => vi.resetAllMocks());

  it('handleGetUsage mapea el cupo del día', async () => {
    gateway.getUsage.mockReturnValue(
      of({ used: 4, limit: 100, remaining: 96, resetsAt: '2026-11-02T05:00:00Z', plan: 'PREMIUM' }),
    );

    const usage = await firstValueFrom(service.handleGetUsage());

    expect(usage.plan).toBe('PREMIUM');
    expect(usage.remaining).toBe(96);
  });

  it('handleGetConversations pide la página indicada', async () => {
    gateway.getConversations.mockReturnValue(
      of({
        content: [
          { id: 'c-1', title: 'Hola', lastMessageAt: '2026-11-01T20:00:00Z', createdAt: '2026-11-01T20:00:00Z' },
        ],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0,
      }),
    );

    const page = await firstValueFrom(service.handleGetConversations(createGetConversationsQuery(0, 20)));

    expect(gateway.getConversations).toHaveBeenCalledWith(0, 20);
    expect(page.content[0].id.value).toBe('c-1');
  });

  it('handleGetConversationMessages mapea los mensajes en orden', async () => {
    gateway.getConversationMessages.mockReturnValue(
      of([
        { id: 'm-1', conversationId: 'c-1', role: 'USER', content: 'Hola', feedback: null, createdAt: '2026-11-01T20:00:00Z' },
        { id: 'm-2', conversationId: 'c-1', role: 'ASSISTANT', content: 'Hola', feedback: 'DOWN', createdAt: '2026-11-01T20:00:01Z' },
      ]),
    );

    const messages = await firstValueFrom(
      service.handleGetConversationMessages(
        createGetConversationMessagesQuery(createConversationId('c-1')),
      ),
    );

    expect(gateway.getConversationMessages).toHaveBeenCalledWith('c-1');
    expect(messages.map((m) => m.role)).toEqual(['USER', 'ASSISTANT']);
    expect(messages[1].feedback).toBe('DOWN');
  });
});
