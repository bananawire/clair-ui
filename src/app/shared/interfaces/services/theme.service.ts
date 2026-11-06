import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'clair-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly themeSignal = signal<Theme>('dark');

  readonly theme = this.themeSignal.asReadonly();

  initialize(): void {
    this.apply(this.getStoredTheme() ?? 'dark', false);
  }

  toggle(): void {
    this.apply(this.themeSignal() === 'dark' ? 'light' : 'dark', true);
  }

  private apply(theme: Theme, animate: boolean): void {
    const root = this.document.documentElement;

    if (animate) {
      root.classList.add('theme-transition');
      setTimeout(() => root.classList.remove('theme-transition'), 250);
    }

    root.setAttribute('data-theme', theme);
    this.themeSignal.set(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this session.
    }
  }

  private getStoredTheme(): Theme | null {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return stored === 'dark' || stored === 'light' ? stored : null;
    } catch {
      return null;
    }
  }
}
