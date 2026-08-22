import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';
export type Direction = 'ltr' | 'rtl';

/**
 * Theme Service
 * Manages application theme (light/dark) and direction (LTR/RTL)
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'roaya-theme';
  private readonly DIRECTION_KEY = 'roaya-direction';

  theme = signal<Theme>(this.getInitialTheme());
  direction = signal<Direction>(this.getInitialDirection());

  constructor() {
    // Apply theme and direction whenever they change
    effect(() => {
      this.applyTheme(this.theme());
      this.applyDirection(this.direction());
    });
  }

  /**
   * Get initial theme from localStorage or system preference
   */
  private getInitialTheme(): Theme {
    // SSR guard: no browser storage/media queries on the server
    if (typeof localStorage === 'undefined' || typeof window === 'undefined') {
      return 'light';
    }
    const stored = localStorage.getItem(this.THEME_KEY) as Theme;
    if (stored && (stored === 'light' || stored === 'dark')) {
      return stored;
    }

    // Check system preference
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }

    return 'light';
  }

  /**
   * Get initial direction from localStorage or browser language
   */
  private getInitialDirection(): Direction {
    // SSR guard: no browser storage/navigator on the server
    if (typeof localStorage === 'undefined' || typeof navigator === 'undefined') {
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
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  /**
   * Set specific theme
   */
  setTheme(theme: Theme): void {
    this.theme.set(theme);
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
  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return; // SSR guard
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  /**
   * Apply direction to document
   */
  private applyDirection(direction: Direction): void {
    if (typeof document === 'undefined') return; // SSR guard
    const root = document.documentElement;
    root.setAttribute('dir', direction);
    document.body.dir = direction;
    localStorage.setItem(this.DIRECTION_KEY, direction);
  }

  /**
   * Check if current theme is dark
   */
  isDarkTheme(): boolean {
    return this.theme() === 'dark';
  }

  /**
   * Check if current direction is RTL
   */
  isRTL(): boolean {
    return this.direction() === 'rtl';
  }
}
