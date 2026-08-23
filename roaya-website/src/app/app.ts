import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { VisitorTrackingService } from './core/services/visitor-tracking.service';
import { SEOService } from './core/services/seo.service';
import { StructuredDataService } from './core/services/structured-data.service';

/**
 * Root Application Component
 * Roaya IT - Angular 21 Standalone App
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastModule],
  template: `
    <router-outlet />
    <p-toast position="top-right" />
  `,
  styles: [`
    :host {
      display: block;
      overflow-x: hidden;
    }
  `]
})
export class App {
  private readonly tracking = inject(VisitorTrackingService);
  // Instantiated at the root so every route (server and browser) gets a
  // self-referencing canonical URL, not only pages that use SEOService.
  private readonly seo = inject(SEOService);
  // Instantiated at the root so the SSR-first JSON-LD graph is emitted for
  // every route with approved structured-data facts (TIFO-13).
  private readonly structuredData = inject(StructuredDataService);

  constructor() {
    this.tracking.init();
    this.tracking.enableClickTracking();
  }
}
