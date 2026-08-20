import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// Keep Editor for rich text (no shadcn equivalent)
import { EditorModule } from 'primeng/editor';

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
  SelectComponent,
  SelectOption,
} from '../../../shared/components/ui';
import { ToastService } from '../../../shared/components/ui/feedback/toast/toast.service';

/**
 * Documentation Interfaces
 */
export interface DocCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  order: number;
  parentId?: string;
  children?: DocCategory[];
}

export interface DocPage {
  id: string;
  categoryId: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  slug: string;
  accessLevel: 'public' | 'internal' | 'admin';
  isPublished: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface TreeNode {
  id: string;
  label: string;
  icon: string;
  data: DocCategory & { pageCount: number };
  expanded?: boolean;
}

/**
 * Documentation Management Component
 * Hierarchical documentation system with bilingual support
 */
@Component({
  selector: 'app-docs-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    EditorModule,
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
    SelectComponent,
  ],
  template: `
    <div class="docs-page p-6">
      <!-- Page Header -->
      <div class="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="flex items-center gap-3 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              <svg class="h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                <path d="M9 10h6"/>
                <path d="M9 14h6"/>
              </svg>
              {{ 'Documentation' | translate }}
            </h1>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {{ 'Manage knowledge base articles and documentation' | translate }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              (click)="openCategoryDialog()"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
                <line x1="12" x2="12" y1="10" y2="16"/>
                <line x1="9" x2="15" y1="13" y2="13"/>
              </svg>
              New Category
            </button>
            <button
              (click)="openPageDialog()"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" x2="12" y1="18" y2="12"/>
                <line x1="9" x2="15" y1="15" y2="15"/>
              </svg>
              New Page
            </button>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-6">
        <div class="relative max-w-md">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Search documentation..."
            class="w-full h-10 pl-10 pr-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16">
          <ui-spinner size="lg" variant="default"></ui-spinner>
          <p class="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Loading documentation...</p>
        </div>
      } @else {
        <!-- Main Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <!-- Category Sidebar -->
          <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div class="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <h3 class="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                <svg class="h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="14" rx="1"/>
                  <rect width="7" height="7" x="3" y="14" rx="1"/>
                </svg>
                Categories
              </h3>
            </div>
            <div class="p-2">
              <!-- All Pages Option -->
              <button
                (click)="selectAllPages()"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors"
                [class.bg-primary-50]="!selectedCategoryId()"
                [class.dark:bg-primary-900/20]="!selectedCategoryId()"
                [class.text-primary-700]="!selectedCategoryId()"
                [class.dark:text-primary-300]="!selectedCategoryId()"
                [class.text-neutral-600]="selectedCategoryId()"
                [class.dark:text-neutral-400]="selectedCategoryId()"
                [class.hover:bg-neutral-100]="selectedCategoryId()"
                [class.dark:hover:bg-neutral-800]="selectedCategoryId()"
              >
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                  <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                </svg>
                <span class="flex-1">All Pages</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                  {{ pages().length }}
                </span>
              </button>

              <!-- Category List -->
              @for (node of categoryTree(); track node.id) {
                <button
                  (click)="selectCategory(node)"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors"
                  [class.bg-primary-50]="selectedCategoryId() === node.id"
                  [class.dark:bg-primary-900/20]="selectedCategoryId() === node.id"
                  [class.text-primary-700]="selectedCategoryId() === node.id"
                  [class.dark:text-primary-300]="selectedCategoryId() === node.id"
                  [class.text-neutral-600]="selectedCategoryId() !== node.id"
                  [class.dark:text-neutral-400]="selectedCategoryId() !== node.id"
                  [class.hover:bg-neutral-100]="selectedCategoryId() !== node.id"
                  [class.dark:hover:bg-neutral-800]="selectedCategoryId() !== node.id"
                >
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
                  </svg>
                  <span class="flex-1 truncate">{{ node.label }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                    {{ node.data.pageCount }}
                  </span>
                </button>
              }
            </div>
          </div>

          <!-- Pages Grid -->
          <div class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div class="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <h3 class="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                <svg class="h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                {{ selectedCategoryName() || 'All Pages' }}
              </h3>
              <span class="text-xs text-neutral-500 dark:text-neutral-400">
                {{ filteredPages().length }} pages
              </span>
            </div>

            @if (filteredPages().length === 0) {
              <!-- Empty State -->
              <div class="flex flex-col items-center justify-center py-16 text-center">
                <div class="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                  <svg class="h-8 w-8 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  No pages yet
                </h4>
                <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                  Create your first documentation page
                </p>
                <button
                  (click)="openPageDialog()"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"/><path d="M12 5v14"/>
                  </svg>
                  Create Page
                </button>
              </div>
            } @else {
              <!-- Pages Grid -->
              <div class="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                @for (page of filteredPages(); track page.id) {
                  <div
                    (click)="editPage(page)"
                    class="group p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <h4 class="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {{ page.titleEn }}
                      </h4>
                      <ui-tag
                        [variant]="getAccessVariant(page.accessLevel)"
                        size="sm"
                      >
                        {{ page.accessLevel }}
                      </ui-tag>
                    </div>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-3" dir="rtl">
                      {{ page.titleAr }}
                    </p>
                    <div class="flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500 mb-3">
                      <span class="flex items-center gap-1">
                        <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {{ formatDate(page.updatedAt) }}
                      </span>
                      <span class="flex items-center gap-1">
                        <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/>
                          <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>
                        </svg>
                        v{{ page.version }}
                      </span>
                      @if (!page.isPublished) {
                        <ui-tag variant="warning" size="sm">Draft</ui-tag>
                      }
                    </div>
                    <div class="flex items-center justify-end gap-1 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        (click)="editPage(page); $event.stopPropagation()"
                        class="action-btn"
                        title="Edit"
                      >
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                          <path d="m15 5 4 4"/>
                        </svg>
                      </button>
                      <button
                        (click)="duplicatePage(page); $event.stopPropagation()"
                        class="action-btn"
                        title="Duplicate"
                      >
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                        </svg>
                      </button>
                      <button
                        (click)="confirmDeletePage(page); $event.stopPropagation()"
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
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Category Dialog -->
    <ui-dialog [open]="showCategoryDialog" (openChange)="showCategoryDialog = $event" size="md">
      <ui-dialog-header>
        <ui-dialog-title>
          {{ editingCategory ? 'Edit Category' : 'New Category' }}
        </ui-dialog-title>
      </ui-dialog-header>

      <ui-dialog-content>
        <div class="space-y-4">
          <div>
            <ui-label for="catNameEn" [required]="true">Name (English)</ui-label>
            <input
              id="catNameEn"
              [(ngModel)]="categoryForm.nameEn"
              type="text"
              class="input-field"
              placeholder="Getting Started"
            />
          </div>
          <div>
            <ui-label for="catNameAr" [required]="true">Name (Arabic)</ui-label>
            <input
              id="catNameAr"
              [(ngModel)]="categoryForm.nameAr"
              type="text"
              class="input-field"
              dir="rtl"
              placeholder="البدء"
            />
          </div>
          <div>
            <ui-label for="catSlug" [required]="true">Slug</ui-label>
            <input
              id="catSlug"
              [(ngModel)]="categoryForm.slug"
              type="text"
              class="input-field"
              placeholder="getting-started"
            />
          </div>
          <div>
            <ui-label for="catParent">Parent Category</ui-label>
            <ui-select
              [(ngModel)]="categoryForm.parentId"
              [options]="parentOptions"
              placeholder="None (Root)"
            ></ui-select>
          </div>
        </div>
      </ui-dialog-content>

      <ui-dialog-footer>
        <button
          (click)="showCategoryDialog = false"
          class="px-4 py-2 rounded-lg text-sm font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Cancel
        </button>
        <button
          (click)="saveCategory()"
          class="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors"
        >
          {{ editingCategory ? 'Update' : 'Create' }}
        </button>
      </ui-dialog-footer>
    </ui-dialog>

    <!-- Page Dialog -->
    <ui-dialog [open]="showPageDialog" (openChange)="showPageDialog = $event" size="full">
      <ui-dialog-header>
        <ui-dialog-title>
          {{ editingPage ? 'Edit Page' : 'New Page' }}
        </ui-dialog-title>
      </ui-dialog-header>

      <ui-dialog-content>
        <!-- Custom Tabs -->
        <div class="mb-4">
          <div class="inline-flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
            <button
              (click)="activePageTab = 'english'"
              class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              [class.bg-white]="activePageTab === 'english'"
              [class.dark:bg-neutral-900]="activePageTab === 'english'"
              [class.text-neutral-900]="activePageTab === 'english'"
              [class.dark:text-neutral-100]="activePageTab === 'english'"
              [class.shadow-sm]="activePageTab === 'english'"
              [class.text-neutral-600]="activePageTab !== 'english'"
              [class.dark:text-neutral-400]="activePageTab !== 'english'"
            >
              English
            </button>
            <button
              (click)="activePageTab = 'arabic'"
              class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              [class.bg-white]="activePageTab === 'arabic'"
              [class.dark:bg-neutral-900]="activePageTab === 'arabic'"
              [class.text-neutral-900]="activePageTab === 'arabic'"
              [class.dark:text-neutral-100]="activePageTab === 'arabic'"
              [class.shadow-sm]="activePageTab === 'arabic'"
              [class.text-neutral-600]="activePageTab !== 'arabic'"
              [class.dark:text-neutral-400]="activePageTab !== 'arabic'"
            >
              Arabic
            </button>
            <button
              (click)="activePageTab = 'settings'"
              class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              [class.bg-white]="activePageTab === 'settings'"
              [class.dark:bg-neutral-900]="activePageTab === 'settings'"
              [class.text-neutral-900]="activePageTab === 'settings'"
              [class.dark:text-neutral-100]="activePageTab === 'settings'"
              [class.shadow-sm]="activePageTab === 'settings'"
              [class.text-neutral-600]="activePageTab !== 'settings'"
              [class.dark:text-neutral-400]="activePageTab !== 'settings'"
            >
              Settings
            </button>
          </div>
        </div>

        <!-- English Tab Content -->
        @if (activePageTab === 'english') {
          <div class="space-y-4">
            <div>
              <ui-label for="pageTitleEn" [required]="true">Title</ui-label>
              <input
                id="pageTitleEn"
                [(ngModel)]="pageForm.titleEn"
                type="text"
                class="input-field"
                placeholder="Page title"
              />
            </div>
            <div>
              <ui-label for="pageContentEn" [required]="true">Content</ui-label>
              <p-editor
                [(ngModel)]="pageForm.contentEn"
                [style]="{ height: '400px' }"
              ></p-editor>
            </div>
          </div>
        }

        <!-- Arabic Tab Content -->
        @if (activePageTab === 'arabic') {
          <div class="space-y-4" dir="rtl">
            <div>
              <ui-label for="pageTitleAr" [required]="true">العنوان</ui-label>
              <input
                id="pageTitleAr"
                [(ngModel)]="pageForm.titleAr"
                type="text"
                class="input-field"
                placeholder="عنوان الصفحة"
              />
            </div>
            <div>
              <ui-label for="pageContentAr" [required]="true">المحتوى</ui-label>
              <p-editor
                [(ngModel)]="pageForm.contentAr"
                [style]="{ height: '400px' }"
              ></p-editor>
            </div>
          </div>
        }

        <!-- Settings Tab Content -->
        @if (activePageTab === 'settings') {
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <ui-label for="pageCat" [required]="true">Category</ui-label>
                <ui-select
                  [(ngModel)]="pageForm.categoryId"
                  [options]="categoryOptions"
                  placeholder="Select category"
                ></ui-select>
              </div>
              <div>
                <ui-label for="pageSlug" [required]="true">Slug</ui-label>
                <input
                  id="pageSlug"
                  [(ngModel)]="pageForm.slug"
                  type="text"
                  class="input-field"
                  placeholder="page-slug"
                />
              </div>
            </div>
            <div>
              <ui-label for="pageAccess">Access Level</ui-label>
              <ui-select
                [(ngModel)]="pageForm.accessLevel"
                [options]="accessOptions"
              ></ui-select>
            </div>
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                [(ngModel)]="pageForm.isPublished"
                id="published"
                class="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <label for="published" class="text-sm text-neutral-700 dark:text-neutral-300">
                Published
              </label>
            </div>
          </div>
        }
      </ui-dialog-content>

      <ui-dialog-footer>
        <button
          (click)="showPageDialog = false"
          class="px-4 py-2 rounded-lg text-sm font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Cancel
        </button>
        @if (!pageForm.isPublished) {
          <button
            (click)="savePage(false)"
            class="px-4 py-2 rounded-lg text-sm font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Save as Draft
          </button>
        }
        <button
          (click)="savePage(true)"
          class="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors"
        >
          {{ editingPage ? 'Update' : 'Publish' }}
        </button>
      </ui-dialog-footer>
    </ui-dialog>

    <!-- Confirm Delete Dialog -->
    <ui-confirm-dialog
      [open]="showDeleteConfirm()"
      (openChange)="showDeleteConfirm.set($event)"
      title="Delete Page"
      [message]="deleteConfirmMessage()"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      (confirmed)="deletePage()"
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

    .action-btn-delete:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  `]
})
export class DocsListComponent implements OnInit {
  private toastService = inject(ToastService);

