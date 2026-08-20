import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { VisitorTrackingService } from './core/services/visitor-tracking.service';

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

  constructor() {
    this.tracking.init();
    this.tracking.enableClickTracking();
  }
}
