import {
  Component,
  Input,
  signal,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMail, lucideCheck, lucideAlertCircle, lucideLoader2 } from '@ng-icons/lucide';
import { AnalyticsService } from '../../../core/services/analytics.service';

/**
 * Newsletter Signup Component
 * Inline newsletter subscription form for blog pages
 */
@Component({
  selector: 'app-newsletter-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgIcon],
  providers: [
    provideIcons({ lucideMail, lucideCheck, lucideAlertCircle, lucideLoader2 })
  ],
  template: `
    <div
      class="newsletter-signup rounded-2xl p-6 md:p-8"
      [class]="variant === 'card' ? 'bg-gradient-to-br from-navy/5 to-teal/5 dark:from-navy/20 dark:to-teal/20 border border-neutral-200 dark:border-neutral-700' : ''"
    >
      <!-- Header -->
      <div class="flex items-start gap-4 mb-4">
        <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-navy to-teal flex items-center justify-center">
          <ng-icon name="lucideMail" size="24" class="text-white" aria-hidden="true"></ng-icon>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-black/90 dark:text-white">
            {{ 'blog.newsletter.title' | translate }}
          </h3>
          <p class="text-sm text-black/70 dark:text-neutral-400">
            {{ 'blog.newsletter.description' | translate }}
          </p>
        </div>
      </div>

      <!-- Success State -->
      @if (isSuccess()) {
        <div class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400" role="alert">
          <ng-icon name="lucideCheck" size="20" aria-hidden="true"></ng-icon>
          <span>{{ 'blog.newsletter.success' | translate }}</span>
        </div>
      }

      <!-- Error State -->
      @if (isError()) {
        <div class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 mb-4" role="alert">
          <ng-icon name="lucideAlertCircle" size="20" aria-hidden="true"></ng-icon>
          <span>{{ 'blog.newsletter.error' | translate }}</span>
        </div>
      }

      <!-- Form -->
      @if (!isSuccess()) {
        <form (ngSubmit)="onSubmit()" class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1 relative">
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              [placeholder]="'blog.newsletter.placeholder' | translate"
              class="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-navy dark:focus:ring-teal focus:border-transparent transition-all"
              [disabled]="isLoading()"
              required
              autocomplete="email"
            />
          </div>
          <button
            type="submit"
            class="px-6 py-3 bg-gradient-to-r from-navy to-teal text-white font-medium rounded-lg hover:shadow-lg hover:shadow-navy/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-navy dark:focus:ring-teal focus:ring-offset-2"
            [disabled]="isLoading() || !email"
          >
            @if (isLoading()) {
              <ng-icon name="lucideLoader2" size="20" class="animate-spin" aria-hidden="true"></ng-icon>
            }
            <span>{{ 'blog.newsletter.button' | translate }}</span>
          </button>
        </form>
      }

      <!-- Privacy Note -->
      <p class="mt-4 text-xs text-black/70 dark:text-neutral-500">
        {{ 'blog.newsletter.privacy' | translate }}
      </p>
    </div>
  `,
  styles: [`
    .newsletter-signup {
      container-type: inline-size;
    }

    @container (max-width: 400px) {
      form {
        flex-direction: column;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsletterSignupComponent {
  private readonly analytics = inject(AnalyticsService);

  @Input() variant: 'card' | 'inline' = 'card';
  @Input() source: 'blog' | 'footer' | 'popup' = 'blog';

  email = '';
  isLoading = signal(false);
  isSuccess = signal(false);
  isError = signal(false);

  async onSubmit(): Promise<void> {
    if (!this.email || !this.isValidEmail(this.email)) {
      this.isError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.isError.set(false);

    try {
      // Simulate API call - in production, this would call the actual API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Track successful subscription
      this.analytics.trackEvent('newsletter_signup', {
        source: this.source,
        email_domain: this.email.split('@')[1]
      });

      this.isSuccess.set(true);
      this.email = '';
    } catch {
      this.isError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
