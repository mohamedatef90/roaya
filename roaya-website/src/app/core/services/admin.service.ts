import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  AdminUser,
  Tag,
  CreateTagDto,
} from '../interfaces/admin.interface';

/**
 * Admin Service
 * Handles admin-specific operations (user management, tags, settings)
 */
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly API_URL = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // ============================================================================
  // USER MANAGEMENT (Super Admin only)
  // ============================================================================

  /**
   * Get all admin users
   */
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<ApiResponse<AdminUser[]>>(`${this.API_URL}/users`).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to get users');
        }
        return response.data;
      }),
      catchError((error) => {
        console.error('Get users error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get single admin user by ID
   */
  getUser(id: string): Observable<AdminUser> {
    return this.http.get<ApiResponse<AdminUser>>(`${this.API_URL}/users/${id}`).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to get user');
        }
        return response.data;
      }),
      catchError((error) => {
        console.error('Get user error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update admin user
   */
  updateUser(id: string, data: Partial<AdminUser>): Observable<AdminUser> {
    return this.http
      .patch<ApiResponse<AdminUser>>(`${this.API_URL}/users/${id}`, data)
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to update user');
          }
          return response.data;
        }),
        catchError((error) => {
          console.error('Update user error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete admin user
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/users/${id}`).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to delete user');
        }
      }),
      catchError((error) => {
        console.error('Delete user error:', error);
        return throwError(() => error);
      })
    );
  }

  // ============================================================================
  // TAG MANAGEMENT
  // ============================================================================

  /**
   * Get all tags
   */
  getTags(): Observable<Tag[]> {
    return this.http.get<ApiResponse<Tag[]>>(`${this.API_URL}/tags`).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to get tags');
        }
        return response.data;
      }),
      catchError((error) => {
        console.error('Get tags error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create new tag
   */
  createTag(tag: CreateTagDto): Observable<Tag> {
    return this.http.post<ApiResponse<Tag>>(`${this.API_URL}/tags`, tag).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to create tag');
        }
        return response.data;
      }),
      catchError((error) => {
        console.error('Create tag error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete tag
   */
  deleteTag(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/tags/${id}`).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to delete tag');
        }
      }),
      catchError((error) => {
        console.error('Delete tag error:', error);
        return throwError(() => error);
      })
    );
  }

  // ============================================================================
  // SYSTEM SETTINGS (Super Admin only)
  // ============================================================================

  /**
   * Get all system settings
   */
  getSettings(): Observable<Record<string, any>> {
    return this.http.get<ApiResponse<Record<string, any>>>(`${this.API_URL}/settings`).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to get settings');
        }
        return response.data;
      }),
      catchError((error) => {
        console.error('Get settings error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update system setting
   */
  updateSetting(key: string, value: any): Observable<void> {
    return this.http
      .patch<ApiResponse<void>>(`${this.API_URL}/settings/${key}`, { value })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error?.message || 'Failed to update setting');
          }
        }),
        catchError((error) => {
          console.error('Update setting error:', error);
          return throwError(() => error);
        })
      );
  }
}
