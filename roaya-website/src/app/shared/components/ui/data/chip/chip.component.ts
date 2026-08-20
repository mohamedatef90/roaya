import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const chipVariants = cva(
  'inline-flex items-center gap-1.5 font-medium transition-all',
  {
    variants: {
      variant: {
        default: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700',
        primary: 'bg-primary-100 text-primary-800 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50',
        secondary: 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200 dark:bg-secondary-900/30 dark:text-secondary-300 dark:hover:bg-secondary-900/50',
        outline: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs rounded-md',
        md: 'px-3 py-1 text-sm rounded-lg',
        lg: 'px-4 py-1.5 text-sm rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

type ChipVariants = VariantProps<typeof chipVariants>;

@Component({
  selector: 'ui-chip',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="chipClass"
      [class.cursor-pointer]="clickable"
      [class.cursor-default]="!clickable"
      [attr.role]="clickable ? 'button' : null"
      [attr.tabindex]="clickable ? 0 : null"
      (click)="onClick()"
      (keydown.enter)="onClick()"
      (keydown.space)="onClick()"
    >
      <!-- Leading icon/avatar -->
      <ng-content select="[chipLeading]"></ng-content>

      <!-- Label -->
      <span><ng-content></ng-content></span>

      <!-- Remove button -->
      <button
        *ngIf="removable"
        type="button"
        class="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        (click)="onRemove($event)"
        [attr.aria-label]="'Remove'"
      >
        <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"/>
          <path d="m6 6 12 12"/>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
  `]
})
export class ChipComponent {
  @Input() variant: ChipVariants['variant'] = 'default';
  @Input() size: ChipVariants['size'] = 'md';
  @Input() removable = false;
  @Input() clickable = false;
  @Input() customClass = '';

  @Output() removed = new EventEmitter<void>();
  @Output() clicked = new EventEmitter<void>();

  get chipClass(): string {
    return chipVariants({ variant: this.variant, size: this.size }) + ' ' + this.customClass;
  }

  onClick(): void {
    if (this.clickable) {
      this.clicked.emit();
    }
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    this.removed.emit();
  }
}

// Chip Group Component
@Component({
  selector: 'ui-chip-group',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap gap-2" role="group" [attr.aria-label]="ariaLabel">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ChipGroupComponent {
  @Input() ariaLabel = 'Chip group';
}
