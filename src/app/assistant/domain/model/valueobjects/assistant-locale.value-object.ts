export type AssistantLocale = 'es' | 'en';

/** The assistant answers in Spanish unless the active language is English. */
export const createAssistantLocale = (value: string | null | undefined): AssistantLocale => {
  return value === 'en' ? 'en' : 'es';
};
