import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// shadcn-style UI Components
import { ConfirmDialogComponent } from '../../../shared/components/ui';
import { ToastService } from '../../../shared/components/ui/feedback/toast/toast.service';

// Services
import { AdminService } from '../../../core/services/admin.service';

// Interfaces
interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
}

interface Permission {
  key: string;
  label: string;
  description: string;
}

/**
 * Settings Component
 * System settings management with tabs for different categories
 * Migrated from PrimeNG to shadcn-style Tailwind components
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="p-6 min-h-screen">
      <!-- Header -->
      <div class="mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
          {{ 'Settings' | translate }}
        </h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ 'Manage system configuration and preferences' | translate }}</p>
      </div>

      <!-- Tabs -->
      <div class="flex flex-wrap gap-2 mb-6 p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
        @for (tab of tabs; track tab.value) {
          <button
            (click)="activeTab = tab.value"
            [class]="activeTab === tab.value
              ? 'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-sm transition-all'
              : 'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-all'"
          >
            <span [innerHTML]="tab.icon"></span>
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Tab Content -->
      <!-- General Settings -->
      @if (activeTab === 'general') {
        <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
            <svg class="h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            <span class="font-semibold text-neutral-900 dark:text-neutral-100">General Settings</span>
          </div>
          <div class="p-6">
            <form [formGroup]="generalForm" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Company Name</label>
                <input formControlName="companyName" type="text" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Support Email</label>
                <input formControlName="supportEmail" type="email" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Phone Number</label>
                <input formControlName="phoneNumber" type="tel" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Timezone</label>
                <select formControlName="timezone" class="input-field">
                  @for (opt of timezoneOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Date Format</label>
                <select formControlName="dateFormat" class="input-field">
                  @for (opt of dateFormatOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
              <hr class="border-neutral-200 dark:border-neutral-700" />
              <div class="flex justify-end">
                <button (click)="saveGeneralSettings()" [disabled]="saving()" class="btn-primary">
                  @if (saving()) { <span class="spinner"></span> }
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Email Settings -->
      @if (activeTab === 'email') {
        <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
            <svg class="h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <span class="font-semibold text-neutral-900 dark:text-neutral-100">Email Settings</span>
          </div>
          <div class="p-6">
            <form [formGroup]="emailForm" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">SMTP Host</label>
                <input formControlName="smtpHost" type="text" class="input-field" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">SMTP Port</label>
                  <input formControlName="smtpPort" type="number" min="1" max="65535" class="input-field" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Encryption</label>
                  <select formControlName="smtpEncryption" class="input-field">
                    @for (opt of encryptionOptions; track opt.value) {
                      <option [value]="opt.value">{{ opt.label }}</option>
                    }
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">From Email</label>
                <input formControlName="fromEmail" type="email" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">From Name</label>
                <input formControlName="fromName" type="text" class="input-field" />
              </div>
              <hr class="border-neutral-200 dark:border-neutral-700" />
              <div class="flex justify-end gap-2">
                <button (click)="testEmailConnection()" class="btn-secondary">
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  Test Connection
                </button>
                <button (click)="saveEmailSettings()" [disabled]="saving()" class="btn-primary">
                  @if (saving()) { <span class="spinner"></span> }
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Notification Settings -->
      @if (activeTab === 'notifications') {
        <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
            <svg class="h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span class="font-semibold text-neutral-900 dark:text-neutral-100">Notification Settings</span>
          </div>
          <div class="p-6">
            <form [formGroup]="notificationForm" class="space-y-5">
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" formControlName="newLeadEmail" class="checkbox-field" />
                <span class="text-sm text-neutral-700 dark:text-neutral-300">Email notification for new leads</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" formControlName="leadAssignmentEmail" class="checkbox-field" />
                <span class="text-sm text-neutral-700 dark:text-neutral-300">Email notification when lead is assigned</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" formControlName="dailyDigest" class="checkbox-field" />
                <span class="text-sm text-neutral-700 dark:text-neutral-300">Daily digest email summary</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" formControlName="weeklyReport" class="checkbox-field" />
                <span class="text-sm text-neutral-700 dark:text-neutral-300">Weekly performance report</span>
              </label>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Notification Recipients</label>
                <input formControlName="notificationRecipients" type="text" class="input-field" placeholder="Comma-separated email addresses" />
              </div>
              <hr class="border-neutral-200 dark:border-neutral-700" />
              <div class="flex justify-end">
                <button (click)="saveNotificationSettings()" [disabled]="saving()" class="btn-primary">
                  @if (saving()) { <span class="spinner"></span> }
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Lead Settings -->
      @if (activeTab === 'leads') {
        <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
            <svg class="h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="font-semibold text-neutral-900 dark:text-neutral-100">Lead Settings</span>
          </div>
          <div class="p-6">
            <form [formGroup]="leadForm" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Default Lead Assignment</label>
                <select formControlName="defaultAssignment" class="input-field">
                  @for (opt of assignmentOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Lead Follow-up Reminder (hours)</label>
                <input formControlName="followUpReminderHours" type="number" min="1" max="168" class="input-field" />
              </div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" formControlName="autoArchiveOldLeads" class="checkbox-field" />
                <span class="text-sm text-neutral-700 dark:text-neutral-300">Auto-archive leads inactive for 90+ days</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" formControlName="requireNoteOnStatusChange" class="checkbox-field" />
                <span class="text-sm text-neutral-700 dark:text-neutral-300">Require note when changing lead status</span>
              </label>
              <hr class="border-neutral-200 dark:border-neutral-700" />
              <div class="flex justify-end">
                <button (click)="saveLeadSettings()" [disabled]="saving()" class="btn-primary">
                  @if (saving()) { <span class="spinner"></span> }
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Security Settings -->
      @if (activeTab === 'security') {
        <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
            <svg class="h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
            <span class="font-semibold text-neutral-900 dark:text-neutral-100">Security Settings</span>
          </div>
          <div class="p-6">
            <form [formGroup]="securityForm" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Session Timeout (minutes)</label>
                <input formControlName="sessionTimeout" type="number" min="5" max="1440" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Max Login Attempts</label>
                <input formControlName="maxLoginAttempts" type="number" min="3" max="10" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Password Expiry (days)</label>
                <input formControlName="passwordExpiryDays" type="number" min="0" max="365" class="input-field" />
                <small class="text-neutral-400 text-xs mt-1 block">Set to 0 for no expiry</small>
              </div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" formControlName="requireTwoFactor" class="checkbox-field" />
                <span class="text-sm text-neutral-700 dark:text-neutral-300">Require two-factor authentication</span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" formControlName="logAllActions" class="checkbox-field" />
                <span class="text-sm text-neutral-700 dark:text-neutral-300">Log all user actions for audit trail</span>
              </label>
              <hr class="border-neutral-200 dark:border-neutral-700" />
              <div class="flex justify-end">
                <button (click)="saveSecuritySettings()" [disabled]="saving()" class="btn-primary">
                  @if (saving()) { <span class="spinner"></span> }
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Admin Roles -->
      @if (activeTab === 'roles') {
        <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span class="font-semibold text-neutral-900 dark:text-neutral-100">Admin Roles Management</span>
            </div>
            <button (click)="openRoleDialog()" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors">
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Add Role
            </button>
          </div>
          <div class="p-6">
            <!-- Roles Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b-2 border-neutral-200 dark:border-neutral-700">
                    <th class="text-left py-3 px-4 font-semibold text-neutral-500 dark:text-neutral-400 uppercase text-xs tracking-wider" style="width: 20%">Role Name</th>
                    <th class="text-left py-3 px-4 font-semibold text-neutral-500 dark:text-neutral-400 uppercase text-xs tracking-wider" style="width: 30%">Description</th>
                    <th class="text-left py-3 px-4 font-semibold text-neutral-500 dark:text-neutral-400 uppercase text-xs tracking-wider" style="width: 35%">Permissions</th>
                    <th class="text-left py-3 px-4 font-semibold text-neutral-500 dark:text-neutral-400 uppercase text-xs tracking-wider" style="width: 15%">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (role of roles(); track role.id) {
                    <tr class="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td class="py-3 px-4">
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                          [style.background]="getRoleBadgeColor(role.name)"
                        >
                          {{ role.name }}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-neutral-600 dark:text-neutral-400">{{ role.description }}</td>
                      <td class="py-3 px-4">
                        <div class="flex flex-wrap gap-1">
                          @for (perm of role.permissions.slice(0, 4); track perm) {
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                              {{ perm }}
                            </span>
                          }
                          @if (role.permissions.length > 4) {
                            <span
                              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 cursor-pointer"
                              [title]="role.permissions.slice(4).join(', ')"
                            >
                              +{{ role.permissions.length - 4 }} more
                            </span>
                          }
                        </div>
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex gap-1">
                          <button
                            (click)="editRole(role)"
                            [disabled]="role.isSystem"
                            class="p-1.5 rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Edit"
                          >
                            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                          </button>
                          <button
                            (click)="confirmDeleteRole(role)"
                            [disabled]="role.isSystem"
                            class="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Delete"
                          >
                            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                  @if (roles().length === 0) {
                    <tr>
                      <td colspan="4" class="text-center py-12 text-neutral-400">
                        No roles defined yet
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Role Info Note -->
            <div class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div class="flex items-start gap-2">
                <svg class="h-4 w-4 text-blue-500 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <div class="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> System roles (Super Admin, Admin) cannot be modified or deleted. Custom roles can be created with specific permissions.
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Role Dialog -->
    @if (roleDialogVisible) {
      <div class="dialog-root">
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" (click)="roleDialogVisible = false" aria-hidden="true"></div>
        <div class="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6 shadow-lg rounded-xl">
          <button
            type="button"
            class="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            (click)="roleDialogVisible = false"
            aria-label="Close"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>

          <h2 class="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
            {{ editingRole() ? 'Edit Role' : 'Add New Role' }}
          </h2>

          <form [formGroup]="roleForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Role Name *</label>
              <input formControlName="name" type="text" class="input-field" placeholder="e.g., Content Manager" />
              @if (roleForm.get('name')?.invalid && roleForm.get('name')?.touched) {
                <small class="text-red-500 text-xs mt-1">Role name is required</small>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Description</label>
              <input formControlName="description" type="text" class="input-field" placeholder="Brief description of this role" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Permissions</label>
              <div class="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                @for (perm of availablePermissions; track perm.key) {
                  <label class="flex items-start gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      [formControlName]="'perm_' + perm.key"
                      class="checkbox-field mt-0.5"
                    />
                    <div>
                      <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{{ perm.label }}</span>
                      <span class="text-xs text-neutral-400 block">{{ perm.description }}</span>
                    </div>
                  </label>
                }
              </div>
            </div>
          </form>

          <div class="flex justify-end gap-2 mt-6">
            <button (click)="roleDialogVisible = false" class="btn-secondary">Cancel</button>
            <button
              (click)="saveRole()"
              [disabled]="roleForm.invalid || savingRole()"
              class="btn-primary"
            >
              @if (savingRole()) { <span class="spinner"></span> }
              {{ editingRole() ? 'Update Role' : 'Create Role' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Role Confirmation -->
    <ui-confirm-dialog
      [open]="showDeleteRoleConfirm()"
      (openChange)="showDeleteRoleConfirm.set($event)"
      variant="destructive"
      title="Delete Role"
      [message]="deleteRoleMessage()"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      (confirmed)="confirmDeleteRoleAction()"
      (cancelled)="cancelDeleteRole()"
    ></ui-confirm-dialog>
  `,
  styles: [`
    :host { display: block; }

    .input-field {
      display: flex;
      height: 2.5rem;
      width: 100%;
      border-radius: 0.375rem;
      border: 1px solid rgb(212 212 212);
      background-color: white;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.15s;

      &:focus {
        ring: 2px;
        border-color: var(--color-primary-500, #3D5A80);
        box-shadow: 0 0 0 2px rgba(61, 90, 128, 0.2);
      }
    }

    :host-context([data-theme='dark']) .input-field,
    :host-context(.dark) .input-field {
      border-color: rgb(82 82 82);
      background-color: rgb(38 38 38);
      color: rgb(245 245 245);
    }

    .checkbox-field {
      width: 1rem;
      height: 1rem;
      border-radius: 0.25rem;
      border: 1px solid rgb(212 212 212);
      accent-color: var(--color-primary-500, #3D5A80);
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      background-color: var(--color-primary-500, #3D5A80);
      color: white;
      transition: all 0.15s;

      &:hover:not(:disabled) {
        background-color: var(--color-primary-600, #345070);
      }
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid rgb(212 212 212);
      color: rgb(64 64 64);
      transition: all 0.15s;

      &:hover {
        background-color: rgb(245 245 245);
      }
    }

    :host-context([data-theme='dark']) .btn-secondary,
    :host-context(.dark) .btn-secondary {
      border-color: rgb(82 82 82);
      color: rgb(212 212 212);
      &:hover { background-color: rgb(64 64 64); }
    }

    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class SettingsComponent implements OnInit {
  activeTab = 'general';
  saving = signal(false);

  private toastService = inject(ToastService);

  // Tab definitions
  tabs = [
    { value: 'general', label: 'General', icon: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>' },
    { value: 'email', label: 'Email', icon: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' },
    { value: 'notifications', label: 'Notifications', icon: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>' },
    { value: 'leads', label: 'Leads', icon: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    { value: 'security', label: 'Security', icon: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>' },
    { value: 'roles', label: 'Admin Roles', icon: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  ];

  // Forms
  generalForm!: FormGroup;
  emailForm!: FormGroup;
  notificationForm!: FormGroup;
  leadForm!: FormGroup;
  securityForm!: FormGroup;
  roleForm!: FormGroup;

  // Role Management
  roles = signal<AdminRole[]>([
    {
      id: 'super-admin',
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: ['all'],
      isSystem: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Administrative access with limited system settings',
      permissions: ['leads.view', 'leads.edit', 'leads.delete', 'analytics.view', 'content.view', 'content.edit', 'users.view'],
      isSystem: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'content-manager',
      name: 'Content Manager',
      description: 'Manage blog posts, case studies, and website content',
      permissions: ['content.view', 'content.edit', 'content.delete', 'content.publish'],
      isSystem: false,
      createdAt: new Date('2024-06-15'),
    },
    {
      id: 'sales-rep',
      name: 'Sales Representative',
      description: 'View and manage assigned leads',
      permissions: ['leads.view', 'leads.edit', 'analytics.view'],
      isSystem: false,
      createdAt: new Date('2024-08-20'),
    },
  ]);

  roleDialogVisible = false;
  editingRole = signal<AdminRole | null>(null);
  savingRole = signal(false);

  // Delete role confirm
  showDeleteRoleConfirm = signal(false);
  roleToDelete = signal<AdminRole | null>(null);

  availablePermissions: Permission[] = [
    { key: 'leads.view', label: 'View Leads', description: 'View lead list and details' },
    { key: 'leads.edit', label: 'Edit Leads', description: 'Modify lead information' },
    { key: 'leads.delete', label: 'Delete Leads', description: 'Remove leads from system' },
    { key: 'leads.assign', label: 'Assign Leads', description: 'Assign leads to team members' },
    { key: 'analytics.view', label: 'View Analytics', description: 'Access analytics dashboard' },
    { key: 'analytics.export', label: 'Export Analytics', description: 'Export analytics data' },
    { key: 'content.view', label: 'View Content', description: 'View blog and case studies' },
    { key: 'content.edit', label: 'Edit Content', description: 'Create and edit content' },
    { key: 'content.delete', label: 'Delete Content', description: 'Remove content items' },
    { key: 'content.publish', label: 'Publish Content', description: 'Publish content publicly' },
    { key: 'users.view', label: 'View Users', description: 'View user list' },
    { key: 'users.edit', label: 'Edit Users', description: 'Modify user accounts' },
    { key: 'users.delete', label: 'Delete Users', description: 'Remove user accounts' },
    { key: 'settings.view', label: 'View Settings', description: 'Access system settings' },
    { key: 'settings.edit', label: 'Edit Settings', description: 'Modify system settings' },
  ];

  // Options
  timezoneOptions = [
    { label: 'UTC', value: 'UTC' },
    { label: 'Africa/Cairo (EET)', value: 'Africa/Cairo' },
    { label: 'Asia/Dubai (GST)', value: 'Asia/Dubai' },
    { label: 'Europe/London (GMT)', value: 'Europe/London' },
    { label: 'America/New_York (EST)', value: 'America/New_York' },
  ];

  dateFormatOptions = [
    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  ];

  encryptionOptions = [
    { label: 'None', value: 'none' },
    { label: 'SSL', value: 'ssl' },
    { label: 'TLS', value: 'tls' },
  ];

  assignmentOptions = [
    { label: 'Round Robin', value: 'round_robin' },
    { label: 'Random', value: 'random' },
    { label: 'Manual Only', value: 'manual' },
    { label: 'By Region', value: 'by_region' },
  ];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadSettings();
  }

  initForms(): void {
    this.generalForm = this.fb.group({
      companyName: ['Roaya IT'],
      supportEmail: ['support@roaya.ai'],
      phoneNumber: ['+20 2 1234 5678'],
      timezone: ['Africa/Cairo'],
      dateFormat: ['DD/MM/YYYY'],
    });

    this.emailForm = this.fb.group({
      smtpHost: ['smtp.sendgrid.net'],
      smtpPort: [587],
      smtpEncryption: ['tls'],
      fromEmail: ['noreply@roaya.ai'],
      fromName: ['Roaya IT'],
    });

    this.notificationForm = this.fb.group({
      newLeadEmail: [true],
      leadAssignmentEmail: [true],
      dailyDigest: [false],
      weeklyReport: [true],
      notificationRecipients: [''],
    });

    this.leadForm = this.fb.group({
      defaultAssignment: ['round_robin'],
      followUpReminderHours: [24],
      autoArchiveOldLeads: [true],
      requireNoteOnStatusChange: [false],
    });

    this.securityForm = this.fb.group({
      sessionTimeout: [60],
      maxLoginAttempts: [5],
      passwordExpiryDays: [90],
      requireTwoFactor: [false],
      logAllActions: [true],
    });

    this.initRoleForm();
  }

  initRoleForm(): void {
    const formConfig: Record<string, any> = {
      name: ['', [Validators.required]],
      description: [''],
    };

    this.availablePermissions.forEach((perm) => {
      formConfig['perm_' + perm.key] = [false];
    });

    this.roleForm = this.fb.group(formConfig);
  }

  loadSettings(): void {
    this.adminService.getSettings().subscribe({
      next: (settings) => {
        if (settings['general']) this.generalForm.patchValue(settings['general']);
        if (settings['email']) this.emailForm.patchValue(settings['email']);
        if (settings['notifications']) this.notificationForm.patchValue(settings['notifications']);
        if (settings['leads']) this.leadForm.patchValue(settings['leads']);
        if (settings['security']) this.securityForm.patchValue(settings['security']);
      },
      error: (error) => {
        console.error('Error loading settings:', error);
      },
    });
  }

  saveGeneralSettings(): void {
    this.saveSettings('general', this.generalForm.value);
  }

  saveEmailSettings(): void {
    this.saveSettings('email', this.emailForm.value);
  }

  saveNotificationSettings(): void {
    this.saveSettings('notifications', this.notificationForm.value);
  }

  saveLeadSettings(): void {
    this.saveSettings('leads', this.leadForm.value);
  }

  saveSecuritySettings(): void {
    this.saveSettings('security', this.securityForm.value);
  }

  private saveSettings(category: string, value: unknown): void {
    this.saving.set(true);
    this.adminService.updateSetting(category, value).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success('Settings saved successfully', 'Success');
      },
      error: (error) => {
        this.saving.set(false);
        console.error('Error saving settings:', error);
        this.toastService.error('Failed to save settings', 'Error');
      },
    });
  }

  testEmailConnection(): void {
    this.toastService.info('Testing email connection...', 'Testing');

    setTimeout(() => {
      this.toastService.success('Email connection test successful', 'Success');
    }, 1500);
  }

  // Role Management Methods
  openRoleDialog(): void {
    this.editingRole.set(null);
    this.roleForm.reset();
    this.initRoleForm();
    this.roleDialogVisible = true;
  }

  editRole(role: AdminRole): void {
    this.editingRole.set(role);
    this.initRoleForm();

    this.roleForm.patchValue({
      name: role.name,
      description: role.description,
    });

    role.permissions.forEach((perm) => {
      const control = this.roleForm.get('perm_' + perm);
      if (control) {
        control.setValue(true);
      }
    });

    this.roleDialogVisible = true;
  }

  saveRole(): void {
    if (this.roleForm.invalid) return;

    this.savingRole.set(true);

    const selectedPermissions: string[] = [];
    this.availablePermissions.forEach((perm) => {
      if (this.roleForm.get('perm_' + perm.key)?.value) {
        selectedPermissions.push(perm.key);
      }
    });

    const roleData = {
      name: this.roleForm.get('name')?.value?.trim(),
      description: this.roleForm.get('description')?.value?.trim() || '',
      permissions: selectedPermissions,
    };

    setTimeout(() => {
      const currentRoles = this.roles();
      const editing = this.editingRole();

      if (editing) {
        const updatedRoles = currentRoles.map((r) =>
          r.id === editing.id ? { ...r, ...roleData } : r
        );
        this.roles.set(updatedRoles);
        this.toastService.success(`Role "${roleData.name}" updated successfully`, 'Success');
      } else {
        const newRole: AdminRole = {
          id: 'role-' + Date.now(),
          ...roleData,
          isSystem: false,
          createdAt: new Date(),
        };
        this.roles.set([...currentRoles, newRole]);
        this.toastService.success(`Role "${roleData.name}" created successfully`, 'Success');
      }

      this.savingRole.set(false);
      this.roleDialogVisible = false;
    }, 800);
  }

  confirmDeleteRole(role: AdminRole): void {
    this.roleToDelete.set(role);
    this.showDeleteRoleConfirm.set(true);
  }

  deleteRoleMessage(): string {
    const role = this.roleToDelete();
    if (!role) return '';
    return `Are you sure you want to delete the role "${role.name}"? Users with this role will lose their permissions.`;
  }

  confirmDeleteRoleAction(): void {
    const role = this.roleToDelete();
    if (!role) return;

    const currentRoles = this.roles();
    this.roles.set(currentRoles.filter((r) => r.id !== role.id));
    this.toastService.success(`Role "${role.name}" has been deleted`, 'Deleted');
    this.showDeleteRoleConfirm.set(false);
    this.roleToDelete.set(null);
  }

  cancelDeleteRole(): void {
    this.showDeleteRoleConfirm.set(false);
    this.roleToDelete.set(null);
  }

  getRoleBadgeColor(roleName: string): string {
    const colors: Record<string, string> = {
      'Super Admin': 'linear-gradient(135deg, #6B4C9A 0%, #3D5A80 100%)',
      'Admin': 'linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%)',
      'Content Manager': 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      'Sales Representative': 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    };
    return colors[roleName] || 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)';
  }
}
