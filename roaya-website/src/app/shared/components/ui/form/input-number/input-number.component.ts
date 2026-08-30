import { Component, Input, forwardRef, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cva, type VariantProps } from 'class-variance-authority';

const inputNumberVariants = cva(
  'flex w-full rounded-lg border bg-transparent text-sm transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 focus-within:ring-primary-500 dark:border-neutral-700 dark:focus-within:ring-primary-400',
        error: 'border-red-500 focus-within:ring-red-500 dark:border-red-400',
        success: 'border-green-500 focus-within:ring-green-500 dark:border-green-400',
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

type InputNumberVariants = VariantProps<typeof inputNumberVariants>;

@Component({
  selector: 'ui-input-number',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputNumberComponent),
      multi: true,
    },
  ],
  template: `
    <div [class]="wrapperClass" [class.opacity-50]="disabled" [class.cursor-not-allowed]="disabled">
      <!-- Decrement button -->
      <button
        *ngIf="showButtons"
        type="button"
        class="flex items-center justify-center px-3 text-content-muted hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-surface-hover transition-colors border-r border-edge-strong"
        (click)="decrement()"
        [disabled]="disabled || (min !== undefined && value() !== null && value()! <= min)"
        [attr.aria-label]="'Decrease value'"
      >
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/>
        </svg>
      </button>

      <!-- Input -->
      <input
        type="number"
        [id]="id"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [readonly]="readonly"
        [min]="min"
        [max]="max"
        [step]="step"
        class="flex-1 bg-transparent px-3 py-2 text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        [attr.aria-label]="ariaLabel"
        [attr.aria-describedby]="ariaDescribedBy"
        [attr.aria-invalid]="variant === 'error'"
        [value]="value()"
        (input)="onInputChange($event)"
        (blur)="onTouched()"
      />

      <!-- Increment button -->
      <button
        *ngIf="showButtons"
        type="button"
        class="flex items-center justify-center px-3 text-content-muted hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-surface-hover transition-colors border-l border-edge-strong"
        (click)="increment()"
        [disabled]="disabled || (max !== undefined && value() !== null && value()! >= max)"
        [attr.aria-label]="'Increase value'"
      >
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/>
          <path d="M12 5v14"/>
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
export class InputNumberComponent implements ControlValueAccessor {
  @Input() variant: InputNumberVariants['variant'] = 'default';
  @Input() size: InputNumberVariants['size'] = 'md';
  @Input() id?: string;
  @Input() placeholder = '0';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step = 1;
  @Input() showButtons = true;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  @Input() customClass = '';

  value = signal<number | null>(null);

  private onChange: (value: number | null) => void = () => {};
  onTouched: () => void = () => {};

  get wrapperClass(): string {
    return inputNumberVariants({ variant: this.variant, size: this.size }) + ' ' + this.customClass;
  }

  increment(): void {
    const currentValue = this.value() ?? 0;
    const newValue = currentValue + this.step;
    if (this.max === undefined || newValue <= this.max) {
      this.value.set(newValue);
      this.onChange(newValue);
    }
  }

  decrement(): void {
    const currentValue = this.value() ?? 0;
    const newValue = currentValue - this.step;
    if (this.min === undefined || newValue >= this.min) {
      this.value.set(newValue);
      this.onChange(newValue);
    }
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const numValue = target.value === '' ? null : parseFloat(target.value);

    if (numValue !== null) {
      let clampedValue = numValue;
      if (this.min !== undefined && numValue < this.min) clampedValue = this.min;
      if (this.max !== undefined && numValue > this.max) clampedValue = this.max;
      this.value.set(clampedValue);
      this.onChange(clampedValue);
    } else {
      this.value.set(null);
      this.onChange(null);
    }
  }

  writeValue(value: number | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
