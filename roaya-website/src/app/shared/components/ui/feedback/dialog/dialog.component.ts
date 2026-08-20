import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const dialogOverlayVariants = cva(
  'fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm',
  {
    variants: {
      animation: {
        fade: 'animate-fade-in',
        none: '',
      },
    },
    defaultVariants: {
      animation: 'fade',
    },
  }
);

const dialogContentVariants = cva(
  'fixed left-[50%] top-[50%] z-[1100] grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg dark:bg-neutral-900 dark:border-neutral-800',
  {
    variants: {
      size: {
        sm: 'max-w-sm rounded-lg',
        md: 'max-w-lg rounded-xl',
        lg: 'max-w-2xl rounded-xl',
        xl: 'max-w-4xl rounded-xl',
        full: 'max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-4rem)] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] rounded-xl overflow-hidden',
      },
      animation: {
        scale: 'animate-scale-in',
        slide: 'animate-fade-in-up',
        none: '',
      },
    },
    defaultVariants: {
      size: 'md',
      animation: 'scale',
    },
  }
);

type DialogContentVariants = VariantProps<typeof dialogContentVariants>;

@Component({
  selector: 'ui-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="open" class="dialog-root">
      <!-- Overlay -->
      <div
        class="fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm animate-fade-in"
        (click)="onOverlayClick()"
        aria-hidden="true"
      ></div>

      <!-- Content -->
      <div
        [class]="contentClass"
        role="dialog"
        [attr.aria-modal]="true"
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
    @keyframes scaleIn {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translate(-50%, -48%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }
    .animate-fade-in {
      animation: fadeIn 0.15s ease-out;
    }
    .animate-scale-in {
      animation: scaleIn 0.15s ease-out;
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.2s ease-out;
    }
  `]
})
export class DialogComponent {
  @Input() open = false;
  @Input() size: DialogContentVariants['size'] = 'md';
  @Input() showCloseButton = true;
  @Input() closeOnOverlayClick = true;
  @Input() closeOnEscape = true;
  @Input() titleId?: string;
  @Input() descriptionId?: string;
  @Input() customClass = '';

  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  get contentClass(): string {
    return dialogContentVariants({ size: this.size }) + ' ' + this.customClass;
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
  selector: 'ui-dialog-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col space-y-1.5 text-center sm:text-left">
      <ng-content></ng-content>
    </div>
  `,
})
export class DialogHeaderComponent {}

@Component({
  selector: 'ui-dialog-title',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 [id]="id" class="text-lg font-semibold leading-none tracking-tight">
      <ng-content></ng-content>
    </h2>
  `,
})
export class DialogTitleComponent {
  @Input() id?: string;
}

@Component({
  selector: 'ui-dialog-description',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p [id]="id" class="text-sm text-content-muted">
      <ng-content></ng-content>
    </p>
  `,
})
export class DialogDescriptionComponent {
  @Input() id?: string;
}

@Component({
  selector: 'ui-dialog-content',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="py-4 overflow-y-auto max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-14rem)]">
      <ng-content></ng-content>
    </div>
  `,
})
export class DialogContentComponent {}

@Component({
  selector: 'ui-dialog-footer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
      <ng-content></ng-content>
    </div>
  `,
})
export class DialogFooterComponent {}
