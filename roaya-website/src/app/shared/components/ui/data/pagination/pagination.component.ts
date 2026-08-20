import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const paginationButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        outline: 'border border-neutral-200 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800',
      },
      size: {
        sm: 'h-8 w-8',
        md: 'h-9 w-9',
        lg: 'h-10 w-10',
      },
      active: {
        true: 'bg-primary-500 text-white hover:bg-primary-600',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      active: false,
    },
  }
);

type PaginationButtonVariants = VariantProps<typeof paginationButtonVariants>;

export interface PageChangeEvent {
  page: number;
  first: number;
  rows: number;
  pageCount: number;
}

@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="flex items-center justify-between" [attr.aria-label]="ariaLabel">
      <!-- Page info (optional) -->
      <div *ngIf="showInfo" class="text-sm text-neutral-500 dark:text-neutral-400">
        Showing {{ firstItem() }} to {{ lastItem() }} of {{ totalRecords }} entries
      </div>

      <div class="flex items-center gap-1">
        <!-- First page button -->
        <button
          *ngIf="showFirstLastButtons"
          type="button"
          [class]="buttonClass(false)"
          [disabled]="currentPage() === 1"
          (click)="goToPage(1)"
          [attr.aria-label]="'Go to first page'"
        >
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="11 17 6 12 11 7"/>
            <polyline points="18 17 13 12 18 7"/>
          </svg>
        </button>

        <!-- Previous button -->
        <button
          type="button"
          [class]="buttonClass(false)"
          [disabled]="currentPage() === 1"
          (click)="goToPage(currentPage() - 1)"
          [attr.aria-label]="'Go to previous page'"
        >
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <!-- Page numbers -->
        <ng-container *ngFor="let page of visiblePages()">
          <button
            *ngIf="page !== '...'"
            type="button"
            [class]="buttonClass(page === currentPage())"
            (click)="goToPage(+page)"
            [attr.aria-label]="'Go to page ' + page"
            [attr.aria-current]="page === currentPage() ? 'page' : null"
          >
            {{ page }}
          </button>
          <span
            *ngIf="page === '...'"
            class="px-2 text-neutral-400"
          >
            ...
          </span>
        </ng-container>

        <!-- Next button -->
        <button
          type="button"
          [class]="buttonClass(false)"
          [disabled]="currentPage() === pageCount()"
          (click)="goToPage(currentPage() + 1)"
          [attr.aria-label]="'Go to next page'"
        >
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <!-- Last page button -->
        <button
          *ngIf="showFirstLastButtons"
          type="button"
          [class]="buttonClass(false)"
          [disabled]="currentPage() === pageCount()"
          (click)="goToPage(pageCount())"
          [attr.aria-label]="'Go to last page'"
        >
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="13 17 18 12 13 7"/>
            <polyline points="6 17 11 12 6 7"/>
          </svg>
        </button>
      </div>

      <!-- Rows per page selector -->
      <div *ngIf="showRowsPerPage" class="flex items-center gap-2">
        <span class="text-sm text-neutral-500 dark:text-neutral-400">Rows per page:</span>
        <select
          class="rounded-md border border-neutral-200 bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-700"
          [value]="rows"
          (change)="onRowsChange($event)"
        >
          <option *ngFor="let option of rowsPerPageOptions" [value]="option">
            {{ option }}
          </option>
        </select>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PaginationComponent {
  @Input() totalRecords = 0;
  @Input() rows = 10;
  @Input() first = 0;
  @Input() pageLinkSize = 5;
  @Input() showInfo = true;
  @Input() showFirstLastButtons = true;
  @Input() showRowsPerPage = true;
  @Input() rowsPerPageOptions = [10, 20, 50, 100];
  @Input() size: PaginationButtonVariants['size'] = 'md';
  @Input() variant: PaginationButtonVariants['variant'] = 'default';
  @Input() ariaLabel = 'Pagination navigation';
  @Input() customClass = '';

  @Output() pageChange = new EventEmitter<PageChangeEvent>();

  currentPage = computed(() => Math.floor(this.first / this.rows) + 1);
  pageCount = computed(() => Math.ceil(this.totalRecords / this.rows) || 1);

  firstItem = computed(() => {
    if (this.totalRecords === 0) return 0;
    return this.first + 1;
  });

  lastItem = computed(() => {
    const last = this.first + this.rows;
    return last > this.totalRecords ? this.totalRecords : last;
  });

  visiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.pageCount();
    const size = this.pageLinkSize;
    const pages: (number | string)[] = [];

    if (total <= size) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(size / 2);
      let start = Math.max(1, current - half);
      let end = Math.min(total, start + size - 1);

      if (end - start < size - 1) {
        start = Math.max(1, end - size + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== total) {
          pages.push(i);
        }
      }

      if (end < total) {
        if (end < total - 1) {
          pages.push('...');
        }
        pages.push(total);
      }
    }

    return pages;
  });

  buttonClass(active: boolean): string {
    return paginationButtonVariants({
      variant: this.variant,
      size: this.size,
      active,
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pageCount()) return;

    const first = (page - 1) * this.rows;
    this.first = first;

    this.pageChange.emit({
      page,
      first,
      rows: this.rows,
      pageCount: this.pageCount(),
    });
  }

  onRowsChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.rows = parseInt(select.value, 10);
    this.first = 0;

    this.pageChange.emit({
      page: 1,
      first: 0,
      rows: this.rows,
      pageCount: this.pageCount(),
    });
  }
}
