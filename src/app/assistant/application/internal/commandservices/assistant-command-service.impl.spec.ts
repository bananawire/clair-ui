import { firstValueFrom, of, throwError } from 'rxjs';
import { AssistantCommandServiceImpl } from './assistant-command-service.impl';
import { AssistantGateway } from '../../../infrastructure/api/gateways/assistant.gateway';
import { createSendAssistantMessageCommand } from '../../../domain/model/commands/send-assistant-message.command';
import { createRateAssistantMessageCommand } from '../../../domain/model/commands/rate-assistant-message.command';
import { createMessageId } from '../../../domain/model/valueobjects/message-id.value-object';

const replyResource = {
  conversationId: 'conv-1',
  userMessage: {
    id: 'm-1',
    conversationId: 'conv-1',
    role: 'USER',
    content: '¿Debo ventilar?',
    feedback: null,
    createdAt: '2026-11-01T20:00:00Z',
  },
  assistantMessage: {
    id: 'm-2',
    conversationId: 'conv-1',
    role: 'ASSISTANT',
    content: 'Sí, el CO2 está alto.',
    feedback: null,
    createdAt: '2026-11-01T20:00:01Z',
  },
  usage: { used: 1, limit: 10, remaining: 9, resetsAt: '2026-11-02T05:00:00Z', plan: 'FREEMIUM' },
};

describe('AssistantCommandServiceImpl', () => {
  const gateway = {
    sendMessage: vi.fn(),
    getConversations: vi.fn(),
    getConversationMessages: vi.fn(),
    getUsage: vi.fn(),
    rateMessage: vi.fn(),
  };
  const service = new AssistantCommandServiceImpl(gateway as unknown as AssistantGateway);

  beforeEach(() => vi.resetAllMocks());

  it('handleSendAssistantMessage envía el body y mapea la respuesta', async () => {
    gateway.sendMessage.mockReturnValue(of(replyResource));

    const reply = await firstValueFrom(
      service.handleSendAssistantMessage(createSendAssistantMessageCommand('¿Debo ventilar?', 'es')),
    );

    expect(gateway.sendMessage).toHaveBeenCalledWith({
      conversationId: null,
      content: '¿Debo ventilar?',
      locale: 'es',
    });
    expect(reply.assistantMessage.content).toBe('Sí, el CO2 está alto.');
    expect(reply.usage.remaining).toBe(9);
  });

  it('handleRateAssistantMessage envía el id y la calificación', async () => {
    gateway.rateMessage.mockReturnValue(of(undefined));

    await firstValueFrom(
      service.handleRateAssistantMessage(
        createRateAssistantMessageCommand(createMessageId('m-2'), 'UP'),
      ),
    );

    expect(gateway.rateMessage).toHaveBeenCalledWith('m-2', { rating: 'UP' });
  });

  it('propaga los errores del gateway (por ejemplo 429)', async () => {
    gateway.sendMessage.mockReturnValue(throwError(() => ({ status: 429 })));

    await expect(
      firstValueFrom(
        service.handleSendAssistantMessage(createSendAssistantMessageCommand('Hola', 'es')),
      ),
    ).rejects.toEqual({ status: 429 });
  });
});
