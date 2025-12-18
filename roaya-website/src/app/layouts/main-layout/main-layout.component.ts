import { Component, HostListener, signal, computed, inject, OnInit, OnDestroy, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { NavigationService } from '../../core/services/navigation.service';
import { LoadingService } from '../../core/services/loading.service';
import { ScrollSmootherService } from '../../core/services/scroll-smoother.service';
import { MegaMenuComponent, MegaMenuItem } from '../../shared/components/mega-menu/mega-menu.component';
import { ScrollIndicatorComponent } from '../../shared/components/scroll-indicator/scroll-indicator.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { CosmicLoaderComponent } from '../../shared/components/cosmic-loader/cosmic-loader.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, MegaMenuComponent, ScrollIndicatorComponent, ThemeToggleComponent, LanguageSelectorComponent, CosmicLoaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  // Inject services using modern inject() function
  readonly themeService = inject(ThemeService);
  readonly languageService = inject(LanguageService);
  readonly navigationService = inject(NavigationService);
  readonly loadingService = inject(LoadingService);
  private readonly scrollSmootherService = inject(ScrollSmootherService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  // Content entrance animation gate
  contentEntered = false;

  // Scroll state signal
  isScrolled = signal<boolean>(false);
  private scrollThreshold = 50; // Threshold for navbar background change

  // Mobile menu expandable sections state
  private mobileServicesOpen = signal<boolean>(false);
  private mobileIndustriesOpen = signal<boolean>(false);

  // Computed signals for mobile menu expandable sections
  isMobileServicesOpen = computed(() => this.mobileServicesOpen());
  isMobileIndustriesOpen = computed(() => this.mobileIndustriesOpen());

  // News bar height (when navbar should stick to top)
  private newsBarHeight = 38;

  // Computed signals for template
  headerClass = computed(() =>
    this.isScrolled() ? 'header-scrolled' : 'header-default'
  );

  // Computed signal for header positioning (sticky behavior)
  headerPosition = computed(() =>
    this.isScrolled() ? 'header-sticky' : 'header-below-news'
  );

  isRTL = computed(() => this.languageService.isRTL());
  isMobileMenuOpen = computed(() => this.navigationService.mobileMenuOpen());

  // Mega menu items for all 8 services (with SVG icons)
  megaMenuItems: MegaMenuItem[] = [
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

  // Resources menu items (with outline SVG icons like services)
  resourcesMenuItems: MegaMenuItem[] = [
    {
      id: 'blog',
      title: 'resources.types.blog.title',
      description: 'resources.types.blog.description',
      icon: '&#9998;',
      iconSvg: '/assets/images/icons/resources/blog.svg',
      route: '/resources/blog'
    },
    {
      id: 'case-studies',
      title: 'resources.types.caseStudies.title',
      description: 'resources.types.caseStudies.description',
      icon: '&#128202;',
      iconSvg: '/assets/images/icons/resources/case-studies.svg',
      route: '/resources/case-studies'
    },
    {
      id: 'whitepapers',
      title: 'resources.types.whitepapers.title',
      description: 'resources.types.whitepapers.description',
      icon: '&#128196;',
      iconSvg: '/assets/images/icons/resources/whitepapers.svg',
      route: '/resources/whitepapers'
    },
    {
      id: 'documentation',
      title: 'resources.types.documentation.title',
      description: 'resources.types.documentation.description',
      icon: '&#128214;',
      iconSvg: '/assets/images/icons/resources/documentation.svg',
      route: '/resources/documentation'
    }
  ];

  // Mega menu items for all 6 industries (with SVG icons)
  industryMenuItems: MegaMenuItem[] = [
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

  private navigationSub?: Subscription;
  private navigationStartTime = 0;
  private readonly minimumLoaderDuration = 6000;
  private loaderShownOnce = false;

  ngOnInit(): void {
    // Check initial scroll position
    this.checkScroll();
    this.initializeLoader();
  }

  ngAfterViewInit(): void {
    // Ensure loader is visible on first paint
    this.showInitialLoader();
  }

  ngOnDestroy(): void {
    // Close mobile menu when component is destroyed
    this.navigationService.closeMobileMenu();
    this.navigationSub?.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScroll();
  }

  @HostListener('window:keydown.escape', [])
  onEscapeKey(): void {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  private checkScroll(): void {
    if (typeof window !== 'undefined') {
      // Use ScrollSmoother's scroll position if available, otherwise fallback to window
      const scrollY = this.scrollSmootherService.isReady()
        ? this.scrollSmootherService.scrollTop()
        : window.scrollY;
      this.isScrolled.set(scrollY > this.scrollThreshold);
    }
  }

  private initializeLoader(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.navigationSub = this.router.events.subscribe(event => {
      if (this.loaderShownOnce) {
        return;
      }

      if (event instanceof NavigationStart) {
        this.navigationStartTime = performance.now();
        this.loadingService.showLoading();
      }

      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        const elapsed = performance.now() - this.navigationStartTime;
        const remaining = Math.max(0, this.minimumLoaderDuration - elapsed);
        window.setTimeout(() => {
          this.loadingService.hideLoading();
          this.loaderShownOnce = true;
          this.contentEntered = true;
        }, remaining);
      }
    });
  }

  private showInitialLoader(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Prevent double-run if already shown via navigation events
    if (this.loaderShownOnce) {
      return;
    }

    this.navigationStartTime = performance.now();
    this.loadingService.showLoading();
    window.setTimeout(() => {
      this.loadingService.hideLoading();
      this.loaderShownOnce = true;
      this.contentEntered = true;
    }, this.minimumLoaderDuration);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }

  toggleMobileMenu(): void {
    this.navigationService.toggleMobileMenu();
  }

  closeMobileMenu(): void {
    this.navigationService.closeMobileMenu();
    // Reset expandable sections when closing menu
    this.mobileServicesOpen.set(false);
    this.mobileIndustriesOpen.set(false);
  }

  toggleMobileServices(): void {
    this.mobileServicesOpen.update(state => !state);
  }

  toggleMobileIndustries(): void {
    this.mobileIndustriesOpen.update(state => !state);
  }

  onBackdropClick(event: MouseEvent): void {
    // Close menu when clicking the backdrop
    if ((event.target as HTMLElement).classList.contains('mobile-drawer-backdrop')) {
      this.closeMobileMenu();
    }
  }

  // Get current year for footer
  get currentYear(): number {
    return new Date().getFullYear();
  }
}
