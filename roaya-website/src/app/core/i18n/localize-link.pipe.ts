import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { localizeRouterCommands } from './locale-routing';

/**
 * Locale-aware `routerLink` values: `[routerLink]="'/contact' | localizeLink"`
 * or `[routerLink]="['/resources/blog', post.slug] | localizeLink"`.
 *
 * On an Arabic page (`/ar/...`) the pipe prefixes absolute internal commands
 * with `/ar`, so links keep the reader in the Arabic tree — and, because SSR
 * renders the pipe too, crawlers see `/ar/...` hrefs on Arabic pages instead
 * of every Arabic link pointing into the English site (2026-09-01
 * AI-readiness audit). On English pages it is a no-op.
 *
 * The pipe is pure on purpose: the active language can only change through a
 * navigation to the mirrored URL (the URL is the source of truth — see
 * locale-routing.ts), which recreates the components under the other route
 * branch, so a stale cached transform cannot survive a locale switch.
 */
@Pipe({
  name: 'localizeLink',
  standalone: true
})
export class LocalizeLinkPipe implements PipeTransform {
  private readonly languageService = inject(LanguageService);

  transform(commands: string | readonly unknown[]): string | unknown[] {
    return localizeRouterCommands(commands, this.languageService.getCurrentLanguage());
  }
}
