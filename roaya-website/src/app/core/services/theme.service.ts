import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

/**
 * Theme Service
 * Manages light/dark mode theme switching with persistence
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'roaya-theme';
  
  // Signal for reactive theme state
  theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // Effect to sync theme changes with DOM and localStorage
    effect(() => {
      const currentTheme = this.theme();
      try {
        this.applyTheme(currentTheme);
        this.saveTheme(currentTheme);
      } catch (error) {
        console.warn('Failed to apply theme:', error);
        // Fallback: at least try to apply DOM theme even if storage fails
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', currentTheme === 'dark');
        }
      }
    });
  }

  /**
   * Get initial theme from localStorage or system preference
   */
  private getInitialTheme(): Theme {
    // Check localStorage first (with SSR safety)
    if (typeof localStorage !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
        if (savedTheme === 'light' || savedTheme === 'dark') {
          return savedTheme;
        }
      } catch {
        // localStorage may be disabled
      }
    }

    // Fall back to system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } catch {
        // matchMedia may not be available
      }
    }

    return 'light';
  }

  /**
   * Apply theme to document
   * Sets both data-theme attribute (for CSS variable files) and dark class (for Tailwind)
   */
  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;

      // Set data-theme attribute for CSS variable theme files (light.css, dark.css)
      html.setAttribute('data-theme', theme);

      // Toggle dark class for Tailwind dark mode utilities
      if (theme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(theme: Theme): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    this.theme.update(current => current === 'light' ? 'dark' : 'light');
  }

  /**
   * Set specific theme
   */
  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  /**
   * Check if dark mode is active
   */
  isDark(): boolean {
    return this.theme() === 'dark';
  }
}
