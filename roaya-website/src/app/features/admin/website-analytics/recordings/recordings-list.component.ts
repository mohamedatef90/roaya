import { Component, OnInit, OnDestroy, signal, inject, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// shadcn-style UI Components
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogContentComponent,
  ConfirmDialogComponent,
  SpinnerComponent,
  SelectComponent,
  SelectOption,
  PaginationComponent,
  PageChangeEvent,
} from '../../../../shared/components/ui';
import { ToastService } from '../../../../shared/components/ui/feedback/toast/toast.service';

import {
  WebsiteAnalyticsService,
  SessionRecord,
  SessionRecordingData,
  PaginationMeta,
} from '../../../../core/services/website-analytics.service';

interface SessionRecording {
  id: string;
  sessionId: string;
  startTime: string;
  duration: number;
  pageCount: number;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  country: string;
  browser: string;
  pages: string[];
  isWatched: boolean;
  hasError: boolean;
  isLive: boolean;
}

@Component({
  selector: 'app-recordings-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    ConfirmDialogComponent,
    SpinnerComponent,
    SelectComponent,
    PaginationComponent,
  ],
  template: `
    <div class="p-6 min-h-screen">
      <!-- Page Header -->
      <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-700">
        <div>
          <h1 class="text-2xl font-bold bg-gradient-to-r from-[#3D5A80] via-[#5DB7C2] to-[#6B4C9A] bg-clip-text text-transparent">
            Session Recordings
          </h1>
          <p class="text-neutral-500 dark:text-neutral-400 mt-1">
            Watch how users interact with your website
          </p>
        </div>
        <div class="flex items-center gap-3">
          <ui-select
            [(ngModel)]="selectedDateRange"
            [options]="dateRangeOptions"
            placeholder="Date Range"
          ></ui-select>
          <div class="relative">
            <button
              (click)="showExportMenu = !showExportMenu"
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all shadow-sm"
              type="button"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
              Export
              <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            @if (showExportMenu) {
              <div class="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg overflow-hidden z-50 animate-slideDown">
                <button
                  (click)="exportRecordings('csv')"
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  type="button"
                >
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" x2="8" y1="13" y2="13"/>
                    <line x1="16" x2="8" y1="17" y2="17"/>
                    <line x1="10" x2="8" y1="9" y2="9"/>
                  </svg>
                  Export as CSV
                </button>
                <button
                  (click)="exportRecordings('json')"
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors border-t border-neutral-100 dark:border-neutral-700"
                  type="button"
                >
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/>
                    <path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/>
                  </svg>
                  Export as JSON
                </button>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <!-- Total Recordings -->
        <div class="relative overflow-hidden bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3D5A80] to-[#5DB7C2]"></div>
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3D5A80] to-[#5DB7C2] flex items-center justify-center shadow-lg">
              <svg class="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-3xl font-bold text-neutral-900 dark:text-white">{{ totalRecordings() }}</p>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">Total Recordings</p>
            </div>
          </div>
        </div>

        <!-- Live Sessions -->
        <div class="relative overflow-hidden bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <span class="relative flex h-4 w-4">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span class="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
              </span>
            </div>
            <div class="flex-1">
              <p class="text-3xl font-bold text-red-500">{{ liveSessionsCount() }}</p>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">Live Sessions</p>
              <div class="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-red-50 dark:bg-red-900/30 rounded-full text-xs font-semibold text-red-600 dark:text-red-400">
                <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Active now
              </div>
            </div>
          </div>
        </div>

        <!-- Unwatched -->
        <div class="relative overflow-hidden bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500"></div>
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
              <svg class="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-3xl font-bold text-neutral-900 dark:text-white">{{ unwatchedCount() }}</p>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">Unwatched</p>
              <div class="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 rounded-full text-xs font-semibold text-amber-600 dark:text-amber-400">
                Need review
              </div>
            </div>
          </div>
        </div>

        <!-- Avg Duration -->
        <div class="relative overflow-hidden bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6B4C9A] to-purple-500"></div>
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B4C9A] to-purple-500 flex items-center justify-center shadow-lg">
              <svg class="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-3xl font-bold text-neutral-900 dark:text-white">{{ formatDuration(avgDuration()) }}</p>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">Avg. Duration</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 mb-6 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <div class="relative">
              <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="applyFilters()"
                placeholder="Filter by page URL (e.g., /pricing, /about)..."
                class="w-full h-11 pl-11 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5DB7C2] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <!-- Device Filter -->
          <ui-select
            [(ngModel)]="selectedDevice"
            (ngModelChange)="applyFilters()"
            [options]="deviceOptions"
            placeholder="Device Type"
          ></ui-select>

          <!-- Duration Filter -->
          <ui-select
            [(ngModel)]="selectedDuration"
            (ngModelChange)="applyFilters()"
            [options]="durationOptions"
            placeholder="Duration"
          ></ui-select>

          <!-- Status Filter -->
          <ui-select
            [(ngModel)]="selectedStatus"
            (ngModelChange)="applyFilters()"
            [options]="statusOptions"
            placeholder="Status"
          ></ui-select>
        </div>
      </div>

      <!-- Recordings Table -->
      <div class="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
        <!-- Table Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
          <div class="flex items-center gap-2">
            <svg class="h-5 w-5 text-[#5DB7C2]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
            </svg>
            <h3 class="font-semibold text-neutral-900 dark:text-white">Recent Recordings</h3>
          </div>
          <span class="text-sm text-neutral-500 dark:text-neutral-400">{{ filteredRecordings().length }} recordings</span>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-20">
            <ui-spinner size="lg" variant="default"></ui-spinner>
            <p class="mt-4 text-neutral-500 dark:text-neutral-400">Loading recordings...</p>
          </div>
        } @else if (paginatedRecordings().length === 0) {
          <!-- Empty State -->
          <div class="flex flex-col items-center justify-center py-20">
            <div class="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-4">
              <svg class="h-10 w-10 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
              </svg>
            </div>
            <h4 class="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No recordings found</h4>
            <p class="text-neutral-500 dark:text-neutral-400">Try adjusting your filters</p>
          </div>
        } @else {
          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-700">
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4">Session</th>
                  <th class="px-6 py-4">Started</th>
                  <th class="px-6 py-4">Duration</th>
                  <th class="px-6 py-4">Pages</th>
                  <th class="px-6 py-4">Device</th>
                  <th class="px-6 py-4">Location</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 dark:divide-neutral-700">
                @for (recording of paginatedRecordings(); track recording.id) {
                  <tr
                    class="group hover:bg-gradient-to-r hover:from-[#5DB7C2]/5 hover:to-[#6B4C9A]/5 cursor-pointer transition-colors"
                    [class.bg-[#5DB7C2]/5]="!recording.isWatched"
                    (click)="playRecording(recording)"
                  >
                    <!-- Status -->
                    <td class="px-6 py-4">
                      @if (recording.isLive) {
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm">
                          <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          LIVE
                        </span>
                      } @else if (recording.hasError) {
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                          <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                            <path d="M12 9v4"/><path d="M12 17h.01"/>
                          </svg>
                          Error
                        </span>
                      } @else if (!recording.isWatched) {
                        <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#5DB7C2]/10 text-[#3D5A80] dark:text-[#5DB7C2]">
                          New
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400">
                          Watched
                        </span>
                      }
                    </td>

                    <!-- Session -->
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D5A80]/10 to-[#6B4C9A]/10 flex items-center justify-center">
                          <svg class="h-5 w-5 text-[#3D5A80] dark:text-[#5DB7C2]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                        </div>
                        <div>
                          <p class="font-mono font-semibold text-neutral-900 dark:text-white">{{ recording.sessionId }}</p>
                          <p class="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                            <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <circle cx="12" cy="12" r="4"/>
                              <line x1="21.17" x2="12" y1="8" y2="8"/>
                              <line x1="3.95" x2="8.54" y1="6.06" y2="14"/>
                              <line x1="10.88" x2="15.46" y1="21.94" y2="14"/>
                            </svg>
                            {{ recording.browser }}
                          </p>
                        </div>
                      </div>
                    </td>

                    <!-- Started -->
                    <td class="px-6 py-4">
                      <p class="font-medium text-neutral-900 dark:text-white">{{ formatDate(recording.startTime) }}</p>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ formatTime(recording.startTime) }}</p>
                    </td>

                    <!-- Duration -->
                    <td class="px-6 py-4">
                      <span
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold"
                        [class.bg-neutral-100]="recording.duration <= 300"
                        [class.dark:bg-neutral-700]="recording.duration <= 300"
                        [class.text-neutral-700]="recording.duration <= 300"
                        [class.dark:text-neutral-300]="recording.duration <= 300"
                        [class.bg-gradient-to-r]="recording.duration > 300"
                        [class.from-[#5DB7C2]/10]="recording.duration > 300"
                        [class.to-[#6B4C9A]/10]="recording.duration > 300"
                        [class.text-[#6B4C9A]]="recording.duration > 300"
                        [class.dark:text-purple-400]="recording.duration > 300"
                      >
                        <svg class="h-4 w-4 opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {{ formatDuration(recording.duration) }}
                      </span>
                    </td>

                    <!-- Pages -->
                    <td class="px-6 py-4">
                      <p class="font-semibold text-neutral-900 dark:text-white">{{ recording.pageCount }} pages</p>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400 max-w-[140px] truncate" [title]="recording.pages.join(' → ')">
                        {{ recording.pages.slice(0, 2).join(' → ') }}
                      </p>
                    </td>

                    <!-- Device -->
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-[#5DB7C2]" [innerHTML]="getDeviceIconSvg(recording.deviceType)"></div>
                        <span class="text-neutral-700 dark:text-neutral-300">{{ recording.deviceType | titlecase }}</span>
                      </div>
                    </td>

                    <!-- Location -->
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <span class="text-xl">{{ getCountryFlag(recording.country) }}</span>
                        <span class="text-neutral-700 dark:text-neutral-300">{{ recording.country }}</span>
                      </div>
                    </td>

                    <!-- Actions -->
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          (click)="playRecording(recording); $event.stopPropagation()"
                          class="w-9 h-9 rounded-xl bg-gradient-to-r from-[#5DB7C2] to-[#6B4C9A] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                          title="Play"
                        >
                          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="6 3 20 12 6 21 6 3"/>
                          </svg>
                        </button>
                        <button
                          (click)="downloadRecording(recording); $event.stopPropagation()"
                          class="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-300 transition-all"
                          title="Download"
                        >
                          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" x2="12" y1="15" y2="3"/>
                          </svg>
                        </button>
                        <button
                          (click)="confirmDelete(recording); $event.stopPropagation()"
                          class="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-800 hover:text-red-500 transition-all"
                          title="Delete"
                        >
                          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (filteredRecordings().length > pageSize) {
            <div class="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
              <ui-pagination
                [totalRecords]="filteredRecordings().length"
                [rows]="pageSize"
                [first]="(currentPage$() - 1) * pageSize"
                [showRowsPerPage]="false"
                (pageChange)="onPageChange($event)"
              ></ui-pagination>
            </div>
          }
        }
      </div>
    </div>

    <!-- Session Details Dialog -->
    <ui-dialog [open]="playerVisible" (openChange)="onPlayerDialogChange($event)" size="xl">
      <ui-dialog-header>
        <ui-dialog-title class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-gradient-to-r from-[#3D5A80] to-[#5DB7C2]">
            <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
            </svg>
          </div>
          <div>
            <span class="font-mono font-semibold">Session Replay</span>
            <div class="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-normal mt-0.5">
              <span>{{ selectedRecording()?.sessionId }}</span>
            </div>
          </div>
        </ui-dialog-title>
      </ui-dialog-header>

      <ui-dialog-content>
        @if (selectedRecording()) {
          <div class="space-y-6">
            <!-- rrweb Player Section -->
            @if (recordingLoading()) {
              <div class="flex flex-col items-center justify-center py-16">
                <ui-spinner size="lg" variant="default"></ui-spinner>
                <p class="mt-4 text-neutral-500 dark:text-neutral-400">Loading session recording...</p>
              </div>
            } @else if (recordingEvents().length === 0) {
              <div class="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <svg class="h-5 w-5 text-neutral-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
                </svg>
                <div>
                  <p class="font-semibold text-neutral-700 dark:text-neutral-300 text-sm">No Recording Available</p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">This session was recorded before rrweb was enabled, or no events were captured.</p>
                </div>
              </div>
            } @else {
              <!-- Speed Controls -->
              <div class="flex items-center justify-between mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <span class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Playback Speed</span>
                <div class="flex items-center gap-1">
                  @for (speed of availableSpeeds; track speed) {
                    <button
                      (click)="setPlaybackSpeed(speed)"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      [class.bg-gradient-to-r]="playbackSpeed() === speed"
                      [class.from-[#5DB7C2]]="playbackSpeed() === speed"
                      [class.to-[#6B4C9A]]="playbackSpeed() === speed"
                      [class.text-white]="playbackSpeed() === speed"
                      [class.shadow-lg]="playbackSpeed() === speed"
                      [class.bg-neutral-100]="playbackSpeed() !== speed"
                      [class.dark:bg-neutral-700]="playbackSpeed() !== speed"
                      [class.text-neutral-600]="playbackSpeed() !== speed"
                      [class.dark:text-neutral-300]="playbackSpeed() !== speed"
                      [class.hover:bg-neutral-200]="playbackSpeed() !== speed"
                      [class.dark:hover:bg-neutral-600]="playbackSpeed() !== speed"
                    >
                      {{ speed }}x
                    </button>
                  }
                </div>
              </div>
              <div #rrwebPlayerContainer class="rrweb-player-wrapper rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700"></div>
            }

            <!-- Session Info Grid -->
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <p class="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold mb-1">Started</p>
                <p class="font-semibold text-neutral-900 dark:text-white">{{ formatDate(selectedRecording()?.startTime || '') }} {{ formatTime(selectedRecording()?.startTime || '') }}</p>
              </div>
              <div class="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <p class="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold mb-1">Duration</p>
                <p class="font-semibold text-neutral-900 dark:text-white">{{ formatDuration(selectedRecording()?.duration || 0) }}</p>
              </div>
              <div class="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <p class="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold mb-1">Device</p>
                <p class="font-semibold text-neutral-900 dark:text-white">{{ selectedRecording()?.deviceType | titlecase }}</p>
              </div>
              <div class="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <p class="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold mb-1">Browser</p>
                <p class="font-semibold text-neutral-900 dark:text-white">{{ selectedRecording()?.browser }}</p>
              </div>
              <div class="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <p class="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold mb-1">Location</p>
                <p class="font-semibold text-neutral-900 dark:text-white">{{ selectedRecording()?.country || 'Unknown' }}</p>
              </div>
              <div class="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <p class="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-semibold mb-1">Pages Viewed</p>
                <p class="font-semibold text-neutral-900 dark:text-white">{{ selectedRecording()?.pageCount }}</p>
              </div>
            </div>

            <!-- Pages Visited -->
            @if (selectedRecording()?.pages && selectedRecording()!.pages.length > 0) {
              <div>
                <h4 class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Pages Visited</h4>
                <div class="flex flex-wrap gap-2">
                  @for (page of selectedRecording()?.pages; track page; let i = $index) {
                    <span class="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                      <span class="w-6 h-6 rounded-full bg-gradient-to-r from-[#5DB7C2] to-[#6B4C9A] text-white text-xs font-bold flex items-center justify-center">
                        {{ i + 1 }}
                      </span>
                      <span class="text-sm text-neutral-700 dark:text-neutral-200 max-w-[160px] truncate">{{ page }}</span>
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </ui-dialog-content>
    </ui-dialog>

    <!-- Delete Confirmation -->
    <ui-confirm-dialog
      [open]="showDeleteConfirm()"
      (openChange)="showDeleteConfirm.set($event)"
      title="Delete Recording"
      [message]="'Are you sure you want to delete session ' + (recordingToDelete()?.sessionId || '') + '? This action cannot be undone.'"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      (confirmed)="deleteRecording()"
      (cancelled)="showDeleteConfirm.set(false)"
    ></ui-confirm-dialog>
  `,
  styles: [`
    :host {
      display: block;
    }
    .rrweb-player-wrapper {
      min-height: 400px;
      background: #f8fafc;
    }
    .rrweb-player-wrapper :deep(.replayer-wrapper) {
      margin: 0 auto;
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-slideDown {
      animation: slideDown 0.2s ease-out;
    }
  `],
})
export class RecordingsListComponent implements OnInit, OnDestroy {
  private readonly toastService = inject(ToastService);
  private readonly analytics = inject(WebsiteAnalyticsService);

