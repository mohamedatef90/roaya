import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-primary text-white hover:shadow-lg hover:scale-105',
        secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 hover:shadow-md',
        outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 dark:border-secondary-400 dark:text-secondary-400 dark:hover:bg-primary-900',
        ghost: 'hover:bg-surface hover:text-primary-600 dark:hover:text-secondary-400',
        link: 'text-primary-500 underline-offset-4 hover:underline',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [class]="buttonClass"
      [attr.aria-label]="ariaLabel"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariants['variant'] = 'primary';
  @Input() size: ButtonVariants['size'] = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() ariaLabel?: string;
  @Input() customClass = '';

  get buttonClass(): string {
    return buttonVariants({ variant: this.variant, size: this.size }) + ' ' + this.customClass;
  }
}
