import { Component, OnInit, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheckCircle2,
  lucideMail,
  lucideArrowLeft,
  lucideFileText,
  lucideBookOpen
} from '@ng-icons/lucide';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { SEOService } from '../../../core/services/seo.service';

export type ComingSoonType = 'whitepapers' | 'documentation';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({
      lucideCheckCircle2,
      lucideMail,
      lucideArrowLeft,
      lucideFileText,
      lucideBookOpen
    })
  ],
  templateUrl: './coming-soon.component.html',
  styleUrl: './coming-soon.component.scss'
})
export class ComingSoonComponent implements OnInit {
  /** Type of coming soon page - determines translations and icon */
  type = input<ComingSoonType>('whitepapers');

  private readonly analytics = inject(AnalyticsService);
  private readonly seo = inject(SEOService);
  private readonly translate = inject(TranslateService);

  // State signals
  email = signal('');
  subscribed = signal(false);
  submitting = signal(false);
  error = signal(false);

  ngOnInit(): void {
    const pageType = this.type();

    // Track page view
    this.analytics.trackPageView(`/resources/${pageType}`);

    // Set SEO meta tags with translated values
    const titleKey = `resources.${pageType}.comingSoon.meta.title`;
    const descriptionKey = `resources.${pageType}.comingSoon.meta.description`;

    this.seo.updateSEO({
      title: this.translate.instant(titleKey),
      description: this.translate.instant(descriptionKey)
    });
  }

  get translationPrefix(): string {
    return `resources.${this.type()}.comingSoon`;
  }

  get iconName(): string {
    return this.type() === 'whitepapers' ? 'lucideFileText' : 'lucideBookOpen';
  }

  /**
   * Handle email subscription
   */
  async handleSubscribe(): Promise<void> {
    const emailValue = this.email().trim();
    if (!emailValue || this.submitting()) return;

    this.submitting.set(true);
    this.error.set(false);

    try {
      // Track subscription attempt
      this.analytics.trackEvent('coming_soon_subscribe', {
        type: this.type(),
        email: emailValue
      });

      // TODO: Connect to backend API for email subscription
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.subscribed.set(true);

      // Track success
      this.analytics.trackEvent('coming_soon_subscribe_success', {
        type: this.type()
      });

    } catch (err) {
      this.error.set(true);

      // Track error
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.analytics.trackEvent('coming_soon_subscribe_error', {
        type: this.type(),
        error: errorMessage
      });

      console.error('Subscription error:', err);
    } finally {
      this.submitting.set(false);
    }
  }
}
