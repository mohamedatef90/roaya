import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// shadcn-style UI Components
import {
  TagComponent,
  ConfirmDialogComponent,
  SpinnerComponent,
  SelectComponent,
  SelectOption,
  PaginationComponent,
  PageChangeEvent,
} from '../../../shared/components/ui';
import { ToastService } from '../../../shared/components/ui/feedback/toast/toast.service';

// Services
import {
  ContentAdminService,
  ContentItem,
  ContentType,
  ContentStatus,
} from '../../../core/services/content-admin.service';
import { PaginationMeta } from '../../../core/interfaces/admin.interface';

// Components
import { ContentEditorDialogComponent } from './components/content-editor-dialog/content-editor-dialog.component';

@Component({
  selector: 'app-case-studies-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    // shadcn components
    TagComponent,
    ConfirmDialogComponent,
    SpinnerComponent,
    SelectComponent,
    PaginationComponent,
    ContentEditorDialogComponent,
  ],
  template: `
    <div class="content-page p-6">
      <!-- Page Header -->
      <div class="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="flex items-center gap-3 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              <svg class="h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              {{ 'Case Studies' | translate }}
            </h1>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {{ 'Manage client success stories' | translate }}
            </p>
          </div>
          <button
            (click)="openEditorDialog()"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            New Case Study
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1 relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="loadContent()"
              placeholder="Search case studies..."
              class="w-full h-10 pl-10 pr-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <!-- Status Filter -->
          <div class="w-full sm:w-48">
            <ui-select
              [(ngModel)]="selectedStatus"
              [options]="statusOptions"
              placeholder="All Statuses"
              (ngModelChange)="loadContent()"
            ></ui-select>
          </div>
          <!-- Search Button -->
          <button
            (click)="loadContent()"
            class="h-10 px-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16">
          <ui-spinner size="lg" variant="default"></ui-spinner>
          <p class="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Loading case studies...</p>
        </div>
      } @else {
        <!-- Content Table -->
        <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
          <!-- Table Header -->
          <div class="hidden lg:grid grid-cols-[minmax(200px,1fr)_100px_100px_60px_100px] gap-4 px-6 py-3 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 min-w-[600px]">
            <span class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Title</span>
            <span class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Industry</span>
            <span class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Status</span>
            <span class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 text-center">Views</span>
            <span class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 text-center">Actions</span>
          </div>

          <!-- Table Body -->
          @if (contents().length > 0) {
            @for (item of contents(); track item.id) {
              <div class="grid grid-cols-1 lg:grid-cols-[minmax(200px,1fr)_100px_100px_60px_100px] gap-4 px-6 py-4 items-center border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors min-w-[600px]">
                <!-- Title & Image -->
                <div class="flex items-center gap-3">
                  @if (item.featuredImage) {
                    <div
                      class="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0"
                      [style.background-image]="'url(' + item.featuredImage + ')'"
                    ></div>
                  } @else {
                    <div class="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                      <svg class="h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                    </div>
                  }
                  <div class="min-w-0">
                    <p class="font-medium text-neutral-900 dark:text-neutral-100 truncate">{{ item.titleEn }}</p>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                      {{ item.excerptEn || 'No excerpt' }}
                    </p>
                  </div>
                </div>

                <!-- Industry -->
                <div class="text-sm text-neutral-600 dark:text-neutral-400">
                  {{ item.category || 'Uncategorized' }}
                </div>

                <!-- Status -->
                <div>
                  <ui-tag
                    [variant]="getStatusVariant(item.status)"
                    size="sm"
                  >
                    {{ item.status }}
                  </ui-tag>
                </div>

                <!-- Views -->
                <div class="text-center text-sm text-neutral-600 dark:text-neutral-400">
                  {{ item.viewCount || 0 }}
                </div>

                <!-- Actions -->
                <div class="flex justify-center gap-1">
                  <button
                    (click)="openEditorDialog(item)"
                    class="action-btn action-btn-edit"
                    title="Edit"
                  >
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      <path d="m15 5 4 4"/>
                    </svg>
                  </button>
                  @if (item.status !== 'PUBLISHED') {
                    <button
                      (click)="publishItem(item)"
                      class="action-btn action-btn-publish"
                      title="Publish"
                    >
                      <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </button>
                  }
                  <button
                    (click)="confirmDelete(item)"
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
            }
          } @else {
            <!-- Empty State -->
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <div class="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <svg class="h-8 w-8 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                No case studies found
              </h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                Showcase your client success stories by creating case studies.
              </p>
              <button
                (click)="openEditorDialog()"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"/><path d="M12 5v14"/>
                </svg>
                Create First Case Study
              </button>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if ((meta()?.total || 0) > pageSize) {
          <div class="mt-4">
            <ui-pagination
              [totalRecords]="meta()?.total || 0"
              [rows]="pageSize"
              [first]="(currentPage - 1) * pageSize"
              [showInfo]="true"
              (pageChange)="onPageChange($event)"
            ></ui-pagination>
          </div>
        }
      }
    </div>

    <!-- Content Editor Dialog -->
    <app-content-editor-dialog
      [(visible)]="editorDialogVisible"
      [contentType]="ContentType.CASE_STUDY"
      [editItem]="selectedItem"
      (saved)="onContentSaved()"
    ></app-content-editor-dialog>

    <!-- Confirm Delete Dialog -->
    <ui-confirm-dialog
      [open]="showDeleteConfirm()"
      (openChange)="showDeleteConfirm.set($event)"
      title="Delete Case Study"
      [message]="deleteConfirmMessage()"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      (confirmed)="deleteItem()"
      (cancelled)="cancelDelete()"
    ></ui-confirm-dialog>
  `,
  styles: [`
    :host {
      display: block;
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

    .action-btn-publish:hover:not(:disabled) {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .action-btn-delete:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  `],
})
export class CaseStudiesListComponent implements OnInit {
  contents = signal<ContentItem[]>([]);
  meta = signal<PaginationMeta | null>(null);
  loading = signal(true);

