import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-white text-neutral-900 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-50 dark:border-neutral-800',
        info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-100 dark:border-blue-800',
        success: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-100 dark:border-green-800',
        warning: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/20 dark:text-amber-100 dark:border-amber-800',
        destructive: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-100 dark:border-red-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type AlertVariants = VariantProps<typeof alertVariants>;

@Component({
  selector: 'ui-alert',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="alertClass"
      role="alert"
      [attr.aria-live]="variant === 'destructive' || variant === 'warning' ? 'assertive' : 'polite'"
    >
      <!-- Icon slot -->
      <div *ngIf="showIcon" class="flex-shrink-0">
        <ng-container [ngSwitch]="variant">
          <!-- Info icon -->
          <svg *ngSwitchCase="'info'" class="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
          <!-- Success icon -->
          <svg *ngSwitchCase="'success'" class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <!-- Warning icon -->
          <svg *ngSwitchCase="'warning'" class="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>
          <!-- Error/Destructive icon -->
          <svg *ngSwitchCase="'destructive'" class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="m15 9-6 6"/>
            <path d="m9 9 6 6"/>
          </svg>
          <!-- Default icon -->
          <svg *ngSwitchDefault class="h-5 w-5 text-neutral-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
        </ng-container>
      </div>

      <!-- Content -->
      <div class="flex-1" [class.ml-3]="showIcon">
        <ng-content></ng-content>
      </div>

      <!-- Close button -->
      <button
        *ngIf="dismissible"
        type="button"
        class="ml-auto flex-shrink-0 rounded-lg p-1.5 inline-flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        (click)="onDismiss()"
        aria-label="Dismiss"
      >
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"/>
          <path d="m6 6 12 12"/>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    div[role="alert"] {
      display: flex;
      align-items: flex-start;
    }
  `]
})
export class AlertComponent {
  @Input() variant: AlertVariants['variant'] = 'default';
  @Input() showIcon = true;
  @Input() dismissible = false;
  @Input() customClass = '';

  @Output() dismissed = new EventEmitter<void>();

  get alertClass(): string {
    return alertVariants({ variant: this.variant }) + ' ' + this.customClass;
  }

  onDismiss(): void {
    this.dismissed.emit();
  }
}

@Component({
  selector: 'ui-alert-title',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h5 class="mb-1 font-medium leading-none tracking-tight">
      <ng-content></ng-content>
    </h5>
  `,
})
export class AlertTitleComponent {}

@Component({
  selector: 'ui-alert-description',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text-sm [&_p]:leading-relaxed">
      <ng-content></ng-content>
    </div>
  `,
})
export class AlertDescriptionComponent {}
