import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { TranslateLoader } from '@ngx-translate/core';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { ServerTranslationLoader } from './core/i18n/server-translation.loader';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // On the server, load translations synchronously from bundled JSON
    // (HTTP relative-URL loading and IndexedDB are browser-only).
    { provide: TranslateLoader, useClass: ServerTranslationLoader },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
