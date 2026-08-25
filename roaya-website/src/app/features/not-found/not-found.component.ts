import { Component, inject, OnInit, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Not Found (404) Component
 * Rendered for unknown URLs. Sets the HTTP 404 status via RESPONSE_INIT
 * injection so SSR returns a real 404 to crawlers.
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <section class="min-h-[60vh] flex items-center justify-center px-6 py-24">
      <div class="text-center max-w-xl">
        <p class="text-7xl font-bold bg-gradient-to-r from-[#3D5A80] to-[#5DB7C2] bg-clip-text text-transparent">404</p>
        <h1 class="mt-6 text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          {{ 'notFound.title' | translate }}
        </h1>
        <p class="mt-4 text-neutral-600 dark:text-neutral-400">
          {{ 'notFound.description' | translate }}
        </p>
        <a routerLink="/"
           class="mt-8 inline-block rounded-lg bg-[#3D5A80] px-6 py-3 text-white hover:opacity-90 transition-opacity">
          {{ 'notFound.backHome' | translate }}
        </a>
      </div>
    </section>
  `
})
export class NotFoundComponent implements OnInit {
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  ngOnInit(): void {
    // Set real HTTP 404 status for SSR (ensures crawlers receive 404, not 200)
    if (this.responseInit) {
      this.responseInit.status = 404;
    }
  }
}
