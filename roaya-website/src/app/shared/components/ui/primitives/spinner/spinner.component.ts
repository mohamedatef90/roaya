import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      variant: {
        default: 'text-primary-500',
        secondary: 'text-secondary-500',
        muted: 'text-neutral-400',
        white: 'text-white',
      },
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

type SpinnerVariants = VariantProps<typeof spinnerVariants>;

@Component({
  selector: 'ui-spinner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="spinnerClass"
      role="status"
      [attr.aria-label]="ariaLabel"
    >
      <span class="sr-only">{{ screenReaderText }}</span>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `]
})
export class SpinnerComponent {
  @Input() variant: SpinnerVariants['variant'] = 'default';
  @Input() size: SpinnerVariants['size'] = 'md';
  @Input() ariaLabel = 'Loading';
  @Input() screenReaderText = 'Loading...';
  @Input() customClass = '';

  get spinnerClass(): string {
    return spinnerVariants({ variant: this.variant, size: this.size }) + ' ' + this.customClass;
  }
}

// Spinner with text
@Component({
  selector: 'ui-spinner-with-text',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-2">
      <ui-spinner [variant]="variant" [size]="size"></ui-spinner>
      <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ text }}</span>
    </div>
  `,
})
export class SpinnerWithTextComponent {
  @Input() variant: SpinnerVariants['variant'] = 'default';
  @Input() size: SpinnerVariants['size'] = 'md';
  @Input() text = 'Loading...';
}

// Full page overlay spinner
@Component({
  selector: 'ui-loading-overlay',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngIf="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      [attr.aria-hidden]="!visible"
    >
      <div class="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-xl dark:bg-neutral-900">
        <ui-spinner size="xl" [variant]="variant"></ui-spinner>
        <span *ngIf="text" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {{ text }}
        </span>
      </div>
    </div>
  `,
})
export class LoadingOverlayComponent {
  @Input() visible = false;
  @Input() text?: string;
  @Input() variant: SpinnerVariants['variant'] = 'default';
}
