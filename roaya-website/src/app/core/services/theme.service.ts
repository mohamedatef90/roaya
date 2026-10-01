import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';
export type Direction = 'ltr' | 'rtl';

/**
 * Theme Service
 * Keeps the application on the light theme and manages direction (LTR/RTL).
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'roaya-theme';
  private readonly DIRECTION_KEY = 'roaya-direction';

  /**
   * Angular's own platform check — the only reliable browser test.
   * `typeof localStorage === 'undefined'` is NOT reliable: Node 22+ ships an
   * experimental `localStorage` global that is defined but has no `getItem`,
   * so a typeof guard passes on the server and then throws, which silently
   * fails every prerendered route at build time.
   */
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  theme = signal<Theme>('light');
  direction = signal<Direction>(this.getInitialDirection());

  constructor() {
    // Apply theme and direction whenever they change
    effect(() => {
      this.applyTheme(this.theme());
      this.applyDirection(this.direction());
    });
  }

  /**
   * Get initial direction from localStorage or browser language
   */
  private getInitialDirection(): Direction {
    // SSR guard: no browser storage/navigator on the server
    if (!this.isBrowser) {
      return 'ltr';
    }
    const stored = localStorage.getItem(this.DIRECTION_KEY) as Direction;
    if (stored && (stored === 'ltr' || stored === 'rtl')) {
      return stored;
    }

    // Check if the browser language is RTL
    const lang = navigator.language || (navigator as any).userLanguage;
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    if (rtlLanguages.some((rtl) => lang.startsWith(rtl))) {
      return 'rtl';
    }

    return 'ltr';
  }

  /**
   * Kept for backwards compatibility with any legacy callers.
   * The application is intentionally light-only.
   */
  toggleTheme(): void {
    this.theme.set('light');
  }

  /**
   * Set specific theme
   */
  setTheme(_theme: Theme): void {
    this.theme.set('light');
  }

  /**
   * Toggle between LTR and RTL directions
   */
  toggleDirection(): void {
    this.direction.set(this.direction() === 'ltr' ? 'rtl' : 'ltr');
  }

  /**
   * Set specific direction
   */
  setDirection(direction: Direction): void {
    this.direction.set(direction);
  }

  /**
   * Apply theme to document
   */
  private applyTheme(_theme: Theme): void {
    if (!this.isBrowser) return; // SSR guard
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');
    root.classList.remove('dark');
    localStorage.setItem(this.THEME_KEY, 'light');
  }

  /**
   * Apply direction to document
   */
  private applyDirection(direction: Direction): void {
    if (!this.isBrowser) return; // SSR guard
    const root = document.documentElement;
    root.setAttribute('dir', direction);
    document.body.dir = direction;
    localStorage.setItem(this.DIRECTION_KEY, direction);
  }

  /**
   * Check if current theme is dark
   */
  isDarkTheme(): boolean {
    return false;
  }

  /**
   * Check if current direction is RTL
   */
  isRTL(): boolean {
    return this.direction() === 'rtl';
  }
}
