import { Component, OnInit, OnDestroy, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

// shadcn-style UI Components
import {
  SheetComponent,
  SheetHeaderComponent,
  SheetContentComponent,
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogDescriptionComponent,
  DialogContentComponent,
  DialogFooterComponent,
  AvatarComponent,
  BadgeComponent,
  InputComponent,
  DropdownMenuComponent,
  DropdownMenuItemComponent,
  DropdownMenuSeparatorComponent,
} from '../../../shared/components/ui';
import { ButtonComponent } from '../../../shared/components/button/button.component';

// Services
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { IdleTimeoutService } from '../../../core/services/idle-timeout.service';

/**
 * Admin Layout Component
 * Main layout for admin dashboard with fixed sidebar and top header
 */
// Menu item interface (replacing PrimeNG MenuItem)
export interface AdminMenuItem {
  label?: string;
  icon?: string;
  routerLink?: string[];
  items?: AdminMenuItem[];
  command?: () => void;
  separator?: boolean;
  // Permission control
  visible?: () => boolean;
  // Badge for view-only access
  viewOnly?: boolean;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    // shadcn-style components
    SheetComponent,
    SheetHeaderComponent,
    SheetContentComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogContentComponent,
    DialogFooterComponent,
    AvatarComponent,
    BadgeComponent,
    InputComponent,
    DropdownMenuComponent,
    DropdownMenuItemComponent,
    DropdownMenuSeparatorComponent,
    ButtonComponent,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  // Inject services
  public authService = inject(AuthService);
  public languageService = inject(LanguageService);
  public idleTimeoutService = inject(IdleTimeoutService);
  private router = inject(Router);

  // Signals
  sidebarCollapsed = signal(false);
  mobileSidebarVisible = signal(false);
  currentUser = this.authService.currentUserSignal;
  currentLang = this.languageService.language;
  pageTitle = signal('Dashboard');

  // Track expanded sub-menus
  expandedMenus: Record<number, boolean> = {};

  // Navigation menu items with role-based visibility
  // Use computed signal to dynamically filter based on user role
  menuItems = computed<AdminMenuItem[]>(() => {
    return [
      {
        label: 'Dashboard',
        icon: 'home',
        routerLink: ['/admin/dashboard'],
        // Dashboard visible to all authenticated users
        visible: () => true,
      },
      {
        label: 'Leads',
        icon: 'users',
        routerLink: ['/admin/leads'],
        // Lead management - SALES_REP+ only
        visible: () => this.authService.canManageLeads(),
      },
      {
        label: 'Analytics',
        icon: 'chartBar',
        routerLink: ['/admin/analytics'],
        // Analytics overview - SALES_REP+ only
        visible: () => this.authService.canViewAnalytics(),
      },
      {
        label: 'Content',
        icon: 'fileEdit',
        // Content management - ADMIN+ only
        visible: () => this.authService.canManageContent(),
        items: [
          { label: 'Blog Posts', routerLink: ['/admin/content/blog'] },
          { label: 'Case Studies', routerLink: ['/admin/content/case-studies'] },
          { label: 'Documentation', routerLink: ['/admin/documentation'] },
        ],
      },
      {
        label: 'Website',
        icon: 'globe',
        // Website content - ADMIN+ only
        visible: () => this.authService.canManageTeamContent(),
        items: [
          { label: 'Packages', routerLink: ['/admin/packages'] },
          { label: 'Team', routerLink: ['/admin/team'] },
          { label: 'Testimonials', routerLink: ['/admin/testimonials'] },
          { label: 'Logos', routerLink: ['/admin/logos'] },
        ],
      },
      {
        label: 'Website Analytics',
        icon: 'eye',
        // Website analytics - ADMIN+ only
        visible: () => this.authService.isAdmin(),
        items: [
          { label: 'Dashboard', routerLink: ['/admin/website-analytics'] },
          { label: 'Heatmaps', routerLink: ['/admin/website-analytics/heatmaps'] },
          { label: 'Recordings', routerLink: ['/admin/website-analytics/recordings'] },
          { label: 'Tracking Code', routerLink: ['/admin/website-analytics/tracking'] },
        ],
      },
      {
        label: 'Email Templates',
        icon: 'mail',
        routerLink: ['/admin/email-templates'],
        // Email templates - ADMIN+ only
        visible: () => this.authService.canManageEmailTemplates(),
      },
      {
        label: 'Users',
        icon: 'userEdit',
        routerLink: ['/admin/users'],
        // Users - ADMIN+ can view, SUPER_ADMIN can manage
        visible: () => this.authService.canViewUsers(),
        // Show view-only badge for non-SUPER_ADMIN
        viewOnly: !this.authService.canManageUsers(),
      },
      {
        label: 'Settings',
        icon: 'settings',
        routerLink: ['/admin/settings'],
        // Settings - SUPER_ADMIN only
        visible: () => this.authService.canManageSettings(),
      },
    ].filter(item => !item.visible || item.visible());
  });

  // User dropdown menu
  userMenuItems: AdminMenuItem[] = [
    {
      label: 'Profile',
      icon: 'user',
      command: () => this.viewProfile(),
    },
    {
      label: 'Settings',
      icon: 'settings',
      command: () => this.openSettings(),
    },
    {
      separator: true,
    },
    {
      label: 'Logout',
      icon: 'logout',
      command: () => this.logout(),
    },
  ];

  constructor() {
    // Load sidebar state from localStorage
    const collapsed = localStorage.getItem('admin-sidebar-collapsed') === 'true';
    this.sidebarCollapsed.set(collapsed);

    // Save sidebar state on change
    effect(() => {
      localStorage.setItem('admin-sidebar-collapsed', String(this.sidebarCollapsed()));
    });
  }

  ngOnInit(): void {
    // Update page title based on route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
      });

    // Set initial page title
    this.updatePageTitle();

    // Initialize idle timeout monitoring for session security
    this.idleTimeoutService.initialize();
  }

  ngOnDestroy(): void {
    // Stop idle monitoring when layout is destroyed
    this.idleTimeoutService.stop();
  }

  /**
   * Extend session when user clicks "Stay Logged In" on warning dialog
   */
  extendSession(): void {
    this.idleTimeoutService.extendSession();
  }

  /**
   * Logout from warning dialog
   */
  logoutFromWarning(): void {
    this.idleTimeoutService.stop();
    this.logout();
  }

  updatePageTitle(): void {
    const url = this.router.url;
    if (url.includes('/admin/dashboard')) {
      this.pageTitle.set('Dashboard');
    } else if (url.includes('/admin/leads')) {
      this.pageTitle.set('Leads');
    } else if (url.includes('/admin/analytics') && !url.includes('/website-analytics')) {
      this.pageTitle.set('Analytics');
    } else if (url.includes('/admin/website-analytics')) {
      this.pageTitle.set('Website Analytics');
    } else if (url.includes('/admin/content')) {
      this.pageTitle.set('Content');
    } else if (url.includes('/admin/logos')) {
      this.pageTitle.set('Logo Management');
    } else if (url.includes('/admin/documentation')) {
      this.pageTitle.set('Documentation');
    } else if (url.includes('/admin/email-templates')) {
      this.pageTitle.set('Email Templates');
    } else if (url.includes('/admin/packages')) {
      this.pageTitle.set('Packages');
    } else if (url.includes('/admin/team')) {
      this.pageTitle.set('Team');
    } else if (url.includes('/admin/testimonials')) {
      this.pageTitle.set('Testimonials');
    } else if (url.includes('/admin/users')) {
      this.pageTitle.set('Users');
    } else if (url.includes('/admin/settings')) {
      this.pageTitle.set('Settings');
    } else {
      this.pageTitle.set('Dashboard');
    }
  }

  toggleSidebarCollapse(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  toggleSubmenu(index: number): void {
    this.expandedMenus[index] = !this.expandedMenus[index];
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }

  viewProfile(): void {
    // Navigate to profile page (to be implemented)
    console.log('View profile');
  }

  openSettings(): void {
    this.router.navigate(['/admin/settings']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/admin/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Navigate anyway on error
        this.router.navigate(['/admin/login']);
      },
    });
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  getUserFullName(): string {
    const user = this.currentUser();
    if (!user) return 'User';
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  }
}
