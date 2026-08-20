import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CsrfService } from './csrf.service';
import {
  ApiResponse,
  LoginCredentials,
  LoginResponse,
  AuthTokens,
  AdminUser,
  ChangePasswordRequest,
} from '../interfaces/admin.interface';

/**
 * Authentication Service
 * Handles user authentication using httpOnly cookies
 * Tokens are managed by the server via secure cookies
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly SESSION_KEY = 'admin_session_active';

  // Reactive state using signals (memory-only, no localStorage)
  private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Signal-based reactive state (memory-only)
  public currentUserSignal = signal<AdminUser | null>(null);
  public isAuthenticatedSignal = computed(() => !!this.currentUserSignal() && this.hasActiveSession());

  private csrfService = inject(CsrfService);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize user state on service creation
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from server
   * If session flag exists, fetch user from server
   */
  private initializeAuth(): void {
    const hasSession = this.hasActiveSession();

    if (hasSession) {
      // Fetch user from server
      this.getProfile().subscribe({
        next: (user) => {
          // User data is already set by getProfile()
          // Fetch CSRF token on init
          this.csrfService.initialize().subscribe({
            error: (csrfError) => {
              // Ignore AbortError (happens during page refresh/navigation)
              if (csrfError?.name === 'AbortError' || csrfError?.message?.includes('aborted')) {
                return;
              }
              console.warn('[AuthService] Failed to initialize CSRF token:', csrfError);
            }
          });
        },
        error: (error) => {
          // Ignore AbortError (happens during page refresh/navigation)
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            return;
          }
          console.error('[AuthService] Failed to fetch user profile on init:', error);
          // Clear session flag if server says user is not authenticated
          this.clearSession();
        }
      });
    }
  }

  /**
   * Login with email and password
   * Server will set httpOnly cookies for tokens
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const loginUrl = `${this.API_URL}/auth/login`;
    console.log('[AuthService] Attempting login to:', loginUrl);
    console.log('[AuthService] API_URL is:', this.API_URL);

    return this.http
      .post<ApiResponse<LoginResponse>>(
        loginUrl,
        credentials,
        { withCredentials: true }
      )
      .pipe(
        map((response) => {
          console.log('[AuthService] Login response:', response);
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Login failed');
          }
          return response.data;
        }),
        tap((data) => {
          // Set session flag and store user in memory only
          this.setSessionActive(true);

          // Update reactive state (memory-only, no localStorage)
          this.currentUserSubject.next(data.user);
          this.currentUserSignal.set(data.user);
        }),
        // Fetch CSRF token after successful login
        switchMap((data) =>
          this.csrfService.refreshToken().pipe(
            map(() => data),
            catchError(() => of(data)) // Continue even if CSRF fetch fails
          )
        ),
        catchError((error) => {
          console.error('[AuthService] Login error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
            url: loginUrl
          });
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout and clear session
   * Server will clear httpOnly cookies
   * Only redirects to login if user is on an admin route
   */
  logout(): Observable<any> {
    const shouldRedirect = this.isOnAdminRoute();
    return this.http
      .post(
        `${this.API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          this.clearSession();
          this.csrfService.clearToken();
          if (shouldRedirect) {
            this.router.navigate(['/admin/login']);
          }
        }),
        catchError((error) => {
          // Clear session even if API call fails
          this.clearSession();
          this.csrfService.clearToken();
          if (shouldRedirect) {
            this.router.navigate(['/admin/login']);
          }
          return throwError(() => error);
        })
      );
  }

  /**
   * Refresh access token using refresh token cookie
   * Server will set new httpOnly cookies
   */
  refreshToken(): Observable<void> {
    const shouldRedirect = this.isOnAdminRoute();
    return this.http
      .post<ApiResponse<AuthTokens>>(
        `${this.API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error?.message || 'Token refresh failed');
          }
          // Tokens are set via httpOnly cookies by server
          // Just need to refresh CSRF token
        }),
        tap(() => {
          this.setSessionActive(true);
        }),
        catchError((error) => {
          console.error('Token refresh error:', error);
          this.clearSession();
          if (shouldRedirect) {
            this.router.navigate(['/admin/login']);
          }
          return throwError(() => error);
        })
      );
  }

  /**
   * Get current user profile from server
   */
  getProfile(): Observable<AdminUser> {
    return this.http
      .get<ApiResponse<AdminUser>>(
        `${this.API_URL}/auth/profile`,
        { withCredentials: true }
      )
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to get profile');
          }
          return response.data;
        }),
        tap((user) => {
          // Update memory-only state (no localStorage)
          this.currentUserSubject.next(user);
          this.currentUserSignal.set(user);
        }),
        catchError((error) => {
          console.error('Get profile error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Change password
   */
  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(
        `${this.API_URL}/auth/change-password`,
        request,
        { withCredentials: true }
      )
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error?.message || 'Password change failed');
          }
        }),
        catchError((error) => {
          console.error('Change password error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Check if user is authenticated
   * Based on memory state and session flag
   */
  isAuthenticated(): boolean {
    const user = this.currentUserSignal();
    const hasSession = this.hasActiveSession();
    return !!(user && hasSession);
  }

  /**
   * Verify session with server (for route guards)
   * Makes a lightweight API call to check if session is valid
   */
  verifySession(): Observable<boolean> {
    return this.http
      .get<ApiResponse<AdminUser>>(
        `${this.API_URL}/auth/profile`,
        { withCredentials: true }
      )
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            // Update memory-only state
            this.setSessionActive(true);
            this.currentUserSubject.next(response.data);
            this.currentUserSignal.set(response.data);
            return true;
          }
          return false;
        }),
        catchError(() => {
          this.clearSession();
          return of(false);
        })
      );
  }

  /**
   * Get current user
   */
  getCurrentUser(): AdminUser | null {
    return this.currentUserSignal();
  }

  /**
   * Check if current user has specific role(s)
   */
  hasRole(...roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }

  /**
   * Check if current user is Super Admin
   */
  isSuperAdmin(): boolean {
    return this.hasRole('SUPER_ADMIN');
  }

  /**
   * Check if current user is Admin or above
   */
  isAdmin(): boolean {
    return this.hasRole('SUPER_ADMIN', 'ADMIN');
  }

  /**
   * Check if current user is Sales Manager or above
   */
  isSalesManager(): boolean {
    return this.hasRole('SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER');
  }

  /**
   * Check if current user is Sales Rep or above
   */
  isSalesRep(): boolean {
    return this.hasRole('SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_REP');
  }

  // ============================================================================
  // PERMISSION HELPERS (based on User Permissions Matrix)
  // ============================================================================

  /**
   * User Management - Only SUPER_ADMIN can create, edit, delete users
   */
  canManageUsers(): boolean {
    return this.isSuperAdmin();
  }

  /**
   * View User List - ADMIN+ can view
   */
  canViewUsers(): boolean {
    return this.isAdmin();
  }

  /**
   * Content Management (Blog, Case Studies) - ADMIN+ only
   */
  canManageContent(): boolean {
    return this.isAdmin();
  }

  /**
   * Logo Management - ADMIN+ only
   */
  canManageLogos(): boolean {
    return this.isAdmin();
  }

  /**
   * Email Templates - ADMIN+ only
   */
  canManageEmailTemplates(): boolean {
    return this.isAdmin();
  }

  /**
   * Team/Packages/Testimonials - ADMIN+ only
   */
  canManageTeamContent(): boolean {
    return this.isAdmin();
  }

  /**
   * Lead Management - All sales roles (SALES_REP+)
   */
  canManageLeads(): boolean {
    return this.isSalesRep();
  }

  /**
   * Analytics Overview - All sales roles
   */
  canViewAnalytics(): boolean {
    return this.isSalesRep();
  }

  /**
   * Analytics Team Performance - SALES_MANAGER+ only
   */
  canViewTeamPerformance(): boolean {
    return this.isSalesManager();
  }

  /**
   * Analytics Export - ADMIN+ only
   */
  canExportAnalytics(): boolean {
    return this.isAdmin();
  }

  /**
   * System Settings - SUPER_ADMIN only
   */
  canManageSettings(): boolean {
    return this.isSuperAdmin();
  }

  /**
   * Admin Panel Access - All roles except VIEWER
   */
  canAccessAdminPanel(): boolean {
    return this.hasRole('SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_REP');
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Set session active flag in sessionStorage
   * No PII is stored - only a boolean flag
   */
  private setSessionActive(active: boolean): void {
    if (active) {
      sessionStorage.setItem(this.SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(this.SESSION_KEY);
    }
  }

  /**
   * Check if session is marked as active
   */
  private hasActiveSession(): boolean {
    return sessionStorage.getItem(this.SESSION_KEY) === 'true';
  }

  /**
   * Check if the user is currently on an admin route
   * Used to decide whether to redirect to login on session expiry
   */
  private isOnAdminRoute(): boolean {
    const url = this.router.url || window.location.pathname;
    return url.startsWith('/admin');
  }

  /**
   * Clear all authentication data
   * Clears sessionStorage flag and memory-only user state
   */
  private clearSession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.currentUserSubject.next(null);
    this.currentUserSignal.set(null);
  }

  // ============================================================================
  // DEPRECATED METHODS (kept for backwards compatibility during migration)
  // ============================================================================

  /**
   * @deprecated Tokens are now in httpOnly cookies
   * This method is kept for backwards compatibility but always returns null
   */
  getAccessToken(): string | null {
    console.warn('getAccessToken() is deprecated. Tokens are now managed via httpOnly cookies.');
    return null;
  }

  /**
   * @deprecated Tokens are now in httpOnly cookies
   * This method is kept for backwards compatibility but always returns null
   */
  getRefreshToken(): string | null {
    console.warn('getRefreshToken() is deprecated. Tokens are now managed via httpOnly cookies.');
    return null;
  }

  /**
   * @deprecated Token expiry is now managed server-side
   */
  isTokenExpired(token: string): boolean {
    console.warn('isTokenExpired() is deprecated. Token validation is now server-side.');
    return false;
  }

  /**
   * @deprecated Token expiry is now managed server-side
   */
  getTokenTimeRemaining(): number {
    console.warn('getTokenTimeRemaining() is deprecated. Token management is now server-side.');
    return 0;
  }
}
