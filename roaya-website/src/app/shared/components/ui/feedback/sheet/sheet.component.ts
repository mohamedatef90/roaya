import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-white p-6 shadow-lg transition-transform dark:bg-neutral-900 dark:border-neutral-800',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b',
        bottom: 'inset-x-0 bottom-0 border-t',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
        right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);

type SheetVariants = VariantProps<typeof sheetVariants>;

@Component({
  selector: 'ui-sheet',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="open" class="sheet-root">
      <!-- Overlay -->
      <div
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        [class.animate-fade-in]="open"
        (click)="onOverlayClick()"
        aria-hidden="true"
      ></div>

      <!-- Content -->
      <div
        [class]="sheetClass"
        [class.animate-slide-in-right]="side === 'right' && open"
        [class.animate-slide-in-left]="side === 'left' && open"
        [class.animate-slide-in-top]="side === 'top' && open"
        [class.animate-slide-in-bottom]="side === 'bottom' && open"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        [attr.aria-describedby]="descriptionId"
      >
        <!-- Close button -->
        <button
          *ngIf="showCloseButton"
          type="button"
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:ring-offset-neutral-950"
          (click)="close()"
          [attr.aria-label]="'Close'"
        >
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>

        <!-- Content slot -->
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    @keyframes slideInLeft {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    @keyframes slideInTop {
      from { transform: translateY(-100%); }
      to { transform: translateY(0); }
    }
    @keyframes slideInBottom {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-slide-in-right {
      animation: slideInRight 0.3s ease-out;
    }
    .animate-slide-in-left {
      animation: slideInLeft 0.3s ease-out;
    }
    .animate-slide-in-top {
      animation: slideInTop 0.3s ease-out;
    }
    .animate-slide-in-bottom {
      animation: slideInBottom 0.3s ease-out;
    }
  `]
})
export class SheetComponent {
  @Input() open = false;
  @Input() side: SheetVariants['side'] = 'right';
  @Input() showCloseButton = true;
  @Input() closeOnOverlayClick = true;
  @Input() closeOnEscape = true;
  @Input() titleId?: string;
  @Input() descriptionId?: string;
  @Input() customClass = '';

  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  get sheetClass(): string {
    return sheetVariants({ side: this.side }) + ' ' + this.customClass;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.open && this.closeOnEscape) {
      this.close();
    }
  }

  onOverlayClick(): void {
    if (this.closeOnOverlayClick) {
      this.close();
    }
  }

  close(): void {
    this.open = false;
    this.openChange.emit(false);
    this.closed.emit();
  }
}

@Component({
  selector: 'ui-sheet-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col space-y-2">
      <ng-content></ng-content>
    </div>
  `,
})
export class SheetHeaderComponent {}

@Component({
  selector: 'ui-sheet-title',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 [id]="id" class="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
      <ng-content></ng-content>
    </h2>
  `,
})
export class SheetTitleComponent {
  @Input() id?: string;
}

@Component({
  selector: 'ui-sheet-description',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p [id]="id" class="text-sm text-neutral-500 dark:text-neutral-400">
      <ng-content></ng-content>
    </p>
  `,
})
export class SheetDescriptionComponent {
  @Input() id?: string;
}

@Component({
  selector: 'ui-sheet-content',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="py-4 overflow-auto flex-1">
      <ng-content></ng-content>
    </div>
  `,
})
export class SheetContentComponent {}

@Component({
  selector: 'ui-sheet-footer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
      <ng-content></ng-content>
    </div>
  `,
})
export class SheetFooterComponent {}
