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
import { ContentAdminService, Testimonial } from '../../../core/services/content-admin.service';

@Component({
  selector: 'app-testimonials-list',
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
    <div class="testimonials-page p-6">
      <!-- Page Header -->
      <div class="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="flex items-center gap-3 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              <svg class="h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {{ 'Testimonials' | translate }}
            </h1>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {{ 'Manage client reviews and testimonials' | translate }}
            </p>
          </div>
          <button
            (click)="openCreateDialog()"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Add Testimonial
          </button>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16">
          <ui-spinner size="lg" variant="default"></ui-spinner>
          <p class="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Loading testimonials...</p>
        </div>
      } @else {
        <!-- Testimonials Grid -->
        @if (testimonials().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            @for (testimonial of testimonials(); track testimonial.id; let i = $index) {
              <div
                class="group relative rounded-xl border bg-white dark:bg-neutral-900 overflow-hidden transition-all hover:shadow-lg"
                [class.border-amber-400]="testimonial.isFeatured"
                [class.border-neutral-200]="!testimonial.isFeatured"
                [class.dark:border-amber-600]="testimonial.isFeatured"
                [class.dark:border-neutral-800]="!testimonial.isFeatured"
                [class.opacity-60]="!testimonial.isActive"
              >
                <!-- Featured Badge -->
                @if (testimonial.isFeatured) {
                  <div class="absolute top-3 right-3">
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Featured
                    </span>
                  </div>
                }

                <div class="p-5">
                  <!-- Quote -->
                  <div class="relative mb-4">
                    <svg class="absolute -top-1 -left-1 h-8 w-8 text-primary-200 dark:text-primary-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                    </svg>
                    <p class="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed pl-6 italic">
                      "{{ truncateQuote(testimonial.quoteEn) }}"
                    </p>
                  </div>

                  <!-- Rating Stars -->
                  <div class="flex items-center gap-1 mb-4">
                    @for (star of [1,2,3,4,5]; track star) {
                      <svg
                        class="h-4 w-4"
                        [class.text-amber-400]="star <= testimonial.rating"
                        [class.text-neutral-200]="star > testimonial.rating"
                        [class.dark:text-neutral-700]="star > testimonial.rating"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        [attr.fill]="star <= testimonial.rating ? 'currentColor' : 'none'"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    }
                  </div>

                  <!-- Author Info -->
                  <div class="flex items-center gap-3 mb-4">
                    @if (testimonial.authorPhoto) {
                      <img
                        [src]="testimonial.authorPhoto"
                        [alt]="testimonial.authorName"
                        class="w-12 h-12 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-neutral-800"
                      />
                    } @else {
                      <div
                        class="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-neutral-100 dark:ring-neutral-800"
                        [style.background]="getAvatarGradient(i)"
                      >
                        {{ getInitials(testimonial.authorName) }}
                      </div>
                    }
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {{ testimonial.authorName }}
                      </p>
                      <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                        {{ testimonial.authorTitleEn }}
                      </p>
                      @if (testimonial.authorCompany) {
                        <p class="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                          {{ testimonial.authorCompany }}
                        </p>
                      }
                    </div>
                  </div>

                  <!-- Tags -->
                  <div class="flex flex-wrap gap-2 mb-4">
                    <ui-tag
                      [variant]="testimonial.isActive ? 'success' : 'danger'"
                      size="sm"
                    >
                      {{ testimonial.isActive ? 'Active' : 'Inactive' }}
                    </ui-tag>
                    @if (testimonial.service) {
                      <ui-tag variant="secondary" size="sm">
                        {{ testimonial.service }}
                      </ui-tag>
                    }
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
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
                        [disabled]="i === testimonials().length - 1"
                        class="action-btn"
                        title="Move Down"
                      >
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </button>
                    </div>
                    <div class="flex items-center gap-1">
                      <button
                        (click)="toggleFeatured(testimonial)"
                        class="action-btn"
                        [class.action-btn-featured]="testimonial.isFeatured"
                        title="Toggle Featured"
                      >
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" [attr.fill]="testimonial.isFeatured ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </button>
                      <button
                        (click)="openEditDialog(testimonial)"
                        class="action-btn action-btn-edit"
                        title="Edit"
                      >
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                          <path d="m15 5 4 4"/>
                        </svg>
                      </button>
                      <button
                        (click)="confirmDelete(testimonial)"
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
              </div>
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <svg class="h-10 w-10 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              No Testimonials
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm">
              Start collecting client testimonials to showcase your work and build trust.
            </p>
            <button
              (click)="openCreateDialog()"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              Add First Testimonial
            </button>
          </div>
        }
      }
    </div>

    <!-- Create/Edit Dialog -->
    <ui-dialog [open]="showDialog" (openChange)="showDialog = $event" size="lg">
      <ui-dialog-header>
        <ui-dialog-title>
          {{ editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial' }}
        </ui-dialog-title>
      </ui-dialog-header>

      <ui-dialog-content>
        <form [formGroup]="testimonialForm" class="space-y-4">
          <!-- Quote Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ui-label for="quoteEn" [required]="true">Quote (English)</ui-label>
              <textarea
                id="quoteEn"
                formControlName="quoteEn"
                rows="4"
                class="input-field resize-none"
                placeholder="Client testimonial..."
              ></textarea>
            </div>
            <div>
              <ui-label for="quoteAr" [required]="true">Quote (Arabic)</ui-label>
              <textarea
                id="quoteAr"
                formControlName="quoteAr"
                rows="4"
                class="input-field resize-none"
                dir="rtl"
                placeholder="الشهادة بالعربية..."
              ></textarea>
            </div>
          </div>

          <!-- Author Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <ui-label for="authorName" [required]="true">Author Name</ui-label>
              <input
                id="authorName"
                formControlName="authorName"
                type="text"
                class="input-field"
                placeholder="John Doe"
              />
            </div>
            <div>
              <ui-label for="authorTitleEn" [required]="true">Title (English)</ui-label>
              <input
                id="authorTitleEn"
                formControlName="authorTitleEn"
                type="text"
                class="input-field"
                placeholder="CEO"
              />
            </div>
            <div>
              <ui-label for="authorTitleAr" [required]="true">Title (Arabic)</ui-label>
              <input
                id="authorTitleAr"
                formControlName="authorTitleAr"
                type="text"
                class="input-field"
                dir="rtl"
                placeholder="المدير التنفيذي"
              />
            </div>
          </div>

          <!-- Company & Photo -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ui-label for="authorCompany">Company</ui-label>
              <input
                id="authorCompany"
                formControlName="authorCompany"
                type="text"
                class="input-field"
                placeholder="Company Name"
              />
            </div>
            <div>
              <ui-label for="authorPhoto">Photo URL</ui-label>
              <input
                id="authorPhoto"
                formControlName="authorPhoto"
                type="url"
                class="input-field"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          <!-- Rating, Service, Industry -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <ui-label for="rating">Rating</ui-label>
              <div class="flex items-center gap-1 h-10">
                @for (star of [1,2,3,4,5]; track star) {
                  <button
                    type="button"
                    (click)="setRating(star)"
                    class="p-1 hover:scale-110 transition-transform"
                  >
                    <svg
                      class="h-6 w-6"
                      [class.text-amber-400]="star <= testimonialForm.get('rating')?.value"
                      [class.text-neutral-300]="star > testimonialForm.get('rating')?.value"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      [attr.fill]="star <= testimonialForm.get('rating')?.value ? 'currentColor' : 'none'"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </button>
                }
              </div>
            </div>
            <div>
              <ui-label for="service">Service</ui-label>
              <input
                id="service"
                formControlName="service"
                type="text"
                class="input-field"
                placeholder="Web Development"
              />
            </div>
            <div>
              <ui-label for="industry">Industry</ui-label>
              <input
                id="industry"
                formControlName="industry"
                type="text"
                class="input-field"
                placeholder="Technology"
              />
            </div>
          </div>

          <!-- Checkboxes (only for edit) -->
          @if (editingTestimonial) {
            <div class="flex items-center gap-6">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  formControlName="isActive"
                  class="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                />
                <span class="text-sm text-neutral-700 dark:text-neutral-300">Active</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  formControlName="isFeatured"
                  class="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500"
                />
                <span class="text-sm text-neutral-700 dark:text-neutral-300">Featured</span>
              </label>
            </div>
          }
        </form>
      </ui-dialog-content>

      <ui-dialog-footer>
        <button
          (click)="closeDialog()"
          class="px-4 py-2 rounded-lg text-sm font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Cancel
        </button>
        <button
          (click)="saveTestimonial()"
          [disabled]="testimonialForm.invalid || saving()"
          class="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          @if (saving()) {
            <ui-spinner size="sm" variant="white" customClass="mr-2"></ui-spinner>
          }
          {{ editingTestimonial ? 'Update' : 'Add Testimonial' }}
        </button>
      </ui-dialog-footer>
    </ui-dialog>

    <!-- Confirm Delete Dialog -->
    <ui-confirm-dialog
      [open]="showDeleteConfirm()"
      (openChange)="showDeleteConfirm.set($event)"
      title="Delete Testimonial"
      [message]="deleteConfirmMessage()"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      (confirmed)="deleteTestimonial()"
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

    .action-btn-featured {
      color: #f59e0b;
      &:hover:not(:disabled) {
        background: rgba(245, 158, 11, 0.1);
        color: #d97706;
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
export class TestimonialsListComponent implements OnInit {
  testimonials = signal<Testimonial[]>([]);
  loading = signal(true);
  saving = signal(false);

  showDialog = false;
  editingTestimonial: Testimonial | null = null;
  testimonialForm!: FormGroup;

  // Delete confirmation
  showDeleteConfirm = signal(false);
  testimonialToDelete = signal<Testimonial | null>(null);

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
    this.loadTestimonials();
  }

  private initForm(): void {
    this.testimonialForm = this.fb.group({
      quoteEn: ['', Validators.required],
      quoteAr: ['', Validators.required],
      authorName: ['', Validators.required],
      authorTitleEn: ['', Validators.required],
      authorTitleAr: ['', Validators.required],
      authorCompany: [''],
      authorPhoto: [''],
      rating: [5],
      service: [''],
      industry: [''],
      isActive: [true],
      isFeatured: [false],
    });
  }

  loadTestimonials(): void {
    this.loading.set(true);
    this.contentService.getTestimonials(true).subscribe({
      next: (response) => {
        this.testimonials.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading testimonials:', error);
        this.toastService.error('Failed to load testimonials', 'Error');
        this.loading.set(false);
      },
    });
  }

  openCreateDialog(): void {
    this.editingTestimonial = null;
    this.testimonialForm.reset({ rating: 5, isActive: true, isFeatured: false });
    this.showDialog = true;
  }

  openEditDialog(testimonial: Testimonial): void {
    this.editingTestimonial = testimonial;
    this.testimonialForm.patchValue({
      quoteEn: testimonial.quoteEn,
      quoteAr: testimonial.quoteAr,
      authorName: testimonial.authorName,
      authorTitleEn: testimonial.authorTitleEn,
      authorTitleAr: testimonial.authorTitleAr,
      authorCompany: testimonial.authorCompany,
      authorPhoto: testimonial.authorPhoto,
      rating: testimonial.rating,
      service: testimonial.service,
      industry: testimonial.industry,
      isActive: testimonial.isActive,
      isFeatured: testimonial.isFeatured,
    });
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingTestimonial = null;
  }

  setRating(value: number): void {
    this.testimonialForm.patchValue({ rating: value });
  }

  saveTestimonial(): void {
    if (this.testimonialForm.invalid) return;

    this.saving.set(true);
    const data = this.testimonialForm.value;

    if (this.editingTestimonial) {
      this.contentService.updateTestimonial(this.editingTestimonial.id, data).subscribe({
        next: () => {
          this.toastService.success('Testimonial updated successfully', 'Updated');
          this.closeDialog();
          this.loadTestimonials();
          this.saving.set(false);
        },
        error: () => {
          this.toastService.error('Failed to update testimonial', 'Error');
          this.saving.set(false);
        },
      });
    } else {
      this.contentService.createTestimonial(data).subscribe({
        next: () => {
          this.toastService.success('Testimonial added successfully', 'Created');
          this.closeDialog();
          this.loadTestimonials();
          this.saving.set(false);
        },
        error: () => {
          this.toastService.error('Failed to add testimonial', 'Error');
          this.saving.set(false);
        },
      });
    }
  }

  confirmDelete(testimonial: Testimonial): void {
    this.testimonialToDelete.set(testimonial);
    this.showDeleteConfirm.set(true);
  }

  deleteConfirmMessage(): string {
    const testimonial = this.testimonialToDelete();
    return testimonial
      ? `Are you sure you want to delete the testimonial from "${testimonial.authorName}"? This action cannot be undone.`
      : 'Are you sure you want to delete this testimonial?';
  }

  cancelDelete(): void {
    this.testimonialToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  deleteTestimonial(): void {
    const testimonial = this.testimonialToDelete();
    if (!testimonial) return;

    this.showDeleteConfirm.set(false);
    this.contentService.deleteTestimonial(testimonial.id).subscribe({
      next: () => {
        this.toastService.success('Testimonial deleted successfully', 'Deleted');
        this.testimonialToDelete.set(null);
        this.loadTestimonials();
      },
      error: () => {
        this.toastService.error('Failed to delete testimonial', 'Error');
        this.testimonialToDelete.set(null);
      },
    });
  }

  toggleFeatured(testimonial: Testimonial): void {
    this.contentService.toggleTestimonialFeatured(testimonial.id).subscribe({
      next: () => {
        this.toastService.success(
          testimonial.isFeatured ? 'Removed from featured' : 'Added to featured',
          'Updated'
        );
        this.loadTestimonials();
      },
      error: () => {
        this.toastService.error('Failed to toggle featured status', 'Error');
      },
    });
  }

  moveUp(index: number): void {
    if (index === 0) return;
    const items = [...this.testimonials()];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    this.updateOrder(items);
  }

  moveDown(index: number): void {
    const items = [...this.testimonials()];
    if (index === items.length - 1) return;
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    this.updateOrder(items);
  }

  private updateOrder(items: Testimonial[]): void {
    const orderedIds = items.map((t) => t.id);
    this.contentService.reorderTestimonials(orderedIds).subscribe({
      next: () => {
        this.testimonials.set(items);
        this.toastService.success('Testimonial order updated', 'Reordered');
      },
      error: () => {
        this.toastService.error('Failed to reorder testimonials', 'Error');
      },
    });
  }

  truncateQuote(quote: string): string {
    const maxLength = 150;
    return quote.length > maxLength ? quote.substring(0, maxLength) + '...' : quote;
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
