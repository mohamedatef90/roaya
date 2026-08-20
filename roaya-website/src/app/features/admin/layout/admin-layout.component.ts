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
import { ThemeService } from '../../../core/services/theme.service';
import { IdleTimeoutService } from '../../../core/services/idle-timeout.service';

/**
 * Admin Layout Component
 * Main layout for admin dashboard with fixed sidebar and top header
 */
// Menu item interface (replacing PrimeNG MenuItem)
export interface AdminMenuItem {
  label?: string;
  icon?: string;
  svgIcon?: string; // SVG path for inline rendering
  routerLink?: string[];
  items?: AdminMenuItem[];
  command?: () => void;
  separator?: boolean;
  // Permission control
  visible?: () => boolean;
  // Badge for view-only access
  viewOnly?: boolean;
}

// SVG icon paths for consistent rendering (Lucide-style icons)
export const ADMIN_ICONS = {
  home: `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  chartBar: `<path d="M3 3v18h18"/><rect width="4" height="7" x="7" y="10" rx="1"/><rect width="4" height="12" x="15" y="5" rx="1"/>`,
  fileEdit: `<path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5"/><polyline points="14 2 14 8 20 8"/><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"/>`,
  globe: `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>`,
  eye: `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`,
  mail: `<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`,
  userEdit: `<path d="M11.5 15H7a4 4 0 0 0-4 4v2"/><path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506l4.013-4.01Z"/><circle cx="10" cy="7" r="4"/>`,
  settings: `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`,
  user: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  logout: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
};

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
  public themeService = inject(ThemeService);
  public idleTimeoutService = inject(IdleTimeoutService);
  private router = inject(Router);

  // Signals
  sidebarCollapsed = signal(false);
  mobileSidebarVisible = signal(false);
  currentUser = this.authService.currentUserSignal;
  isDarkMode = this.themeService.theme;
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
        svgIcon: ADMIN_ICONS.home,
        routerLink: ['/admin/dashboard'],
        // Dashboard visible to all authenticated users
        visible: () => true,
      },
      {
        label: 'Leads',
        svgIcon: ADMIN_ICONS.users,
        routerLink: ['/admin/leads'],
        // Lead management - SALES_REP+ only
        visible: () => this.authService.canManageLeads(),
      },
      {
        label: 'Analytics',
        svgIcon: ADMIN_ICONS.chartBar,
        routerLink: ['/admin/analytics'],
        // Analytics overview - SALES_REP+ only
        visible: () => this.authService.canViewAnalytics(),
      },
      {
        label: 'Content',
        svgIcon: ADMIN_ICONS.fileEdit,
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
        svgIcon: ADMIN_ICONS.globe,
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
        svgIcon: ADMIN_ICONS.eye,
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
        svgIcon: ADMIN_ICONS.mail,
        routerLink: ['/admin/email-templates'],
        // Email templates - ADMIN+ only
        visible: () => this.authService.canManageEmailTemplates(),
      },
      {
        label: 'Users',
        svgIcon: ADMIN_ICONS.userEdit,
        routerLink: ['/admin/users'],
        // Users - ADMIN+ can view, SUPER_ADMIN can manage
        visible: () => this.authService.canViewUsers(),
        // Show view-only badge for non-SUPER_ADMIN
        viewOnly: !this.authService.canManageUsers(),
      },
      {
        label: 'Settings',
        svgIcon: ADMIN_ICONS.settings,
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
      svgIcon: ADMIN_ICONS.user,
      command: () => this.viewProfile(),
    },
    {
      label: 'Settings',
      svgIcon: ADMIN_ICONS.settings,
      command: () => this.openSettings(),
    },
    {
      separator: true,
    },
    {
      label: 'Logout',
      svgIcon: ADMIN_ICONS.logout,
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

  toggleTheme(): void {
    this.themeService.toggleTheme();
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