  @ViewChild('rrwebPlayerContainer') playerContainerRef!: ElementRef<HTMLElement>;

  loading = signal(false);
  searchQuery = '';
  selectedDevice = 'all';
  selectedDuration = 'all';
  selectedStatus = 'all';
  selectedDateRange = 'last7days';
  playerVisible = false;
  selectedRecording = signal<SessionRecording | null>(null);

  // rrweb player state
  recordingLoading = signal(false);
  recordingEvents = signal<Record<string, unknown>[]>([]);
  private playerInstance: any = null;
  playbackSpeed = signal(1); // Default 1x speed
  availableSpeeds = [0.5, 1, 1.5, 2, 4, 8];

  currentPage$ = signal(1);
  pageSize = 10;
  totalFromApi = signal(0);
  activeVisitors = signal(0);

  showDeleteConfirm = signal(false);
  recordingToDelete = signal<SessionRecording | null>(null);
  showExportMenu = false;

  dateRangeOptions: SelectOption[] = [
    { label: 'Last 7 days', value: 'last7days' },
    { label: 'Last 30 days', value: 'last30days' },
    { label: 'Last 90 days', value: 'last90days' },
  ];

  deviceOptions: SelectOption[] = [
    { label: 'All Devices', value: 'all' },
    { label: 'Desktop', value: 'desktop' },
    { label: 'Tablet', value: 'tablet' },
    { label: 'Mobile', value: 'mobile' },
  ];

