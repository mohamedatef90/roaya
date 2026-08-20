import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * CSRF Service
 * Manages CSRF token retrieval and storage for secure API requests
 */
@Injectable({
  providedIn: 'root',
})
export class CsrfService {
  private readonly API_URL = environment.apiUrl;
  private csrfToken = signal<string | null>(null);
  private tokenFetched = false;

  constructor(private http: HttpClient) {}

  /**
   * Get the current CSRF token
   */
  getToken(): string | null {
    return this.csrfToken();
  }

  /**
   * Check if CSRF token is available
   */
  hasToken(): boolean {
    return !!this.csrfToken();
  }

  /**
   * Fetch CSRF token from server
   * Called on app initialization and after login
   */
  fetchToken(): Observable<string | null> {
    return this.http
      .get<{ success: boolean; data: { csrfToken: string } }>(
        `${this.API_URL}/auth/csrf-token`,
        { withCredentials: true }
      )
      .pipe(
        map((response) => {
          if (response.success && response.data?.csrfToken) {
            this.csrfToken.set(response.data.csrfToken);
            this.tokenFetched = true;
            return response.data.csrfToken;
          }
          return null;
        }),
        catchError((error) => {
          // Silently ignore AbortError (happens during page refresh/navigation)
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            return of(null);
          }
          console.error('Failed to fetch CSRF token:', error);
          this.tokenFetched = true; // Mark as attempted even on failure
          return of(null);
        })
      );
  }

  /**
   * Initialize CSRF token (call on app startup)
   */
  initialize(): Observable<string | null> {
    if (this.tokenFetched && this.csrfToken()) {
      return of(this.csrfToken());
    }
    return this.fetchToken();
  }

  /**
   * Refresh CSRF token (call after login/logout)
   */
  refreshToken(): Observable<string | null> {
    return this.fetchToken();
  }

  /**
   * Clear CSRF token (call on logout)
   */
  clearToken(): void {
    this.csrfToken.set(null);
    this.tokenFetched = false;
  }
}
