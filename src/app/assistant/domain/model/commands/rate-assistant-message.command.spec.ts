import { createRateAssistantMessageCommand } from './rate-assistant-message.command';
import { createMessageId } from '../valueobjects/message-id.value-object';

describe('createRateAssistantMessageCommand', () => {
  const messageId = createMessageId('msg-1');

  it.each(['UP', 'DOWN'])('acepta la calificación %s y es inmutable', (rating) => {
    const command = createRateAssistantMessageCommand(messageId, rating);

    expect(command.messageId).toBe(messageId);
    expect(command.rating).toBe(rating);
    expect(Object.isFrozen(command)).toBe(true);
  });

  it('rechaza una calificación desconocida', () => {
    expect(() => createRateAssistantMessageCommand(messageId, 'MEH')).toThrow(
      'Invalid feedback rating: MEH',
    );
  });

  it.each([null, undefined])('rechaza un messageId nulo (%j)', (value) => {
    expect(() => createRateAssistantMessageCommand(value as never, 'UP')).toThrow(
      'Message ID is required',
    );
  });
});
