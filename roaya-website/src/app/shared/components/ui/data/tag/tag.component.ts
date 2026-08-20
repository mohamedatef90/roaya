import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const tagVariants = cva(
  'inline-flex items-center gap-1 rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
        primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
        secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
        success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        outline: 'border border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
      rounded: {
        default: 'rounded-md',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'default',
    },
  }
);

type TagVariants = VariantProps<typeof tagVariants>;

@Component({
  selector: 'ui-tag',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="tagClass">
      <!-- Icon slot -->
      <ng-container *ngIf="icon">
        <span class="flex-shrink-0" [innerHTML]="icon"></span>
      </ng-container>

      <!-- Dot indicator -->
      <span
        *ngIf="showDot"
        class="h-1.5 w-1.5 rounded-full"
        [class]="dotClass"
      ></span>

      <!-- Content -->
      <ng-content></ng-content>

      <!-- Removable button -->
      <button
        *ngIf="removable"
        type="button"
        class="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        (click)="onRemove($event)"
        [attr.aria-label]="'Remove tag'"
      >
        <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"/>
          <path d="m6 6 12 12"/>
        </svg>
      </button>
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
  `]
})
export class TagComponent {
  @Input() variant: TagVariants['variant'] = 'default';
  @Input() size: TagVariants['size'] = 'md';
  @Input() rounded: TagVariants['rounded'] = 'default';
  @Input() icon?: string;
  @Input() showDot = false;
  @Input() removable = false;
  @Input() customClass = '';

  @Output() removed = new EventEmitter<void>();

  get tagClass(): string {
    return tagVariants({ variant: this.variant, size: this.size, rounded: this.rounded }) + ' ' + this.customClass;
  }

  get dotClass(): string {
    const dotColors: Record<string, string> = {
      default: 'bg-neutral-500',
      primary: 'bg-primary-500',
      secondary: 'bg-secondary-500',
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
      info: 'bg-blue-500',
      outline: 'bg-neutral-500',
    };
    return dotColors[this.variant || 'default'];
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    this.removed.emit();
  }
}
