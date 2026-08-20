import { Component, Input, forwardRef, signal, ChangeDetectionStrategy, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cva, type VariantProps } from 'class-variance-authority';
import { BadgeComponent } from '../../primitives/badge/badge.component';

export interface MultiSelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

const multiSelectVariants = cva(
  'flex w-full min-h-[44px] items-center justify-between rounded-xl border-0 bg-neutral-100 px-3 py-2 text-sm transition-all focus:outline-none dark:bg-neutral-800 text-neutral-900 dark:text-white',
  {
    variants: {
      variant: {
        default: 'focus:ring-2 focus:ring-[#5DB7C2]/50 focus:bg-white dark:focus:bg-neutral-900',
        error: 'ring-2 ring-red-500/50 bg-red-50 dark:bg-red-900/20',
        success: 'ring-2 ring-green-500/50 bg-green-50 dark:bg-green-900/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type MultiSelectVariants = VariantProps<typeof multiSelectVariants>;

@Component({
  selector: 'ui-multi-select',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
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
        <div class="flex flex-wrap gap-1 flex-1">
          <ng-container *ngIf="selectedOptions().length > 0; else placeholderTemplate">
            <ng-container *ngIf="selectedOptions().length <= maxDisplayedItems; else countTemplate">
              <ui-badge
                *ngFor="let option of selectedOptions()"
                variant="secondary"
                size="sm"
                class="inline-flex items-center gap-1"
              >
                {{ option.label }}
                <button
                  type="button"
                  class="ml-1 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600"
                  (click)="removeOption($event, option)"
                  [attr.aria-label]="'Remove ' + option.label"
                >
                  <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"/>
                    <path d="m6 6 12 12"/>
                  </svg>
                </button>
              </ui-badge>
            </ng-container>
            <ng-template #countTemplate>
              <ui-badge variant="secondary" size="sm">
                {{ selectedOptions().length }} selected
              </ui-badge>
            </ng-template>
          </ng-container>
          <ng-template #placeholderTemplate>
            <span class="text-neutral-400">{{ placeholder }}</span>
          </ng-template>
        </div>
        <svg
          class="h-4 w-4 flex-shrink-0 transition-transform"
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
        aria-multiselectable="true"
        [attr.aria-label]="ariaLabel || 'Options'"
      >
        <!-- Search filter -->
        <div *ngIf="filterable" class="px-2 py-2 border-b border-neutral-200 dark:border-neutral-700">
          <input
            type="text"
            class="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800"
            placeholder="Search..."
            [value]="filterText()"
            (input)="onFilterInput($event)"
          />
        </div>

        <!-- Select all -->
        <div
          *ngIf="showSelectAll && filteredOptions().length > 0"
          class="flex items-center px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer border-b border-neutral-200 dark:border-neutral-700"
          (click)="toggleSelectAll()"
        >
          <div class="flex h-4 w-4 items-center justify-center rounded border border-neutral-300 mr-2 dark:border-neutral-600"
               [class.bg-primary-500]="isAllSelected()"
               [class.border-primary-500]="isAllSelected()">
            <svg *ngIf="isAllSelected()" class="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg *ngIf="isSomeSelected() && !isAllSelected()" class="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <span class="font-medium">Select All</span>
        </div>

        <!-- Options -->
        <div class="max-h-60 overflow-auto">
          <div
            *ngFor="let option of filteredOptions(); let i = index"
            class="flex cursor-pointer select-none items-center px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            [class.opacity-50]="option.disabled"
            [class.pointer-events-none]="option.disabled"
            [class.bg-neutral-100]="focusedIndex() === i"
            [class.dark:bg-neutral-800]="focusedIndex() === i"
            (click)="toggleOption(option)"
            role="option"
            [attr.aria-selected]="isSelected(option)"
            [attr.aria-disabled]="option.disabled"
          >
            <div class="flex h-4 w-4 items-center justify-center rounded border border-neutral-300 mr-2 dark:border-neutral-600"
                 [class.bg-primary-500]="isSelected(option)"
                 [class.border-primary-500]="isSelected(option)">
              <svg *ngIf="isSelected(option)" class="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span class="flex-1">{{ option.label }}</span>
          </div>

          <div
            *ngIf="filteredOptions().length === 0"
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
export class MultiSelectComponent implements ControlValueAccessor {
  @ViewChild('selectContainer') selectContainer!: ElementRef;

  @Input() variant: MultiSelectVariants['variant'] = 'default';
  @Input() options: MultiSelectOption[] = [];
  @Input() placeholder = 'Select options';
  @Input() emptyMessage = 'No options available';
  @Input() disabled = false;
  @Input() filterable = true;
  @Input() showSelectAll = true;
  @Input() maxDisplayedItems = 3;
  @Input() ariaLabel?: string;
  @Input() customClass = '';

  value = signal<any[]>([]);
  isOpen = signal(false);
  focusedIndex = signal(-1);
  filterText = signal('');

  private onChange: (value: any[]) => void = () => {};
  private onTouched: () => void = () => {};

  get selectClass(): string {
    return multiSelectVariants({ variant: this.variant }) + ' ' + this.customClass;
  }

  selectedOptions(): MultiSelectOption[] {
    return this.options.filter(opt => this.value().includes(opt.value));
  }

  filteredOptions(): MultiSelectOption[] {
    const filter = this.filterText().toLowerCase();
    if (!filter) return this.options;
    return this.options.filter(opt => opt.label.toLowerCase().includes(filter));
  }

  isSelected(option: MultiSelectOption): boolean {
    return this.value().includes(option.value);
  }

  isAllSelected(): boolean {
    const filtered = this.filteredOptions().filter(opt => !opt.disabled);
    return filtered.length > 0 && filtered.every(opt => this.isSelected(opt));
  }

  isSomeSelected(): boolean {
    const filtered = this.filteredOptions().filter(opt => !opt.disabled);
    return filtered.some(opt => this.isSelected(opt));
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
        this.focusedIndex.set(0);
      }
    }
  }

  toggleOption(option: MultiSelectOption): void {
    if (option.disabled) return;

    const currentValue = [...this.value()];
    const index = currentValue.indexOf(option.value);

    if (index === -1) {
      currentValue.push(option.value);
    } else {
      currentValue.splice(index, 1);
    }

    this.value.set(currentValue);
    this.onChange(currentValue);
  }

  toggleSelectAll(): void {
    const filtered = this.filteredOptions().filter(opt => !opt.disabled);

    if (this.isAllSelected()) {
      // Deselect all filtered options
      const filteredValues = filtered.map(opt => opt.value);
      const newValue = this.value().filter(v => !filteredValues.includes(v));
      this.value.set(newValue);
      this.onChange(newValue);
    } else {
      // Select all filtered options
      const currentValue = [...this.value()];
      filtered.forEach(opt => {
        if (!currentValue.includes(opt.value)) {
          currentValue.push(opt.value);
        }
      });
      this.value.set(currentValue);
      this.onChange(currentValue);
    }
  }

  removeOption(event: Event, option: MultiSelectOption): void {
    event.stopPropagation();
    this.toggleOption(option);
  }

  onFilterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterText.set(target.value);
    this.focusedIndex.set(0);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen()) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        this.toggleDropdown();
      }
      return;
    }

    const filtered = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex.update(i => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex.update(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        const option = filtered[this.focusedIndex()];
        if (option && !option.disabled) {
          this.toggleOption(option);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.isOpen.set(false);
        break;
    }
  }

  writeValue(value: any[]): void {
    this.value.set(value || []);
  }

  registerOnChange(fn: (value: any[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
