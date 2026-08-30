import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// shadcn-style UI Components
import {
  TagComponent,
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogContentComponent,
  DialogFooterComponent,
  ConfirmDialogComponent,
  LabelComponent,
  SpinnerComponent,
} from '../../../shared/components/ui';
import { ToastService } from '../../../shared/components/ui/feedback/toast/toast.service';

// Services
import { ContentAdminService, TeamMember } from '../../../core/services/content-admin.service';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    // shadcn components
    TagComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent,
    ConfirmDialogComponent,
    LabelComponent,
    SpinnerComponent,
  ],
  template: `
    <div class="team-page p-6">
      <!-- Page Header -->
      <div class="mb-6 pb-6 border-b border-edge-subtle">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="flex items-center gap-3 text-2xl font-bold text-content-primary">
              <svg class="h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {{ 'Team Members' | translate }}
            </h1>
            <p class="text-sm text-content-muted mt-1">
              {{ 'Manage your team directory' | translate }}
            </p>
          </div>
          <button
            (click)="openCreateDialog()"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Add Member
          </button>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16">
          <ui-spinner size="lg" variant="default"></ui-spinner>
          <p class="mt-4 text-sm text-content-muted">Loading team members...</p>
        </div>
      } @else {
        <!-- Team Grid -->
        @if (members().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            @for (member of members(); track member.id; let i = $index) {
              <div
                class="group relative rounded-xl border border-edge-subtle bg-surface-elevated p-5 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all"
                [class.opacity-60]="!member.isActive"
              >
                <div class="flex flex-col items-center text-center">
                  <!-- Avatar -->
                  <div class="mb-4 relative">
                    @if (member.photoUrl) {
                      <img
                        [src]="member.photoUrl"
                        [alt]="member.nameEn"
                        class="w-20 h-20 rounded-full object-cover ring-4 ring-neutral-100 dark:ring-neutral-800"
                      />
                    } @else {
                      <div
                        class="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold ring-4 ring-neutral-100 dark:ring-neutral-800"
                        [style.background]="getAvatarGradient(i)"
                      >
                        {{ getInitials(member.nameEn) }}
                      </div>
                    }
                    <!-- Status indicator -->
                    <span
                      class="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900"
                      [class.bg-emerald-500]="member.isActive"
                      [class.bg-neutral-400]="!member.isActive"
                    ></span>
                  </div>

                  <!-- Name & Title -->
                  <h3 class="font-semibold text-content-primary mb-1">
                    {{ member.nameEn }}
                  </h3>
                  <p class="text-sm text-content-muted mb-3">
                    {{ member.titleEn }}
                  </p>

                  <!-- Department Tag -->
                  @if (member.department) {
                    <ui-tag variant="secondary" size="sm" customClass="mb-3">
                      {{ member.department }}
                    </ui-tag>
                  }

                  <!-- Status Tag -->
                  <ui-tag
                    [variant]="member.isActive ? 'success' : 'danger'"
                    size="sm"
                    customClass="mb-4"
                  >
                    {{ member.isActive ? 'Active' : 'Inactive' }}
                  </ui-tag>

                  <!-- Social Links -->
                  @if (member.email || member.linkedin || member.twitter) {
                    <div class="flex items-center gap-2 mb-4">
                      @if (member.email) {
                        <a
                          [href]="'mailto:' + member.email"
                          class="flex items-center justify-center w-8 h-8 rounded-full bg-surface-secondary text-content-secondary hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors"
                          title="Email"
                        >
                          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                          </svg>
                        </a>
                      }
                      @if (member.linkedin) {
                        <a
                          [href]="member.linkedin"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="flex items-center justify-center w-8 h-8 rounded-full bg-surface-secondary text-content-secondary hover:bg-[#0077B5]/10 hover:text-[#0077B5] transition-colors"
                          title="LinkedIn"
                        >
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      }
                      @if (member.twitter) {
                        <a
                          [href]="member.twitter"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="flex items-center justify-center w-8 h-8 rounded-full bg-surface-secondary text-content-secondary hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] transition-colors"
                          title="Twitter"
                        >
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                      }
                    </div>
                  }

                  <!-- Actions -->
                  <div class="flex items-center gap-1">
                    <button
                      (click)="moveUp(i)"
                      [disabled]="i === 0"
                      class="action-btn"
                      title="Move Up"
                    >
                      <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                    </button>
                    <button
                      (click)="moveDown(i)"
                      [disabled]="i === members().length - 1"
                      class="action-btn"
                      title="Move Down"
                    >
                      <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </button>
                    <button
                      (click)="openEditDialog(member)"
                      class="action-btn action-btn-edit"
                      title="Edit"
                    >
                      <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                    </button>
                    <button
                      (click)="confirmDelete(member)"
                      class="action-btn action-btn-delete"
                      title="Delete"
                    >
                      <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-20 h-20 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
              <svg class="h-10 w-10 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-content-primary mb-2">
              No Team Members
            </h3>
            <p class="text-sm text-content-muted mb-6 max-w-sm">
              Your team directory is empty. Add your first team member to get started.
            </p>
            <button
              (click)="openCreateDialog()"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 border-edge-subtle text-content-secondary hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              Add First Member
            </button>
          </div>
        }
      }
    </div>

    <!-- Create/Edit Dialog -->
    <ui-dialog [open]="showDialog" (openChange)="showDialog = $event" size="lg">
      <ui-dialog-header>
        <ui-dialog-title>
          {{ editingMember ? 'Edit Team Member' : 'Add Team Member' }}
        </ui-dialog-title>
      </ui-dialog-header>

      <ui-dialog-content>
        <form [formGroup]="memberForm" class="space-y-4">
          <!-- Name Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ui-label for="nameEn" [required]="true">Name (English)</ui-label>
              <input
                id="nameEn"
                formControlName="nameEn"
                type="text"
                class="input-field"
                placeholder="John Doe"
              />
            </div>
            <div>
              <ui-label for="nameAr" [required]="true">Name (Arabic)</ui-label>
              <input
                id="nameAr"
                formControlName="nameAr"
                type="text"
                class="input-field"
                dir="rtl"
                placeholder="الاسم بالعربية"
              />
            </div>
          </div>

          <!-- Title Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ui-label for="titleEn" [required]="true">Title (English)</ui-label>
              <input
                id="titleEn"
                formControlName="titleEn"
                type="text"
                class="input-field"
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <ui-label for="titleAr" [required]="true">Title (Arabic)</ui-label>
              <input
                id="titleAr"
                formControlName="titleAr"
                type="text"
                class="input-field"
                dir="rtl"
                placeholder="المسمى الوظيفي"
              />
            </div>
          </div>

          <!-- Department -->
          <div>
            <ui-label for="department">Department</ui-label>
            <input
              id="department"
              formControlName="department"
              type="text"
              class="input-field"
              placeholder="Engineering"
            />
          </div>

          <!-- Photo URL -->
          <div>
            <ui-label for="photoUrl">Photo URL</ui-label>
            <input
              id="photoUrl"
              formControlName="photoUrl"
              type="url"
              class="input-field"
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <!-- Contact Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ui-label for="email">Email</ui-label>
              <input
                id="email"
                formControlName="email"
                type="email"
                class="input-field"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <ui-label for="linkedin">LinkedIn</ui-label>
              <input
                id="linkedin"
                formControlName="linkedin"
                type="url"
                class="input-field"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          <!-- Bio Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ui-label for="bioEn">Bio (English)</ui-label>
              <textarea
                id="bioEn"
                formControlName="bioEn"
                rows="3"
                class="input-field resize-none"
                placeholder="Short biography..."
              ></textarea>
            </div>
            <div>
              <ui-label for="bioAr">Bio (Arabic)</ui-label>
              <textarea
                id="bioAr"
                formControlName="bioAr"
                rows="3"
                class="input-field resize-none"
                dir="rtl"
                placeholder="نبذة مختصرة..."
              ></textarea>
            </div>
          </div>

          <!-- Active Checkbox (only for edit) -->
          @if (editingMember) {
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                formControlName="isActive"
                class="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <label for="isActive" class="text-sm text-content-secondary">
                Active
              </label>
            </div>
          }
        </form>
      </ui-dialog-content>

      <ui-dialog-footer>
        <button
          (click)="closeDialog()"
          class="px-4 py-2 rounded-lg text-sm font-medium border border-edge-strong text-content-secondary hover:bg-surface-hover transition-colors"
        >
          Cancel
        </button>
        <button
          (click)="saveMember()"
          [disabled]="memberForm.invalid || saving()"
          class="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          @if (saving()) {
            <ui-spinner size="sm" variant="white" customClass="mr-2"></ui-spinner>
          }
          {{ editingMember ? 'Update' : 'Add Member' }}
        </button>
      </ui-dialog-footer>
    </ui-dialog>

    <!-- Confirm Delete Dialog -->
    <ui-confirm-dialog
      [open]="showDeleteConfirm()"
      (openChange)="showDeleteConfirm.set($event)"
      title="Delete Team Member"
      [message]="deleteConfirmMessage()"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      (confirmed)="deleteMember()"
      (cancelled)="cancelDelete()"
    ></ui-confirm-dialog>
  `,
  styles: [`
    :host {
      display: block;
    }

    .input-field {
      display: flex;
      width: 100%;
      height: 2.5rem;
      border-radius: 0.5rem;
      border: 1px solid rgb(212 212 212);
      background-color: white;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.15s;

      &:focus {
        border-color: var(--color-primary-500, #3D5A80);
        box-shadow: 0 0 0 2px rgba(61, 90, 128, 0.2);
      }

      &::placeholder {
        color: rgb(163 163 163);
      }
    }

    :host-context([data-theme='dark']) .input-field,
    :host-context(.dark) .input-field {
      border-color: rgb(82 82 82);
      background-color: rgb(38 38 38);
      color: rgb(245 245 245);
    }

    textarea.input-field {
      height: auto;
      min-height: 5rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: rgb(115 115 115);
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: rgb(245 245 245);
        color: rgb(64 64 64);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    :host-context([data-theme='dark']) .action-btn,
    :host-context(.dark) .action-btn {
      &:hover:not(:disabled) {
        background: rgb(64 64 64);
        color: rgb(229 229 229);
      }
    }

    .action-btn-edit:hover:not(:disabled) {
      background: rgba(61, 90, 128, 0.1);
      color: #3D5A80;
    }

    .action-btn-delete:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  `],
})
export class TeamListComponent implements OnInit {
  members = signal<TeamMember[]>([]);
  loading = signal(true);
  saving = signal(false);

