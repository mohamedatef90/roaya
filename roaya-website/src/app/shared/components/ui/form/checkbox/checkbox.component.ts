import { Component, Input, forwardRef, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cva, type VariantProps } from 'class-variance-authority';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded border ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 text-primary-500 focus-visible:ring-primary-500 checked:bg-primary-500 checked:border-primary-500 dark:border-neutral-600',
        success: 'border-green-500 text-green-500 focus-visible:ring-green-500 checked:bg-green-500 checked:border-green-500',
        error: 'border-red-500 text-red-500 focus-visible:ring-red-500',
      },
      size: {
        sm: 'h-3.5 w-3.5',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

type CheckboxVariants = VariantProps<typeof checkboxVariants>;

@Component({
  selector: 'ui-checkbox',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <label class="flex items-center gap-2 cursor-pointer" [class.cursor-not-allowed]="disabled" [class.opacity-50]="disabled">
      <div class="relative">
        <input
          type="checkbox"
          [id]="id"
          [checked]="checked()"
          [disabled]="disabled"
          [class]="checkboxClass"
          [attr.aria-label]="ariaLabel"
          [attr.aria-describedby]="ariaDescribedBy"
          (change)="onCheckboxChange($event)"
          (blur)="onTouched()"
          class="appearance-none"
        />
        <!-- Custom checkmark -->
        <svg
          *ngIf="checked()"
          class="absolute inset-0 pointer-events-none text-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <span *ngIf="label" class="text-sm font-medium text-content-secondary select-none">
        {{ label }}
      </span>
      <ng-content></ng-content>
    </label>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
    input[type="checkbox"] {
      -webkit-appearance: none;
      appearance: none;
    }
    input[type="checkbox"]:checked {
      background-color: currentColor;
    }
  `]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() variant: CheckboxVariants['variant'] = 'default';
  @Input() size: CheckboxVariants['size'] = 'md';
  @Input() id?: string;
  @Input() label?: string;
  @Input() disabled = false;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  @Input() customClass = '';

  checked = signal(false);

  private onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  get checkboxClass(): string {
    return checkboxVariants({ variant: this.variant, size: this.size }) + ' ' + this.customClass;
  }

  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
    this.onChange(target.checked);
  }

  writeValue(value: boolean): void {
    this.checked.set(value || false);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
