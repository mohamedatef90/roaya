import { Component, OnInit, signal, ViewChild, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// shadcn-style UI Components
import {
  CardComponent,
  CardHeaderComponent,
  CardContentComponent,
  InputComponent,
  SpinnerComponent,
  ConfirmDialogComponent,
} from '../../../shared/components/ui';
import { ToastService } from '../../../shared/components/ui/feedback/toast/toast.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

// Services
import { LeadService } from '../../../core/services/lead.service';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import {
  Lead,
  LeadActivity,
  LeadNote,
  LeadStatus,
  LeadPriority,
  ActivityType,
  LEAD_STATUS_LABELS,
  LEAD_PRIORITY_LABELS,
  Tag,
  CreateNoteDto,
  CreateActivityDto,
  PaginationMeta,
  AdminUser,
} from '../../../core/interfaces/admin.interface';

// Sub-components
import {
  ActivityTimelineComponent,
  InlineEditFieldComponent,
  TagManagerComponent,
  QuickActionsComponent,
} from './components';

/**
 * Lead Detail Component
 * View and edit single lead with activities, notes, and tags
 * Migrated from PrimeNG to shadcn-style Tailwind components
 */
@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    // shadcn-style components
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    InputComponent,
    SpinnerComponent,
    ConfirmDialogComponent,
    ButtonComponent,
    // Sub-components
    ActivityTimelineComponent,
    InlineEditFieldComponent,
    TagManagerComponent,
    QuickActionsComponent,
  ],
  template: `
    @if (lead()) {
      <div class="lead-detail">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div class="flex items-center gap-3">
            <button
              [routerLink]="['/admin/leads']"
              class="flex items-center justify-center w-10 h-10 rounded-full text-neutral-500 hover:bg-surface-hover transition-colors"
              aria-label="Back to leads"
            >
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
              </svg>
            </button>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-content-primary">
                {{ lead()!.firstName }} {{ lead()!.lastName }}
              </h1>
              <p class="text-sm text-content-muted mt-0.5">
                {{ lead()!.email }} &bull; {{ lead()!.company || 'No Company' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              (click)="onSubmit()"
              [disabled]="leadForm.invalid || saving()"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              @if (saving()) {
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              } @else {
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
              }
              Save
            </button>
            <button
              (click)="deleteLead()"
              class="inline-flex items-center justify-center w-10 h-10 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete lead"
            >
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Left Column - Lead Information -->
          <div class="flex flex-col gap-6">
            <!-- Lead Info Card -->
            <div class="rounded-xl border border-edge-subtle bg-surface-elevated shadow-sm">
              <div class="px-6 py-4 border-b border-edge-subtle">
                <h3 class="text-lg font-semibold text-content-primary">{{ 'Lead Information' | translate }}</h3>
              </div>
              <div class="p-6">
                <form [formGroup]="leadForm" class="space-y-5">
                  <!-- Name Fields -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label for="firstName" class="block text-sm font-medium text-content-secondary mb-1.5">
                        {{ 'First Name' | translate }} *
                      </label>
                      <input
                        id="firstName"
                        formControlName="firstName"
                        type="text"
                        class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                      />
                    </div>
                    <div>
                      <label for="lastName" class="block text-sm font-medium text-content-secondary mb-1.5">
                        {{ 'Last Name' | translate }} *
                      </label>
                      <input
                        id="lastName"
                        formControlName="lastName"
                        type="text"
                        class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                      />
                    </div>
                  </div>

                  <!-- Email -->
                  <div>
                    <label for="email" class="block text-sm font-medium text-content-secondary mb-1.5">
                      {{ 'Email' | translate }} *
                    </label>
                    <input
                      id="email"
                      formControlName="email"
                      type="email"
                      class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                    />
                  </div>

                  <!-- Phone -->
                  <div>
                    <label for="phone" class="block text-sm font-medium text-content-secondary mb-1.5">
                      {{ 'Phone' | translate }}
                    </label>
                    <input
                      id="phone"
                      formControlName="phone"
                      type="tel"
                      class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                    />
                  </div>

                  <!-- Company -->
                  <div>
                    <label for="company" class="block text-sm font-medium text-content-secondary mb-1.5">
                      {{ 'Company' | translate }}
                    </label>
                    <input
                      id="company"
                      formControlName="company"
                      type="text"
                      class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                    />
                  </div>

                  <!-- Job Title -->
                  <div>
                    <label for="jobTitle" class="block text-sm font-medium text-content-secondary mb-1.5">
                      {{ 'Job Title' | translate }}
                    </label>
                    <input
                      id="jobTitle"
                      formControlName="jobTitle"
                      type="text"
                      class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                    />
                  </div>

                  <!-- Website -->
                  <div>
                    <label for="website" class="block text-sm font-medium text-content-secondary mb-1.5">
                      {{ 'Website' | translate }}
                    </label>
                    <input
                      id="website"
                      formControlName="website"
                      type="url"
                      class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                    />
                  </div>

                  <!-- Status & Priority -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label for="status" class="block text-sm font-medium text-content-secondary mb-1.5">
                        {{ 'Status' | translate }} *
                      </label>
                      <select
                        id="status"
                        formControlName="status"
                        class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                      >
                        @for (opt of statusOptions; track opt.value) {
                          <option [value]="opt.value">{{ opt.label }}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label for="priority" class="block text-sm font-medium text-content-secondary mb-1.5">
                        {{ 'Priority' | translate }} *
                      </label>
                      <select
                        id="priority"
                        formControlName="priority"
                        class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                      >
                        @for (opt of priorityOptions; track opt.value) {
                          <option [value]="opt.value">{{ opt.label }}</option>
                        }
                      </select>
                    </div>
                  </div>

                  <!-- Assign To (Super Admin Only) -->
                  @if (isSuperAdmin()) {
                    <div>
                      <label for="assignedToId" class="block text-sm font-medium text-content-secondary mb-1.5">
                        {{ 'Assign To' | translate }}
                      </label>
                      <select
                        id="assignedToId"
                        formControlName="assignedToId"
                        class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                      >
                        <option [value]="''">Unassigned</option>
                        @for (user of users(); track user.id) {
                          <option [value]="user.id">{{ user.firstName }} {{ user.lastName }} ({{ user.role }})</option>
                        }
                      </select>
                    </div>
                  } @else if (lead()?.assignedTo) {
                    <div>
                      <label class="block text-sm font-medium text-content-secondary mb-1.5">
                        {{ 'Assigned To' | translate }}
                      </label>
                      <p class="flex h-10 w-full items-center rounded-md border border-edge-subtle bg-surface-secondary px-3 text-sm text-content-secondary">
                        {{ lead()!.assignedTo!.firstName }} {{ lead()!.assignedTo!.lastName }}
                      </p>
                    </div>
                  }

                  <!-- Follow-up Date -->
                  <div>
                    <label for="nextFollowUpAt" class="block text-sm font-medium text-content-secondary mb-1.5">
                      {{ 'Next Follow-up' | translate }}
                    </label>
                    <input
                      id="nextFollowUpAt"
                      formControlName="nextFollowUpAt"
                      type="datetime-local"
                      class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                    />
                  </div>
                </form>
              </div>
            </div>

            <!-- Tags Card -->
            <div class="rounded-xl border border-edge-subtle bg-surface-elevated shadow-sm">
              <div class="px-6 py-4 border-b border-edge-subtle">
                <h3 class="text-lg font-semibold text-content-primary">{{ 'Tags' | translate }}</h3>
              </div>
              <div class="p-6">
                <app-tag-manager
                  #tagManager
                  [currentTags]="lead()?.tags ?? []"
                  [availableTags]="availableTags()"
                  [loading]="loading()"
                  (addTag)="onAddTag($event)"
                  (removeTagEvent)="onRemoveTag($event)"
                  (createNewTag)="onCreateNewTag($event)"
                />
              </div>
            </div>
          </div>

          <!-- Right Column - Activity & Notes -->
          <div>
            <!-- Tabs -->
            <div class="rounded-xl border border-edge-subtle bg-surface-elevated shadow-sm">
              <!-- Tab Headers -->
              <div class="flex border-b border-edge-subtle">
                <button
                  (click)="activeTab = 'activity'"
                  [class]="activeTab === 'activity'
                    ? 'px-6 py-3 text-sm font-medium text-primary-600 border-b-2 border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 dark:text-primary-400'
                    : 'px-6 py-3 text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors'"
                >
                  Activity
                </button>
                <button
                  (click)="activeTab = 'notes'"
                  [class]="activeTab === 'notes'
                    ? 'px-6 py-3 text-sm font-medium text-primary-600 border-b-2 border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 dark:text-primary-400'
                    : 'px-6 py-3 text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors'"
                >
                  Notes
                </button>
                <button
                  (click)="activeTab = 'source'"
                  [class]="activeTab === 'source'
                    ? 'px-6 py-3 text-sm font-medium text-primary-600 border-b-2 border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 dark:text-primary-400'
                    : 'px-6 py-3 text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors'"
                >
                  Source Info
                </button>
              </div>

              <!-- Tab Content -->
              <div class="p-6 min-h-[400px]">
                <!-- Activity Tab -->
                @if (activeTab === 'activity') {
                  <app-activity-timeline
                    [activities]="activities()"
                    [meta]="activitiesMeta()"
                    [loading]="activitiesLoading()"
                    (filterChange)="onActivityFilterChange($event)"
                    (pageChange)="onActivityPageChange($event)"
                  />
                }

                <!-- Notes Tab -->
                @if (activeTab === 'notes') {
                  <div class="notes-container">
                    <!-- Add Note Form -->
                    <form [formGroup]="noteForm" (ngSubmit)="addNote()" class="mb-6 pb-6 border-b border-edge-subtle">
                      <textarea
                        formControlName="content"
                        rows="3"
                        placeholder="Add a note..."
                        class="flex min-h-[80px] w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100 mb-3"
                      ></textarea>
                      <div class="flex items-center justify-between">
                        <label class="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            formControlName="isPrivate"
                            class="w-4 h-4 rounded border-edge-strong text-primary-500 focus:ring-primary-500 dark:bg-neutral-800"
                          />
                          <span class="text-sm text-content-secondary">Private Note</span>
                        </label>
                        <button
                          type="submit"
                          [disabled]="noteForm.invalid"
                          class="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14"/><path d="M12 5v14"/>
                          </svg>
                          Add Note
                        </button>
                      </div>
                    </form>

                    <!-- Notes List -->
                    <div class="flex flex-col gap-3">
                      @for (note of lead()!.notes; track note.id) {
                        <div class="p-4 bg-surface-secondary rounded-lg border-l-3 border-primary-500">
                          <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-2">
                              <div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-xs font-semibold shrink-0">
                                {{ note.createdBy ? (note.createdBy.firstName?.charAt(0) || '') + (note.createdBy.lastName?.charAt(0) || '') : '?' }}
                              </div>
                              <strong class="text-sm text-content-primary">
                                {{ note.createdBy ? note.createdBy.firstName + ' ' + note.createdBy.lastName : 'Unknown User' }}
                              </strong>
                              @if (note.isPrivate) {
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                  Private
                                </span>
                              }
                            </div>
                            <button
                              (click)="deleteNote(note.id)"
                              class="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete note"
                            >
                              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                              </svg>
                            </button>
                          </div>
                          <p class="text-sm text-content-secondary mb-1">{{ note.content }}</p>
                          <small class="text-xs text-neutral-400">{{ formatDate(note.createdAt) }}</small>
                        </div>
                      }

                      @if (!lead()?.notes || lead()!.notes!.length === 0) {
                        <div class="text-center py-12 text-neutral-400">
                          {{ 'No notes yet' | translate }}
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Source Info Tab -->
                @if (activeTab === 'source') {
                  <div class="flex flex-col gap-5">
                    <div>
                      <label class="block text-sm font-semibold text-content-muted mb-1">{{ 'Source' | translate }}</label>
                      <p class="text-content-primary">{{ lead()!.source }}</p>
                    </div>
                    @if (lead()!.utmSource) {
                      <div>
                        <label class="block text-sm font-semibold text-content-muted mb-1">{{ 'UTM Source' | translate }}</label>
                        <p class="text-content-primary">{{ lead()!.utmSource }}</p>
                      </div>
                    }
                    @if (lead()!.utmMedium) {
                      <div>
                        <label class="block text-sm font-semibold text-content-muted mb-1">{{ 'UTM Medium' | translate }}</label>
                        <p class="text-content-primary">{{ lead()!.utmMedium }}</p>
                      </div>
                    }
                    @if (lead()!.utmCampaign) {
                      <div>
                        <label class="block text-sm font-semibold text-content-muted mb-1">{{ 'UTM Campaign' | translate }}</label>
                        <p class="text-content-primary">{{ lead()!.utmCampaign }}</p>
                      </div>
                    }
                    @if (lead()!.referrer) {
                      <div>
                        <label class="block text-sm font-semibold text-content-muted mb-1">{{ 'Referrer' | translate }}</label>
                        <p class="text-content-primary">{{ lead()!.referrer }}</p>
                      </div>
                    }
                    @if (lead()!.message) {
                      <div>
                        <label class="block text-sm font-semibold text-content-muted mb-1">{{ 'Message' | translate }}</label>
                        <p class="text-content-primary whitespace-pre-wrap">{{ lead()!.message }}</p>
                      </div>
                    }
                    <div>
                      <label class="block text-sm font-semibold text-content-muted mb-1">{{ 'Created At' | translate }}</label>
                      <p class="text-content-primary">{{ formatDate(lead()!.createdAt) }}</p>
                    </div>
                    @if (lead()!.estimatedValue) {
                      <div>
                        <label class="block text-sm font-semibold text-content-muted mb-1">{{ 'Estimated Value' | translate }}</label>
                        <p class="text-lg font-semibold text-green-600 dark:text-green-400">\${{ lead()!.estimatedValue | number:'1.0-0' }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Speed Dial -->
        <app-quick-actions
          #quickActions
          (activityCreated)="onActivityCreated($event)"
        />
      </div>
    }

    <!-- Loading State -->
    @if (loading()) {
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="flex items-center gap-3 p-6 bg-surface-elevated rounded-xl border border-edge-subtle shadow-sm">
          <svg class="animate-spin h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-content-secondary">{{ 'Loading lead details...' | translate }}</p>
        </div>
      </div>
    }

    <!-- Delete Confirmation Dialog -->
    <ui-confirm-dialog
      [open]="showDeleteConfirm()"
      (openChange)="showDeleteConfirm.set($event)"
      variant="destructive"
      title="Confirm Delete"
      [message]="deleteConfirmMessage()"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      (confirmed)="confirmDeleteLead()"
      (cancelled)="cancelDeleteLead()"
    ></ui-confirm-dialog>

    <!-- Delete Note Confirmation Dialog -->
    <ui-confirm-dialog
      [open]="showDeleteNoteConfirm()"
      (openChange)="showDeleteNoteConfirm.set($event)"
      variant="destructive"
      title="Confirm Delete"
      message="Are you sure you want to delete this note?"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      (confirmed)="confirmDeleteNote()"
      (cancelled)="cancelDeleteNote()"
    ></ui-confirm-dialog>
  `,
  styles: [`
    :host {
      display: block;
    }
    .border-l-3 {
      border-left-width: 3px;
    }
  `],
})
export class LeadDetailComponent implements OnInit {
  @ViewChild('quickActions') quickActionsRef?: QuickActionsComponent;
  @ViewChild('tagManager') tagManagerRef?: TagManagerComponent;