  // State
  loading = signal(true);
  categories = signal<DocCategory[]>([]);
  pages = signal<DocPage[]>([]);
  categoryTree = signal<TreeNode[]>([]);
  filteredPages = signal<DocPage[]>([]);
  selectedCategoryId = signal<string | null>(null);
  selectedCategoryName = signal<string>('');
  searchQuery = '';

  // Dialogs
  showCategoryDialog = false;
  showPageDialog = false;
  editingCategory: DocCategory | null = null;
  editingPage: DocPage | null = null;
  activePageTab: 'english' | 'arabic' | 'settings' = 'english';

  // Delete confirmation
  showDeleteConfirm = signal(false);
  pageToDelete = signal<DocPage | null>(null);

  // Form data
  categoryForm: Partial<DocCategory> = { nameEn: '', nameAr: '', slug: '', parentId: undefined };
  pageForm: Partial<DocPage> = this.getEmptyPageForm();

  // Options
  parentOptions: SelectOption[] = [];
  categoryOptions: SelectOption[] = [];
  accessOptions: SelectOption[] = [
    { label: 'Public', value: 'public' },
    { label: 'Internal', value: 'internal' },
    { label: 'Admin Only', value: 'admin' },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // TODO: Replace with actual API call
    setTimeout(() => {
      this.categories.set([
        { id: '1', nameEn: 'Getting Started', nameAr: 'البدء', slug: 'getting-started', order: 1 },
        { id: '2', nameEn: 'API Reference', nameAr: 'مرجع API', slug: 'api-reference', order: 2 },
        { id: '3', nameEn: 'Tutorials', nameAr: 'الدروس', slug: 'tutorials', order: 3 },
      ]);

      this.pages.set([
        {
          id: '1', categoryId: '1', titleEn: 'Introduction', titleAr: 'مقدمة',
          contentEn: '<p>Welcome to the documentation.</p>', contentAr: '<p>مرحبا بك في الوثائق.</p>',
          slug: 'introduction', accessLevel: 'public', isPublished: true, version: 1,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        },
        {
          id: '2', categoryId: '1', titleEn: 'Quick Start', titleAr: 'بداية سريعة',
          contentEn: '<p>Get started quickly.</p>', contentAr: '<p>ابدأ بسرعة.</p>',
          slug: 'quick-start', accessLevel: 'public', isPublished: true, version: 2,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        },
      ]);

      this.buildTree();
      this.updateOptions();
      this.filteredPages.set(this.pages());
      this.loading.set(false);
    }, 500);
  }

