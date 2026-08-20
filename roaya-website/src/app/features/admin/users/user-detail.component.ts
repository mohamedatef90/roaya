import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { Paginator } from 'primeng/paginator';
import { MessageService, ConfirmationService } from 'primeng/api';

// Services
import { UserService } from '../../../core/services/user.service';
import {
  AdminUser,
  UserActivityLog,
  UserRole,
  USER_ROLE_LABELS,
  PaginationMeta,
} from '../../../core/interfaces/admin.interface';

/**
 * User Detail Component
 * View user details and activity logs
 */
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    CardModule,
    ButtonModule,
    TagModule,
    TimelineModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    Paginator,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="user-detail" *ngIf="user()">
      <!-- Header -->
      <div class="page-header">
        <div class="flex items-center gap-4">
          <p-button
            icon="pi pi-arrow-left"
            [routerLink]="['/admin/users']"
            [text]="true"
            [rounded]="true"
          ></p-button>
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center text-xl font-medium"
            >
              {{ user()!.firstName?.charAt(0) }}{{ user()!.lastName?.charAt(0) }}
            </div>
            <div>
              <h1>{{ user()!.firstName }} {{ user()!.lastName }}</h1>
              <p class="text-surface-500">{{ user()!.email }}</p>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <p-button
            label="Edit"
            icon="pi pi-pencil"
            [routerLink]="['/admin/users', user()!.id, 'edit']"
          ></p-button>
          <p-button
            label="Reset Password"
            icon="pi pi-key"
            severity="warn"
            (click)="resetPassword()"
          ></p-button>
          <p-button
            icon="pi pi-trash"
            severity="danger"
            [text]="true"
            (click)="confirmDelete()"
          ></p-button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- User Info Card -->
        <div class="lg:col-span-1">
          <p-card header="User Information">
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-surface-500 mb-1">Role</label>
                <p-tag
                  [value]="getRoleLabel(user()!.role)"
                  [severity]="getRoleSeverity(user()!.role)"
                ></p-tag>
              </div>

              <div>
                <label class="block text-sm text-surface-500 mb-1">Status</label>
                <p-tag
                  [value]="user()!.isActive ? 'Active' : 'Inactive'"
                  [severity]="user()!.isActive ? 'success' : 'danger'"
                ></p-tag>
              </div>

              <div>
                <label class="block text-sm text-surface-500 mb-1">Assigned Leads</label>
                <p class="font-medium">{{ user()!.assignedLeadsCount || 0 }}</p>
              </div>

              <div>
                <label class="block text-sm text-surface-500 mb-1">Last Login</label>
                <p>{{ user()!.lastLoginAt ? formatDate(user()!.lastLoginAt) : 'Never' }}</p>
              </div>

              <div>
                <label class="block text-sm text-surface-500 mb-1">Created</label>
                <p>{{ formatDate(user()!.createdAt) }}</p>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Activity Log Card -->
        <div class="lg:col-span-2">
          <p-card header="Activity Log">
            <!-- Loading state -->
            <div *ngIf="activityLoading()" class="flex justify-center py-8">
              <i class="pi pi-spin pi-spinner text-2xl"></i>
            </div>

            <!-- Activity timeline -->
            <div *ngIf="!activityLoading() && activityLogs().length > 0">
              <p-timeline [value]="activityLogs()" styleClass="customized-timeline">
                <ng-template #content let-log>
                  <div class="activity-item p-3 bg-surface-50 dark:bg-surface-800 rounded-lg mb-2">
                    <div class="flex justify-between items-start mb-1">
                      <span class="font-medium text-sm">{{ formatAction(log.action) }}</span>
                      <span class="text-xs text-surface-500">{{ formatDateTime(log.createdAt) }}</span>
                    </div>
                    <p *ngIf="log.details" class="text-sm text-surface-600 dark:text-surface-400">
                      {{ formatDetails(log.details) }}
                    </p>
                    <div *ngIf="log.ipAddress" class="text-xs text-surface-500 mt-1">
                      IP: {{ log.ipAddress }}
                    </div>
                  </div>
                </ng-template>
              </p-timeline>

              <!-- Pagination -->
              <p-paginator
                *ngIf="activityMeta()"
                [rows]="activityMeta()!.limit"
                [totalRecords]="activityMeta()!.total"
                [first]="(activityMeta()!.page - 1) * activityMeta()!.limit"
                (onPageChange)="onPageChange($event)"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
              ></p-paginator>
            </div>

            <!-- Empty state -->
            <div
              *ngIf="!activityLoading() && activityLogs().length === 0"
              class="text-center py-8 text-surface-500"
            >
              <i class="pi pi-history text-4xl mb-2"></i>
              <p>No activity recorded yet</p>
            </div>
          </p-card>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="loading()" class="flex justify-center py-8">
      <i class="pi pi-spin pi-spinner text-2xl"></i>
    </div>

    <!-- Reset Password Dialog -->
    <p-dialog
      [(visible)]="showResetDialog"
      header="Password Reset"
      [modal]="true"
      [style]="{ width: '400px' }"
      [closable]="true"
      (onHide)="closeResetDialog()"
    >
      <div class="text-center">
        <i class="pi pi-check-circle text-green-500 text-5xl mb-4"></i>
        <p class="mb-4">
          Password reset for <strong>{{ user()?.firstName }} {{ user()?.lastName }}</strong>
        </p>
        <div class="bg-surface-100 dark:bg-surface-700 p-4 rounded-lg mb-4">
          <label class="block text-sm text-surface-500 mb-1">Temporary Password</label>
          <div class="flex items-center justify-center gap-2">
            <code class="text-lg font-mono">{{ resetPasswordResult }}</code>
            <p-button
              icon="pi pi-copy"
              [text]="true"
              [rounded]="true"
              (click)="copyPassword()"
            ></p-button>
          </div>
        </div>
        <p class="text-sm text-surface-500">
          Please provide this password to the user. They should change it upon first login.
        </p>
      </div>

      <ng-template pTemplate="footer">
        <p-button label="Close" (click)="closeResetDialog()"></p-button>
      </ng-template>
    </p-dialog>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [`
    .user-detail {
      padding: 1.5rem;

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;

        h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
      }
    }
  `],
})
export class UserDetailComponent implements OnInit {
  user = signal<AdminUser | null>(null);
  loading = signal(true);

