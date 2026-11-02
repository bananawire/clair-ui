import {
  ASSISTANT_MESSAGE_MAX_LENGTH,
  createSendAssistantMessageCommand,
} from './send-assistant-message.command';
import { createConversationId } from '../valueobjects/conversation-id.value-object';

describe('createSendAssistantMessageCommand', () => {
  it('recorta el contenido, normaliza el idioma y es inmutable', () => {
    const conversationId = createConversationId('conv-1');

    const command = createSendAssistantMessageCommand('  ¿Cómo está el aire?  ', 'en', conversationId);

    expect(command.content).toBe('¿Cómo está el aire?');
    expect(command.locale).toBe('en');
    expect(command.conversationId).toBe(conversationId);
    expect(Object.isFrozen(command)).toBe(true);
  });

  it('usa español y conversación nueva por defecto', () => {
    const command = createSendAssistantMessageCommand('Hola', 'fr');

    expect(command.locale).toBe('es');
    expect(command.conversationId).toBeNull();
  });

  it.each(['', '   ', null, undefined] as unknown[])('rechaza un contenido vacío (%j)', (value) => {
    expect(() => createSendAssistantMessageCommand(value as string, 'es')).toThrow(
      'Message content is required',
    );
  });

  it('acepta hasta 1000 caracteres y rechaza más', () => {
    expect(
      createSendAssistantMessageCommand('x'.repeat(ASSISTANT_MESSAGE_MAX_LENGTH), 'es').content,
    ).toHaveLength(1000);
    expect(() => createSendAssistantMessageCommand('x'.repeat(1001), 'es')).toThrow(
      'at most 1000 characters',
    );
  });
});
