import { Component, Input, Output, EventEmitter, signal, HostListener, ChangeDetectionStrategy, Renderer2, OnDestroy, Inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  faSolidCrosshairs,
  faSolidInfinity,
  faSolidBuildingColumns,
  faSolidHospital,
  faSolidLandmarkDome,
  faSolidIndustry,
  faSolidCartShopping,
  faSolidGraduationCap,
  // Services icons
  faSolidCloud,
  faSolidDatabase,
  faSolidGears,
  faSolidEnvelope,
  faSolidHardDrive,
  faSolidShieldHalved,
  faSolidRobot,
  faSolidLightbulb,
  faSolidEye,
  faSolidUserShield,
  faSolidMicrochip,
  // Resources icons
  faSolidNewspaper,
  faSolidFolderOpen,
  faSolidFileLines,
  faSolidBook
} from '@ng-icons/font-awesome/solid';
import { gsap } from 'gsap';

export interface MegaMenuItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconSvg?: string;
  faIcon?: string; // Font Awesome icon name (e.g., 'faCrosshairs')
  logoImage?: string; // Full-color logo (not inverted)
  backgroundImage?: string; // Background image for featured cards
  route: string;
  badge?: string;
  isFeatured?: boolean; // Display as featured card on right side
  children?: MegaMenuItem[]; // Sub-menu items for nested navigation
}

export interface MegaMenuGroup {
  title: string;
  items: MegaMenuItem[];
}

/**
 * Mega Menu Component
 * AWS-inspired dropdown mega menu for services navigation
 * Uses OnPush change detection for optimal performance
 * GSAP-powered animations for smooth expand/collapse
 */