  lead = signal<Lead | null>(null);
  availableTags = signal<Tag[]>([]);
  users = signal<AdminUser[]>([]);
  loading = signal(true);
  saving = signal(false);

  // Activity timeline signals
  activities = signal<LeadActivity[]>([]);
  activitiesMeta = signal<PaginationMeta | null>(null);
  activitiesLoading = signal(false);

  // Tab state
  activeTab: 'activity' | 'notes' | 'source' = 'activity';

  // Confirm dialog state
  showDeleteConfirm = signal(false);
  showDeleteNoteConfirm = signal(false);
  noteToDeleteId = signal<string | null>(null);

  leadForm!: FormGroup;
  noteForm!: FormGroup;

  statusOptions = Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({
    label,
    value,
  }));
  priorityOptions = Object.entries(LEAD_PRIORITY_LABELS).map(([value, label]) => ({
    label,
    value,
  }));

  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  isSuperAdmin = () => this.authService.isSuperAdmin();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private leadService: LeadService,
    private adminService: AdminService,
  ) {
    this.destroyRef.onDestroy(() => {
      this.destroy$.next();
      this.destroy$.complete();
    });
  }

  ngOnInit(): void {
    this.initializeForms();
    this.loadLead();
    this.loadTags();
    if (this.authService.isSuperAdmin()) {
      this.loadUsers();
    }
  }

  private loadUsers(): void {
    this.userService.getUsers({ isActive: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => this.users.set(users),
        error: () => {},
      });
  }

  deleteConfirmMessage(): string {
    const lead = this.lead();
    if (!lead) return 'Are you sure you want to delete this lead?';
    return `Are you sure you want to delete lead "${lead.firstName} ${lead.lastName}"? This action cannot be undone.`;
  }

  // ============================================================
  // Activity Management
  // ============================================================

  loadActivities(page = 1, limit = 20, type?: ActivityType): void {
    const leadId = this.lead()?.id;
    if (!leadId) return;

    this.activitiesLoading.set(true);
    this.leadService.getActivities(leadId, { page, limit, type })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ activities, meta }) => {
          this.activities.set(activities);
          this.activitiesMeta.set(meta);
          this.activitiesLoading.set(false);
        },
        error: (error) => {
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            return;
          }
          console.error('Error loading activities:', error);
          this.activitiesLoading.set(false);
          this.toastService.error('Failed to load activities', 'Error');
        },
      });
  }

  onActivityFilterChange(type: ActivityType | null): void {
    this.loadActivities(1, 20, type ?? undefined);
  }

  onActivityPageChange(event: { page: number; limit: number }): void {
    this.loadActivities(event.page, event.limit);
  }

  onActivityCreated(data: CreateActivityDto): void {
    const leadId = this.lead()?.id;
    if (!leadId) return;

    this.leadService.createActivity(leadId, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Activity logged successfully', 'Success');
          this.quickActionsRef?.onActivitySaved();
          this.loadActivities();
          this.loadLead();
        },
        error: (error) => {
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            return;
          }
          console.error('Error creating activity:', error);
          this.quickActionsRef?.onActivityError();
          this.toastService.error('Failed to log activity', 'Error');
        },
      });
  }

  // ============================================================
  // Note Management
  // ============================================================

  updateNote(noteId: string, content: string): void {
    this.leadService.updateNote(noteId, { content })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Note updated successfully', 'Success');
          this.loadLead();
        },
        error: (error) => {
          console.error('Error updating note:', error);
          this.toastService.error('Failed to update note', 'Error');
        },
      });
  }

  deleteNote(noteId: string): void {
    this.noteToDeleteId.set(noteId);
    this.showDeleteNoteConfirm.set(true);
  }

  confirmDeleteNote(): void {
    const noteId = this.noteToDeleteId();
    if (!noteId) return;

    this.leadService.deleteNote(noteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Note deleted successfully', 'Success');
          this.loadLead();
          this.showDeleteNoteConfirm.set(false);
          this.noteToDeleteId.set(null);
        },
        error: (error) => {
          console.error('Error deleting note:', error);
          this.toastService.error('Failed to delete note', 'Error');
          this.showDeleteNoteConfirm.set(false);
          this.noteToDeleteId.set(null);
        },
      });
  }

  cancelDeleteNote(): void {
    this.showDeleteNoteConfirm.set(false);
    this.noteToDeleteId.set(null);
  }

  // ============================================================
  // Tag Management
  // ============================================================

  onAddTag(tagId: string): void {
    const leadId = this.lead()?.id;
    if (!leadId) return;

    this.leadService.addTag(leadId, { tagId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Tag added successfully', 'Success');
          this.loadLead();
        },
        error: (error) => {
          console.error('Error adding tag:', error);
          this.toastService.error('Failed to add tag', 'Error');
        },
      });
  }

  onRemoveTag(tag: Tag): void {
    this.removeTag(tag.id);
  }

  onCreateNewTag(data: { name: string; color: string }): void {
    this.adminService.createTag(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tag) => {
          this.toastService.success('Tag created successfully', 'Success');
          this.loadTags();
          this.tagManagerRef?.onTagCreated();
          this.onAddTag(tag.id);
        },
        error: (error) => {
          console.error('Error creating tag:', error);
          this.toastService.error('Failed to create tag', 'Error');
        },
      });
  }

  // ============================================================
  // Inline Edit
  // ============================================================

  onInlineFieldChange(field: string, value: string | Date | null): void {
    const leadId = this.lead()?.id;
    if (!leadId) return;

    const updateData: Record<string, unknown> = {
      [field]: value instanceof Date ? value.toISOString() : value,
    };

    this.leadService.updateLead(leadId, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedLead) => {
          this.lead.set(updatedLead);
          this.toastService.success('Field updated successfully', 'Success');
        },
        error: (error) => {
          console.error('Error updating field:', error);
          this.toastService.error('Failed to update field', 'Error');
        },
      });
  }

  initializeForms(): void {
    this.leadForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: [''],
      jobTitle: [''],
      website: [''],
      status: [LeadStatus.NEW, Validators.required],
      priority: [LeadPriority.MEDIUM, Validators.required],
      assignedToId: [''],
      nextFollowUpAt: [null],
    });

    this.noteForm = this.fb.group({
      content: ['', Validators.required],
      isPrivate: [false],
    });
  }

  loadLead(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/admin/leads']);
      return;
    }

    this.loading.set(true);
    this.leadService.getLead(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lead) => {
          this.lead.set(lead);
          this.patchFormValues(lead);
          this.loading.set(false);
          this.loadActivities();
        },
        error: (error) => {
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            return;
          }
          console.error('Error loading lead:', error);
          this.toastService.error('Failed to load lead details', 'Error');
          this.loading.set(false);
          this.router.navigate(['/admin/leads']);
        },
      });
  }

  loadTags(): void {
    this.adminService.getTags()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tags) => {
          this.availableTags.set(tags);
        },
        error: (error) => {
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            return;
          }
          console.error('Error loading tags:', error);
        },
      });
  }

  patchFormValues(lead: Lead): void {
    this.leadForm.patchValue({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      jobTitle: lead.jobTitle,
      website: lead.website,
      status: lead.status,
      priority: lead.priority,
      assignedToId: lead.assignedToId || '',
      nextFollowUpAt: lead.nextFollowUpAt
        ? this.formatDateForInput(new Date(lead.nextFollowUpAt))
        : null,
    });
  }

  onSubmit(): void {
    if (this.leadForm.invalid) {
      Object.keys(this.leadForm.controls).forEach((key) => {
        this.leadForm.get(key)?.markAsTouched();
      });
      return;
    }

    const leadId = this.lead()?.id;
    if (!leadId) return;

    this.saving.set(true);
    const formValue = { ...this.leadForm.value };

    // Convert empty assignedToId to null for unassignment
    if (formValue.assignedToId === '') {
      formValue.assignedToId = null;
    }

    if (formValue.nextFollowUpAt) {
      formValue.nextFollowUpAt = new Date(formValue.nextFollowUpAt).toISOString();
    }

    this.leadService.updateLead(leadId, formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedLead) => {
          this.lead.set(updatedLead);
          this.saving.set(false);
          this.toastService.success('Lead updated successfully', 'Success');
        },
        error: (error) => {
          console.error('Error updating lead:', error);
          this.saving.set(false);
          this.toastService.error('Failed to update lead', 'Error');
        },
      });
  }

  addNote(): void {
    if (this.noteForm.invalid) {
      return;
    }

    const leadId = this.lead()?.id;
    if (!leadId) return;

    const noteData: CreateNoteDto = this.noteForm.value;

    this.leadService.addNote(leadId, noteData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Note added successfully', 'Success');
          this.noteForm.reset({ isPrivate: false });
          this.loadLead();
        },
        error: (error) => {
          console.error('Error adding note:', error);
          this.toastService.error('Failed to add note', 'Error');
        },
      });
  }

  removeTag(tagId: string): void {
    const leadId = this.lead()?.id;
    if (!leadId) return;

    this.leadService.removeTag(leadId, tagId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Tag removed successfully', 'Success');
          this.loadLead();
        },
        error: (error) => {
          console.error('Error removing tag:', error);
          this.toastService.error('Failed to remove tag', 'Error');
        },
      });
  }

  deleteLead(): void {
    this.showDeleteConfirm.set(true);
  }

  confirmDeleteLead(): void {
    const lead = this.lead();
    if (!lead) return;

    this.leadService.deleteLead(lead.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Lead deleted successfully', 'Success');
          this.showDeleteConfirm.set(false);
          this.router.navigate(['/admin/leads']);
        },
        error: (error) => {
          console.error('Error deleting lead:', error);
          this.toastService.error('Failed to delete lead', 'Error');
          this.showDeleteConfirm.set(false);
        },
      });
  }

  cancelDeleteLead(): void {
    this.showDeleteConfirm.set(false);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  getStatusSeverity(
    status: LeadStatus
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const severityMap: Record<
      LeadStatus,
      'success' | 'info' | 'warning' | 'danger' | 'secondary'
    > = {
      [LeadStatus.NEW]: 'info',
      [LeadStatus.CONTACTED]: 'warning',
      [LeadStatus.QUALIFIED]: 'success',
      [LeadStatus.PROPOSAL]: 'warning',
      [LeadStatus.NEGOTIATION]: 'warning',
      [LeadStatus.WON]: 'success',
      [LeadStatus.LOST]: 'danger',
      [LeadStatus.ARCHIVED]: 'secondary',
    };
    return severityMap[status] || 'info';
  }

  private formatDateForInput(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
