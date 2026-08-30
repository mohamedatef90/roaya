import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const confirmDialogVariants = cva(
  'fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg rounded-xl dark:bg-neutral-900 dark:border-neutral-800',
  {
    variants: {
      variant: {
        default: '',
        destructive: '',
        warning: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type ConfirmDialogVariants = VariantProps<typeof confirmDialogVariants>;

@Component({
  selector: 'ui-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="open" class="confirm-dialog-root">
      <!-- Overlay -->
      <div
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
        (click)="onOverlayClick()"
        aria-hidden="true"
      ></div>

      <!-- Content -->
      <div
        [class]="dialogClass"
        role="alertdialog"
        aria-modal="true"
        [attr.aria-labelledby]="'confirm-dialog-title'"
        [attr.aria-describedby]="'confirm-dialog-description'"
      >
        <!-- Icon -->
        <div class="flex justify-center mb-2">
          <div [class]="iconWrapperClass">
            <ng-container [ngSwitch]="variant">
              <!-- Destructive icon -->
              <svg *ngSwitchCase="'destructive'" class="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="m15 9-6 6"/>
                <path d="m9 9 6 6"/>
              </svg>
              <!-- Warning icon -->
              <svg *ngSwitchCase="'warning'" class="h-6 w-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
              </svg>
              <!-- Default (question) icon -->
              <svg *ngSwitchDefault class="h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <path d="M12 17h.01"/>
              </svg>
            </ng-container>
          </div>
        </div>

        <!-- Title -->
        <h2
          id="confirm-dialog-title"
          class="text-lg font-semibold text-center"
        >
          {{ title }}
        </h2>

        <!-- Message -->
        <p
          id="confirm-dialog-description"
          class="text-sm text-content-muted text-center"
        >
          {{ message }}
        </p>

        <!-- Actions -->
        <div class="flex flex-col-reverse sm:flex-row sm:justify-center gap-2 mt-4">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors border border-edge-strong bg-surface-elevated text-content-secondary hover:bg-surface-hover"
            (click)="onCancel()"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            [class]="confirmButtonClass"
            (click)="onConfirm()"
            [disabled]="loading"
          >
            <svg *ngIf="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    .animate-fade-in {
      animation: fadeIn 0.15s ease-out;
    }
    .confirm-dialog-root > div:last-child {
      animation: scaleIn 0.15s ease-out;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() variant: ConfirmDialogVariants['variant'] = 'default';
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() loading = false;
  @Input() closeOnOverlayClick = false;
  @Input() closeOnEscape = true;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  get dialogClass(): string {
    return confirmDialogVariants({ variant: this.variant });
  }

  get iconWrapperClass(): string {
    const baseClass = 'flex h-12 w-12 items-center justify-center rounded-full';
    switch (this.variant) {
      case 'destructive':
        return `${baseClass} bg-red-100 dark:bg-red-900/20`;
      case 'warning':
        return `${baseClass} bg-amber-100 dark:bg-amber-900/20`;
      default:
        return `${baseClass} bg-primary-100 dark:bg-primary-900/20`;
    }
  }

  get confirmButtonClass(): string {
    const baseClass = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    switch (this.variant) {
      case 'destructive':
        return `${baseClass} bg-red-500 text-white hover:bg-red-600`;
      case 'warning':
        return `${baseClass} bg-amber-500 text-white hover:bg-amber-600`;
      default:
        return `${baseClass} bg-primary-500 text-white hover:bg-primary-600`;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.open && this.closeOnEscape) {
      this.onCancel();
    }
  }

  onOverlayClick(): void {
    if (this.closeOnOverlayClick) {
      this.onCancel();
    }
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.open = false;
    this.openChange.emit(false);
    this.cancelled.emit();
  }
}
