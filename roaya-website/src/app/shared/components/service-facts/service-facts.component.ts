import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  publishedFacts,
  serviceFactLabelKey,
  serviceFactsFor,
  type ServiceFactField
} from '../../../core/seo/service-facts';

/**
 * The published Service Facts for a route, as a definition list.
 *
 * Renders only facts marked `published` in `service-facts.ts`. A service whose
 * facts are all pending renders nothing at all — an empty table, or one full of
 * "to be confirmed", tells a buyer less than silence and invites exactly the
 * scepticism the audit is trying to remove.
 *
 * A `<dl>` rather than a `<table>`: these are name/value pairs, not a grid, and
 * the pairing survives being read linearly by a screen reader or scraped as
 * text by an assistant — which is the whole reason the section exists.
 */
@Component({
  selector: 'app-service-facts',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (facts().length > 0) {
      <section class="service-facts" [attr.aria-labelledby]="headingId">
        <h2 [id]="headingId" class="service-facts__title">
          {{ 'serviceFacts.title' | translate }}
        </h2>
        <dl class="service-facts__list">
          @for (entry of facts(); track entry.field) {
            <div class="service-facts__row">
              <dt class="service-facts__term">{{ labelKey(entry.field) | translate }}</dt>
              <dd class="service-facts__value">
                @if (entry.fact.valueKey) {
                  {{ entry.fact.valueKey | translate }}
                } @else {
                  {{ entry.fact.value }}
                }
              </dd>
            </div>
          }
        </dl>
        <p class="service-facts__reviewed">
          {{ 'serviceFacts.lastReviewed' | translate }}
          <time [attr.datetime]="reviewed()">{{ reviewed() }}</time>
        </p>
      </section>
    }
  `,
  styles: [`
    .service-facts {
      margin-block: 2.5rem;
      padding: 1.5rem;
      border: 1px solid var(--color-border);
      border-radius: 0.75rem;
    }
    .service-facts__title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    .service-facts__row {
      display: grid;
      grid-template-columns: minmax(10rem, 16rem) 1fr;
      gap: 0.75rem 1.5rem;
      padding-block: 0.6rem;
      border-top: 1px solid var(--color-border);
    }
    .service-facts__row:first-child { border-top: 0; }
    .service-facts__term { font-weight: 600; }
    .service-facts__value { margin: 0; }
    .service-facts__reviewed {
      margin-top: 1rem;
      font-size: 0.8rem;
      opacity: 0.75;
    }
    @media (max-width: 640px) {
      .service-facts__row { grid-template-columns: 1fr; gap: 0.15rem; }
    }
  `]
})
export class ServiceFactsComponent {
  /** Locale-independent route whose facts to show, e.g. '/services/aws'. */
  readonly path = input.required<string>();

  private readonly record = computed(() => serviceFactsFor(this.path()));

  readonly facts = computed(() => {
    const record = this.record();
    return record ? publishedFacts(record) : [];
  });

  readonly reviewed = computed(() => this.record()?.lastReviewed ?? '');

  readonly headingId = 'service-facts-title';

  labelKey(field: ServiceFactField): string {
    return serviceFactLabelKey(field);
  }
}