  private buildTree(): void {
    const tree: TreeNode[] = this.categories().map(cat => ({
      id: cat.id,
      label: cat.nameEn,
      icon: 'folder',
      data: {
        ...cat,
        pageCount: this.pages().filter(p => p.categoryId === cat.id).length,
      },
    }));
    this.categoryTree.set(tree);
  }

  private updateOptions(): void {
    this.parentOptions = [
      { label: 'None (Root)', value: null },
      ...this.categories().map(c => ({ label: c.nameEn, value: c.id })),
    ];
    this.categoryOptions = this.categories().map(c => ({ label: c.nameEn, value: c.id }));
  }

  selectAllPages(): void {
    this.selectedCategoryId.set(null);
    this.selectedCategoryName.set('');
    this.filteredPages.set(this.pages());
  }

  selectCategory(node: TreeNode): void {
    this.selectedCategoryId.set(node.id);
    this.selectedCategoryName.set(node.label);
    this.filteredPages.set(this.pages().filter(p => p.categoryId === node.id));
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredPages.set(
      this.pages().filter(p =>
        p.titleEn.toLowerCase().includes(query) ||
        p.titleAr.includes(query) ||
        p.contentEn.toLowerCase().includes(query)
      )
    );
    this.selectedCategoryId.set(null);
    this.selectedCategoryName.set('');
  }

