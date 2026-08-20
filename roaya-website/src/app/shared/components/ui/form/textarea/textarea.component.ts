import { Component, Input, forwardRef, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cva, type VariantProps } from 'class-variance-authority';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-lg border bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 focus-visible:ring-primary-500 dark:border-neutral-700 dark:focus-visible:ring-primary-400',
        error: 'border-red-500 focus-visible:ring-red-500 dark:border-red-400',
        success: 'border-green-500 focus-visible:ring-green-500 dark:border-green-400',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      variant: 'default',
      resize: 'vertical',
    },
  }
);

type TextareaVariants = VariantProps<typeof textareaVariants>;

@Component({
  selector: 'ui-textarea',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  template: `
    <textarea
      [id]="id"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [readonly]="readonly"
      [rows]="rows"
      [class]="textareaClass"
      [attr.aria-label]="ariaLabel"
      [attr.aria-describedby]="ariaDescribedBy"
      [attr.aria-invalid]="variant === 'error'"
      [attr.maxlength]="maxLength"
      [value]="value()"
      (input)="onInputChange($event)"
      (blur)="onTouched()"
    ></textarea>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() variant: TextareaVariants['variant'] = 'default';
  @Input() resize: TextareaVariants['resize'] = 'vertical';
  @Input() id?: string;
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() rows = 4;
  @Input() maxLength?: number;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedBy?: string;
  @Input() customClass = '';

  value = signal('');

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  get textareaClass(): string {
    return textareaVariants({ variant: this.variant, resize: this.resize }) + ' ' + this.customClass;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
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
