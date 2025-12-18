import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

/**
 * Root Application Component
 * Roaya IT - Angular 21 Standalone App
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent],
  template: `
    <app-main-layout />
  `,
  styles: [`
    :host {
      display: block;
      overflow-x: hidden;
    }
  `]
})
export class App {}
