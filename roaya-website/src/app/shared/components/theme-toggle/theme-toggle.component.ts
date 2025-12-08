import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

/**
 * Theme Toggle Component
 * Beautiful animated toggle switch for light/dark mode
 * Design inspired by Uiverse.io
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);

  // Computed signal for checked state
  isChecked = computed(() => this.themeService.isDark());

  /**
   * Toggle theme when switch is clicked
   */
  onToggle(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Get accessible label for current theme
   */
  get ariaLabel(): string {
    return this.isChecked()
      ? 'Switch to light mode'
      : 'Switch to dark mode';
  }
}
