import { createConversationId } from '../../../domain/model/valueobjects/conversation-id.value-object';
import {
  ConversationMessage,
  createConversationMessage,
} from '../../../domain/model/valueobjects/conversation-message.value-object';
import {
  Conversation,
  ConversationPage,
  createConversation,
} from '../../../domain/model/valueobjects/conversation.value-object';
import {
  AssistantUsage,
  createAssistantUsage,
} from '../../../domain/model/valueobjects/assistant-usage.value-object';
import { AssistantReply } from '../../../domain/model/valueobjects/assistant-reply.value-object';
import { createFeedbackRating } from '../../../domain/model/valueobjects/feedback-rating.value-object';
import { createMessageId } from '../../../domain/model/valueobjects/message-id.value-object';
import { createMessageRole } from '../../../domain/model/valueobjects/message-role.value-object';
import { SendAssistantMessageCommand } from '../../../domain/model/commands/send-assistant-message.command';
import { AssistantReplyResource } from '../resources/assistant-reply.resource';
import { AssistantUsageResource } from '../resources/assistant-usage.resource';
import { ConversationMessageResource } from '../resources/conversation-message.resource';
import { ConversationPageResource, ConversationResource } from '../resources/conversation-page.resource';
import { SendAssistantMessageResource } from '../resources/send-assistant-message.resource';

export const sendAssistantMessageCommandToResource = (
  command: SendAssistantMessageCommand,
): SendAssistantMessageResource => ({
  conversationId: command.conversationId?.value ?? null,
  content: command.content,
  locale: command.locale,
});

export const conversationMessageResourceToDomain = (
  resource: ConversationMessageResource,
): ConversationMessage =>
  createConversationMessage({
    id: createMessageId(resource.id),
    conversationId: createConversationId(resource.conversationId),
    role: createMessageRole(resource.role),
    content: resource.content,
    feedback: resource.feedback ? createFeedbackRating(resource.feedback) : null,
    createdAt: resource.createdAt,
  });

export const assistantUsageResourceToDomain = (resource: AssistantUsageResource): AssistantUsage =>
  createAssistantUsage({
    used: resource.used,
    limit: resource.limit,
    remaining: resource.remaining,
    resetsAt: resource.resetsAt,
    plan: resource.plan,
  });

export const assistantReplyResourceToDomain = (resource: AssistantReplyResource): AssistantReply =>
  Object.freeze({
    conversationId: createConversationId(resource.conversationId),
    userMessage: conversationMessageResourceToDomain(resource.userMessage),
    assistantMessage: conversationMessageResourceToDomain(resource.assistantMessage),
    usage: assistantUsageResourceToDomain(resource.usage),
  });

export const conversationResourceToDomain = (resource: ConversationResource): Conversation =>
  createConversation({
    id: createConversationId(resource.id),
    title: resource.title,
    lastMessageAt: resource.lastMessageAt,
    createdAt: resource.createdAt,
  });

export const conversationPageResourceToDomain = (
  resource: ConversationPageResource,
): ConversationPage =>
  Object.freeze({
    content: Object.freeze(resource.content.map(conversationResourceToDomain)),
    totalElements: resource.totalElements,
    totalPages: resource.totalPages,
    size: resource.size,
    number: resource.number,
  });
