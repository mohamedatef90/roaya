import { Component, Input, forwardRef, signal, ChangeDetectionStrategy, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cva, type VariantProps } from 'class-variance-authority';

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: string;
}

const selectVariants = cva(
  'flex w-full items-center justify-between rounded-xl border-0 bg-neutral-100 px-3 py-2 text-sm transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-800 text-neutral-900 dark:text-white',
  {
    variants: {
      variant: {
        default: 'focus:ring-2 focus:ring-[#5DB7C2]/50 focus:bg-white dark:focus:bg-neutral-900',
        error: 'ring-2 ring-red-500/50 bg-red-50 dark:bg-red-900/20',
        success: 'ring-2 ring-green-500/50 bg-green-50 dark:bg-green-900/20',
      },
      size: {
        sm: 'h-8 text-xs',
        md: 'h-11 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

type SelectVariants = VariantProps<typeof selectVariants>;

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative" #selectContainer>
      <!-- Trigger -->
      <button
        type="button"
        [class]="selectClass"
        [disabled]="disabled"
        (click)="toggleDropdown()"
        (keydown)="onKeyDown($event)"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-haspopup]="true"
        [attr.aria-label]="ariaLabel"
        role="combobox"
      >
        <span [class.text-neutral-400]="!selectedOption()">
          {{ selectedOption()?.label || placeholder }}
        </span>
        <svg
          class="h-4 w-4 transition-transform"
          [class.rotate-180]="isOpen()"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      <!-- Dropdown -->
      <div
        *ngIf="isOpen()"
        class="absolute z-[9999] mt-2 w-full rounded-xl border border-neutral-200 bg-white py-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
        role="listbox"
        [attr.aria-label]="ariaLabel || 'Options'"
      >
        <div class="max-h-60 overflow-auto">
          <div
            *ngFor="let option of options; let i = index"
            class="relative flex cursor-pointer select-none items-center px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            [class.bg-primary-50]="option.value === value()"
            [class.dark:bg-primary-900/20]="option.value === value()"
            [class.text-primary-600]="option.value === value()"
            [class.dark:text-primary-400]="option.value === value()"
            [class.opacity-50]="option.disabled"
            [class.pointer-events-none]="option.disabled"
            [class.bg-neutral-100]="focusedIndex() === i"
            [class.dark:bg-neutral-800]="focusedIndex() === i"
            (click)="selectOption(option)"
            role="option"
            [attr.aria-selected]="option.value === value()"
            [attr.aria-disabled]="option.disabled"
          >
            <span class="flex-1">{{ option.label }}</span>
            <svg
              *ngIf="option.value === value()"
              class="h-4 w-4 text-primary-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <div
            *ngIf="options.length === 0"
            class="px-3 py-6 text-center text-sm text-neutral-500"
          >
            {{ emptyMessage }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SelectComponent implements ControlValueAccessor {
  @ViewChild('selectContainer') selectContainer!: ElementRef;

  @Input() variant: SelectVariants['variant'] = 'default';
  @Input() size: SelectVariants['size'] = 'md';
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Select an option';
  @Input() emptyMessage = 'No options available';
  @Input() disabled = false;
  @Input() ariaLabel?: string;
  @Input() customClass = '';

  value = signal<any>(null);
  isOpen = signal(false);
  focusedIndex = signal(-1);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  get selectClass(): string {
    return selectVariants({ variant: this.variant, size: this.size }) + ' ' + this.customClass;
  }

  selectedOption(): SelectOption | undefined {
    return this.options.find(opt => opt.value === this.value());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.selectContainer && !this.selectContainer.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen.update(v => !v);
      if (this.isOpen()) {
        const selectedIdx = this.options.findIndex(opt => opt.value === this.value());
        this.focusedIndex.set(selectedIdx >= 0 ? selectedIdx : 0);
      }
    }
  }

  selectOption(option: SelectOption): void {
    if (!option.disabled) {
      this.value.set(option.value);
      this.onChange(option.value);
      this.isOpen.set(false);
      this.onTouched();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen()) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        this.toggleDropdown();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex.update(i => Math.min(i + 1, this.options.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex.update(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        const option = this.options[this.focusedIndex()];
        if (option && !option.disabled) {
          this.selectOption(option);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.isOpen.set(false);
        break;
    }
  }

  writeValue(value: any): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
