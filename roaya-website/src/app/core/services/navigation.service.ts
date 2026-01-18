import { Injectable, signal, inject, DestroyRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScrollSmootherService } from './scroll-smoother.service';

export interface NavItem {
  label: string;
  route: string;
  icon?: string;
  hasMegaMenu?: boolean;
  children?: NavItem[];
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconSvg: string; // Path to SVG icon
  route: string;
  badge?: string;
}

export interface IndustryItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconSvg: string; // Path to SVG icon
  route: string;
}

/**
 * Navigation Service
 * Manages navigation state and mobile menu
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollSmootherService = inject(ScrollSmootherService);

  // Signal for mobile menu state
  mobileMenuOpen = signal<boolean>(false);

  // Signal for current route
  currentRoute = signal<string>('');

  // Main navigation items (Services is handled by mega menu in header)
  navItems: NavItem[] = [
    { label: 'common.home', route: '/' },
    { label: 'common.industries', route: '/industries' },
    { label: 'common.resources', route: '/resources' },
    { label: 'common.about', route: '/about' },
    { label: 'common.contact', route: '/contact' }
  ];

  // Services for mega menu - All 8 services
  serviceItems: ServiceItem[] = [
    {
      id: 'cloud',
      title: 'services.cloud.title',
      description: 'services.cloud.description',
      icon: '&#9729;',
      iconSvg: '/assets/images/icons/services/cloud.svg',
      route: '/services/cloud'
    },
    {
      id: 'security',
      title: 'services.security.title',
      description: 'services.security.description',
      icon: '&#128274;',
      iconSvg: '/assets/images/icons/services/security.svg',
      route: '/services/security'
    },
    {
      id: 'email',
      title: 'services.email.title',
      description: 'services.email.description',
      icon: '&#9993;',
      iconSvg: '/assets/images/icons/services/email.svg',
      route: '/services/email'
    },
    {
      id: 'managed',
      title: 'services.managed.title',
      description: 'services.managed.description',
      icon: '&#9881;',
      iconSvg: '/assets/images/icons/services/managed.svg',
      route: '/services/managed'
    },
    {
      id: 'backup',
      title: 'services.backup.title',
      description: 'services.backup.description',
      icon: '&#128190;',
      iconSvg: '/assets/images/icons/services/backup.svg',
      route: '/services/backup'
    },
    {
      id: 'consulting',
      title: 'services.consulting.title',
      description: 'services.consulting.description',
      icon: '&#128161;',
      iconSvg: '/assets/images/icons/services/consulting.svg',
      route: '/services/consulting'
    },
    {
      id: 'sap',
      title: 'services.sap.title',
      description: 'services.sap.description',
      icon: '&#128200;',
      iconSvg: '/assets/images/icons/services/sap.svg',
      route: '/services/sap',
      badge: 'New'
    },
    {
      id: 'automation',
      title: 'services.automation.title',
      description: 'services.automation.description',
      icon: '&#9889;',
      iconSvg: '/assets/images/icons/services/automation.svg',
      route: '/services/automation',
      badge: 'New'
    }
  ];

  // Industries for mega menu - All 6 industries
  industryItems: IndustryItem[] = [
    {
      id: 'finance',
      title: 'industries.finance.title',
      description: 'industries.finance.description',
      icon: '🏦',
      iconSvg: '/assets/images/icons/industries/finance.svg',
      route: '/industries/finance'
    },
    {
      id: 'healthcare',
      title: 'industries.healthcare.title',
      description: 'industries.healthcare.description',
      icon: '🏥',
      iconSvg: '/assets/images/icons/industries/healthcare.svg',
      route: '/industries/healthcare'
    },
    {
      id: 'government',
      title: 'industries.government.title',
      description: 'industries.government.description',
      icon: '🏛️',
      iconSvg: '/assets/images/icons/industries/government.svg',
      route: '/industries/government'
    },
    {
      id: 'manufacturing',
      title: 'industries.manufacturing.title',
      description: 'industries.manufacturing.description',
      icon: '🏭',
      iconSvg: '/assets/images/icons/industries/manufacturing.svg',
      route: '/industries/manufacturing'
    },
    {
      id: 'retail',
      title: 'industries.retail.title',
      description: 'industries.retail.description',
      icon: '🛒',
      iconSvg: '/assets/images/icons/industries/retail.svg',
      route: '/industries/retail'
    },
    {
      id: 'education',
      title: 'industries.education.title',
      description: 'industries.education.description',
      icon: '🎓',
      iconSvg: '/assets/images/icons/industries/education.svg',
      route: '/industries/education'
    }
  ];

  constructor() {
    // Track current route with proper cleanup to prevent memory leak
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (event: NavigationEnd) => {
        this.currentRoute.set(event.urlAfterRedirects);
        // Close mobile menu on navigation
        this.closeMobileMenu();
        // Reset scroll position to top for GSAP ScrollSmoother
        this.resetScrollPosition();
      },
      error: (error) => {
        console.error('Navigation error:', error);
      }
    });
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(state => !state);
  }

  /**
   * Open mobile menu
   */
  openMobileMenu(): void {
    this.mobileMenuOpen.set(true);
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  /**
   * Reset scroll position to top
   * Handles both native scroll and GSAP ScrollSmoother
   */
  private resetScrollPosition(): void {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Reset GSAP ScrollSmoother if initialized
      if (this.scrollSmootherService.isReady()) {
        this.scrollSmootherService.scrollTo(0, false);
      }
      // Also reset native scroll as fallback
      window.scrollTo(0, 0);
    });
  }

  /**
   * Navigate to route
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * Check if route is active
   */
  isActive(route: string): boolean {
    return this.currentRoute() === route;
  }

  /**
   * Get navigation items
   */
  getNavItems(): NavItem[] {
    return this.navItems;
  }

  /**
   * Get service items for mega menu
   */
  getServiceItems(): ServiceItem[] {
    return this.serviceItems;
  }

  /**
   * Get industry items for mega menu
   */
  getIndustryItems(): IndustryItem[] {
    return this.industryItems;
  }
}