  activityLogs = signal<UserActivityLog[]>([]);
  activityMeta = signal<PaginationMeta | null>(null);
  activityLoading = signal(false);

  showResetDialog = false;
  resetPasswordResult = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/admin/users']);
      return;
    }

    this.loading.set(true);
    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
        this.loadActivityLogs();
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user',
        });
        this.loading.set(false);
        this.router.navigate(['/admin/users']);
      },
    });
  }

  loadActivityLogs(page = 1, limit = 10): void {
    const userId = this.user()?.id;
    if (!userId) return;

    this.activityLoading.set(true);
    this.userService.getUserActivity(userId, { page, limit }).subscribe({
      next: ({ logs, meta }) => {
        this.activityLogs.set(logs);
        this.activityMeta.set(meta);
        this.activityLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading activity logs:', error);
        this.activityLoading.set(false);
      },
    });
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? 10;
    const page = Math.floor(first / rows) + 1;
    this.loadActivityLogs(page, rows);
  }

  confirmDelete(): void {
    const user = this.user();
    if (!user) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete user "${user.firstName} ${user.lastName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User deleted successfully',
            });
            this.router.navigate(['/admin/users']);
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to delete user',
            });
          },
        });
      },
    });
  }

  resetPassword(): void {
    const user = this.user();
    if (!user) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to reset password for "${user.firstName} ${user.lastName}"?`,
      header: 'Confirm Reset',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.resetPassword(user.id).subscribe({
          next: (result) => {
            this.resetPasswordResult = result.tempPassword;
            this.showResetDialog = true;
          },
          error: (error) => {
            console.error('Error resetting password:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to reset password',
            });
          },
        });
      },
    });
  }

  copyPassword(): void {
    navigator.clipboard.writeText(this.resetPasswordResult);
    this.messageService.add({
      severity: 'success',
      summary: 'Copied',
      detail: 'Password copied to clipboard',
    });
  }

  closeResetDialog(): void {
    this.showResetDialog = false;
    this.resetPasswordResult = '';
  }

  getRoleSeverity(role: UserRole): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severityMap: Record<UserRole, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      [UserRole.SUPER_ADMIN]: 'danger',
      [UserRole.ADMIN]: 'warn',
      [UserRole.SALES_MANAGER]: 'info',
      [UserRole.SALES_REP]: 'success',
      [UserRole.VIEWER]: 'secondary',
    };
    return severityMap[role] || 'secondary';
  }

  getRoleLabel(role: UserRole): string {
    return USER_ROLE_LABELS[role] || role;
  }

  formatAction(action: string): string {
    const actionLabels: Record<string, string> = {
      LOGIN: 'User Login',
      LOGOUT: 'User Logout',
      USER_CREATED: 'User Created',
      USER_UPDATED: 'User Updated',
      USER_DELETED: 'User Deleted',
      PASSWORD_RESET: 'Password Reset',
      LEAD_UPDATE: 'Lead Updated',
      LEAD_CREATED: 'Lead Created',
    };
    return actionLabels[action] || action.replace(/_/g, ' ');
  }

  formatDetails(details: Record<string, unknown>): string {
    if (!details) return '';
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString();
  }
}
