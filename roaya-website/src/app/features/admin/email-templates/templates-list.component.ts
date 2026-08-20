import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Keep Editor from PrimeNG (no shadcn equivalent)
import { EditorModule } from 'primeng/editor';

// shadcn-style UI Components
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogContentComponent,
  DialogFooterComponent,
  ConfirmDialogComponent,
  SpinnerComponent,
  SelectComponent,
  SelectOption,
  TagComponent,
} from '../../../shared/components/ui';
import { ToastService } from '../../../shared/components/ui/feedback/toast/toast.service';

/**
 * Email Template Interface
 */
export interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  category: 'transactional' | 'marketing' | 'notification';
  subjectEn: string;
  subjectAr: string;
  bodyHtmlEn: string;
  bodyHtmlAr: string;
  bodyTextEn: string;
  bodyTextAr: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type TemplateCategory = EmailTemplate['category'];

/**
 * Email Templates Management Component
 * Create and manage email templates with bilingual support
 * Migrated to shadcn/Tailwind styling
 */
@Component({
  selector: 'app-templates-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    EditorModule,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent,
    ConfirmDialogComponent,
    SpinnerComponent,
    SelectComponent,
    TagComponent,
  ],
  template: `
    <div class="p-6 min-h-screen">
      <!-- Page Header -->
      <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-700">
        <div>
          <h1 class="text-2xl font-bold bg-gradient-to-r from-[#3D5A80] via-[#5DB7C2] to-[#6B4C9A] bg-clip-text text-transparent">
            Email Templates
          </h1>
          <p class="text-neutral-500 dark:text-neutral-400 mt-1">
            Manage email templates for automated communications
          </p>
        </div>
        <button
          (click)="openTemplateDialog()"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3D5A80] to-[#5DB7C2] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          New Template
        </button>
      </div>

      <!-- Category Filters -->
      <div class="flex flex-wrap gap-3 mb-8">
        @for (cat of categories; track cat.value) {
          <button
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            [class]="selectedCategory() === cat.value
              ? 'bg-gradient-to-r from-[#3D5A80] to-[#5DB7C2] text-white shadow-lg'
              : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-[#5DB7C2] hover:bg-[#5DB7C2]/5'"
            (click)="selectCategory(cat.value)"
          >
            <span [innerHTML]="cat.icon"></span>
            {{ cat.label }}
            <span
              class="px-2 py-0.5 rounded-lg text-xs font-bold"
              [class]="selectedCategory() === cat.value
                ? 'bg-white/20 text-white'
                : 'bg-[#5DB7C2]/10 text-[#3D5A80] dark:text-[#5DB7C2]'"
            >
              {{ getCountByCategory(cat.value) }}
            </span>
          </button>
        }
        <button
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
          [class]="selectedCategory() === null
            ? 'bg-gradient-to-r from-[#3D5A80] to-[#5DB7C2] text-white shadow-lg'
            : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-[#5DB7C2] hover:bg-[#5DB7C2]/5'"
          (click)="selectCategory(null)"
        >
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/>
            <line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>
          </svg>
          All Templates
          <span
            class="px-2 py-0.5 rounded-lg text-xs font-bold"
            [class]="selectedCategory() === null
              ? 'bg-white/20 text-white'
              : 'bg-[#5DB7C2]/10 text-[#3D5A80] dark:text-[#5DB7C2]'"
          >
            {{ templates().length }}
          </span>
        </button>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 animate-pulse">
              <div class="flex justify-between mb-4">
                <div class="h-6 bg-neutral-200 dark:bg-neutral-700 rounded-lg w-1/2"></div>
                <div class="h-6 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
              </div>
              <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-3"></div>
              <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-4"></div>
              <div class="flex gap-2">
                <div class="h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
                <div class="h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Templates Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          @for (template of filteredTemplates(); track template.id) {
            <div
              class="group relative bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              [class.opacity-60]="!template.isActive"
            >
              <!-- Category Accent -->
              <div
                class="absolute top-0 left-0 right-0 h-1"
                [class]="getCategoryGradient(template.category)"
              ></div>

              <div class="p-6">
                <!-- Header -->
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h4 class="font-semibold text-neutral-900 dark:text-white mb-2">{{ template.name }}</h4>
                    <ui-tag [variant]="getCategoryVariant(template.category)" size="sm">
                      {{ getCategoryLabel(template.category) }}
                    </ui-tag>
                  </div>
                  <!-- Active Toggle -->
                  <button
                    (click)="toggleActive(template); $event.stopPropagation()"
                    class="relative w-12 h-6 rounded-full transition-colors"
                    [class]="template.isActive ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600'"
                  >
                    <span
                      class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                      [class]="template.isActive ? 'translate-x-7' : 'translate-x-1'"
                    ></span>
                  </button>
                </div>

                <!-- Subject Preview -->
                <div class="mb-4">
                  <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Subject</span>
                  <p class="text-sm text-neutral-700 dark:text-neutral-300 mt-1 line-clamp-2">{{ template.subjectEn }}</p>
                </div>

                <!-- Variables -->
                <div class="mb-4">
                  <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Variables</span>
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    @for (v of template.variables.slice(0, 4); track v) {
                      <span class="px-2 py-0.5 bg-[#6B4C9A]/10 text-[#6B4C9A] dark:text-purple-400 rounded-lg text-xs font-medium">
                        {{ formatVariable(v) }}
                      </span>
                    }
                    @if (template.variables.length > 4) {
                      <span class="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 rounded-lg text-xs">
                        +{{ template.variables.length - 4 }} more
                      </span>
                    }
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end gap-1 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                  <button
                    (click)="previewTemplate(template)"
                    class="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-[#5DB7C2]/10 hover:text-[#5DB7C2] transition-colors"
                    title="Preview"
                  >
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button
                    (click)="editTemplate(template)"
                    class="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-[#3D5A80]/10 hover:text-[#3D5A80] transition-colors"
                    title="Edit"
                  >
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      <path d="m15 5 4 4"/>
                    </svg>
                  </button>
                  <button
                    (click)="openTestSendDialog(template)"
                    class="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500 transition-colors"
                    title="Send Test"
                  >
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                    </svg>
                  </button>
                  <button
                    (click)="confirmDelete(template)"
                    class="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors"
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

        <!-- Empty State -->
        @if (filteredTemplates().length === 0) {
          <div class="flex flex-col items-center justify-center py-20">
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-[#3D5A80]/10 to-[#5DB7C2]/10 flex items-center justify-center mb-6">
              <svg class="h-12 w-12 text-[#5DB7C2]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No templates found</h3>
            <p class="text-neutral-500 dark:text-neutral-400 mb-6">Create your first email template to get started</p>
            <button
              (click)="openTemplateDialog()"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3D5A80] to-[#5DB7C2] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              Create Template
            </button>
          </div>
        }
      }
    </div>

    <!-- Template Editor Dialog -->
    <ui-dialog [open]="showTemplateDialog" (openChange)="showTemplateDialog = $event" size="xl">
      <ui-dialog-header>
        <ui-dialog-title class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-gradient-to-r from-[#3D5A80] to-[#5DB7C2]">
            <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
          {{ editingTemplate ? 'Edit Template' : 'New Template' }}
        </ui-dialog-title>
      </ui-dialog-header>

      <ui-dialog-content class="p-0">
        <!-- Tabs -->
        <div class="border-b border-neutral-200 dark:border-neutral-700 px-6 pt-4">
          <div class="flex gap-1">
            @for (tab of editorTabs; track tab.id) {
              <button
                (click)="activeEditorTab.set(tab.id)"
                class="px-4 py-2.5 rounded-t-xl font-medium text-sm transition-all"
                [class]="activeEditorTab() === tab.id
                  ? 'bg-white dark:bg-neutral-800 text-[#3D5A80] dark:text-[#5DB7C2] border border-neutral-200 dark:border-neutral-700 border-b-white dark:border-b-neutral-800 -mb-px'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'"
              >
                {{ tab.label }}
              </button>
            }
          </div>
        </div>

        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <!-- Settings Tab -->
          @if (activeEditorTab() === 'settings') {
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Template Name *</label>
                <input
                  type="text"
                  [(ngModel)]="templateForm.name"
                  placeholder="Welcome Email"
                  class="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5DB7C2] transition-all"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Slug *</label>
                <input
                  type="text"
                  [(ngModel)]="templateForm.slug"
                  placeholder="welcome-email"
                  class="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5DB7C2] transition-all"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Category *</label>
                <ui-select
                  [(ngModel)]="templateForm.category"
                  [options]="categoryOptions"
                  placeholder="Select category"
                ></ui-select>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Status</label>
                <div class="flex items-center gap-3 h-11">
                  <button
                    (click)="templateForm.isActive = !templateForm.isActive"
                    class="relative w-12 h-6 rounded-full transition-colors"
                    [class]="templateForm.isActive ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600'"
                  >
                    <span
                      class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                      [class]="templateForm.isActive ? 'translate-x-7' : 'translate-x-1'"
                    ></span>
                  </button>
                  <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ templateForm.isActive ? 'Active' : 'Inactive' }}</span>
                </div>
              </div>
              <div class="col-span-2 space-y-2">
                <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Variables (comma-separated)</label>
                <input
                  type="text"
                  [(ngModel)]="variablesInput"
                  placeholder="firstName, lastName, companyName"
                  class="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5DB7C2] transition-all"
                />
                <p class="text-xs text-neutral-500">Use double curly braces like variableName in templates</p>
              </div>
            </div>
          }

          <!-- English Content Tab -->
          @if (activeEditorTab() === 'english') {
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Subject Line *</label>
                <input
                  type="text"
                  [(ngModel)]="templateForm.subjectEn"
                  placeholder="Welcome to Roaya IT, [firstName]!"
                  class="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5DB7C2] transition-all"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">HTML Content *</label>
                <p-editor [(ngModel)]="templateForm.bodyHtmlEn" [style]="{ height: '300px' }"></p-editor>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Plain Text Version</label>
                <textarea
                  [(ngModel)]="templateForm.bodyTextEn"
                  rows="4"
                  placeholder="Plain text fallback for email clients that don't support HTML..."
                  class="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5DB7C2] transition-all font-mono text-sm"
                ></textarea>
              </div>
            </div>
          }

          <!-- Arabic Content Tab -->
          @if (activeEditorTab() === 'arabic') {
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Subject Line *</label>
                <input
                  type="text"
                  dir="rtl"
                  [(ngModel)]="templateForm.subjectAr"
                  placeholder="مرحبا بك في روعة، [firstName]!"
                  class="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5DB7C2] transition-all"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">HTML Content *</label>
                <p-editor [(ngModel)]="templateForm.bodyHtmlAr" [style]="{ height: '300px' }"></p-editor>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Plain Text Version</label>
                <textarea
                  [(ngModel)]="templateForm.bodyTextAr"
                  rows="4"
                  dir="rtl"
                  placeholder="نسخة النص العادي..."
                  class="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5DB7C2] transition-all font-mono text-sm"
                ></textarea>
              </div>
            </div>
          }
        </div>
      </ui-dialog-content>

      <ui-dialog-footer>
        <button
          (click)="showTemplateDialog = false"
          class="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          Cancel
        </button>
        <button
          (click)="saveTemplate()"
          [disabled]="saving()"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3D5A80] to-[#5DB7C2] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
        >
          @if (saving()) {
            <ui-spinner size="sm" variant="white"></ui-spinner>
          }
          {{ editingTemplate ? 'Update' : 'Create' }}
        </button>
      </ui-dialog-footer>
    </ui-dialog>

    <!-- Preview Dialog -->
    <ui-dialog [open]="showPreviewDialog" (openChange)="showPreviewDialog = $event" size="lg">
      <ui-dialog-header>
        <ui-dialog-title class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-[#5DB7C2]/10">
            <svg class="h-5 w-5 text-[#5DB7C2]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          Template Preview
        </ui-dialog-title>
      </ui-dialog-header>

      <ui-dialog-content>
        <!-- Language Toggle -->
        <div class="flex gap-2 mb-4">
          <button
            (click)="previewLanguage = 'en'"
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            [class]="previewLanguage === 'en' ? 'bg-[#3D5A80] text-white' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'"
          >
            English
          </button>
          <button
            (click)="previewLanguage = 'ar'"
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            [class]="previewLanguage === 'ar' ? 'bg-[#3D5A80] text-white' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'"
          >
            العربية
          </button>
        </div>

        <!-- Email Preview -->
        <div class="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
          <div class="bg-neutral-100 dark:bg-neutral-800 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
            <p class="text-sm"><span class="font-semibold text-neutral-500">Subject:</span> <span class="text-neutral-900 dark:text-white">{{ previewLanguage === 'en' ? templateToPreview?.subjectEn : templateToPreview?.subjectAr }}</span></p>
          </div>
          <div
            class="p-6 bg-white dark:bg-neutral-900 min-h-[300px]"
            [dir]="previewLanguage === 'ar' ? 'rtl' : 'ltr'"
            [innerHTML]="previewHtml"
          ></div>
        </div>
      </ui-dialog-content>
    </ui-dialog>

    <!-- Test Send Dialog -->
    <ui-dialog [open]="showTestSendDialog" (openChange)="showTestSendDialog = $event" size="sm">
      <ui-dialog-header>
        <ui-dialog-title class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <svg class="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
            </svg>
          </div>
          Send Test Email
        </ui-dialog-title>
      </ui-dialog-header>

      <ui-dialog-content>
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Send To Email *</label>
            <input
              type="email"
              [(ngModel)]="testEmail"
              placeholder="test@example.com"
              class="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5DB7C2] transition-all"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Language</label>
            <ui-select
              [(ngModel)]="testLanguage"
              [options]="languageOptions"
              placeholder="Select language"
            ></ui-select>
          </div>
        </div>
      </ui-dialog-content>

      <ui-dialog-footer>
        <button
          (click)="showTestSendDialog = false"
          class="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          Cancel
        </button>
        <button
          (click)="sendTestEmail()"
          [disabled]="sendingTest()"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
        >
          @if (sendingTest()) {
            <ui-spinner size="sm" variant="white"></ui-spinner>
          }
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
          </svg>
          Send Test
        </button>
      </ui-dialog-footer>
    </ui-dialog>

    <!-- Delete Confirmation -->
    <ui-confirm-dialog
      [open]="showDeleteConfirm()"
      (openChange)="showDeleteConfirm.set($event)"
      title="Delete Template"
      [message]="'Are you sure you want to delete \\'' + (templateToDelete()?.name || '') + '\\'? This action cannot be undone.'"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      (confirmed)="deleteTemplate()"
      (cancelled)="showDeleteConfirm.set(false)"
    ></ui-confirm-dialog>
  `,
  styles: [`
    :host {
      display: block;
    }

    :host ::ng-deep .p-editor {
      border-radius: 0.75rem;
      overflow: hidden;
      border: 1px solid rgb(229 229 229);
    }

    :host ::ng-deep .p-editor .p-editor-toolbar {
      background: rgb(250 250 250);
      border-bottom: 1px solid rgb(229 229 229);
    }

    :host ::ng-deep .p-editor .p-editor-content {
      background: rgb(250 250 250);
    }

    :host-context(.dark) ::ng-deep .p-editor {
      border-color: rgb(64 64 64);
    }

    :host-context(.dark) ::ng-deep .p-editor .p-editor-toolbar {
      background: rgb(38 38 38);
      border-color: rgb(64 64 64);
    }

    :host-context(.dark) ::ng-deep .p-editor .p-editor-content {
      background: rgb(38 38 38);
    }

    :host-context(.dark) ::ng-deep .p-editor .p-editor-content .ql-editor {
      color: white;
    }
  `]
})
export class TemplatesListComponent implements OnInit {
  private toastService = inject(ToastService);
  private sanitizer = inject(DomSanitizer);

