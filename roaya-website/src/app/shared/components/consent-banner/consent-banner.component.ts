import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LocalizeLinkPipe } from '../../../core/i18n/localize-link.pipe';

/**
 * GDPR Consent Banner
 * Simple consent banner for analytics and session recording tracking.
 * Stores user consent preferences in localStorage.
 */
@Component({
  selector: 'app-consent-banner',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LocalizeLinkPipe],
  template: `
    @if (showBanner()) {
      <div class="fixed bottom-0 inset-x-0 z-50 p-3 bg-surface-elevated border-t border-edge-subtle shadow-2xl">
        <div class="container mx-auto max-w-7xl">
          <div class="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-5">
            <!-- Icon & Message -->
            <div class="flex items-start sm:items-center gap-2.5 flex-1">
              <svg class="h-5 w-5 text-primary-600 dark:text-secondary-400 flex-shrink-0 mt-0.5 sm:mt-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                <p class="text-sm text-content-secondary leading-snug">
                  We use analytics cookies to improve your experience. Session recording stays off unless you enable it.
                  <a [routerLink]="['/privacy'] | localizeLink" class="text-primary-600 dark:text-secondary-400 underline hover:no-underline">Learn more</a>
                </p>
                <!-- Recording Checkbox -->
                <label class="flex items-center gap-2 shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="allowRecording"
                    class="w-4 h-4 rounded border-edge-strong text-primary-600 focus:ring-secondary-500"
                  />
                  <span class="text-sm text-content-secondary whitespace-nowrap">
                    Allow session recording
                  </span>
                </label>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 w-full lg:w-auto">
              <button
                (click)="decline()"
                class="flex-1 lg:flex-initial px-4 py-1.5 text-sm font-medium text-content-secondary bg-surface-secondary rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Decline
              </button>
              <button
                (click)="accept()"
                class="flex-1 lg:flex-initial px-5 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-primary-700 to-secondary-500 rounded-lg hover:shadow-lg transition-all"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class ConsentBannerComponent implements OnInit {
  showBanner = signal(false);
  allowRecording = false;

  private readonly ANALYTICS_CONSENT_KEY = 'ra_analytics_consent';
  private readonly RECORDING_CONSENT_KEY = 'ra_recording_consent';

  ngOnInit(): void {
    this.checkConsent();
  }

  private checkConsent(): void {
    try {
      const analyticsConsent = localStorage.getItem(this.ANALYTICS_CONSENT_KEY);
      if (!analyticsConsent) {
        this.showBanner.set(true);
      }
    } catch {
      // localStorage unavailable - don't show banner
    }
  }

  accept(): void {
    try {
      localStorage.setItem(this.ANALYTICS_CONSENT_KEY, 'accepted');
      localStorage.setItem(this.RECORDING_CONSENT_KEY, this.allowRecording ? 'accepted' : 'declined');
      this.showBanner.set(false);
    } catch {
      // Silently fail if localStorage unavailable
    }
  }

  decline(): void {
    try {
      localStorage.setItem(this.ANALYTICS_CONSENT_KEY, 'declined');
      localStorage.setItem(this.RECORDING_CONSENT_KEY, 'declined');
      this.showBanner.set(false);
    } catch {
      // Silently fail if localStorage unavailable
    }
  }
}