  durationOptions: SelectOption[] = [
    { label: 'Any Duration', value: 'all' },
    { label: '< 30 seconds', value: 'short' },
    { label: '30s - 2 minutes', value: 'medium' },
    { label: '2 - 5 minutes', value: 'long' },
    { label: '> 5 minutes', value: 'verylong' },
  ];

  statusOptions: SelectOption[] = [
    { label: 'All Status', value: 'all' },
  ];

  recordings = signal<SessionRecording[]>([]);

  totalRecordings = computed(() => this.totalFromApi());
  liveSessionsCount = computed(() => this.activeVisitors());
  unwatchedCount = computed(() => this.totalFromApi());
  avgDuration = computed(() => {
    const recs = this.recordings();
    if (recs.length === 0) return 0;
    return Math.round(recs.reduce((sum, r) => sum + r.duration, 0) / recs.length);
  });

  filteredRecordings = computed(() => {
    let result = this.recordings();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.sessionId.toLowerCase().includes(query) ||
          r.country.toLowerCase().includes(query) ||
          r.pages.some((p) => p.toLowerCase().includes(query)),
      );
    }

    if (this.selectedDuration !== 'all') {
      result = result.filter((r) => {
        switch (this.selectedDuration) {
          case 'short': return r.duration < 30;
          case 'medium': return r.duration >= 30 && r.duration < 120;
          case 'long': return r.duration >= 120 && r.duration < 300;
          case 'verylong': return r.duration >= 300;
          default: return true;
        }
      });
    }

