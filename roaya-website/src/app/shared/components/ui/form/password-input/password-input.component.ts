import { Component, Input, forwardRef, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cva, type VariantProps } from 'class-variance-authority';

const passwordInputVariants = cva(
  'flex w-full rounded-xl border-0 bg-neutral-100 text-sm transition-all placeholder:text-neutral-400 focus-within:outline-none focus-within:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-800 dark:focus-within:bg-neutral-900',
  {
    variants: {
      variant: {
        default: 'focus-within:ring-2 focus-within:ring-[#5DB7C2]/50 dark:focus-within:ring-[#5DB7C2]/40',
        error: 'ring-2 ring-red-500/50 bg-red-50 dark:bg-red-900/20',
        success: 'ring-2 ring-green-500/50 bg-green-50 dark:bg-green-900/20',
      },
      size: {
        sm: 'h-8',
        md: 'h-10',
        lg: 'h-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

type PasswordInputVariants = VariantProps<typeof passwordInputVariants>;

@Component({
  selector: 'ui-password-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true,
    },
  ],
  template: `
    <div [class]="wrapperClass">
      <input
        [type]="showPassword() ? 'text' : 'password'"
        [id]="id"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [readonly]="readonly"
        class="flex-1 bg-transparent px-3 py-2 outline-none"
        [attr.aria-label]="ariaLabel"
        [attr.aria-describedby]="ariaDescribedBy"
        [attr.aria-invalid]="variant === 'error'"
        [attr.autocomplete]="autocomplete"
        [value]="value()"
        (input)="onInputChange($event)"
        (blur)="onTouched()"
      />
      <button
        type="button"
        class="flex items-center justify-center px-3 text-content-muted hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        (click)="togglePasswordVisibility()"
        [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
        tabindex="-1"
      >
        <!-- Eye icon (show password) -->
        <svg *ngIf="!showPassword()" class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <!-- Eye off icon (hide password) -->
        <svg *ngIf="showPassword()" class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
          <line x1="2" x2="22" y1="2" y2="22"/>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PasswordInputComponent implements ControlValueAccessor {
  @Input() variant: PasswordInputVariants['variant'] = 'default';
  @Input() size: PasswordInputVariants['size'] = 'md';
  @Input() id?: string;
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  @Input() autocomplete = 'current-password';
  @Input() customClass = '';

  value = signal('');
  showPassword = signal(false);

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  get wrapperClass(): string {
    return passwordInputVariants({ variant: this.variant, size: this.size }) + ' ' + this.customClass;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
