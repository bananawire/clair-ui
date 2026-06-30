import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLanguage = 'en' | 'es';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'es'];
export const LANGUAGE_STORAGE_KEY = 'clair-language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  initialize(): void {
    const stored = this.getStoredLanguage();
    const language = stored ?? 'en';
    this.translate.setFallbackLang('en').subscribe();
    this.translate.use(language).subscribe();
  }

  getCurrentLanguage(): SupportedLanguage {
    const current = this.translate.getCurrentLang();
    return current === 'en' || current === 'es' ? current : 'en';
  }

  setLanguage(language: SupportedLanguage): void {
    this.translate.use(language).subscribe();
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }

  getStoredLanguage(): SupportedLanguage | null {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'es') {
      return stored;
    }
    return null;
  }
}