    return result;
  });

  paginatedRecordings = computed(() => {
    const filtered = this.filteredRecordings();
    const page = this.currentPage$();
    const size = this.pageSize;
    const start = (page - 1) * size;
    return filtered.slice(start, start + size);
  });

  ngOnInit(): void {
    this.loadSessions();
    this.analytics.getActiveVisitors().subscribe((n) => this.activeVisitors.set(n));
  }

  applyFilters(): void {
    // Reset to page 1 when filters change
    this.currentPage$.set(1);
  }

  onPageChange(event: PageChangeEvent): void {
    this.currentPage$.set(event.page);
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading.set(true);
    const range = this.buildDateRange();

    this.analytics
      .getSessions({
        from: range.from,
        to: range.to,
        device: this.selectedDevice !== 'all' ? this.selectedDevice : undefined,
        page: this.currentPage$(),
        limit: this.pageSize,
      })
      .subscribe((res) => {
        this.totalFromApi.set(res.meta.total);
        this.recordings.set(
          res.sessions.map((s) => this.mapSessionToRecording(s)),
        );
        this.loading.set(false);
      });
  }

  private mapSessionToRecording(s: SessionRecord): SessionRecording {
    const startedAt = new Date(s.startedAt);
    const endedAt = s.endedAt ? new Date(s.endedAt) : null;
    const duration = endedAt
      ? Math.round((endedAt.getTime() - startedAt.getTime()) / 1000)
      : 0;

    return {
      id: s.id,
      sessionId: s.id.substring(0, 12),
      startTime: s.startedAt,
      duration,
      pageCount: s.pageCount,
      deviceType: (s.device as 'desktop' | 'tablet' | 'mobile') || 'desktop',
      country: s.country || 'Unknown',
      browser: s.browser || 'Unknown',
      pages: [],
      isWatched: true,
      hasError: false,
      isLive: !s.endedAt,
    };
  }

  /**
   * Export filtered recordings in CSV or JSON format
   * Only exports currently filtered/visible recordings
   */
  exportRecordings(format: 'csv' | 'json'): void {
    this.showExportMenu = false;
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `session-recordings-${dateStr}`;
    const recordingsToExport = this.filteredRecordings();

    if (recordingsToExport.length === 0) {
      this.toastService.warning('No recordings to export', 'Export');
      return;
    }

    if (format === 'csv') {
      this.exportAsCSV(filename, recordingsToExport);
    } else {
      this.exportAsJSON(filename, recordingsToExport);
    }

    this.toastService.success(
      `Exported ${recordingsToExport.length} recordings as ${format.toUpperCase()}`,
      'Export Complete'
    );
  }

  private exportAsCSV(filename: string, recordings: SessionRecording[]): void {
    const headers = [
      'Session ID',
      'Visitor ID',
      'Start Time',
      'Duration (s)',
      'Pages Visited',
      'Device',
      'Browser',
      'Country',
      'Status'
    ];

    const rows = recordings.map(rec => [
      rec.sessionId,
      rec.id,
      new Date(rec.startTime).toISOString(),
      rec.duration.toString(),
      rec.pageCount.toString(),
      rec.deviceType,
      rec.browser,
      rec.country,
      rec.isLive ? 'Live' : rec.hasError ? 'Error' : rec.isWatched ? 'Watched' : 'New'
    ]);

    const csvContent = this.arrayToCSV(headers, rows);
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  private exportAsJSON(filename: string, recordings: SessionRecording[]): void {
    const exportData = {
      exportedAt: new Date().toISOString(),
      dateRange: this.selectedDateRange,
      filters: {
        device: this.selectedDevice !== 'all' ? this.selectedDevice : null,
        duration: this.selectedDuration !== 'all' ? this.selectedDuration : null,
        status: this.selectedStatus !== 'all' ? this.selectedStatus : null,
        searchQuery: this.searchQuery || null,
      },
      totalRecordings: recordings.length,
      recordings: recordings.map(rec => ({
        sessionId: rec.sessionId,
        visitorId: rec.id,
        startTime: rec.startTime,
        duration: rec.duration,
        pageCount: rec.pageCount,
        deviceType: rec.deviceType,
        browser: rec.browser,
        country: rec.country,
        pages: rec.pages,
        status: {
          isLive: rec.isLive,
          hasError: rec.hasError,
          isWatched: rec.isWatched,
        },
      })),
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;');
  }

  /**
   * Convert array data to CSV format with proper escaping
   */
  private arrayToCSV(headers: string[], rows: string[][]): string {
    const escapeCsvCell = (cell: string): string => {
      const str = String(cell ?? '');
      // Escape if contains comma, quote, or newline
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerLine = headers.map(escapeCsvCell).join(',');
    const dataLines = rows.map(row =>
      row.map(escapeCsvCell).join(',')
    );

    return [headerLine, ...dataLines].join('\n');
  }

  /**
   * Trigger browser download of file
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getDeviceIconSvg(deviceType: string): string {
    switch (deviceType) {
      case 'desktop':
        return '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>';
      case 'tablet':
        return '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>';
      case 'mobile':
        return '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>';
      default:
        return '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>';
    }
  }

  /**
   * Convert 2-letter ISO country code to Unicode flag emoji
   * @param countryCode ISO 3166-1 alpha-2 country code (e.g., 'EG', 'US', 'SA')
   * @returns Unicode flag emoji or globe icon for unknown/invalid codes
   */
  countryToFlag(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  getCountryFlag(country: string): string {
    // Map country names to ISO codes
    const countryToCode: Record<string, string> = {
      'Egypt': 'EG',
      'Saudi Arabia': 'SA',
      'UAE': 'AE',
      'United Arab Emirates': 'AE',
      'Jordan': 'JO',
      'Kuwait': 'KW',
      'Qatar': 'QA',
      'Bahrain': 'BH',
      'Oman': 'OM',
      'United States': 'US',
      'United Kingdom': 'GB',
      'Germany': 'DE',
      'France': 'FR',
      'Canada': 'CA',
      'Australia': 'AU',
      'India': 'IN',
      'China': 'CN',
      'Japan': 'JP',
      'South Korea': 'KR',
      'Brazil': 'BR',
      'Mexico': 'MX',
      'Spain': 'ES',
      'Italy': 'IT',
      'Netherlands': 'NL',
      'Switzerland': 'CH',
      'Sweden': 'SE',
      'Norway': 'NO',
      'Denmark': 'DK',
      'Finland': 'FI',
      'Poland': 'PL',
      'Turkey': 'TR',
      'Unknown': '',
    };

    const code = countryToCode[country];
    return code ? this.countryToFlag(code) : '🌍';
  }

  playRecording(recording: SessionRecording): void {
    this.selectedRecording.set(recording);
    this.recordingLoading.set(true);
    this.recordingEvents.set([]);
    this.destroyPlayer();
    this.playerVisible = true;

    this.analytics.getSessionRecording(recording.id).subscribe((data) => {
      this.recordingEvents.set(data.events);
      this.recordingLoading.set(false);

      if (data.events.length > 0) {
        // Wait for the DOM to render the container, then mount player
        setTimeout(() => this.mountPlayer(data.events), 0);
      }
    });
  }

  onPlayerDialogChange(open: boolean): void {
    this.playerVisible = open;
    if (!open) {
      this.destroyPlayer();
    }
  }

  private async mountPlayer(events: Record<string, unknown>[]): Promise<void> {
    try {
      const container = this.playerContainerRef?.nativeElement;
      if (!container) return;

      const rrwebPlayer = await import('rrweb-player');
      const RRWebPlayer = rrwebPlayer.default || rrwebPlayer;

      this.playerInstance = new RRWebPlayer({
        target: container,
        props: {
          events: events as any[],
          width: container.clientWidth,
          height: 500,
          autoPlay: false,
          showController: true,
          speed: this.playbackSpeed(),
          speedOption: [1, 2, 4, 8],
        },
      });
    } catch {
      this.toastService.error('Failed to load replay player.', 'Error');
    }
  }

  setPlaybackSpeed(speed: number): void {
    this.playbackSpeed.set(speed);
    if (this.playerInstance) {
      try {
        // rrweb-player exposes setSpeed method
        this.playerInstance.setSpeed?.(speed);
      } catch {
        // If setSpeed not available, recreate player with new speed
        const events = this.recordingEvents();
        if (events.length > 0) {
          this.destroyPlayer();
          setTimeout(() => this.mountPlayer(events), 0);
        }
      }
    }
  }

  private destroyPlayer(): void {
    if (this.playerInstance) {
      try {
        this.playerInstance.$destroy?.();
        this.playerInstance.destroy?.();
      } catch {
        // Best effort cleanup
      }
      this.playerInstance = null;
    }
    // Clear the container
    if (this.playerContainerRef?.nativeElement) {
      this.playerContainerRef.nativeElement.innerHTML = '';
    }
  }

  ngOnDestroy(): void {
    this.destroyPlayer();
  }

  downloadRecording(recording: SessionRecording): void {
    this.toastService.info('Session replay export is coming soon.', 'Coming Soon');
  }

  confirmDelete(recording: SessionRecording): void {
    this.recordingToDelete.set(recording);
    this.showDeleteConfirm.set(true);
  }

  deleteRecording(): void {
    const recording = this.recordingToDelete();
    if (!recording) return;

    this.recordings.set(this.recordings().filter((r) => r.id !== recording.id));
    this.showDeleteConfirm.set(false);
    this.recordingToDelete.set(null);
    this.toastService.success(`Session ${recording.sessionId} removed from view`, 'Removed');
  }

  private buildDateRange(): { from?: string; to?: string } {
    const to = new Date().toISOString();
    let from: Date;
    switch (this.selectedDateRange) {
      case 'last7days':
        from = new Date(Date.now() - 7 * 86400000);
        break;
      case 'last30days':
        from = new Date(Date.now() - 30 * 86400000);
        break;
      case 'last90days':
        from = new Date(Date.now() - 90 * 86400000);
        break;
      default:
        from = new Date(Date.now() - 7 * 86400000);
    }
    return { from: from.toISOString(), to };
  }
}
