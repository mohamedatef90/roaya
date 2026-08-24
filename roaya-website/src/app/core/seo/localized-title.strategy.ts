import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { ROUTE_METADATA } from './route-metadata';
import { splitLocale } from '../i18n/locale-routing';

/**
 * Keeps the router out of the title for any route the metadata registry owns.
 *
 * Two things were writing `document.title`: Angular's default TitleStrategy
 * (from the static English `title:` on each route in app.routes.ts) and
 * SEOService (from the bilingual ROUTE_METADATA registry). Which one landed
 * last was an accident of subscriber ordering. Adding the locale resolver
 * changed that ordering, and the static English title started winning — so
 * /ar/about, whose body and meta description were correct Arabic, was served
 * with an English `<title>`.
 *
 * This strategy resolves the ambiguity by ownership rather than by timing:
 * if the registry has an entry for the route, SEOService owns the title and
 * this writes nothing. Otherwise (the 404 page, admin screens, any route with
 * no registry entry) the route's own static title is applied as before, so
 * nothing loses a title it used to have.
 */
@Injectable()
export class LocalizedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const { path } = splitLocale(snapshot.url);
    if (ROUTE_METADATA[path]) {
      return;
    }

    const routeTitle = this.buildTitle(snapshot);
    if (routeTitle !== undefined) {
      this.title.setTitle(routeTitle);
    }
  }
}