  openCategoryDialog(category?: DocCategory): void {
    this.editingCategory = category || null;
    this.categoryForm = category ? { ...category } : { nameEn: '', nameAr: '', slug: '', parentId: undefined };
    this.showCategoryDialog = true;
  }

  openPageDialog(page?: DocPage): void {
    this.editingPage = page || null;
    this.pageForm = page ? { ...page } : this.getEmptyPageForm();
    this.activePageTab = 'english';
    this.showPageDialog = true;
  }

  editPage(page: DocPage): void {
    this.openPageDialog(page);
  }

  saveCategory(): void {
    if (!this.categoryForm.nameEn || !this.categoryForm.slug) {
      this.toastService.error('Please fill required fields', 'Error');
      return;
    }

    // TODO: Save to backend
    this.toastService.success('Category saved', 'Success');
    this.showCategoryDialog = false;
    this.loadData();
  }

  savePage(publish: boolean): void {
    if (!this.pageForm.titleEn || !this.pageForm.categoryId) {
      this.toastService.error('Please fill required fields', 'Error');
      return;
    }

    this.pageForm.isPublished = publish;
    // TODO: Save to backend
    this.toastService.success('Page saved', 'Success');
    this.showPageDialog = false;
    this.loadData();
  }

  duplicatePage(page: DocPage): void {
    this.pageForm = {
      ...page,
      id: undefined,
      titleEn: `${page.titleEn} (Copy)`,
      titleAr: `${page.titleAr} (نسخة)`,
      slug: `${page.slug}-copy`,
      isPublished: false,
      version: 1,
    };
    this.editingPage = null;
    this.showPageDialog = true;
  }

  confirmDeletePage(page: DocPage): void {
    this.pageToDelete.set(page);
    this.showDeleteConfirm.set(true);
  }

  deleteConfirmMessage(): string {
    const page = this.pageToDelete();
    return page
      ? `Are you sure you want to delete "${page.titleEn}"? This action cannot be undone.`
      : 'Are you sure you want to delete this page?';
  }

  cancelDelete(): void {
    this.pageToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  deletePage(): void {
    const page = this.pageToDelete();
    if (!page) return;

    this.showDeleteConfirm.set(false);
    // TODO: Delete from backend
    this.toastService.success('Page deleted', 'Deleted');
    this.pageToDelete.set(null);
    this.loadData();
  }

  getAccessVariant(level: string): 'success' | 'info' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'danger' | 'secondary'> = {
      public: 'success',
      internal: 'info',
      admin: 'danger',
    };
    return map[level] || 'secondary';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private getEmptyPageForm(): Partial<DocPage> {
    return {
      titleEn: '', titleAr: '', contentEn: '', contentAr: '',
      slug: '', categoryId: '', accessLevel: 'public', isPublished: false, version: 1,
    };
  }
}