  showDialog = false;
  editingMember: TeamMember | null = null;
  memberForm!: FormGroup;

  // Delete confirmation
  showDeleteConfirm = signal(false);
  memberToDelete = signal<TeamMember | null>(null);

  private avatarGradients = [
    'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
  ];

  private contentService = inject(ContentAdminService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.initForm();
    this.loadMembers();
  }

  private initForm(): void {
    this.memberForm = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      titleEn: ['', Validators.required],
      titleAr: ['', Validators.required],
      bioEn: [''],
      bioAr: [''],
      email: ['', Validators.email],
      linkedin: [''],
      twitter: [''],
      photoUrl: [''],
      department: [''],
      isActive: [true],
    });
  }

  loadMembers(): void {
    this.loading.set(true);
    this.contentService.getTeamMembers(true).subscribe({
      next: (response) => {
        this.members.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading team members:', error);
        this.toastService.error('Failed to load team members', 'Error');
        this.loading.set(false);
      },
    });
  }

  openCreateDialog(): void {
    this.editingMember = null;
    this.memberForm.reset({ isActive: true });
    this.showDialog = true;
  }

  openEditDialog(member: TeamMember): void {
    this.editingMember = member;
    this.memberForm.patchValue({
      nameEn: member.nameEn,
      nameAr: member.nameAr,
      titleEn: member.titleEn,
      titleAr: member.titleAr,
      bioEn: member.bioEn,
      bioAr: member.bioAr,
      email: member.email,
      linkedin: member.linkedin,
      twitter: member.twitter,
      photoUrl: member.photoUrl,
      department: member.department,
      isActive: member.isActive,
    });
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingMember = null;
  }

  saveMember(): void {
    if (this.memberForm.invalid) return;

    this.saving.set(true);
    const data = this.memberForm.value;

    if (this.editingMember) {
      this.contentService.updateTeamMember(this.editingMember.id, data).subscribe({
        next: () => {
          this.toastService.success('Team member updated successfully', 'Updated');
          this.closeDialog();
          this.loadMembers();
          this.saving.set(false);
        },
        error: () => {
          this.toastService.error('Failed to update team member', 'Error');
          this.saving.set(false);
        },
      });
    } else {
      this.contentService.createTeamMember(data).subscribe({
        next: () => {
          this.toastService.success('Team member added successfully', 'Created');
          this.closeDialog();
          this.loadMembers();
          this.saving.set(false);
        },
        error: () => {
          this.toastService.error('Failed to add team member', 'Error');
          this.saving.set(false);
        },
      });
    }
  }

  confirmDelete(member: TeamMember): void {
    this.memberToDelete.set(member);
    this.showDeleteConfirm.set(true);
  }

  deleteConfirmMessage(): string {
    const member = this.memberToDelete();
    return member
      ? `Are you sure you want to delete "${member.nameEn}"? This action cannot be undone.`
      : 'Are you sure you want to delete this team member?';
  }

  cancelDelete(): void {
    this.memberToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  deleteMember(): void {
    const member = this.memberToDelete();
    if (!member) return;

    this.showDeleteConfirm.set(false);
    this.contentService.deleteTeamMember(member.id).subscribe({
      next: () => {
        this.toastService.success('Team member deleted successfully', 'Deleted');
        this.memberToDelete.set(null);
        this.loadMembers();
      },
      error: () => {
        this.toastService.error('Failed to delete team member', 'Error');
        this.memberToDelete.set(null);
      },
    });
  }

  moveUp(index: number): void {
    if (index === 0) return;
    const items = [...this.members()];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    this.updateOrder(items);
  }

  moveDown(index: number): void {
    const items = [...this.members()];
    if (index === items.length - 1) return;
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    this.updateOrder(items);
  }

  private updateOrder(items: TeamMember[]): void {
    const orderedIds = items.map((m) => m.id);
    this.contentService.reorderTeamMembers(orderedIds).subscribe({
      next: () => {
        this.members.set(items);
        this.toastService.success('Team order updated', 'Reordered');
      },
      error: () => {
        this.toastService.error('Failed to reorder team members', 'Error');
      },
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getAvatarGradient(index: number): string {
    return this.avatarGradients[index % this.avatarGradients.length];
  }
}
