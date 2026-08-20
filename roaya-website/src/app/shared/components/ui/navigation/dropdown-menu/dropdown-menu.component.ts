import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

export interface DropdownMenuItem {
  id?: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  action?: () => void;
  children?: DropdownMenuItem[];
}

const dropdownMenuVariants = cva(
  'absolute z-50 min-w-[8rem] overflow-hidden rounded-lg border bg-white p-1 shadow-lg dark:bg-neutral-900 dark:border-neutral-800',
  {
    variants: {
      align: {
        start: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-0',
      },
      side: {
        bottom: 'top-full mt-1',
        top: 'bottom-full mb-1',
        left: 'right-full mr-1 top-0',
        right: 'left-full ml-1 top-0',
      },
    },
    defaultVariants: {
      align: 'start',
      side: 'bottom',
    },
  }
);

type DropdownMenuVariants = VariantProps<typeof dropdownMenuVariants>;

@Component({
  selector: 'ui-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-block" #menuContainer>
      <!-- Trigger -->
      <div (click)="toggle()" (keydown.enter)="toggle()" (keydown.space)="toggle()">
        <ng-content select="[dropdownTrigger]"></ng-content>
      </div>

      <!-- Menu -->
      <div
        *ngIf="isOpen()"
        [class]="menuClass"
        role="menu"
        [attr.aria-label]="ariaLabel"
      >
        <ng-container *ngFor="let item of items; let i = index">
          <!-- Separator -->
          <div
            *ngIf="item.separator"
            class="-mx-1 my-1 h-px bg-neutral-200 dark:bg-neutral-700"
            role="separator"
          ></div>

          <!-- Menu item -->
          <button
            *ngIf="!item.separator"
            type="button"
            role="menuitem"
            class="relative flex w-full cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors"
            [class.text-red-600]="item.danger"
            [class.dark:text-red-400]="item.danger"
            [class.hover:bg-neutral-100]="!item.disabled"
            [class.dark:hover:bg-neutral-800]="!item.disabled"
            [class.opacity-50]="item.disabled"
            [class.cursor-not-allowed]="item.disabled"
            [class.focus:bg-neutral-100]="!item.disabled"
            [class.dark:focus:bg-neutral-800]="!item.disabled"
            [disabled]="item.disabled"
            [attr.tabindex]="item.disabled ? -1 : 0"
            (click)="onItemClick(item)"
            (keydown)="onItemKeyDown($event, i)"
          >
            <!-- Icon -->
            <span *ngIf="item.icon" class="mr-2 h-4 w-4" [innerHTML]="item.icon"></span>

            <!-- Label -->
            <span class="flex-1">{{ item.label }}</span>

            <!-- Shortcut -->
            <span *ngIf="item.shortcut" class="ml-auto text-xs text-neutral-400">
              {{ item.shortcut }}
            </span>

            <!-- Submenu indicator -->
            <svg
              *ngIf="item.children && item.children.length > 0"
              class="ml-auto h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </ng-container>

        <!-- Custom content slot -->
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    div[role="menu"] {
      animation: fadeIn 0.1s ease-out;
    }
  `]
})
export class DropdownMenuComponent {
  @ViewChild('menuContainer') menuContainer!: ElementRef;

  @Input() items: DropdownMenuItem[] = [];
  @Input() align: DropdownMenuVariants['align'] = 'start';
  @Input() side: DropdownMenuVariants['side'] = 'bottom';
  @Input() ariaLabel = 'Menu';
  @Input() closeOnSelect = true;
  @Input() customClass = '';

  @Output() itemSelected = new EventEmitter<DropdownMenuItem>();
  @Output() openChange = new EventEmitter<boolean>();

  isOpen = signal(false);
  focusedIndex = signal(-1);

  get menuClass(): string {
    return dropdownMenuVariants({ align: this.align, side: this.side }) + ' ' + this.customClass;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.menuContainer && !this.menuContainer.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.close();
  }

  toggle(): void {
    this.isOpen.update(v => !v);
    this.openChange.emit(this.isOpen());
    if (this.isOpen()) {
      this.focusedIndex.set(0);
    }
  }

  open(): void {
    this.isOpen.set(true);
    this.openChange.emit(true);
    this.focusedIndex.set(0);
  }

  close(): void {
    this.isOpen.set(false);
    this.openChange.emit(false);
    this.focusedIndex.set(-1);
  }

  onItemClick(item: DropdownMenuItem): void {
    if (item.disabled) return;

    if (item.action) {
      item.action();
    }

    this.itemSelected.emit(item);

    if (this.closeOnSelect && !item.children?.length) {
      this.close();
    }
  }

  onItemKeyDown(event: KeyboardEvent, index: number): void {
    const enabledItems = this.items.filter(item => !item.separator && !item.disabled);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex.set((index + 1) % enabledItems.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex.set(index > 0 ? index - 1 : enabledItems.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.onItemClick(enabledItems[index]);
        break;
    }
  }
}

// Dropdown Menu Item Component for slot-based usage
@Component({
  selector: 'ui-dropdown-menu-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      role="menuitem"
      class="relative flex w-full cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-surface-hover focus:bg-neutral-100 dark:focus:bg-neutral-800"
      [class.text-red-600]="danger"
      [class.dark:text-red-400]="danger"
      [class.opacity-50]="disabled"
      [class.cursor-not-allowed]="disabled"
      [disabled]="disabled"
      (click)="onClick()"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class DropdownMenuItemComponent {
  @Input() disabled = false;
  @Input() danger = false;

  @Output() selected = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.selected.emit();
    }
  }
}

// Dropdown Menu Separator
@Component({
  selector: 'ui-dropdown-menu-separator',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="-mx-1 my-1 h-px bg-neutral-200 dark:bg-neutral-700" role="separator"></div>`,
})
export class DropdownMenuSeparatorComponent {}

// Dropdown Menu Label
@Component({
  selector: 'ui-dropdown-menu-label',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="px-2 py-1.5 text-xs font-semibold text-content-muted">
      <ng-content></ng-content>
    </div>
  `,
})
export class DropdownMenuLabelComponent {}
