import { Component, Input, forwardRef, signal, ChangeDetectionStrategy, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cva, type VariantProps } from 'class-variance-authority';

const datePickerVariants = cva(
  'flex w-full items-center rounded-xl border-0 bg-neutral-100 px-3 py-2 text-sm transition-all focus-within:outline-none dark:bg-neutral-800 text-neutral-900 dark:text-white',
  {
    variants: {
      variant: {
        default: 'focus-within:ring-2 focus-within:ring-[#5DB7C2]/50 focus-within:bg-white dark:focus-within:bg-neutral-900',
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

type DatePickerVariants = VariantProps<typeof datePickerVariants>;

@Component({
  selector: 'ui-date-picker',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative w-full" #pickerContainer>
      <!-- Input trigger -->
      <div [class]="pickerClass" [class.opacity-50]="disabled" [class.cursor-not-allowed]="disabled">
        <input
          type="text"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="true"
          class="flex-1 bg-transparent outline-none cursor-pointer"
          [value]="formattedDate()"
          (click)="toggleCalendar()"
          (keydown)="onKeyDown($event)"
          [attr.aria-label]="ariaLabel"
          [attr.aria-expanded]="isOpen()"
          role="combobox"
        />
        <button
          type="button"
          class="flex items-center justify-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          (click)="toggleCalendar()"
          [disabled]="disabled"
          [attr.aria-label]="'Open calendar'"
          tabindex="-1"
        >
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
        </button>
      </div>

      <!-- Calendar dropdown -->
      <div
        *ngIf="isOpen()"
        class="absolute z-[9999] mt-2 w-72 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="'Choose date'"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <button
            type="button"
            class="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            (click)="previousMonth()"
            [attr.aria-label]="'Previous month'"
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <span class="font-medium">
            {{ monthNames[viewMonth()] }} {{ viewYear() }}
          </span>
          <button
            type="button"
            class="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            (click)="nextMonth()"
            [attr.aria-label]="'Next month'"
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>

        <!-- Weekday headers -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div
            *ngFor="let day of weekDays"
            class="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar grid -->
        <div class="grid grid-cols-7 gap-1">
          <button
            *ngFor="let day of calendarDays()"
            type="button"
            class="h-8 w-8 rounded text-sm transition-colors"
            [class.text-neutral-400]="!day.isCurrentMonth"
            [class.dark:text-neutral-600]="!day.isCurrentMonth"
            [class.hover:bg-neutral-100]="!day.isSelected && !day.isDisabled"
            [class.dark:hover:bg-neutral-800]="!day.isSelected && !day.isDisabled"
            [class.bg-primary-500]="day.isSelected"
            [class.text-white]="day.isSelected"
            [class.hover:bg-primary-600]="day.isSelected"
            [class.font-semibold]="day.isToday"
            [class.ring-1]="day.isToday && !day.isSelected"
            [class.ring-primary-500]="day.isToday && !day.isSelected"
            [class.opacity-50]="day.isDisabled"
            [class.cursor-not-allowed]="day.isDisabled"
            [disabled]="day.isDisabled"
            (click)="selectDate(day.date)"
          >
            {{ day.date.getDate() }}
          </button>
        </div>

        <!-- Footer -->
        <div class="mt-4 flex justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <button
            type="button"
            class="text-sm text-primary-500 hover:text-primary-600"
            (click)="selectToday()"
          >
            Today
          </button>
          <button
            type="button"
            class="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            (click)="clearDate()"
          >
            Clear
          </button>
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
export class DatePickerComponent implements ControlValueAccessor {
  @ViewChild('pickerContainer') pickerContainer!: ElementRef;

  @Input() variant: DatePickerVariants['variant'] = 'default';
  @Input() size: DatePickerVariants['size'] = 'md';
  @Input() placeholder = 'Select date';
  @Input() disabled = false;
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() dateFormat = 'MMM dd, yyyy';
  @Input() ariaLabel?: string;
  @Input() customClass = '';

  value = signal<Date | null>(null);
  isOpen = signal(false);
  viewMonth = signal(new Date().getMonth());
  viewYear = signal(new Date().getFullYear());

  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  get pickerClass(): string {
    return datePickerVariants({ variant: this.variant, size: this.size }) + ' ' + this.customClass;
  }

  formattedDate(): string {
    const date = this.value();
    if (!date) return '';
    return this.formatDate(date);
  }

  private formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  calendarDays(): { date: Date; isCurrentMonth: boolean; isSelected: boolean; isToday: boolean; isDisabled: boolean }[] {
    const days: { date: Date; isCurrentMonth: boolean; isSelected: boolean; isToday: boolean; isDisabled: boolean }[] = [];
    const firstDay = new Date(this.viewYear(), this.viewMonth(), 1);
    const lastDay = new Date(this.viewYear(), this.viewMonth() + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add days from previous month
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(this.viewYear(), this.viewMonth(), -i);
      days.push(this.createDayObject(date, false, today));
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(this.viewYear(), this.viewMonth(), i);
      days.push(this.createDayObject(date, true, today));
    }

    // Add days from next month
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(this.viewYear(), this.viewMonth() + 1, i);
      days.push(this.createDayObject(date, false, today));
    }

    return days;
  }

  private createDayObject(date: Date, isCurrentMonth: boolean, today: Date) {
    const selected = this.value();
    return {
      date,
      isCurrentMonth,
      isSelected: selected ? this.isSameDay(date, selected) : false,
      isToday: this.isSameDay(date, today),
      isDisabled: this.isDateDisabled(date),
    };
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  private isDateDisabled(date: Date): boolean {
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    return false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.pickerContainer && !this.pickerContainer.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleCalendar(): void {
    if (!this.disabled) {
      this.isOpen.update(v => !v);
      if (this.isOpen()) {
        const date = this.value() || new Date();
        this.viewMonth.set(date.getMonth());
        this.viewYear.set(date.getFullYear());
      }
    }
  }

  previousMonth(): void {
    if (this.viewMonth() === 0) {
      this.viewMonth.set(11);
      this.viewYear.update(y => y - 1);
    } else {
      this.viewMonth.update(m => m - 1);
    }
  }

  nextMonth(): void {
    if (this.viewMonth() === 11) {
      this.viewMonth.set(0);
      this.viewYear.update(y => y + 1);
    } else {
      this.viewMonth.update(m => m + 1);
    }
  }

  selectDate(date: Date): void {
    if (!this.isDateDisabled(date)) {
      this.value.set(date);
      this.onChange(date);
      this.onTouched();
      this.isOpen.set(false);
    }
  }

  selectToday(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.selectDate(today);
  }

  clearDate(): void {
    this.value.set(null);
    this.onChange(null);
    this.isOpen.set(false);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleCalendar();
    } else if (event.key === 'Escape') {
      this.isOpen.set(false);
    }
  }

  writeValue(value: Date | null): void {
    this.value.set(value);
    if (value) {
      this.viewMonth.set(value.getMonth());
      this.viewYear.set(value.getFullYear());
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
