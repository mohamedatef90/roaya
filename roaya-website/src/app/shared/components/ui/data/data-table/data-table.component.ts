import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, computed, ContentChildren, QueryList, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent, PageChangeEvent } from '../pagination/pagination.component';
import { CheckboxComponent } from '../../form/checkbox/checkbox.component';
import { SpinnerComponent } from '../../primitives/spinner/spinner.component';
import { InputComponent } from '../../primitives/input/input.component';

export interface TableColumn<T = any> {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  template?: TemplateRef<any>;
  formatter?: (value: any, row: T) => string;
}

export interface SortEvent {
  field: string;
  order: 'asc' | 'desc';
}

export interface TableLazyLoadEvent {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  globalFilter?: string;
}

@Component({
  selector: 'ui-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, CheckboxComponent, SpinnerComponent, InputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full" [class]="customClass">
      <!-- Header with search and actions -->
      <div *ngIf="showHeader" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <!-- Global search -->
        <div *ngIf="globalFilterable" class="relative w-full sm:w-64">
          <input
            type="text"
            class="w-full rounded-lg border border-edge-strong bg-surface-elevated py-2 pl-10 pr-4 text-sm placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            [placeholder]="searchPlaceholder"
            [value]="globalFilter()"
            (input)="onGlobalFilterChange($event)"
          />
          <svg
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
        </div>

        <!-- Actions slot -->
        <div class="flex items-center gap-2">
          <ng-content select="[tableActions]"></ng-content>
        </div>
      </div>

      <!-- Table container -->
      <div class="relative overflow-x-auto rounded-lg border border-edge-subtle">
        <!-- Loading overlay -->
        <div
          *ngIf="loading"
          class="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80"
        >
          <ui-spinner size="lg"></ui-spinner>
        </div>

        <table class="w-full text-left text-sm">
          <!-- Header -->
          <thead class="bg-surface-secondary text-xs uppercase text-content-secondary">
            <tr>
              <!-- Selection checkbox -->
              <th *ngIf="selectable" class="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-edge-strong text-primary-500 focus:ring-primary-500"
                  [checked]="allSelected()"
                  [indeterminate]="someSelected() && !allSelected()"
                  (change)="toggleSelectAll()"
                />
              </th>

              <!-- Column headers -->
              <th
                *ngFor="let col of columns"
                class="px-4 py-3"
                [style.width]="col.width"
                [class.cursor-pointer]="col.sortable"
                [class.select-none]="col.sortable"
                (click)="col.sortable && onSort(col.field)"
              >
                <div
                  class="flex items-center gap-1"
                  [class.justify-start]="col.align === 'left' || !col.align"
                  [class.justify-center]="col.align === 'center'"
                  [class.justify-end]="col.align === 'right'"
                >
                  <span>{{ col.header }}</span>
                  <span *ngIf="col.sortable" class="flex flex-col">
                    <svg
                      class="h-3 w-3 transition-colors"
                      [class.text-primary-500]="sortField() === col.field && sortOrder() === 'asc'"
                      [class.text-neutral-300]="sortField() !== col.field || sortOrder() !== 'asc'"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="m18 15-6-6-6 6"/>
                    </svg>
                    <svg
                      class="h-3 w-3 -mt-1.5 transition-colors"
                      [class.text-primary-500]="sortField() === col.field && sortOrder() === 'desc'"
                      [class.text-neutral-300]="sortField() !== col.field || sortOrder() !== 'desc'"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </span>
                </div>
              </th>

              <!-- Actions column -->
              <th *ngIf="showActions" class="w-20 px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-700">
            <tr
              *ngFor="let row of displayData(); let i = index; trackBy: trackByFn"
              class="bg-surface-elevated hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              [class.bg-primary-50]="isSelected(row)"
              [class.dark:bg-primary-900/20]="isSelected(row)"
            >
              <!-- Selection checkbox -->
              <td *ngIf="selectable" class="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-edge-strong text-primary-500 focus:ring-primary-500"
                  [checked]="isSelected(row)"
                  (change)="toggleSelect(row)"
                />
              </td>

              <!-- Data cells -->
              <td
                *ngFor="let col of columns"
                class="px-4 py-3"
                [class.text-left]="col.align === 'left' || !col.align"
                [class.text-center]="col.align === 'center'"
                [class.text-right]="col.align === 'right'"
              >
                <ng-container *ngIf="col.template; else defaultCell">
                  <ng-container *ngTemplateOutlet="col.template; context: { $implicit: row, row: row, value: getFieldValue(row, col.field), index: i }"></ng-container>
                </ng-container>
                <ng-template #defaultCell>
                  {{ col.formatter ? col.formatter(getFieldValue(row, col.field), row) : getFieldValue(row, col.field) }}
                </ng-template>
              </td>

              <!-- Actions cell -->
              <td *ngIf="showActions" class="px-4 py-3 text-right">
                <ng-content select="[rowActions]"></ng-content>
              </td>
            </tr>

            <!-- Empty state -->
            <tr *ngIf="displayData().length === 0 && !loading">
              <td
                [attr.colspan]="columns.length + (selectable ? 1 : 0) + (showActions ? 1 : 0)"
                class="px-4 py-12 text-center"
              >
                <div class="flex flex-col items-center gap-2 text-neutral-500">
                  <svg class="h-12 w-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3h18v18H3z"/>
                    <path d="M3 9h18"/>
                    <path d="M9 21V9"/>
                  </svg>
                  <p class="text-sm">{{ emptyMessage }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer with pagination -->
      <div *ngIf="paginator && totalRecords > 0" class="mt-4">
        <ui-pagination
          [totalRecords]="totalRecords"
          [rows]="rows"
          [first]="first"
          [showInfo]="showPaginationInfo"
          [showRowsPerPage]="showRowsPerPage"
          [rowsPerPageOptions]="rowsPerPageOptions"
          (pageChange)="onPageChange($event)"
        ></ui-pagination>
      </div>

      <!-- Selection info -->
      <div *ngIf="selectable && selectedRows().length > 0" class="mt-4 flex items-center gap-4 rounded-lg bg-primary-50 px-4 py-2 dark:bg-primary-900/20">
        <span class="text-sm text-primary-700 dark:text-primary-300">
          {{ selectedRows().length }} row(s) selected
        </span>
        <button
          type="button"
          class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          (click)="clearSelection()"
        >
          Clear selection
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DataTableComponent<T = any> {
  @Input() data: T[] = [];
  @Input() columns: TableColumn<T>[] = [];
  @Input() loading = false;
  @Input() paginator = true;
  @Input() rows = 10;
  @Input() first = 0;
  @Input() totalRecords = 0;
  @Input() lazy = false;
  @Input() selectable = false;
  @Input() showHeader = true;
  @Input() showActions = false;
  @Input() globalFilterable = true;
  @Input() searchPlaceholder = 'Search...';
  @Input() emptyMessage = 'No data available';
  @Input() showPaginationInfo = true;
  @Input() showRowsPerPage = true;
  @Input() rowsPerPageOptions = [10, 20, 50, 100];
  @Input() dataKey = 'id';
  @Input() customClass = '';

  @Output() lazyLoad = new EventEmitter<TableLazyLoadEvent>();
  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() rowClick = new EventEmitter<T>();

  globalFilter = signal('');
  sortField = signal<string | null>(null);
  sortOrder = signal<'asc' | 'desc'>('asc');
  selectedRows = signal<T[]>([]);

  displayData = computed(() => {
    if (this.lazy) {
      return this.data;
    }

    let result = [...this.data];

    // Global filter
    const filter = this.globalFilter().toLowerCase();
    if (filter) {
      result = result.filter(row => {
        return this.columns.some(col => {
          const value = this.getFieldValue(row, col.field);
          return value?.toString().toLowerCase().includes(filter);
        });
      });
    }

    // Sort
    const field = this.sortField();
    if (field) {
      const order = this.sortOrder() === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const aVal = this.getFieldValue(a, field);
        const bVal = this.getFieldValue(b, field);
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }

    // Pagination (for non-lazy mode)
    if (this.paginator && !this.lazy) {
      const start = this.first;
      const end = start + this.rows;
      result = result.slice(start, end);
    }

    return result;
  });

  allSelected = computed(() => {
    const data = this.displayData();
    const selected = this.selectedRows();
    return data.length > 0 && data.every(row => this.isSelected(row));
  });

  someSelected = computed(() => {
    return this.selectedRows().length > 0;
  });

  trackByFn = (index: number, item: T): any => {
    return (item as any)[this.dataKey] ?? index;
  };

  getFieldValue(row: T, field: string): any {
    return field.split('.').reduce((obj: any, key) => obj?.[key], row);
  }

  isSelected(row: T): boolean {
    const key = (row as any)[this.dataKey];
    return this.selectedRows().some((r: any) => r[this.dataKey] === key);
  }

  toggleSelect(row: T): void {
    const key = (row as any)[this.dataKey];
    const current = this.selectedRows();
    const index = current.findIndex((r: any) => r[this.dataKey] === key);

    if (index === -1) {
      this.selectedRows.set([...current, row]);
    } else {
      this.selectedRows.set(current.filter((_, i) => i !== index));
    }

    this.selectionChange.emit(this.selectedRows());
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedRows.set([]);
    } else {
      this.selectedRows.set([...this.displayData()]);
    }
    this.selectionChange.emit(this.selectedRows());
  }

  clearSelection(): void {
    this.selectedRows.set([]);
    this.selectionChange.emit([]);
  }

  onSort(field: string): void {
    if (this.sortField() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortOrder.set('asc');
    }

    this.sortChange.emit({
      field: this.sortField()!,
      order: this.sortOrder(),
    });

    if (this.lazy) {
      this.emitLazyLoad();
    }
  }

  onGlobalFilterChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.globalFilter.set(target.value);

    if (this.lazy) {
      this.first = 0;
      this.emitLazyLoad();
    }
  }

  onPageChange(event: PageChangeEvent): void {
    this.first = event.first;
    this.rows = event.rows;

    if (this.lazy) {
      this.emitLazyLoad();
    }
  }

  private emitLazyLoad(): void {
    this.lazyLoad.emit({
      first: this.first,
      rows: this.rows,
      sortField: this.sortField() || undefined,
      sortOrder: this.sortOrder(),
      globalFilter: this.globalFilter() || undefined,
    });
  }
}
