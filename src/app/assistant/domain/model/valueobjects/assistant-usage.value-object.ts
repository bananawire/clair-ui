export type AssistantUsage = Readonly<{
  used: number;
  limit: number;
  remaining: number;
  resetsAt: string;
  plan: string;
}>;

export const createAssistantUsage = (usage: AssistantUsage): AssistantUsage => {
  if (!Number.isInteger(usage.used) || usage.used < 0) {
    throw new Error('Used messages must be a non-negative integer');
  }
  if (!Number.isInteger(usage.limit) || usage.limit < 0) {
    throw new Error('Message limit must be a non-negative integer');
  }
  return Object.freeze({
    ...usage,
    remaining: Math.max(0, usage.remaining),
  });
};

export const isUsageExhausted = (usage: AssistantUsage): boolean => usage.remaining <= 0;
