import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  AdminUser,
  UserActivityLog,
  CreateUserDto,
  UpdateUserDto,
  UserQueryParams,
  PaginationMeta,
  UserRole,
} from '../interfaces/admin.interface';

/**
 * User Service
 * Handles all user management API calls
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/admin/users`;
  private readonly USE_MOCK_DATA = !environment.production; // Use mock data only in development

  constructor(private http: HttpClient) {}

  /**
   * Generate mock users
   */
  private getMockUsers(): AdminUser[] {
    return [
      {
        id: '1',
        email: 'admin@roaya.ai',
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        assignedLeadsCount: 0,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        email: 'ahmed.hassan@roaya.ai',
        firstName: 'Ahmed',
        lastName: 'Hassan',
        role: UserRole.SALES_MANAGER,
        isActive: true,
        assignedLeadsCount: 35,
        lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        email: 'sara.mohamed@roaya.ai',
        firstName: 'Sara',
        lastName: 'Mohamed',
        role: UserRole.SALES_REP,
        isActive: true,
        assignedLeadsCount: 28,
        lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        email: 'omar.ali@roaya.ai',
        firstName: 'Omar',
        lastName: 'Ali',
        role: UserRole.SALES_REP,
        isActive: true,
        assignedLeadsCount: 22,
        lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        email: 'fatma.ibrahim@roaya.ai',
        firstName: 'Fatma',
        lastName: 'Ibrahim',
        role: UserRole.VIEWER,
        isActive: false,
        assignedLeadsCount: 0,
        createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Get all users with optional filters
   */
  getUsers(params?: UserQueryParams): Observable<AdminUser[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.role) httpParams = httpParams.set('role', params.role);
      if (params.isActive !== undefined) {
        httpParams = httpParams.set('isActive', params.isActive.toString());
      }
      if (params.search) httpParams = httpParams.set('search', params.search);
    }

    return this.http
      .get<ApiResponse<AdminUser[]>>(this.API_URL, { params: httpParams })
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to get users');
          }
          return response.data;
        }),
        catchError((error) => {
          console.error('Get users error:', error);
          if (this.USE_MOCK_DATA) {
            let users = this.getMockUsers();
            // Apply filters
            if (params?.role) {
              users = users.filter((u) => u.role === params.role);
            }
            if (params?.isActive !== undefined) {
              users = users.filter((u) => u.isActive === params.isActive);
            }
            if (params?.search) {
              const search = params.search.toLowerCase();
              users = users.filter(
                (u) =>
                  u.firstName.toLowerCase().includes(search) ||
                  u.lastName.toLowerCase().includes(search) ||
                  u.email.toLowerCase().includes(search)
              );
            }
            return of(users);
          }
          return throwError(() => error);
        })
      );
  }

  /**
   * Get user by ID
   */
  getUser(id: string): Observable<AdminUser> {
    return this.http.get<ApiResponse<AdminUser>>(`${this.API_URL}/${id}`).pipe(
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
   * Create new user
   */
  createUser(data: CreateUserDto): Observable<AdminUser> {
    return this.http.post<ApiResponse<AdminUser>>(this.API_URL, data).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to create user');
        }
        return response.data;
      }),
      catchError((error) => {
        console.error('Create user error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user
   */
  updateUser(id: string, data: UpdateUserDto): Observable<AdminUser> {
    return this.http.patch<ApiResponse<AdminUser>>(`${this.API_URL}/${id}`, data).pipe(
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
   * Delete user
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
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

  /**
   * Reset user password
   */
  resetPassword(id: string): Observable<{ tempPassword: string }> {
    return this.http
      .post<ApiResponse<{ message: string; tempPassword: string }>>(
        `${this.API_URL}/${id}/reset-password`,
        {}
      )
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to reset password');
          }
          return { tempPassword: response.data.tempPassword };
        }),
        catchError((error) => {
          console.error('Reset password error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get user activity logs
   */
  getUserActivity(
    id: string,
    params?: { page?: number; limit?: number; action?: string }
  ): Observable<{ logs: UserActivityLog[]; meta: PaginationMeta }> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.action) httpParams = httpParams.set('action', params.action);
    }

    return this.http
      .get<ApiResponse<UserActivityLog[]>>(`${this.API_URL}/${id}/activity`, {
        params: httpParams,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to get user activity');
          }
          return {
            logs: response.data,
            meta: response.meta!,
          };
        }),
        catchError((error) => {
          console.error('Get user activity error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get role options for dropdowns
   */
  getRoleOptions(): { label: string; value: UserRole }[] {
    return [
      { label: 'Super Admin', value: UserRole.SUPER_ADMIN },
      { label: 'Admin', value: UserRole.ADMIN },
      { label: 'Sales Manager', value: UserRole.SALES_MANAGER },
      { label: 'Sales Rep', value: UserRole.SALES_REP },
      { label: 'Viewer', value: UserRole.VIEWER },
    ];
  }
}
