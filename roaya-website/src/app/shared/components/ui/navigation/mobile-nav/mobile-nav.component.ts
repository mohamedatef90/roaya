import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface MobileNavItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  badge?: string | number;
  disabled?: boolean;
  children?: MobileNavItem[];
  action?: () => void;
}

@Component({
  selector: 'ui-mobile-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Overlay -->
    <div
      *ngIf="isOpen()"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      [class.animate-fade-in]="isOpen()"
      (click)="close()"
      aria-hidden="true"
    ></div>

    <!-- Drawer -->
    <div
      class="fixed inset-y-0 z-50 flex w-full max-w-xs flex-col bg-white dark:bg-neutral-900 shadow-xl transition-transform duration-300"
      [class.translate-x-0]="isOpen()"
      [class.-translate-x-full]="!isOpen()"
      [class.left-0]="side === 'left'"
      [class.right-0]="side === 'right'"
      [class.translate-x-full]="!isOpen() && side === 'right'"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="ariaLabel"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
        <ng-content select="[mobileNavHeader]"></ng-content>
        <button
          type="button"
          class="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          (click)="close()"
          [attr.aria-label]="'Close menu'"
        >
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4">
        <ul class="space-y-1">
          <ng-container *ngFor="let item of items">
            <li>
              <ng-container *ngIf="!item.children || item.children.length === 0; else parentItem">
                <!-- Simple item -->
                <a
                  *ngIf="item.route; else buttonItem"
                  [routerLink]="item.route"
                  routerLinkActive="bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                  class="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  [class.opacity-50]="item.disabled"
                  [class.pointer-events-none]="item.disabled"
                  (click)="onItemClick(item)"
                >
                  <span *ngIf="item.icon" class="flex-shrink-0" [innerHTML]="item.icon"></span>
                  <span class="flex-1">{{ item.label }}</span>
                  <span
                    *ngIf="item.badge"
                    class="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                  >
                    {{ item.badge }}
                  </span>
                </a>

                <ng-template #buttonItem>
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    [class.opacity-50]="item.disabled"
                    [disabled]="item.disabled"
                    (click)="onItemClick(item)"
                  >
                    <span *ngIf="item.icon" class="flex-shrink-0" [innerHTML]="item.icon"></span>
                    <span class="flex-1 text-left">{{ item.label }}</span>
                    <span
                      *ngIf="item.badge"
                      class="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                    >
                      {{ item.badge }}
                    </span>
                  </button>
                </ng-template>
              </ng-container>

              <!-- Parent item with children -->
              <ng-template #parentItem>
                <div>
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    (click)="toggleExpand(item.id)"
                  >
                    <span *ngIf="item.icon" class="flex-shrink-0" [innerHTML]="item.icon"></span>
                    <span class="flex-1 text-left">{{ item.label }}</span>
                    <svg
                      class="h-5 w-5 transition-transform"
                      [class.rotate-180]="isExpanded(item.id)"
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

                  <!-- Children -->
                  <ul
                    *ngIf="isExpanded(item.id)"
                    class="ml-6 mt-1 space-y-1 border-l-2 border-neutral-200 pl-4 dark:border-neutral-700"
                  >
                    <li *ngFor="let child of item.children">
                      <a
                        *ngIf="child.route; else childButton"
                        [routerLink]="child.route"
                        routerLinkActive="text-primary-600 dark:text-primary-400"
                        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        [class.opacity-50]="child.disabled"
                        [class.pointer-events-none]="child.disabled"
                        (click)="onItemClick(child)"
                      >
                        {{ child.label }}
                      </a>
                      <ng-template #childButton>
                        <button
                          type="button"
                          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                          [class.opacity-50]="child.disabled"
                          [disabled]="child.disabled"
                          (click)="onItemClick(child)"
                        >
                          {{ child.label }}
                        </button>
                      </ng-template>
                    </li>
                  </ul>
                </div>
              </ng-template>
            </li>
          </ng-container>
        </ul>
      </nav>

      <!-- Footer -->
      <div class="border-t border-neutral-200 p-4 dark:border-neutral-800">
        <ng-content select="[mobileNavFooter]"></ng-content>
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
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
  `]
})
export class MobileNavComponent {
  @Input() items: MobileNavItem[] = [];
  @Input() side: 'left' | 'right' = 'left';
  @Input() closeOnNavigation = true;
  @Input() ariaLabel = 'Mobile navigation';

  @Output() openChange = new EventEmitter<boolean>();
  @Output() itemClick = new EventEmitter<MobileNavItem>();

  isOpen = signal(false);
  expandedItems = signal<Set<string>>(new Set());

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  open(): void {
    this.isOpen.set(true);
    this.openChange.emit(true);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.isOpen.set(false);
    this.openChange.emit(false);
    // Restore body scroll
    document.body.style.overflow = '';
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  isExpanded(itemId: string): boolean {
    return this.expandedItems().has(itemId);
  }

  toggleExpand(itemId: string): void {
    this.expandedItems.update(items => {
      const newItems = new Set(items);
      if (newItems.has(itemId)) {
        newItems.delete(itemId);
      } else {
        newItems.add(itemId);
      }
      return newItems;
    });
  }

  onItemClick(item: MobileNavItem): void {
    if (item.action) {
      item.action();
    }

    this.itemClick.emit(item);

    if (this.closeOnNavigation && item.route) {
      this.close();
    }
  }
}
