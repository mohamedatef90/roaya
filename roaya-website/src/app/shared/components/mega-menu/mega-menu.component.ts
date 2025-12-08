import { Component, Input, Output, EventEmitter, signal, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface MegaMenuItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconSvg?: string;
  route: string;
  badge?: string;
}

export interface MegaMenuGroup {
  title: string;
  items: MegaMenuItem[];
}

/**
 * Mega Menu Component
 * AWS-inspired dropdown mega menu for services navigation
 * Uses OnPush change detection for optimal performance
 */
@Component({
  selector: 'app-mega-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative"
      (mouseenter)="openMenu()"
      (mouseleave)="closeMenu()"
    >
      <!-- Trigger Button -->
      <button
        type="button"
        class="px-4 py-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-primary-500 dark:hover:text-secondary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all font-medium focus-ring flex items-center gap-1.5"
        [class.text-primary-500]="isOpen()"
        [class.dark:text-secondary-400]="isOpen()"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="menuId"
        aria-haspopup="true"
      >
        <span>{{ triggerLabel | translate }}</span>
        <svg
          class="h-4 w-4 transition-transform duration-300 ease-in-out"
          [class.rotate-180]="isOpen()"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Mega Menu Panel - Glassmorphism -->
      <div
        *ngIf="isOpen() || isClosing()"
        [id]="menuId"
        [class.menu-closing]="isClosing()"
        class="absolute top-full left-0 rtl:left-auto rtl:right-0 mt-2 w-[600px] max-w-[90vw] rounded-2xl shadow-2xl overflow-hidden mega-menu-dropdown glass-dropdown "
        role="menu"
        aria-orientation="vertical"
      >
        <!-- Menu Content -->
        <div class="p-6 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-t-[23px]">
          <div class="grid grid-cols-2 gap-4">
            <!-- Services Grid -->
            <a
              *ngFor="let item of items"
              [routerLink]="item.route"
              (click)="onItemClick(item)"
              class="group flex gap-4 p-4 rounded-xl hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/30 dark:hover:border-white/20"
              role="menuitem"
            >
              <!-- Icon -->
              <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white group-hover:scale-110 transition-transform overflow-hidden">
                <img *ngIf="item.iconSvg" [src]="item.iconSvg" [alt]="item.title | translate" class="w-8 h-8 object-contain brightness-0 invert" loading="lazy" />
                <span *ngIf="!item.iconSvg" class="text-xl" [innerHTML]="item.icon"></span>
              </div>
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h4 class="font-semibold text-neutral-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-secondary-400 transition-colors ">
                    {{ item.title | translate }}
                  </h4>
                  <span
                    *ngIf="item.badge"
                    class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full"
                  >
                    {{ item.badge }}
                  </span>
                </div>
                <p class="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1">
                  {{ item.description | translate }}
                </p>
              </div>
            </a>
          </div>
        </div>

        <!-- Footer CTA -->
        <div class="px-6 py-4 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm border-t border-white/30 dark:border-white/20 rounded-b-[23px]">
          <a
            [routerLink]="viewAllRoute"
            (click)="closeMenu()"
            class="inline-flex items-center gap-2 text-primary-500 dark:text-secondary-400 font-medium hover:underline"
          >
            <span>{{ viewAllLabel | translate }}</span>
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes menuOpen {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes menuClose {
      from {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      to {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }
    }

    .mega-menu-dropdown {
      animation: menuOpen 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transition: opacity 150ms cubic-bezier(0.4, 0, 1, 1), transform 150ms cubic-bezier(0.4, 0, 1, 1);
    }

    .mega-menu-dropdown.menu-closing {
      animation: menuClose 150ms cubic-bezier(0.4, 0, 1, 1) forwards;
    }

    /* Liquid Glass - iOS-inspired glassmorphism */
    .glass-dropdown {
      background: rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(20px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 25px;
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }

    :host-context(.dark) .glass-dropdown {
      background: rgba(255, 255, 255, 0.05) !important;
      backdrop-filter: blur(20px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
      border: 2px solid rgba(255, 255, 255, 0.15);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class MegaMenuComponent {
  @Input() triggerLabel = 'common.services';
  @Input() items: MegaMenuItem[] = [];
  @Input() viewAllRoute = '/services';
  @Input() viewAllLabel = 'megaMenu.viewAll';
  @Output() itemSelected = new EventEmitter<MegaMenuItem>();

  isOpen = signal(false);
  isClosing = signal(false);
  private closeTimeout: ReturnType<typeof setTimeout> | null = null;
  menuId = `mega-menu-${Math.random().toString(36).substr(2, 9)}`;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.getAttribute('aria-haspopup') === 'true') {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.isOpen() ? this.closeMenu() : this.openMenu();
      }
      if (event.key === 'ArrowDown' && !this.isOpen()) {
        event.preventDefault();
        this.openMenu();
      }
    }
  }

  openMenu(): void {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
    this.isClosing.set(false);
    this.isOpen.set(true);
  }

  closeMenu(): void {
    // Small delay to allow clicking on menu items
    this.closeTimeout = setTimeout(() => {
      if (this.isOpen()) {
        this.isClosing.set(true);
        // Wait for closing animation to complete before removing from DOM
        setTimeout(() => {
          this.isOpen.set(false);
          this.isClosing.set(false);
        }, 150); // Match animation duration
      }
    }, 100);
  }

  onItemClick(item: MegaMenuItem): void {
    this.itemSelected.emit(item);
    this.isClosing.set(true);
    // Wait for closing animation to complete
    setTimeout(() => {
      this.isOpen.set(false);
      this.isClosing.set(false);
    }, 150);
  }
}
