import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Idle Timeout Service
 * Monitors user activity and auto-logs out after inactivity period.
 *
 * Security: Prevents session hijacking from abandoned sessions.
 * NIST 800-63B compliant session timeout.
 */
@Injectable({
  providedIn: 'root',
})
export class IdleTimeoutService {
  // Configuration - 5 minutes idle timeout
  private readonly IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  private readonly WARNING_THRESHOLD_MS = 4.5 * 60 * 1000; // 4:30 - show warning 30 seconds before logout

  // Timers
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private warningTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  private lastActivity = Date.now();
  private initialized = false;

  // Injected services
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Signals for UI
  public showWarning = signal(false);
  public secondsRemaining = signal(30);

  // Activity events to track
  private readonly ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

  constructor() {
    // Cleanup on service destroy
    this.destroyRef.onDestroy(() => {
      this.cleanup();
    });
  }

  /**
   * Initialize idle monitoring for authenticated users
   * Call this when user logs in or app initializes with active session
   */
  initialize(): void {
    if (this.initialized) return;
    if (!this.authService.isAuthenticated()) return;

    this.initialized = true;
    this.lastActivity = Date.now();

    // Track user activity
    this.ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, this.handleActivity, { passive: true });
    });

    // Start the idle timer
    this.resetTimer();
  }

  /**
   * Stop idle monitoring
   * Call this when user logs out
   */
  stop(): void {
    this.cleanup();
    this.initialized = false;
  }

  /**
   * Handle user activity - bound method for event listener
   */
  private handleActivity = (): void => {
    // Debounce activity updates (max once per second)
    const now = Date.now();
    if (now - this.lastActivity < 1000) return;

    this.lastActivity = now;

    // If warning is showing, hide it and reset
    if (this.showWarning()) {
      this.showWarning.set(false);
      this.stopCountdown();
    }

    this.resetTimer();
  };

  /**
   * Reset the idle timer
   */
  private resetTimer(): void {
    // Clear existing timers
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }

    // Set warning timer (30 seconds before logout)
    this.warningTimer = setTimeout(() => {
      this.showWarningDialog();
    }, this.WARNING_THRESHOLD_MS);

    // Set idle logout timer
    this.idleTimer = setTimeout(() => {
      this.performLogout('Session expired due to inactivity');
    }, this.IDLE_TIMEOUT_MS);
  }

  /**
   * Show warning dialog with countdown
   */
  private showWarningDialog(): void {
    this.showWarning.set(true);
    this.secondsRemaining.set(30);
    this.startCountdown();
  }

  /**
   * Start countdown timer
   */
  private startCountdown(): void {
    this.stopCountdown();

    this.countdownInterval = setInterval(() => {
      const remaining = this.secondsRemaining() - 1;
      this.secondsRemaining.set(remaining);

      if (remaining <= 0) {
        this.stopCountdown();
      }
    }, 1000);
  }

  /**
   * Stop countdown timer
   */
  private stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  /**
   * User chose to extend session
   */
  extendSession(): void {
    this.showWarning.set(false);
    this.stopCountdown();
    this.lastActivity = Date.now();
    this.resetTimer();
  }

  /**
   * Perform logout due to inactivity
   */
  private performLogout(reason: string): void {
    this.cleanup();

    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/admin/login'], {
          queryParams: { reason: 'session_timeout' }
        });
      },
      error: () => {
        // Navigate anyway on error
        this.router.navigate(['/admin/login'], {
          queryParams: { reason: 'session_timeout' }
        });
      }
    });
  }

  /**
   * Clean up all timers and event listeners
   */
  private cleanup(): void {
    // Remove event listeners
    this.ACTIVITY_EVENTS.forEach(event => {
      document.removeEventListener(event, this.handleActivity);
    });

    // Clear all timers
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    this.stopCountdown();

    // Reset state
    this.showWarning.set(false);
    this.secondsRemaining.set(30);
  }

  /**
   * Get remaining idle time in seconds (for debugging)
   */
  getRemainingIdleTime(): number {
    const elapsed = Date.now() - this.lastActivity;
    return Math.max(0, Math.round((this.IDLE_TIMEOUT_MS - elapsed) / 1000));
  }
}
