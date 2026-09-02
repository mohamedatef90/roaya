import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { cva, type VariantProps } from 'class-variance-authority';
import { LocalizeLinkPipe } from '../../../../../core/i18n/localize-link.pipe';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  children?: SidebarItem[];
  action?: () => void;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

const sidebarVariants = cva(
  'flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300',
  {
    variants: {
      variant: {
        default: '',
        floating: 'rounded-xl border shadow-lg m-2',
      },
      collapsed: {
        true: 'w-16',
        false: 'w-64',
      },
    },
    defaultVariants: {
      variant: 'default',
      collapsed: false,
    },
  }
);

type SidebarVariants = VariantProps<typeof sidebarVariants>;

@Component({
  selector: 'ui-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LocalizeLinkPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside [class]="sidebarClass">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-edge-subtle">
        <div *ngIf="!collapsed()" class="flex items-center gap-2">
          <ng-content select="[sidebarLogo]"></ng-content>
        </div>
        <button
          *ngIf="collapsible"
          type="button"
          class="p-2 rounded-lg hover:bg-surface-hover transition-colors"
          (click)="toggleCollapse()"
          [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <svg
            class="h-5 w-5 transition-transform"
            [class.rotate-180]="collapsed()"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="11 17 6 12 11 7"/>
            <polyline points="18 17 13 12 18 7"/>
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-2">
        <ng-container *ngFor="let section of sections">
          <!-- Section title -->
          <div
            *ngIf="section.title && !collapsed()"
            class="px-3 py-2 text-xs font-semibold uppercase text-content-muted"
          >
            {{ section.title }}
          </div>

          <!-- Section items -->
          <ul class="space-y-1">
            <li *ngFor="let item of section.items">
              <ng-container *ngIf="!item.children || item.children.length === 0; else parentItem">
                <!-- Simple item -->
                <a
                  *ngIf="item.route; else buttonItem"
                  [routerLink]="item.route | localizeLink"
                  routerLinkActive="bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                  class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-hover"
                  [class.justify-center]="collapsed()"
                  [class.opacity-50]="item.disabled"
                  [class.pointer-events-none]="item.disabled"
                  [attr.title]="collapsed() ? item.label : null"
                >
                  <span *ngIf="item.icon" class="flex-shrink-0" [innerHTML]="item.icon"></span>
                  <span *ngIf="!collapsed()" class="flex-1">{{ item.label }}</span>
                  <span
                    *ngIf="item.badge && !collapsed()"
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    [class]="getBadgeClass(item.badgeVariant)"
                  >
                    {{ item.badge }}
                  </span>
                </a>

                <ng-template #buttonItem>
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-hover"
                    [class.justify-center]="collapsed()"
                    [class.opacity-50]="item.disabled"
                    [disabled]="item.disabled"
                    [attr.title]="collapsed() ? item.label : null"
                    (click)="onItemClick(item)"
                  >
                    <span *ngIf="item.icon" class="flex-shrink-0" [innerHTML]="item.icon"></span>
                    <span *ngIf="!collapsed()" class="flex-1 text-left">{{ item.label }}</span>
                    <span
                      *ngIf="item.badge && !collapsed()"
                      class="rounded-full px-2 py-0.5 text-xs font-medium"
                      [class]="getBadgeClass(item.badgeVariant)"
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
                    class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-hover"
                    [class.justify-center]="collapsed()"
                    [attr.title]="collapsed() ? item.label : null"
                    (click)="toggleExpand(item.id)"
                  >
                    <span *ngIf="item.icon" class="flex-shrink-0" [innerHTML]="item.icon"></span>
                    <span *ngIf="!collapsed()" class="flex-1 text-left">{{ item.label }}</span>
                    <svg
                      *ngIf="!collapsed()"
                      class="h-4 w-4 transition-transform"
                      [class.rotate-90]="isExpanded(item.id)"
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

                  <!-- Children -->
                  <ul
                    *ngIf="isExpanded(item.id) && !collapsed()"
                    class="ml-4 mt-1 space-y-1 border-l border-edge-subtle pl-4"
                  >
                    <li *ngFor="let child of item.children">
                      <a
                        *ngIf="child.route; else childButton"
                        [routerLink]="child.route | localizeLink"
                        routerLinkActive="text-primary-600 dark:text-primary-400"
                        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-content-secondary transition-colors hover:bg-surface-hover"
                        [class.opacity-50]="child.disabled"
                        [class.pointer-events-none]="child.disabled"
                      >
                        {{ child.label }}
                      </a>
                      <ng-template #childButton>
                        <button
                          type="button"
                          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-content-secondary transition-colors hover:bg-surface-hover"
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
          </ul>
        </ng-container>
      </nav>

      <!-- Footer -->
      <div class="border-t border-edge-subtle p-4">
        <ng-content select="[sidebarFooter]"></ng-content>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class SidebarComponent {
  @Input() sections: SidebarSection[] = [];
  @Input() variant: SidebarVariants['variant'] = 'default';
  @Input() collapsible = true;
  @Input() defaultCollapsed = false;
  @Input() customClass = '';

  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() itemClick = new EventEmitter<SidebarItem>();

  collapsed = signal(false);
  expandedItems = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.collapsed.set(this.defaultCollapsed);
  }

  get sidebarClass(): string {
    return sidebarVariants({ variant: this.variant, collapsed: this.collapsed() }) + ' ' + this.customClass;
  }

  toggleCollapse(): void {
    this.collapsed.update(v => !v);
    this.collapsedChange.emit(this.collapsed());
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

  onItemClick(item: SidebarItem): void {
    if (item.action) {
      item.action();
    }
    this.itemClick.emit(item);
  }

  getBadgeClass(variant?: string): string {
    const variants: Record<string, string> = {
      default: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
      primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
      success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return variants[variant || 'default'];
  }
}
