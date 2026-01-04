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
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

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
  isHomeRoute = true;
  scrollProgress = 0;

  // Scroll state signal
  isScrolled = signal<boolean>(false);
  private scrollThreshold = 50; // Threshold for navbar background change
  private scrollSub?: Subscription; // RxJS subscription for throttled scroll events

  // Mobile menu expandable sections state
  private mobileServicesOpen = signal<boolean>(false);
  private mobileIndustriesOpen = signal<boolean>(false);
  private mobileSecurityOpen = signal<boolean>(false);

  // Computed signals for mobile menu expandable sections
  isMobileServicesOpen = computed(() => this.mobileServicesOpen());
  isMobileIndustriesOpen = computed(() => this.mobileIndustriesOpen());
  isMobileSecurityOpen = computed(() => this.mobileSecurityOpen());

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

  // Mega menu items for all services (with Font Awesome icons)
  // Order: Left column (1-5), Right column (6-10), Featured (WorldPosta)
  megaMenuItems: MegaMenuItem[] = [
    // === LEFT COLUMN ===
    {
      id: 'cloud',
      title: 'services.cloud.title',
      description: 'services.cloud.description',
      icon: '&#9729;',
      faIcon: 'faSolidCloud',
      route: '/services/cloud'
    },
    {
      id: 'sap',
      title: 'services.sap.title',
      description: 'services.sap.description',
      icon: '&#128200;',
      faIcon: 'faSolidDatabase',
      route: '/services/sap',
      badge: 'New'
    },
    {
      id: 'ai',
      title: 'services.ai.title',
      description: 'services.ai.description',
      icon: '&#129302;',
      faIcon: 'faSolidBrain',
      route: '/services/ai',
      badge: 'New'
    },
    {
      id: 'managed',
      title: 'services.managed.title',
      description: 'services.managed.description',
      icon: '&#9881;',
      faIcon: 'faSolidGears',
      route: '/services/managed'
    },
    {
      id: 'devops',
      title: 'services.devops.title',
      description: 'services.devops.description',
      icon: '&#128736;',
      faIcon: 'faSolidInfinity',
      route: '/services/devops',
      badge: 'New'
    },
    // === RIGHT COLUMN ===
    {
      id: 'security',
      title: 'services.security.title',
      description: 'services.security.description',
      icon: '&#128274;',
      faIcon: 'faSolidShieldHalved',
      route: '/services/security',
      children: [
        {
          id: 'penetration-testing',
          title: 'services.security.page.penetrationTesting.title',
          description: 'services.security.page.penetrationTesting.hero.subtitle',
          icon: '&#128737;',
          faIcon: 'faSolidCrosshairs',
          route: '/services/security/penetration-testing',
          badge: 'New'
        },
        {
          id: 'soc-solutions',
          title: 'services.security.page.socSolutions.title',
          description: 'services.security.page.socSolutions.hero.subtitle',
          icon: '&#128065;',
          faIcon: 'faSolidEye',
          route: '/services/security/soc-solutions',
          badge: 'New'
        },
        {
          id: 'incident-response',
          title: 'services.security.page.incidentResponse.title',
          description: 'services.security.page.incidentResponse.hero.subtitle',
          icon: '&#128737;',
          faIcon: 'faSolidUserShield',
          route: '/services/security/incident-response',
          badge: 'New'
        }
      ]
    },
    {
      id: 'email',
      title: 'services.email.title',
      description: 'services.email.description',
      icon: '&#9993;',
      faIcon: 'faSolidEnvelope',
      route: '/services/email'
    },
    {
      id: 'backup',
      title: 'services.backup.title',
      description: 'services.backup.description',
      icon: '&#128190;',
      faIcon: 'faSolidHardDrive',
      route: '/services/backup'
    },
    {
      id: 'automation',
      title: 'services.automation.title',
      description: 'services.automation.description',
      icon: '&#9889;',
      faIcon: 'faSolidRobot',
      route: '/services/automation',
      badge: 'New'
    },
    {
      id: 'consulting',
      title: 'services.consulting.title',
      description: 'services.consulting.description',
      icon: '&#128161;',
      faIcon: 'faSolidLightbulb',
      route: '/services/consulting'
    },
    // === FEATURED (Right side card) ===
    {
      id: 'worldposta',
      title: 'services.worldposta.title',
      description: 'services.worldposta.description',
      icon: '&#128231;',
      logoImage: '/assets/images/logos/partners/worldposta.png',
      backgroundImage: '/assets/images/worldposta/data-storage-cloud-computing-technology-concept-with-digital-blue-cloud-symbol-abstract-dark.jpg',
      route: '/services/worldposta',
      badge: 'Partner',
      isFeatured: true
    }
  ];

  // Resources menu items (with Font Awesome icons)
  resourcesMenuItems: MegaMenuItem[] = [
    {
      id: 'blog',
      title: 'resources.types.blog.title',
      description: 'resources.types.blog.description',
      icon: '&#9998;',
      faIcon: 'faSolidNewspaper',
      route: '/resources/blog'
    },
    {
      id: 'case-studies',
      title: 'resources.types.caseStudies.title',
      description: 'resources.types.caseStudies.description',
      icon: '&#128202;',
      faIcon: 'faSolidFolderOpen',
      route: '/resources/case-studies'
    },
    {
      id: 'whitepapers',
      title: 'resources.types.whitepapers.title',
      description: 'resources.types.whitepapers.description',
      icon: '&#128196;',
      faIcon: 'faSolidFileLines',
      route: '/resources/whitepapers'
    },
    {
      id: 'documentation',
      title: 'resources.types.documentation.title',
      description: 'resources.types.documentation.description',
      icon: '&#128214;',
      faIcon: 'faSolidBook',
      route: '/resources/documentation'
    }
  ];

  // Mega menu items for all 6 industries (with Font Awesome icons)
  industryMenuItems: MegaMenuItem[] = [
    {
      id: 'finance',
      title: 'industries.finance.title',
      description: 'industries.finance.description',
      icon: '🏦',
      faIcon: 'faSolidBuildingColumns',
      route: '/industries/finance',
      badge: 'Top Sector',
      isFeatured: true
    },
    {
      id: 'healthcare',
      title: 'industries.healthcare.title',
      description: 'industries.healthcare.description',
      icon: '🏥',
      faIcon: 'faSolidHospital',
      route: '/industries/healthcare',
      badge: 'Growing'
    },
    {
      id: 'government',
      title: 'industries.government.title',
      description: 'industries.government.description',
      icon: '🏛️',
      faIcon: 'faSolidLandmarkDome',
      route: '/industries/government',
      badge: 'High Security'
    },
    {
      id: 'manufacturing',
      title: 'industries.manufacturing.title',
      description: 'industries.manufacturing.description',
      icon: '🏭',
      faIcon: 'faSolidIndustry',
      route: '/industries/manufacturing'
    },
    {
      id: 'retail',
      title: 'industries.retail.title',
      description: 'industries.retail.description',
      icon: '🛒',
      faIcon: 'faSolidCartShopping',
      route: '/industries/retail',
      badge: 'Popular'
    },
    {
      id: 'education',
      title: 'industries.education.title',
      description: 'industries.education.description',
      icon: '🎓',
      faIcon: 'faSolidGraduationCap',
      route: '/industries/education'
    }
  ];

  private navigationSub?: Subscription;
  private routeSub?: Subscription;
  private navigationStartTime = 0;
  private readonly minimumLoaderDuration = 6000;
  private loaderShownOnce = false;

  ngOnInit(): void {
    // Check initial scroll position
    this.checkScroll();
    this.initializeLoader();
    this.updateRouteState(this.router.url);
    this.routeSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateRouteState(event.urlAfterRedirects);
      }
    });
  }

  ngAfterViewInit(): void {
    // Re-enable smooth scrolling after view is ready
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        // Detect mobile devices for optimized scroll behavior
        const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

        this.scrollSmootherService.init({
          smooth: isMobile ? 0.5 : 1.5,
          effects: !isMobile,
          normalizeScroll: !isMobile,
          smoothTouch: false,  // Let mobile use native momentum scrolling
          ignoreMobileResize: true
        });
      }, 100);

      // Setup throttled scroll listener using RxJS (more reliable than @HostListener with RAF)
      this.scrollSub = fromEvent(window, 'scroll', { passive: true })
        .pipe(throttleTime(16, undefined, { leading: true, trailing: true })) // ~60fps max
        .subscribe(() => {
          this.checkScroll();
        });
    }

    // Ensure loader is visible on first paint
    this.showInitialLoader();
  }

  ngOnDestroy(): void {
    // Close mobile menu when component is destroyed
    this.navigationService.closeMobileMenu();
    this.scrollSmootherService.destroy();
    this.navigationSub?.unsubscribe();
    this.routeSub?.unsubscribe();
    this.scrollSub?.unsubscribe();
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

      // Only update signal if value actually changed (prevents unnecessary change detection)
      const newIsScrolled = scrollY > this.scrollThreshold;
      if (this.isScrolled() !== newIsScrolled) {
        this.isScrolled.set(newIsScrolled);
      }

      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? Math.min(scrollY / max, 1) : 0;

      // Only update progress if value changed significantly (reduce unnecessary updates)
      if (Math.abs(this.scrollProgress - progress) > 0.001) {
        this.scrollProgress = progress;
      }
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

  private updateRouteState(url: string): void {
    // Treat root as home; everything else as non-home
    this.isHomeRoute = url === '/' || url === '';
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
    this.mobileSecurityOpen.set(false);
  }

  toggleMobileServices(): void {
    this.mobileServicesOpen.update(state => !state);
  }

  toggleMobileIndustries(): void {
    this.mobileIndustriesOpen.update(state => !state);
  }

  toggleMobileSecurity(): void {
    this.mobileSecurityOpen.update(state => !state);
  }

  // Check if a service item has children (for mobile nested navigation)
  hasChildren(item: { children?: unknown[] }): boolean {
    return !!item.children && item.children.length > 0;
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
