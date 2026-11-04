import { createConversationMessage, withFeedback } from './conversation-message.value-object';
import { createConversationId } from './conversation-id.value-object';
import { createMessageId } from './message-id.value-object';
import { createMessageRole } from './message-role.value-object';
import { createAssistantLocale } from './assistant-locale.value-object';
import { createAssistantUsage, isUsageExhausted } from './assistant-usage.value-object';

const base = {
  id: createMessageId('msg-1'),
  conversationId: createConversationId('conv-1'),
  content: 'Ventila la sala diez minutos.',
  feedback: null,
  createdAt: '2026-11-01T20:00:00Z',
};

describe('createConversationMessage', () => {
  it('crea un mensaje inmutable', () => {
    const message = createConversationMessage({ ...base, role: 'ASSISTANT' });

    expect(message.role).toBe('ASSISTANT');
    expect(Object.isFrozen(message)).toBe(true);
  });

  it('rechaza contenido vacío', () => {
    expect(() => createConversationMessage({ ...base, role: 'USER', content: '  ' })).toThrow(
      'Message content is required',
    );
  });

  it('rechaza una calificación en un mensaje del usuario', () => {
    expect(() => createConversationMessage({ ...base, role: 'USER', feedback: 'UP' })).toThrow(
      'Only assistant messages can be rated',
    );
  });
});

describe('withFeedback', () => {
  it('devuelve una copia calificada sin tocar el original', () => {
    const original = createConversationMessage({ ...base, role: 'ASSISTANT' });

    const rated = withFeedback(original, 'DOWN');

    expect(rated.feedback).toBe('DOWN');
    expect(original.feedback).toBeNull();
  });

  it('no permite calificar una pregunta', () => {
    const question = createConversationMessage({ ...base, role: 'USER' });

    expect(() => withFeedback(question, 'UP')).toThrow('Only assistant messages can be rated');
  });
});

describe('value objects del asistente', () => {
  it('valida el rol del mensaje', () => {
    expect(createMessageRole('USER')).toBe('USER');
    expect(() => createMessageRole('SYSTEM')).toThrow('Invalid message role: SYSTEM');
  });

  it('usa español salvo que el idioma sea inglés', () => {
    expect(createAssistantLocale('en')).toBe('en');
    expect(createAssistantLocale('es')).toBe('es');
    expect(createAssistantLocale(undefined)).toBe('es');
  });

  it('rechaza ids vacíos', () => {
    expect(() => createConversationId(' ')).toThrow('Conversation ID is required');
    expect(() => createMessageId('')).toThrow('Message ID is required');
  });

  it('detecta cuando se agotó el cupo diario', () => {
    const usage = createAssistantUsage({
      used: 10,
      limit: 10,
      remaining: 0,
      resetsAt: '2026-11-02T05:00:00Z',
      plan: 'FREEMIUM',
    });

    expect(isUsageExhausted(usage)).toBe(true);
    expect(() => createAssistantUsage({ ...usage, used: -1 })).toThrow('non-negative integer');
  });
});
