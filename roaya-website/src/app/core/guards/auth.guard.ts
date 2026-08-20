import { inject } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard (Class-based)
 * Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export class AuthGuard implements CanActivate, CanActivateChild {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth(state.url);
  }

  private checkAuth(url: string): boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Store the attempted URL for redirecting after login
    sessionStorage.setItem('redirectUrl', url);

    // Redirect to login page
    return this.router.createUrlTree(['/admin/login']);
  }
}

/**
 * Functional guard for use with new Angular routing
 * Uses session-based authentication check
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Quick check using local session state
  if (!authService.isAuthenticated()) {
    // Store the attempted URL for redirecting after login
    const url = window.location.pathname;
    sessionStorage.setItem('redirectUrl', url);
    return router.createUrlTree(['/admin/login']);
  }

  return true;
};

/**
 * Async auth guard that verifies session with server
 * Use this for sensitive routes that need server-side validation
 */
export const authGuardAsync = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Quick check first
  if (!authService.isAuthenticated()) {
    const url = window.location.pathname;
    sessionStorage.setItem('redirectUrl', url);
    return router.createUrlTree(['/admin/login']);
  }

  // Verify session with server
  return authService.verifySession().pipe(
    map((isValid) => {
      if (isValid) {
        return true;
      }
      const url = window.location.pathname;
      sessionStorage.setItem('redirectUrl', url);
      return router.createUrlTree(['/admin/login']);
    }),
    catchError(() => {
      const url = window.location.pathname;
      sessionStorage.setItem('redirectUrl', url);
      return of(router.createUrlTree(['/admin/login']));
    })
  );
};

/**
 * Role-based guard factory
 * Creates a guard that checks for specific roles
 */
export const roleGuard = (allowedRoles: string[]) => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/admin/login']);
    }

    if (authService.hasRole(...allowedRoles)) {
      return true;
    }

    // User is authenticated but doesn't have required role
    // Redirect to dashboard with error message
    return router.createUrlTree(['/admin/dashboard'], {
      queryParams: { error: 'insufficient_permissions' },
    });
  };
};

/**
 * Super Admin only guard
 * Used for: User management (CRUD), System settings
 */
export const superAdminGuard = () => roleGuard(['SUPER_ADMIN'])();

/**
 * Admin (includes Super Admin) guard
 * Used for: Content, Logos, Email templates, Team, Packages, Testimonials, User list (view only)
 */
export const adminGuard = () => roleGuard(['SUPER_ADMIN', 'ADMIN'])();

/**
 * Sales Manager guard (includes Admin and Super Admin)
 * Used for: Team performance analytics
 */
export const salesManagerGuard = () => roleGuard(['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'])();

/**
 * Sales Rep guard (includes all sales roles)
 * Used for: Lead management, Analytics overview
 */
export const salesRepGuard = () => roleGuard(['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_REP'])();
