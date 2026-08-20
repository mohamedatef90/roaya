import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'bg-white border-neutral-200 text-neutral-900 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-50',
        success: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100',
        error: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100',
        warning: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100',
        info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type ToastVariants = VariantProps<typeof toastVariants>;

export interface ToastData {
  id: string;
  variant: ToastVariants['variant'];
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

@Component({
  selector: 'ui-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="toastClass"
      role="alert"
      [attr.aria-live]="variant === 'error' || variant === 'warning' ? 'assertive' : 'polite'"
    >
      <!-- Icon -->
      <div class="flex-shrink-0">
        <ng-container [ngSwitch]="variant">
          <svg *ngSwitchCase="'success'" class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <svg *ngSwitchCase="'error'" class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="m15 9-6 6"/>
            <path d="m9 9 6 6"/>
          </svg>
          <svg *ngSwitchCase="'warning'" class="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>
          <svg *ngSwitchCase="'info'" class="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
          <svg *ngSwitchDefault class="h-5 w-5 text-neutral-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <path d="M12 8v4"/>
            <path d="M12 16h.01"/>
          </svg>
        </ng-container>
      </div>

      <!-- Content -->
      <div class="flex-1 ml-3">
        <p *ngIf="title" class="text-sm font-semibold">{{ title }}</p>
        <p class="text-sm" [class.mt-1]="title">{{ message }}</p>
      </div>

      <!-- Action button -->
      <button
        *ngIf="action"
        type="button"
        class="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        (click)="onActionClick()"
      >
        {{ action.label }}
      </button>

      <!-- Close button -->
      <button
        *ngIf="dismissible"
        type="button"
        class="inline-flex items-center justify-center rounded-md p-1 transition-opacity opacity-60 hover:opacity-100"
        (click)="onDismiss()"
        aria-label="Close"
      >
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"/>
          <path d="m6 6 12 12"/>
        </svg>
      </button>

      <!-- Progress bar -->
      <div
        *ngIf="showProgress && duration"
        class="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all"
        [style.width.%]="progress()"
      ></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() variant: ToastVariants['variant'] = 'default';
  @Input() title?: string;
  @Input() message = '';
  @Input() duration = 5000;
  @Input() dismissible = true;
  @Input() showProgress = true;
  @Input() action?: { label: string; onClick: () => void };
  @Input() customClass = '';

  @Output() dismissed = new EventEmitter<void>();

  progress = signal(100);
  private timeoutId?: ReturnType<typeof setTimeout>;
  private intervalId?: ReturnType<typeof setInterval>;

  get toastClass(): string {
    return toastVariants({ variant: this.variant }) + ' ' + this.customClass;
  }

  ngOnInit(): void {
    if (this.duration > 0) {
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private startTimer(): void {
    const startTime = Date.now();
    const endTime = startTime + this.duration;

    this.intervalId = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      this.progress.set(Math.max(0, (remaining / this.duration) * 100));

      if (remaining <= 0) {
        this.onDismiss();
      }
    }, 50);
  }

  private clearTimers(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  onActionClick(): void {
    if (this.action?.onClick) {
      this.action.onClick();
    }
  }

  onDismiss(): void {
    this.clearTimers();
    this.dismissed.emit();
  }
}

// Toast Container Component
@Component({
  selector: 'ui-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="containerClass">
      <ui-toast
        *ngFor="let toast of toasts(); trackBy: trackById"
        [variant]="toast.variant"
        [title]="toast.title"
        [message]="toast.message"
        [duration]="toast.duration || 5000"
        [action]="toast.action"
        (dismissed)="removeToast(toast.id)"
        class="animate-slide-in"
      ></ui-toast>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
  `]
})
export class ToastContainerComponent {
  @Input() position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' = 'bottom-right';

  toasts = signal<ToastData[]>([]);

  get containerClass(): string {
    const base = 'fixed z-[100] flex flex-col gap-2 p-4 max-h-screen overflow-hidden pointer-events-none';
    const positions: Record<string, string> = {
      'top-right': 'top-0 right-0',
      'top-left': 'top-0 left-0',
      'bottom-right': 'bottom-0 right-0',
      'bottom-left': 'bottom-0 left-0',
      'top-center': 'top-0 left-1/2 -translate-x-1/2',
      'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
    };
    return `${base} ${positions[this.position] || positions['bottom-right']} w-full max-w-sm`;
  }

  addToast(toast: Omit<ToastData, 'id'>): string {
    const id = Math.random().toString(36).substring(2, 9);
    this.toasts.update(current => [...current, { ...toast, id }]);
    return id;
  }

  removeToast(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  clearAll(): void {
    this.toasts.set([]);
  }

  trackById(index: number, toast: ToastData): string {
    return toast.id;
  }
}
