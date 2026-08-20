import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { DateRange } from '../../../../core/services/analytics-admin.service';

interface PresetOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePicker, ButtonModule, Select],
  template: `
    <div class="date-range-picker flex items-center gap-2">
      <!-- Preset Dropdown -->
      <p-select
        [options]="presets"
        [(ngModel)]="selectedPreset"
        optionLabel="label"
        optionValue="value"
        placeholder="Select range"
        (onChange)="onPresetChange($event.value)"
        [style]="{ minWidth: '160px' }"
      ></p-select>

      <!-- Custom Date Range -->
      <div class="flex items-center gap-2" *ngIf="selectedPreset === 'custom'">
        <p-datepicker
          [(ngModel)]="customStartDate"
          [showIcon]="true"
          dateFormat="M d, yy"
          placeholder="Start date"
          [style]="{ width: '150px' }"
          (onSelect)="onCustomDateChange()"
        ></p-datepicker>
        <span class="text-surface-500">to</span>
        <p-datepicker
          [(ngModel)]="customEndDate"
          [showIcon]="true"
          dateFormat="M d, yy"
          placeholder="End date"
          [style]="{ width: '150px' }"
          (onSelect)="onCustomDateChange()"
        ></p-datepicker>
      </div>
    </div>
  `,
  styles: [`
    .date-range-picker {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  `],
})
export class DateRangePickerComponent {
  @Input() startDate: Date = new Date();
  @Input() endDate: Date = new Date();
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  selectedPreset = 'last30';
  customStartDate: Date | null = null;
  customEndDate: Date | null = null;

  presets: PresetOption[] = [
    { label: 'Last 7 days', value: 'last7' },
    { label: 'Last 30 days', value: 'last30' },
    { label: 'Last 90 days', value: 'last90' },
    { label: 'This month', value: 'thisMonth' },
    { label: 'Last month', value: 'lastMonth' },
    { label: 'This quarter', value: 'thisQuarter' },
    { label: 'This year', value: 'thisYear' },
    { label: 'Custom', value: 'custom' },
  ];

  onPresetChange(preset: string): void {
    if (preset === 'custom') {
      this.customStartDate = this.startDate;
      this.customEndDate = this.endDate;
      return;
    }

    const range = this.calculatePresetRange(preset);
    this.dateRangeChange.emit(range);
  }

  onCustomDateChange(): void {
    if (this.customStartDate && this.customEndDate) {
      this.dateRangeChange.emit({
        startDate: this.customStartDate,
        endDate: this.customEndDate,
      });
    }
  }

  private calculatePresetRange(preset: string): DateRange {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate: Date;
    let endDate: Date = today;

    switch (preset) {
      case 'last7':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;

      case 'last30':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);
        break;

      case 'last90':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 90);
        break;

      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;

      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;

      case 'thisQuarter':
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterMonth, 1);
        break;

      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;

      default:
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);
    }

    return { startDate, endDate };
  }
}