  // State
  templates = signal<EmailTemplate[]>([]);
  loading = signal(true);
  saving = signal(false);
  sendingTest = signal(false);
  selectedCategory = signal<TemplateCategory | null>(null);
  showDeleteConfirm = signal(false);
  templateToDelete = signal<EmailTemplate | null>(null);
  activeEditorTab = signal<'settings' | 'english' | 'arabic'>('settings');

  // Computed
  filteredTemplates = computed(() => {
    const category = this.selectedCategory();
    if (category) {
      return this.templates().filter(t => t.category === category);
    }
    return this.templates();
  });

  // Dialogs
  showTemplateDialog = false;
  showPreviewDialog = false;
  showTestSendDialog = false;
  editingTemplate: EmailTemplate | null = null;
  templateToPreview: EmailTemplate | null = null;
  previewHtml: SafeHtml = '';
  previewLanguage: 'en' | 'ar' = 'en';

  // Form data
  templateForm: Partial<EmailTemplate> = this.getEmptyForm();
  variablesInput = '';
  testEmail = '';
  testLanguage = 'en';

  // Options
  categories = [
    { value: 'transactional' as TemplateCategory, label: 'Transactional', icon: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>' },
    { value: 'marketing' as TemplateCategory, label: 'Marketing', icon: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>' },
    { value: 'notification' as TemplateCategory, label: 'Notification', icon: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>' },
  ];

  editorTabs = [
    { id: 'settings' as const, label: 'Settings' },
    { id: 'english' as const, label: 'English Content' },
    { id: 'arabic' as const, label: 'Arabic Content' },
  ];

  categoryOptions: SelectOption[] = this.categories.map(c => ({ label: c.label, value: c.value }));
  languageOptions: SelectOption[] = [
    { label: 'English', value: 'en' },
    { label: 'Arabic', value: 'ar' },
  ];

  ngOnInit(): void {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    // Using demo data directly
    setTimeout(() => {
      this.templates.set([
        {
          id: '1',
          name: 'Welcome Email',
          slug: 'welcome-email',
          category: 'transactional',
          subjectEn: 'Welcome to Roaya IT, {{firstName}}!',
          subjectAr: 'مرحبا بك في روعة، {{firstName}}!',
          bodyHtmlEn: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h1 style="color: #3D5A80;">Welcome to Roaya IT!</h1><p>Hello {{firstName}},</p><p>Thank you for joining us. We\'re excited to have you on board!</p><p>Best regards,<br>The Roaya IT Team</p></div>',
          bodyHtmlAr: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;"><h1 style="color: #3D5A80;">مرحبا بك في روعة!</h1><p>مرحبا {{firstName}}،</p><p>شكرا لانضمامك إلينا. نحن متحمسون لوجودك معنا!</p><p>مع أطيب التحيات،<br>فريق روعة</p></div>',
          bodyTextEn: 'Welcome to Roaya IT!\n\nHello {{firstName}},\n\nThank you for joining us. We\'re excited to have you on board!\n\nBest regards,\nThe Roaya IT Team',
          bodyTextAr: 'مرحبا بك في روعة!\n\nمرحبا {{firstName}}،\n\nشكرا لانضمامك إلينا.\n\nمع أطيب التحيات،\nفريق روعة',
          variables: ['firstName', 'lastName', 'email', 'companyName'],
          isActive: true,
          createdAt: '2026-01-15T10:00:00Z',
          updatedAt: '2026-01-20T14:30:00Z',
        },
        {
          id: '2',
          name: 'Lead Confirmation',
          slug: 'lead-confirmation',
          category: 'transactional',
          subjectEn: 'Thank you for your interest in Roaya IT',
          subjectAr: 'شكرا لاهتمامك بروعة',
          bodyHtmlEn: '<div style="font-family: Arial, sans-serif;"><h2>Thank You!</h2><p>Hi {{firstName}},</p><p>We\'ve received your inquiry and will get back to you within 24 hours.</p></div>',
          bodyHtmlAr: '<div style="font-family: Arial, sans-serif; direction: rtl;"><h2>شكرا لك!</h2><p>مرحبا {{firstName}}،</p><p>لقد استلمنا استفسارك وسنرد عليك خلال 24 ساعة.</p></div>',
          bodyTextEn: 'Thank You!\n\nHi {{firstName}},\n\nWe\'ve received your inquiry and will get back to you within 24 hours.',
          bodyTextAr: 'شكرا لك!\n\nمرحبا {{firstName}}،\n\nلقد استلمنا استفسارك وسنرد عليك خلال 24 ساعة.',
          variables: ['firstName', 'email', 'message', 'companyName'],
          isActive: true,
          createdAt: '2026-01-10T08:00:00Z',
          updatedAt: '2026-01-18T11:00:00Z',
        },
        {
          id: '3',
          name: 'Weekly Newsletter',
          slug: 'weekly-newsletter',
          category: 'marketing',
          subjectEn: 'Your Weekly Tech Update from Roaya IT',
          subjectAr: 'تحديثك التقني الأسبوعي من روعة',
          bodyHtmlEn: '<div style="font-family: Arial, sans-serif;"><h1>This Week in Tech</h1><p>Hi {{firstName}},</p><p>Here are the latest updates...</p><a href="{{unsubscribeUrl}}">Unsubscribe</a></div>',
          bodyHtmlAr: '<div style="font-family: Arial, sans-serif; direction: rtl;"><h1>هذا الأسبوع في التقنية</h1><p>مرحبا {{firstName}}،</p><p>إليك آخر التحديثات...</p><a href="{{unsubscribeUrl}}">إلغاء الاشتراك</a></div>',
          bodyTextEn: 'This Week in Tech\n\nHi {{firstName}},\n\nHere are the latest updates...',
          bodyTextAr: 'هذا الأسبوع في التقنية\n\nمرحبا {{firstName}}،\n\nإليك آخر التحديثات...',
          variables: ['firstName', 'unsubscribeUrl'],
          isActive: true,
          createdAt: '2026-01-05T09:00:00Z',
          updatedAt: '2026-01-25T16:00:00Z',
        },
        {
          id: '4',
          name: 'Password Reset',
          slug: 'password-reset',
          category: 'transactional',
          subjectEn: 'Reset Your Password',
          subjectAr: 'إعادة تعيين كلمة المرور',
          bodyHtmlEn: '<div style="font-family: Arial, sans-serif;"><h2>Password Reset Request</h2><p>Click the link below to reset your password:</p><a href="{{resetUrl}}" style="background: #3D5A80; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Reset Password</a></div>',
          bodyHtmlAr: '<div style="font-family: Arial, sans-serif; direction: rtl;"><h2>طلب إعادة تعيين كلمة المرور</h2><p>انقر على الرابط أدناه لإعادة تعيين كلمة المرور:</p><a href="{{resetUrl}}" style="background: #3D5A80; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">إعادة تعيين</a></div>',
          bodyTextEn: 'Password Reset Request\n\nClick the link to reset your password: {{resetUrl}}',
          bodyTextAr: 'طلب إعادة تعيين كلمة المرور\n\nانقر على الرابط لإعادة تعيين كلمة المرور: {{resetUrl}}',
          variables: ['resetUrl', 'expiresIn'],
          isActive: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-15T10:00:00Z',
        },
        {
          id: '5',
          name: 'New Lead Notification',
          slug: 'new-lead-notification',
          category: 'notification',
          subjectEn: 'New Lead: {{leadName}} from {{companyName}}',
          subjectAr: 'عميل جديد: {{leadName}} من {{companyName}}',
          bodyHtmlEn: '<div style="font-family: Arial, sans-serif;"><h2>New Lead Received!</h2><p><strong>Name:</strong> {{leadName}}</p><p><strong>Company:</strong> {{companyName}}</p><p><strong>Email:</strong> {{leadEmail}}</p><p><strong>Message:</strong> {{message}}</p></div>',
          bodyHtmlAr: '<div style="font-family: Arial, sans-serif; direction: rtl;"><h2>عميل جديد!</h2><p><strong>الاسم:</strong> {{leadName}}</p><p><strong>الشركة:</strong> {{companyName}}</p><p><strong>البريد:</strong> {{leadEmail}}</p><p><strong>الرسالة:</strong> {{message}}</p></div>',
          bodyTextEn: 'New Lead Received!\n\nName: {{leadName}}\nCompany: {{companyName}}\nEmail: {{leadEmail}}\nMessage: {{message}}',
          bodyTextAr: 'عميل جديد!\n\nالاسم: {{leadName}}\nالشركة: {{companyName}}\nالبريد: {{leadEmail}}\nالرسالة: {{message}}',
          variables: ['leadName', 'companyName', 'leadEmail', 'message'],
          isActive: true,
          createdAt: '2026-01-08T12:00:00Z',
          updatedAt: '2026-01-22T09:00:00Z',
        },
        {
          id: '6',
          name: 'Service Update',
          slug: 'service-update',
          category: 'notification',
          subjectEn: 'Service Update: {{serviceName}}',
          subjectAr: 'تحديث الخدمة: {{serviceName}}',
          bodyHtmlEn: '<div style="font-family: Arial, sans-serif;"><h2>Service Update</h2><p>Hi {{firstName}},</p><p>We wanted to let you know about an update to {{serviceName}}.</p><p>{{updateDetails}}</p></div>',
          bodyHtmlAr: '<div style="font-family: Arial, sans-serif; direction: rtl;"><h2>تحديث الخدمة</h2><p>مرحبا {{firstName}}،</p><p>نود إعلامك بتحديث في {{serviceName}}.</p><p>{{updateDetails}}</p></div>',
          bodyTextEn: 'Service Update\n\nHi {{firstName}},\n\nWe wanted to let you know about an update to {{serviceName}}.\n\n{{updateDetails}}',
          bodyTextAr: 'تحديث الخدمة\n\nمرحبا {{firstName}}،\n\nنود إعلامك بتحديث في {{serviceName}}.\n\n{{updateDetails}}',
          variables: ['firstName', 'serviceName', 'updateDetails'],
          isActive: false,
          createdAt: '2026-01-12T15:00:00Z',
          updatedAt: '2026-01-20T08:00:00Z',
        },
      ]);
      this.loading.set(false);
    }, 300);
  }

  selectCategory(category: TemplateCategory | null): void {
    this.selectedCategory.set(category);
  }

  getCountByCategory(category: TemplateCategory): number {
    return this.templates().filter(t => t.category === category).length;
  }

  getCategoryLabel(category: TemplateCategory): string {
    return this.categories.find(c => c.value === category)?.label || category;
  }

  getCategoryVariant(category: TemplateCategory): 'success' | 'info' | 'warning' | 'default' {
    const map: Record<TemplateCategory, 'success' | 'info' | 'warning' | 'default'> = {
      transactional: 'info',
      marketing: 'success',
      notification: 'warning',
    };
    return map[category];
  }

  getCategoryGradient(category: TemplateCategory): string {
    const map: Record<TemplateCategory, string> = {
      transactional: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      marketing: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      notification: 'bg-gradient-to-r from-amber-500 to-orange-500',
    };
    return map[category];
  }

  openTemplateDialog(template?: EmailTemplate): void {
    this.editingTemplate = template || null;
    this.templateForm = template ? { ...template } : this.getEmptyForm();
    this.variablesInput = this.templateForm.variables?.join(', ') || '';
    this.activeEditorTab.set('settings');
    this.showTemplateDialog = true;
  }

  editTemplate(template: EmailTemplate): void {
    this.openTemplateDialog(template);
  }

  toggleActive(template: EmailTemplate): void {
    template.isActive = !template.isActive;
    this.toastService.success(
      `${template.name} has been ${template.isActive ? 'activated' : 'deactivated'}`,
      template.isActive ? 'Activated' : 'Deactivated'
    );
  }

  previewTemplate(template: EmailTemplate): void {
    this.templateToPreview = template;
    this.previewLanguage = 'en';
    this.updatePreviewHtml();
    this.showPreviewDialog = true;
  }

  updatePreviewHtml(): void {
    if (!this.templateToPreview) return;
    const html = this.previewLanguage === 'en'
      ? this.templateToPreview.bodyHtmlEn
      : this.templateToPreview.bodyHtmlAr;
    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  openTestSendDialog(template: EmailTemplate): void {
    this.templateToPreview = template;
    this.testEmail = '';
    this.testLanguage = 'en';
    this.showTestSendDialog = true;
  }

  sendTestEmail(): void {
    if (!this.testEmail) {
      this.toastService.error('Please enter an email address', 'Error');
      return;
    }

    this.sendingTest.set(true);

    // Simulated API call
    setTimeout(() => {
      this.sendingTest.set(false);
      this.showTestSendDialog = false;
      this.toastService.success(`Test email sent to ${this.testEmail}`, 'Test Sent');
    }, 1500);
  }

  confirmDelete(template: EmailTemplate): void {
    this.templateToDelete.set(template);
    this.showDeleteConfirm.set(true);
  }

  deleteTemplate(): void {
    const template = this.templateToDelete();
    if (!template) return;

    const updated = this.templates().filter(t => t.id !== template.id);
    this.templates.set(updated);
    this.showDeleteConfirm.set(false);
    this.templateToDelete.set(null);
    this.toastService.success(`${template.name} has been deleted`, 'Deleted');
  }

  saveTemplate(): void {
    if (!this.templateForm.name || !this.templateForm.slug || !this.templateForm.category) {
      this.toastService.error('Please fill all required fields', 'Error');
      return;
    }

    this.templateForm.variables = this.variablesInput.split(',').map(v => v.trim()).filter(v => v);
    this.saving.set(true);

    // Simulated API call
    setTimeout(() => {
      if (this.editingTemplate) {
        const updated = this.templates().map(t =>
          t.id === this.editingTemplate!.id ? { ...t, ...this.templateForm, updatedAt: new Date().toISOString() } : t
        );
        this.templates.set(updated as EmailTemplate[]);
      } else {
        const newTemplate: EmailTemplate = {
          ...this.templateForm,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as EmailTemplate;
        this.templates.set([...this.templates(), newTemplate]);
      }

      this.saving.set(false);
      this.showTemplateDialog = false;
      this.toastService.success(
        `${this.templateForm.name} has been ${this.editingTemplate ? 'updated' : 'created'}`,
        this.editingTemplate ? 'Updated' : 'Created'
      );
    }, 500);
  }

  private getEmptyForm(): Partial<EmailTemplate> {
    return {
      name: '',
      slug: '',
      category: 'transactional',
      subjectEn: '',
      subjectAr: '',
      bodyHtmlEn: '',
      bodyHtmlAr: '',
      bodyTextEn: '',
      bodyTextAr: '',
      variables: [],
      isActive: true,
    };
  }

  formatVariable(v: string): string {
    return `{{${v}}}`;
  }
}
