import { Injectable, signal } from '@angular/core';

/**
 * Loading Service
 * Manages application loading states for:
 * - Page transition loading states
 * - Global loading overlay
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Page transition loading state
  isPageLoading = signal<boolean>(false);

  // Global loading overlay state
  isLoading = signal<boolean>(false);

  /**
   * Start page transition loading
   */
  startPageLoading(): void {
    this.isPageLoading.set(true);
  }

  /**
   * Complete page transition loading
   */
  completePageLoading(): void {
    this.isPageLoading.set(false);
  }

  /**
   * Show global loading overlay
   */
  showLoading(): void {
    this.isLoading.set(true);
  }

  /**
   * Hide global loading overlay
   */
  hideLoading(): void {
    this.isLoading.set(false);
  }
}