  searchQuery = '';
  selectedStatus: ContentStatus | null = null;

  // Editor dialog state
  editorDialogVisible = false;
  selectedItem: ContentItem | null = null;

  // Delete confirmation
  showDeleteConfirm = signal(false);
  itemToDelete = signal<ContentItem | null>(null);

  // Expose ContentType enum to template
  ContentType = ContentType;

  currentPage = 1;
  pageSize = 10;

  statusOptions: SelectOption[] = [
    { label: 'All Statuses', value: null },
    { label: 'Draft', value: ContentStatus.DRAFT },
    { label: 'Pending Review', value: ContentStatus.PENDING_REVIEW },
    { label: 'Published', value: ContentStatus.PUBLISHED },
    { label: 'Archived', value: ContentStatus.ARCHIVED },
  ];

  private contentService = inject(ContentAdminService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    this.loading.set(true);
    this.contentService
      .getContents({
        type: ContentType.CASE_STUDY,
        status: this.selectedStatus || undefined,
        search: this.searchQuery || undefined,
        page: this.currentPage,
        limit: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          this.contents.set(response.data);
          this.meta.set(response.meta || null);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading content:', error);
          this.toastService.error('Failed to load case studies', 'Error');
          this.loading.set(false);
        },
      });
  }

  onPageChange(event: PageChangeEvent): void {
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadContent();
  }

  publishItem(item: ContentItem): void {
    this.contentService.publishContent(item.id).subscribe({
      next: () => {
        this.toastService.success('Case study published successfully', 'Published');
        this.loadContent();
      },
      error: () => {
        this.toastService.error('Failed to publish case study', 'Error');
      },
    });
  }

  confirmDelete(item: ContentItem): void {
    this.itemToDelete.set(item);
    this.showDeleteConfirm.set(true);
  }

  deleteConfirmMessage(): string {
    const item = this.itemToDelete();
    return item
      ? `Are you sure you want to delete "${item.titleEn}"? This action cannot be undone.`
      : 'Are you sure you want to delete this case study?';
  }

  cancelDelete(): void {
    this.itemToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  deleteItem(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.showDeleteConfirm.set(false);
    this.contentService.deleteContent(item.id).subscribe({
      next: () => {
        this.toastService.success('Case study deleted successfully', 'Deleted');
        this.itemToDelete.set(null);
        this.loadContent();
      },
      error: () => {
        this.toastService.error('Failed to delete case study', 'Error');
        this.itemToDelete.set(null);
      },
    });
  }

  getStatusVariant(status: ContentStatus): 'success' | 'warning' | 'danger' | 'secondary' {
    const map: Record<ContentStatus, 'success' | 'warning' | 'danger' | 'secondary'> = {
      [ContentStatus.PUBLISHED]: 'success',
      [ContentStatus.PENDING_REVIEW]: 'warning',
      [ContentStatus.DRAFT]: 'secondary',
      [ContentStatus.ARCHIVED]: 'danger',
    };
    return map[status] || 'secondary';
  }

  openEditorDialog(item?: ContentItem): void {
    this.selectedItem = item || null;
    this.editorDialogVisible = true;
  }

  onContentSaved(): void {
    this.editorDialogVisible = false;
    this.selectedItem = null;
    this.loadContent();
  }
}
