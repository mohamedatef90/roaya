import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// Custom UI
import { ConfirmDialogComponent } from '../../../shared/components/ui';
import { ToastService } from '../../../shared/components/ui/feedback/toast/toast.service';

// Services
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  AdminUser,
  UserRole,
  USER_ROLE_LABELS,
} from '../../../core/interfaces/admin.interface';

/**
 * Users List Component
 * Display and manage admin users with modern Tailwind design
 * Migrated from PrimeNG to custom Tailwind + inline SVG icons
 */
@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="users-page p-8 min-h-screen">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex justify-between items-start pb-6 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h1 class="flex items-center gap-3 text-3xl font-bold bg-gradient-to-r from-[#3D5A80] via-[#5DB7C2] to-[#6B4C9A] bg-clip-text text-transparent">
              <svg class="h-7 w-7 text-[#5DB7C2]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              User Management
            </h1>
            <p class="mt-1 text-neutral-500 dark:text-neutral-400">Manage admin users and their access permissions</p>
          </div>
          @if (canManageUsers) {
            <button
              (click)="createUser()"
              class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3D5A80] to-[#5DB7C2] text-white rounded-xl font-semibold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              Add User
            </button>
          } @else {
            <span class="flex items-center gap-2 px-4 py-2 text-neutral-500 dark:text-neutral-400 text-sm bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              View Only
            </span>
          }
        </div>
      </div>

      <!-- Filters Card -->
      <div class="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 mb-6 shadow-sm">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_180px_150px_auto] gap-4 items-end">
          <!-- Search Input -->
          <div class="flex flex-col">
            <label class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">Search</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5DB7C2]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (keyup.enter)="onSearch()"
                placeholder="Search by name or email..."
                class="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5DB7C2] transition-all"
              />
            </div>
          </div>

          <!-- Role Filter -->
          <div class="flex flex-col">
            <label class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">Role</label>
            <select
              [(ngModel)]="selectedRole"
              (ngModelChange)="onFilterChange()"
              class="h-11 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#5DB7C2] transition-all"
            >
              @for (opt of roleOptions; track opt.value) {
                <option [ngValue]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>

          <!-- Active Only Toggle -->
          <div class="flex flex-col">
            <label class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">Status</label>
            <label class="flex items-center gap-2 h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="showActiveOnly"
                (change)="onFilterChange()"
                class="w-4 h-4 accent-[#5DB7C2] rounded"
              />
              <span class="text-sm text-neutral-700 dark:text-neutral-300">Active only</span>
            </label>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <button
              (click)="onSearch()"
              class="flex items-center gap-2 h-11 px-5 bg-gradient-to-r from-[#5DB7C2] to-[#3D5A80] text-white rounded-xl font-semibold text-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              Search
            </button>
            <button
              (click)="loadUsers()"
              title="Refresh"
              class="flex items-center justify-center w-11 h-11 rounded-xl border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-[#5DB7C2]/10 hover:border-[#5DB7C2] hover:text-[#5DB7C2] transition-all"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M8 16H3v5"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table Card -->
      <div class="bg-white/85 dark:bg-neutral-800/85 backdrop-blur-xl border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-lg overflow-hidden">
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-16 text-neutral-400">
            <svg class="animate-spin h-10 w-10 text-[#5DB7C2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-4 text-sm">Loading users...</p>
          </div>
        } @else {
          <!-- Table Header -->
          <div class="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_140px] gap-4 px-6 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700">
            <span class="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">User</span>
            <span class="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Role</span>
            <span class="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 text-center">Status</span>
            <span class="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 text-center">Last Login</span>
            <span class="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 text-center">Assigned Leads</span>
            <span class="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 text-center">Actions</span>
          </div>

          <!-- Table Body -->
          @for (user of users(); track user.id) {
            <div
              class="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_140px] gap-4 px-6 py-4 items-center border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-[#5DB7C2]/5 dark:hover:bg-[#5DB7C2]/10 transition-colors"
              [class.bg-[#6B4C9A]/5]="user.role === 'SUPER_ADMIN'"
              [class.dark:bg-[#6B4C9A]/10]="user.role === 'SUPER_ADMIN'"
              [class.border-l-3]="user.role === 'SUPER_ADMIN'"
              [class.border-l-[#6B4C9A]]="user.role === 'SUPER_ADMIN'"
            >
              <!-- User Info -->
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0"
                  [style.background]="getRoleGradient(user.role)"
                >
                  {{ getInitials(user) }}
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">{{ user.firstName }} {{ user.lastName }}</span>
                  <span class="text-xs text-neutral-500 dark:text-neutral-400 truncate">{{ user.email }}</span>
                </div>
              </div>

              <!-- Role Badge -->
              <div>
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm"
                  [style.background]="getRoleBadgeGradient(user.role)"
                >
                  <span [innerHTML]="getRoleIconSvg(user.role)"></span>
                  {{ getRoleLabel(user.role) }}
                </span>
              </div>

              <!-- Status Badge -->
              <div class="flex md:justify-center">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  [class.bg-emerald-100]="user.isActive"
                  [class.text-emerald-700]="user.isActive"
                  [class.dark:bg-emerald-900/30]="user.isActive"
                  [class.dark:text-emerald-400]="user.isActive"
                  [class.bg-red-100]="!user.isActive"
                  [class.text-red-700]="!user.isActive"
                  [class.dark:bg-red-900/30]="!user.isActive"
                  [class.dark:text-red-400]="!user.isActive"
                >
                  <span
                    class="w-2 h-2 rounded-full"
                    [class.bg-emerald-500]="user.isActive"
                    [class.shadow-[0_0_8px_rgba(16,185,129,0.5)]]="user.isActive"
                    [class.bg-red-500]="!user.isActive"
                  ></span>
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>

              <!-- Last Login -->
              <div class="flex flex-col items-center gap-0.5">
                @if (user.lastLoginAt) {
                  <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ formatDate(user.lastLoginAt) }}</span>
                  <span class="text-xs text-neutral-500 dark:text-neutral-400">{{ formatTime(user.lastLoginAt) }}</span>
                } @else {
                  <span class="text-sm text-neutral-400 dark:text-neutral-500 italic">Never logged in</span>
                }
              </div>

              <!-- Assigned Leads -->
              <div class="flex md:justify-center">
                <span
                  class="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-lg font-bold text-sm"
                  [class.bg-neutral-100]="!(user.assignedLeadsCount || 0)"
                  [class.text-neutral-500]="!(user.assignedLeadsCount || 0)"
                  [class.dark:bg-neutral-700]="!(user.assignedLeadsCount || 0)"
                  [class.dark:text-neutral-400]="!(user.assignedLeadsCount || 0)"
                  [class.bg-[#5DB7C2]/15]="(user.assignedLeadsCount || 0) > 0"
                  [class.text-[#3D5A80]]="(user.assignedLeadsCount || 0) > 0"
                  [class.dark:bg-[#5DB7C2]/20]="(user.assignedLeadsCount || 0) > 0"
                  [class.dark:text-[#5DB7C2]]="(user.assignedLeadsCount || 0) > 0"
                >
                  {{ user.assignedLeadsCount || 0 }}
                </span>
              </div>

              <!-- Actions -->
              <div class="flex justify-center gap-1.5">
                <button
                  (click)="viewUser(user)"
                  title="View Details"
                  class="action-btn-view"
                >
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                @if (canManageUsers) {
                  <button
                    (click)="editUser(user)"
                    title="Edit User"
                    class="action-btn-edit"
                  >
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      <path d="m15 5 4 4"/>
                    </svg>
                  </button>
                  <button
                    (click)="confirmResetPassword(user)"
                    title="Reset Password"
                    class="action-btn-key"
                  >
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/>
                      <path d="m21 2-9.6 9.6"/>
                      <circle cx="7.5" cy="15.5" r="5.5"/>
                    </svg>
                  </button>
                  <button
                    (click)="confirmDelete(user)"
                    title="Delete User"
                    class="action-btn-delete"
                  >
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      <line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
                    </svg>
                  </button>
                }
              </div>
            </div>
          }

          @if (users().length === 0) {
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <svg class="h-16 w-16 text-neutral-200 dark:text-neutral-600 mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <h4 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No Users Found</h4>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-xs">No users match your current filters. Try adjusting your search criteria.</p>
              @if (canManageUsers) {
                <button
                  (click)="createUser()"
                  class="flex items-center gap-2 px-5 py-2.5 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl text-neutral-700 dark:text-neutral-300 font-semibold text-sm hover:border-[#5DB7C2] hover:text-[#5DB7C2] hover:bg-[#5DB7C2]/5 transition-all"
                >
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"/><path d="M12 5v14"/>
                  </svg>
                  Add New User
                </button>
              }
            </div>
          }

          <!-- Pagination Info -->
          @if (users().length > 0) {
            <div class="flex justify-between items-center px-6 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-700">
              <span class="text-sm text-neutral-500 dark:text-neutral-400">
                Showing <strong class="text-neutral-900 dark:text-neutral-100">{{ users().length }}</strong> users
              </span>
            </div>
          }
        }
      </div>
    </div>

    <!-- Reset Password Dialog -->
    @if (showResetDialog) {
      <div class="dialog-root">
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" (click)="closeResetDialog()" aria-hidden="true"></div>
        <div class="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-[#3D5A80] to-[#5DB7C2] px-6 py-4">
            <h2 class="text-lg font-semibold text-white">Password Reset Successful</h2>
          </div>

          <!-- Content -->
          <div class="p-8 text-center">
            <div class="mb-5">
              <svg class="h-16 w-16 mx-auto text-emerald-500 drop-shadow-lg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <p class="text-neutral-700 dark:text-neutral-200 mb-6">
              Password has been reset for
              <strong class="text-[#5DB7C2]">{{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</strong>
            </p>
            <div class="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 mb-5">
              <label class="block text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">Temporary Password</label>
              <div class="flex items-center justify-center gap-3">
                <code class="text-xl font-mono text-neutral-900 dark:text-[#5DB7C2] tracking-wider">{{ resetPasswordResult }}</code>
                <button
                  (click)="copyPassword()"
                  title="Copy to Clipboard"
                  class="flex items-center justify-center w-9 h-9 rounded-lg bg-[#5DB7C2]/10 text-[#5DB7C2] hover:bg-[#5DB7C2] hover:text-white transition-all"
                >
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                </button>
              </div>
            </div>
            <p class="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <svg class="h-4 w-4 text-[#5DB7C2]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
              The user will be required to change this password upon first login.
            </p>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-700">
            <button
              (click)="closeResetDialog()"
              class="w-full py-3 bg-gradient-to-r from-[#3D5A80] to-[#5DB7C2] text-white rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Confirm Delete Dialog -->
    <ui-confirm-dialog
      [open]="showDeleteConfirm()"
      (openChange)="showDeleteConfirm.set($event)"
      title="Confirm Delete"
      [message]="deleteConfirmMessage()"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      (confirmed)="deleteUser()"
      (cancelled)="cancelDelete()"
    />

    <!-- Confirm Reset Password Dialog -->
    <ui-confirm-dialog
      [open]="showResetConfirm()"
      (openChange)="showResetConfirm.set($event)"
      title="Confirm Reset"
      [message]="resetConfirmMessage()"
      confirmLabel="Reset Password"
      cancelLabel="Cancel"
      variant="default"
      (confirmed)="executeResetPassword()"
      (cancelled)="cancelReset()"
    />
  `,
  styles: [`
    :host {
      display: block;
    }

    .border-l-3 {
      border-left-width: 3px;
    }

    .action-btn-view,
    .action-btn-edit,
    .action-btn-key,
    .action-btn-delete {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn-view {
      background: rgba(93, 183, 194, 0.1);
      color: #5DB7C2;
    }
    .action-btn-view:hover {
      background: #5DB7C2;
      color: white;
      transform: scale(1.08);
    }

    .action-btn-edit {
      background: rgba(61, 90, 128, 0.1);
      color: #3D5A80;
    }
    .action-btn-edit:hover {
      background: #3D5A80;
      color: white;
      transform: scale(1.08);
    }

    .action-btn-key {
      background: rgba(245, 158, 11, 0.1);
      color: #d97706;
    }
    .action-btn-key:hover {
      background: #f59e0b;
      color: white;
      transform: scale(1.08);
    }

    .action-btn-delete {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
    }
    .action-btn-delete:hover {
      background: #ef4444;
      color: white;
      transform: scale(1.08);
    }

    :host-context([data-theme='dark']) {
      .action-btn-view { background: rgba(93, 183, 194, 0.15); }
      .action-btn-edit { background: rgba(61, 90, 128, 0.15); color: #93c5fd; }
      .action-btn-edit:hover { background: #3D5A80; color: white; }
      .action-btn-key { background: rgba(245, 158, 11, 0.15); }
      .action-btn-delete { background: rgba(239, 68, 68, 0.15); }
    }

    @media (max-width: 768px) {
      :host .users-page {
        padding: 1rem;
      }
    }
  `],
})
export class UsersListComponent implements OnInit {
  users = signal<AdminUser[]>([]);
  loading = signal(true);
  searchQuery = '';
  selectedRole: UserRole | null = null;
  showActiveOnly = false;

  // Reset password dialog
  showResetDialog = false;
  resetPasswordResult = '';
  selectedUser: AdminUser | null = null;

  // Confirm dialogs (signal-based)
  showDeleteConfirm = signal(false);
  userToDelete = signal<AdminUser | null>(null);
  showResetConfirm = signal(false);
  userToReset = signal<AdminUser | null>(null);

  roleOptions = [
    { label: 'All Roles', value: null },
    ...Object.entries(USER_ROLE_LABELS).map(([value, label]) => ({
      label,
      value,
    })),
  ];

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  // Permission check - only SUPER_ADMIN can manage users
  canManageUsers = this.authService.canManageUsers();

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService
      .getUsers({
        role: this.selectedRole ?? undefined,
        isActive: this.showActiveOnly ? true : undefined,
        search: this.searchQuery || undefined,
      })
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.loading.set(false);
        },
        error: (error) => {
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) return;
          console.error('Error loading users:', error);
          this.loading.set(false);
          this.toastService.error('Failed to load users', 'Error');
        },
      });
  }

  onSearch(): void {
    this.loadUsers();
  }

  onFilterChange(): void {
    this.loadUsers();
  }

  viewUser(user: AdminUser): void {
    this.router.navigate(['/admin/users', user.id]);
  }

  createUser(): void {
    this.router.navigate(['/admin/users/new']);
  }

  editUser(user: AdminUser): void {
    this.router.navigate(['/admin/users', user.id, 'edit']);
  }

  // Delete confirm
  confirmDelete(user: AdminUser): void {
    this.userToDelete.set(user);
    this.showDeleteConfirm.set(true);
  }

  deleteConfirmMessage(): string {
    const user = this.userToDelete();
    return user
      ? `Are you sure you want to delete user "${user.firstName} ${user.lastName}"?`
      : 'Are you sure you want to delete this user?';
  }

  cancelDelete(): void {
    this.userToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  deleteUser(): void {
    const user = this.userToDelete();
    if (!user) return;

    this.showDeleteConfirm.set(false);
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.toastService.success('User deleted successfully', 'Success');
        this.userToDelete.set(null);
        this.loadUsers();
      },
      error: (error) => {
        if (error?.name === 'AbortError' || error?.message?.includes('aborted')) return;
        console.error('Error deleting user:', error);
        this.toastService.error(error.error?.message || 'Failed to delete user', 'Error');
        this.userToDelete.set(null);
      },
    });
  }

  // Reset password confirm
  confirmResetPassword(user: AdminUser): void {
    this.userToReset.set(user);
    this.showResetConfirm.set(true);
  }

  resetConfirmMessage(): string {
    const user = this.userToReset();
    return user
      ? `Are you sure you want to reset password for "${user.firstName} ${user.lastName}"?`
      : 'Are you sure you want to reset this user\'s password?';
  }

  cancelReset(): void {
    this.userToReset.set(null);
    this.showResetConfirm.set(false);
  }

  executeResetPassword(): void {
    const user = this.userToReset();
    if (!user) return;

    this.showResetConfirm.set(false);
    this.userService.resetPassword(user.id).subscribe({
      next: (result) => {
        this.selectedUser = user;
        this.resetPasswordResult = result.tempPassword;
        this.showResetDialog = true;
        this.userToReset.set(null);
      },
      error: (error) => {
        if (error?.name === 'AbortError' || error?.message?.includes('aborted')) return;
        console.error('Error resetting password:', error);
        this.toastService.error('Failed to reset password', 'Error');
        this.userToReset.set(null);
      },
    });
  }

  copyPassword(): void {
    navigator.clipboard.writeText(this.resetPasswordResult);
    this.toastService.success('Password copied to clipboard', 'Copied');
  }

  closeResetDialog(): void {
    this.showResetDialog = false;
    this.resetPasswordResult = '';
    this.selectedUser = null;
  }

  getRoleLabel(role: UserRole): string {
    return USER_ROLE_LABELS[role] || role;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getInitials(user: AdminUser): string {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  getRoleGradient(role: UserRole): string {
    const gradients: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'linear-gradient(135deg, #6B4C9A 0%, #3D5A80 100%)',
      [UserRole.ADMIN]: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      [UserRole.SALES_MANAGER]: 'linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%)',
      [UserRole.SALES_REP]: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      [UserRole.VIEWER]: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
    };
    return gradients[role] || 'linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%)';
  }

  getRoleBadgeGradient(role: UserRole): string {
    const gradients: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'linear-gradient(135deg, #6B4C9A 0%, #4a3470 100%)',
      [UserRole.ADMIN]: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      [UserRole.SALES_MANAGER]: 'linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%)',
      [UserRole.SALES_REP]: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      [UserRole.VIEWER]: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
    };
    return gradients[role] || 'linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%)';
  }

  getRoleIconSvg(role: UserRole): string {
    const icons: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: '<svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>',
      [UserRole.ADMIN]: '<svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      [UserRole.SALES_MANAGER]: '<svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      [UserRole.SALES_REP]: '<svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      [UserRole.VIEWER]: '<svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    };
    return icons[role] || '';
  }
}
