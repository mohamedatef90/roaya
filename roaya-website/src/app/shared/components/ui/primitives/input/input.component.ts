import { Component, Input, forwardRef, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'flex w-full rounded-xl border-0 bg-neutral-100 px-3 py-2 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus:outline-none focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-800 dark:focus:bg-neutral-900 dark:text-white',
  {
    variants: {
      variant: {
        default: 'focus:ring-2 focus:ring-[#5DB7C2]/50 dark:focus:ring-[#5DB7C2]/40',
        error: 'ring-2 ring-red-500/50 bg-red-50 dark:bg-red-900/20',
        success: 'ring-2 ring-green-500/50 bg-green-50 dark:bg-green-900/20',
      },
      size: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

type InputVariants = VariantProps<typeof inputVariants>;

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <input
      [type]="type"
      [id]="id"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [readonly]="readonly"
      [class]="inputClass"
      [attr.aria-label]="ariaLabel"
      [attr.aria-describedby]="ariaDescribedBy"
      [attr.aria-invalid]="variant === 'error'"
      [attr.autocomplete]="autocomplete"
      [value]="value()"
      (input)="onInputChange($event)"
      (blur)="onTouched()"
    />
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() variant: InputVariants['variant'] = 'default';
  @Input() size: InputVariants['size'] = 'md';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' = 'text';
  @Input() id?: string;
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  @Input() autocomplete?: string;
  @Input() customClass = '';

  value = signal('');

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  get inputClass(): string {
    return inputVariants({ variant: this.variant, size: this.size }) + ' ' + this.customClass;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  // ControlValueAccessor implementation
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
