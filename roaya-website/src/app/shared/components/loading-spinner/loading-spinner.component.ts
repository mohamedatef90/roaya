import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from '../../../core/services/loading.service';

/**
 * Global Loading Spinner Component
 * Displays a loading spinner with message
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    <div 
      *ngIf="loadingService.isLoading()" 
      class="loading-overlay"
      role="alert"
      aria-live="assertive"
      aria-busy="true"
    >
      <div class="loading-content">
        <p-progressSpinner
          styleClass="custom-spinner"
          strokeWidth="3"
          animationDuration="1s"
        ></p-progressSpinner>
        <p class="loading-message">{{ loadingService.loadingMessage() }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease-out;
    }

    .loading-content {
      background: var(--surface-card, #ffffff);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      min-width: 200px;
    }

    .loading-message {
      margin: 0;
      color: var(--text-color, #000);
      font-size: 1rem;
      font-weight: 500;
    }

    :host ::ng-deep .custom-spinner .p-progress-spinner-circle {
      stroke: var(--primary-color, #0066cc);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .loading-content {
        padding: 1.5rem;
        min-width: 150px;
      }

      .loading-message {
        font-size: 0.875rem;
      }
    }
  `],
})
export class LoadingSpinnerComponent {
  constructor(public loadingService: LoadingService) {}
}