@Component({
  selector: 'app-mega-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIconComponent],
  viewProviders: [provideIcons({
    faSolidCrosshairs,
    faSolidInfinity,
    faSolidBuildingColumns,
    faSolidHospital,
    faSolidLandmarkDome,
    faSolidIndustry,
    faSolidCartShopping,
    faSolidGraduationCap,
    faSolidCloud,
    faSolidDatabase,
    faSolidGears,
    faSolidEnvelope,
    faSolidHardDrive,
    faSolidShieldHalved,
    faSolidRobot,
    faSolidLightbulb,
    faSolidEye,
    faSolidUserShield,
    faSolidMicrochip,
    faSolidNewspaper,
    faSolidFolderOpen,
    faSolidFileLines,
    faSolidBook
  })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative z-50"
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
        #menuPanel
        *ngIf="isOpen() || isClosing()"
        [id]="menuId"
        class="mega-menu-container absolute top-full left-0 rtl:left-auto rtl:right-0 mt-2 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm"
        [style.width]="getMenuWidth()"
        [style.max-width]="'95vw'"
        role="menu"
        aria-orientation="vertical"
      >
        <!-- Menu Content -->
        <div class="p-6 bg-white/90 dark:bg-neutral-900/90 rounded-t-[23px]">
          <div class="flex gap-6">
            <!-- Column 1: First 5 services -->
            <div class="w-56 flex-shrink-0">
              <div class="space-y-1">
                <div
                  *ngFor="let item of getFirstColumnItems()"
                  (mouseenter)="hasChildren(item) ? showNestedMenu(item.id) : null"
                  (mouseleave)="hasChildren(item) ? hideNestedMenu() : null"
                >
                  <a
                    [routerLink]="item.route"
                    (click)="onItemClick(item)"
                    class="group flex gap-3 p-3 rounded-xl hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/30 dark:hover:border-white/20"
                    [class.bg-white/90]="activeNestedParent() === item.id"
                    [class.dark:bg-white/10]="activeNestedParent() === item.id"
                    role="menuitem"
                  >
                    <!-- Icon -->
                    <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden"
                         [ngClass]="item.logoImage ? 'bg-white/90 dark:bg-white/95 p-1.5' : 'bg-gradient-primary text-white'">
                      <img *ngIf="item.logoImage" [src]="item.logoImage" [alt]="item.title | translate" class="w-full h-full object-contain" loading="lazy" />
                      <ng-icon *ngIf="item.faIcon && !item.logoImage" [name]="item.faIcon" class="text-xl" />
                      <img *ngIf="item.iconSvg && !item.logoImage && !item.faIcon" [src]="item.iconSvg" [alt]="item.title | translate" class="w-6 h-6 object-contain brightness-0 invert" loading="lazy" />
                      <span *ngIf="!item.iconSvg && !item.logoImage && !item.faIcon" class="text-lg" [innerHTML]="item.icon"></span>
                    </div>
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-1.5">
                        <h4 class="font-semibold text-sm text-neutral-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-secondary-400 transition-colors">
                          {{ item.title | translate }}
                        </h4>
                        <span
                          *ngIf="item.badge"
                          class="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full whitespace-nowrap"
                        >
                          {{ item.badge }}
                        </span>
                        <!-- Chevron for items with children -->
                        <svg
                          *ngIf="hasChildren(item)"
                          class="w-3.5 h-3.5 text-neutral-400 ml-auto rtl:rotate-180 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <p class="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 mt-0.5">
                        {{ item.description | translate }}
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <!-- Column 2: Next 5 services -->
            <div class="w-56 flex-shrink-0 border-l rtl:border-l-0 rtl:border-r border-white/20 dark:border-white/10 pl-6 rtl:pl-0 rtl:pr-6">
              <div class="space-y-1">
                <div
                  *ngFor="let item of getSecondColumnItems()"
                  (mouseenter)="hasChildren(item) ? showNestedMenu(item.id) : null"
                  (mouseleave)="hasChildren(item) ? hideNestedMenu() : null"
                >
                  <a
                    [routerLink]="item.route"
                    (click)="onItemClick(item)"
                    class="group flex gap-3 p-3 rounded-xl hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/30 dark:hover:border-white/20"
                    [class.bg-white/90]="activeNestedParent() === item.id"
                    [class.dark:bg-white/10]="activeNestedParent() === item.id"
                    role="menuitem"
                  >
                    <!-- Icon -->
                    <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden"
                         [ngClass]="item.logoImage ? 'bg-white/90 dark:bg-white/95 p-1.5' : 'bg-gradient-primary text-white'">
                      <img *ngIf="item.logoImage" [src]="item.logoImage" [alt]="item.title | translate" class="w-full h-full object-contain" loading="lazy" />
                      <ng-icon *ngIf="item.faIcon && !item.logoImage" [name]="item.faIcon" class="text-xl" />
                      <img *ngIf="item.iconSvg && !item.logoImage && !item.faIcon" [src]="item.iconSvg" [alt]="item.title | translate" class="w-6 h-6 object-contain brightness-0 invert" loading="lazy" />
                      <span *ngIf="!item.iconSvg && !item.logoImage && !item.faIcon" class="text-lg" [innerHTML]="item.icon"></span>
                    </div>
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-1.5">
                        <h4 class="font-semibold text-sm text-neutral-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-secondary-400 transition-colors">
                          {{ item.title | translate }}
                        </h4>
                        <span
                          *ngIf="item.badge"
                          class="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full whitespace-nowrap"
                        >
                          {{ item.badge }}
                        </span>
                        <!-- Chevron for items with children -->
                        <svg
                          *ngIf="hasChildren(item)"
                          class="w-3.5 h-3.5 text-neutral-400 ml-auto rtl:rotate-180 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <p class="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 mt-0.5">
                        {{ item.description | translate }}
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <!-- Nested Column (expands on hover for items with children like Security) -->
            <div
              #nestedColumn
              *ngIf="getActiveNestedItem() as nestedItem"
              (mouseenter)="cancelHideNested()"
              (mouseleave)="hideNestedMenu()"
              class="w-64 flex-shrink-0 nested-column border-l rtl:border-l-0 rtl:border-r border-white/20 dark:border-white/10 pl-6 rtl:pl-0 rtl:pr-6"
            >
              <!-- Parent Service Link -->
              <a
                [routerLink]="nestedItem.route"
                (click)="onItemClick(nestedItem)"
                class="group flex items-center gap-3 px-3 py-2.5 mb-3 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 dark:from-primary-500/20 dark:to-secondary-500/20 hover:from-primary-500/20 hover:to-secondary-500/20 transition-all"
                role="menuitem"
              >
                <svg class="w-4 h-4 text-primary-500 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span class="font-semibold text-sm text-neutral-900 dark:text-white">{{ nestedItem.title | translate }} {{ 'megaMenu.overview' | translate }}</span>
              </a>

              <!-- Child Services -->
              <div class="space-y-1">
                <a
                  *ngFor="let child of nestedItem.children"
                  [routerLink]="child.route"
                  (click)="onItemClick(child)"
                  class="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-200"
                  role="menuitem"
                >
                  <!-- Icon -->
                  <div class="flex-shrink-0 w-8 h-8 rounded-md bg-gradient-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ng-icon *ngIf="child.faIcon" [name]="child.faIcon" class="text-base" />
                    <img *ngIf="child.iconSvg && !child.faIcon" [src]="child.iconSvg" [alt]="child.title | translate" class="w-4 h-4 object-contain brightness-0 invert" loading="lazy" />
                    <span *ngIf="!child.iconSvg && !child.faIcon" class="text-sm" [innerHTML]="child.icon"></span>
                  </div>
                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      <h5 class="font-semibold text-xs text-neutral-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-secondary-400 transition-colors">
                        {{ child.title | translate }}
                      </h5>
                      <span
                        *ngIf="child.badge"
                        class="px-1 py-0.5 text-[9px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full"
                      >
                        {{ child.badge }}
                      </span>
                    </div>
                    <p class="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                      {{ child.description | translate }}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            <!-- Right: Featured Card -->
            <div *ngIf="getFeaturedItem() as featured" class="w-[200px] flex-shrink-0">
              <a
                [routerLink]="featured.route"
                (click)="onItemClick(featured)"
                class="group relative block h-full rounded-2xl overflow-hidden"
                role="menuitem"
              >
                <!-- Background Image (if provided) -->
                <div
                  *ngIf="featured.backgroundImage"
                  class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  [style.backgroundImage]="'url(' + featured.backgroundImage + ')'"
                ></div>

                <!-- Background Gradient - Use brand gradient for industries, green for WorldPosta -->
                <div class="absolute inset-0" [ngClass]="featured.logoImage
                  ? (featured.backgroundImage ? 'bg-gradient-to-br from-[#4a7a2e]/90 via-[#3d6626]/85 to-[#293C51]/95' : 'bg-gradient-to-br from-[#4a7a2e] via-[#3d6626] to-[#293C51]')
                  : 'bg-gradient-to-br from-[#3D5A80] via-[#5DB7C2] to-[#6B4C9A]'"></div>

                <!-- Pattern Overlay -->
                <div class="absolute inset-0 opacity-10">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                  <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <!-- Content -->
                <div class="relative h-full p-5 flex flex-col text-white">
                  <!-- Badge -->
                  <span *ngIf="featured.badge" class="self-start px-2.5 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-full mb-4">
                    {{ featured.badge }}
                  </span>

                  <!-- Logo (for partners like WorldPosta) -->
                  <div *ngIf="featured.logoImage" class="w-full h-14 mb-4 bg-white rounded-xl flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                    <img [src]="featured.logoImage" [alt]="featured.title | translate" class="h-full w-auto object-contain" loading="lazy" />
                  </div>

                  <!-- Icon (for industries with faIcon) -->
                  <div *ngIf="featured.faIcon && !featured.logoImage" class="w-14 h-14 mb-4 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ng-icon [name]="featured.faIcon" class="text-3xl text-white" />
                  </div>

                  <!-- Title -->
                  <h4 class="text-lg font-bold mb-2">
                    {{ featured.title | translate }}
                  </h4>

                  <!-- Description -->
                  <p class="text-sm text-white/80 leading-relaxed flex-grow">
                    {{ featured.description | translate }}
                  </p>

                  <!-- CTA -->
                  <div class="mt-4 flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                    <span>{{ 'megaMenu.learnMore' | translate }}</span>
                    <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            </div>
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
    /* Initial hidden state for menu panel (GSAP will animate) */
    .mega-menu-container {
      opacity: 0;
      transform: scale(0.98) translateY(-8px);
      transform-origin: top center;
      will-change: transform, opacity;
    }

    /* Initial hidden state for nested column (GSAP will animate) */
    .nested-column {
      opacity: 0;
      transform: translateX(10px);
      will-change: transform, opacity;
    }

    :host-context([dir="rtl"]) .nested-column {
      transform: translateX(-10px);
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

    /* Disable will-change for reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .mega-menu-container,
      .nested-column {
        will-change: auto;
      }
    }

    /* Mobile/Tablet optimizations */
    @media (max-width: 1024px) {
      .mega-menu-container {
        max-width: 95vw !important;
      }

      /* Hide nested column on smaller screens - keep it simple */
      .nested-column {
        display: none;
      }
    }

    /* Ensure grid items don't overflow */
    @media (max-width: 640px) {
      .mega-menu-container {
        max-width: 98vw !important;
      }
    }
  `]
})
export class MegaMenuComponent implements AfterViewInit, OnDestroy {
  @Input() triggerLabel = 'common.services';
  @Input() items: MegaMenuItem[] = [];
  @Input() viewAllRoute = '/services';
  @Input() viewAllLabel = 'megaMenu.viewAll';
  @Output() itemSelected = new EventEmitter<MegaMenuItem>();

  @ViewChild('menuPanel') menuPanel?: ElementRef<HTMLDivElement>;
  @ViewChild('nestedColumn') nestedColumn?: ElementRef<HTMLDivElement>;

  isOpen = signal(false);
  isClosing = signal(false);
  activeNestedParent = signal<string | null>(null); // Track which item's nested menu is active
  private closeTimeout: ReturnType<typeof setTimeout> | null = null;
  private nestedCloseTimeout: ReturnType<typeof setTimeout> | null = null;
  private prefersReducedMotion = false;
  private menuTimeline?: gsap.core.Timeline;
  private widthTween?: gsap.core.Tween;
  menuId = `mega-menu-${Math.random().toString(36).substr(2, 9)}`;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngAfterViewInit(): void {
    // Check reduced motion preference (ACCESSIBILITY)
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

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
    this.setBodyBlur(true);

    // Animate menu open with GSAP
    setTimeout(() => {
      if (this.menuPanel && !this.prefersReducedMotion) {
        this.animateMenuOpen();
      }
    }, 0);
  }

  closeMenu(): void {
    // Small delay to allow clicking on menu items
    this.closeTimeout = setTimeout(() => {
      if (this.isOpen()) {
        this.isClosing.set(true);

        // Animate menu close with GSAP
        if (this.menuPanel && !this.prefersReducedMotion) {
          this.animateMenuClose();
        } else {
          // Fallback without animation
          setTimeout(() => {
            this.isOpen.set(false);
            this.isClosing.set(false);
            this.setBodyBlur(false);
          }, 200);
        }
      }
    }, 100);
  }

  onItemClick(item: MegaMenuItem): void {
    this.itemSelected.emit(item);
    this.isClosing.set(true);

    // Animate menu close on item click
    if (this.menuPanel && !this.prefersReducedMotion) {
      this.animateMenuClose();
    } else {
      // Fallback without animation
      setTimeout(() => {
        this.isOpen.set(false);
        this.isClosing.set(false);
        this.setBodyBlur(false);
      }, 200);
    }
  }

  ngOnDestroy(): void {
    // Clean up: remove blur class if component is destroyed while menu is open
    this.setBodyBlur(false);
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
    if (this.nestedCloseTimeout) {
      clearTimeout(this.nestedCloseTimeout);
    }
    // Kill GSAP animations
    if (this.menuTimeline) {
      this.menuTimeline.kill();
    }
    if (this.widthTween) {
      this.widthTween.kill();
    }
  }

  // Check if item has children
  hasChildren(item: MegaMenuItem): boolean {
    return !!item.children && item.children.length > 0;
  }

  // Show nested menu on hover
  showNestedMenu(itemId: string): void {
    if (this.nestedCloseTimeout) {
      clearTimeout(this.nestedCloseTimeout);
      this.nestedCloseTimeout = null;
    }
    this.activeNestedParent.set(itemId);

    // Animate nested column appearance and expand menu width
    setTimeout(() => {
      if (!this.prefersReducedMotion) {
        this.animateNestedColumn();
        this.animateWidthExpansion();
      }
    }, 0);
  }

  // Hide nested menu with delay
  hideNestedMenu(): void {
    this.nestedCloseTimeout = setTimeout(() => {
      // Animate menu width contraction before hiding nested column
      if (!this.prefersReducedMotion) {
        this.animateWidthContraction();
      }
      this.activeNestedParent.set(null);
    }, 100); // 100ms delay before closing (faster response)
  }

  // Cancel hide if user moves back to nested menu
  cancelHideNested(): void {
    if (this.nestedCloseTimeout) {
      clearTimeout(this.nestedCloseTimeout);
      this.nestedCloseTimeout = null;
    }
  }

  private setBodyBlur(active: boolean): void {
    const body = this.document.body;
    if (active) {
      this.renderer.addClass(body, 'mega-menu-open');
    } else {
      this.renderer.removeClass(body, 'mega-menu-open');
    }
  }

  getFeaturedItem(): MegaMenuItem | undefined {
    return this.items.find(item => item.isFeatured);
  }

  // Get regular items excluding featured (Security included for hover-expand)
  getRegularItems(): MegaMenuItem[] {
    return this.items.filter(item => !item.isFeatured);
  }

  // Get items for column 1 (dynamic split for balanced columns)
  getFirstColumnItems(): MegaMenuItem[] {
    const items = this.getRegularItems();
    const splitAt = Math.ceil(items.length / 2); // Ceiling to put more in first column
    return items.slice(0, splitAt);
  }

  // Get items for column 2 (remaining items)
  getSecondColumnItems(): MegaMenuItem[] {
    const items = this.getRegularItems();
    const splitAt = Math.ceil(items.length / 2);
    return items.slice(splitAt);
  }

  // Get static menu width (2 columns + featured, nested column expands on hover)
  getMenuWidth(): string {
    const col1Width = 224; // w-56 = 14rem = 224px
    const col2Width = 224; // w-56 = 14rem = 224px
    const featuredWidth = 200; // Featured card width
    const gap = 24; // gap-6 = 1.5rem = 24px
    const padding = 48; // p-6 on both sides = 24 * 2

    // 2 columns + gaps + padding
    let totalWidth = col1Width + col2Width + gap + padding;

    // Add featured card width if present
    if (this.getFeaturedItem()) {
      totalWidth += featuredWidth + gap;
    }

    return `${totalWidth}px`;
  }

  // Get the active nested item data (kept for backwards compatibility)
  getActiveNestedItem(): MegaMenuItem | undefined {
    const parentId = this.activeNestedParent();
    if (!parentId) return undefined;
    return this.getRegularItems().find(item => item.id === parentId);
  }

  // ========================================
  // GSAP Animation Methods
  // ========================================

  /**
   * Animate menu panel opening with smooth spring-like easing
   * Uses GSAP for better control and smoother transitions
   */
  private animateMenuOpen(): void {
    if (!this.menuPanel) return;

    const element = this.menuPanel.nativeElement;

    // Kill any existing timeline
    if (this.menuTimeline) {
      this.menuTimeline.kill();
    }

    // Create timeline with spring-like easing
    this.menuTimeline = gsap.timeline({
      defaults: { ease: 'power2.out' }
    });

    this.menuTimeline
      .to(element, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.35,
        ease: 'back.out(1.2)', // Spring-like overshoot (1.2 = subtle strength)
      });
  }

  /**
   * Animate menu panel closing with smooth easing
   */
  private animateMenuClose(): void {
    if (!this.menuPanel) return;

    const element = this.menuPanel.nativeElement;

    // Kill any existing timeline
    if (this.menuTimeline) {
      this.menuTimeline.kill();
    }

    this.menuTimeline = gsap.timeline({
      onComplete: () => {
        this.isOpen.set(false);
        this.isClosing.set(false);
        this.setBodyBlur(false);
      }
    });

    this.menuTimeline.to(element, {
      opacity: 0,
      scale: 0.98,
      y: -8,
      duration: 0.25,
      ease: 'power2.in'
    });
  }

  /**
   * Animate nested column sliding in from right (or left in RTL)
   */
  private animateNestedColumn(): void {
    if (!this.nestedColumn) return;

    const element = this.nestedColumn.nativeElement;
    const isRTL = this.document.documentElement.dir === 'rtl';

    gsap.fromTo(element,
      {
        opacity: 0,
        x: isRTL ? -15 : 15, // Slide from left in RTL, right in LTR
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.25,
        ease: 'power2.out'
      }
    );
  }

  /**
   * Animate menu width expansion when nested column appears
   */
  private animateWidthExpansion(): void {
    if (!this.menuPanel) return;

    const element = this.menuPanel.nativeElement;
    const col1Width = 224;
    const col2Width = 224;
    const featuredWidth = 200;
    const nestedWidth = 256; // w-64 for nested column
    const gap = 24;
    const padding = 48;

    // Base width: 2 columns + padding
    let baseWidth = col1Width + col2Width + gap + padding;
    if (this.getFeaturedItem()) {
      baseWidth += featuredWidth + gap;
    }

    const expandedWidth = baseWidth + nestedWidth + gap;

    // Kill any existing width tween
    if (this.widthTween) {
      this.widthTween.kill();
    }

    this.widthTween = gsap.to(element, {
      width: `${expandedWidth}px`,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  /**
   * Animate menu width contraction when nested column disappears
   */
  private animateWidthContraction(): void {
    if (!this.menuPanel) return;

    const element = this.menuPanel.nativeElement;
    const col1Width = 224;
    const col2Width = 224;
    const featuredWidth = 200;
    const gap = 24;
    const padding = 48;

    // Base width: 2 columns + padding
    let baseWidth = col1Width + col2Width + gap + padding;
    if (this.getFeaturedItem()) {
      baseWidth += featuredWidth + gap;
    }

    // Kill any existing width tween
    if (this.widthTween) {
      this.widthTween.kill();
    }

    this.widthTween = gsap.to(element, {
      width: `${baseWidth}px`,
      duration: 0.25,
      ease: 'power2.out'
    });
  }
}
