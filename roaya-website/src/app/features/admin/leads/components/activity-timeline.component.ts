import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  LeadActivity,
  ActivityType,
  PaginationMeta,
} from '../../../../core/interfaces/admin.interface';

interface ActivityOption {
  label: string;
  value: ActivityType | null;
}

/**
 * Activity Timeline Component
 * Displays lead activities in a visual timeline with inline SVG icons
 * Migrated from PrimeNG to shadcn-style Tailwind
 */
@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  template: `
    <div class="activity-timeline">
      <!-- Header with filter -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-content-primary">Activity Timeline</h3>
        <select
          [(ngModel)]="selectedType"
          [ngModelOptions]="{ standalone: true }"
          (change)="onFilterChange()"
          class="h-9 rounded-md border border-edge-strong bg-surface-elevated px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
        >
          @for (opt of activityTypeOptions; track opt.label) {
            <option [ngValue]="opt.value">{{ opt.label }}</option>
          }
        </select>
      </div>

      <!-- Loading state -->
      @if (loading) {
        <div class="flex justify-center py-8">
          <svg class="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      }

      <!-- Timeline -->
      @if (!loading && activities.length > 0) {
        <div class="relative">
          @for (activity of activities; track activity.id; let last = $last) {
            <div class="relative pb-8" [class.pb-0]="last">
              <!-- Connector line -->
              @if (!last) {
                <span class="absolute left-4 top-8 -ml-px h-full w-0.5 bg-neutral-200 dark:bg-neutral-700" aria-hidden="true"></span>
              }

              <div class="relative flex items-start">
                <!-- Marker -->
                <div class="flex-shrink-0">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-full text-white ring-4 ring-white dark:ring-neutral-900"
                    [style.background-color]="getActivityColor(activity.type)"
                  >
                    <span [innerHTML]="getActivitySvg(activity.type)"></span>
                  </span>
                </div>

                <!-- Content -->
                <div class="min-w-0 flex-1 px-4">
                  <div class="p-3 bg-surface-secondary rounded-lg">
                    <div class="flex justify-between items-start mb-1">
                      <span class="font-medium text-sm text-content-primary">{{ getActivityLabel(activity.type) }}</span>
                      <span class="text-xs text-content-muted">
                        {{ formatDate(activity.createdAt) }}
                      </span>
                    </div>
                    <p class="text-sm text-content-secondary mb-1">
                      {{ activity.description }}
                    </p>
                    @if (activity.performedBy) {
                      <span class="text-xs text-content-muted">
                        by {{ activity.performedBy.firstName }} {{ activity.performedBy.lastName }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (meta && meta.total > meta.limit) {
          <div class="flex items-center justify-between border-t border-edge-subtle pt-4 mt-4">
            <span class="text-sm text-neutral-500">
              Showing {{ ((meta.page - 1) * meta.limit) + 1 }} to {{ Math.min(meta.page * meta.limit, meta.total) }} of {{ meta.total }}
            </span>
            <div class="flex gap-1">
              <button
                (click)="goToPage(meta.page - 1)"
                [disabled]="meta.page <= 1"
                class="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm border border-edge-strong hover:bg-surface-hover disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button
                (click)="goToPage(meta.page + 1)"
                [disabled]="meta.page >= Math.ceil(meta.total / meta.limit)"
                class="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm border border-edge-strong hover:bg-surface-hover disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        }
      }

      <!-- Empty state -->
      @if (!loading && activities.length === 0) {
        <div class="text-center py-8 text-content-muted">
          <svg class="h-12 w-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M12 7v5l4 2"/>
          </svg>
          <p>No activities recorded yet</p>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class ActivityTimelineComponent implements OnInit {
  Math = Math;

  @Input() activities: LeadActivity[] = [];
  @Input() meta: PaginationMeta | null = null;
  @Input() loading = false;

  @Output() filterChange = new EventEmitter<ActivityType | null>();
  @Output() pageChange = new EventEmitter<{ page: number; limit: number }>();

  selectedType: ActivityType | null = null;

  activityTypeOptions: ActivityOption[] = [
    { label: 'All Activities', value: null },
    { label: 'Status Changes', value: ActivityType.STATUS_CHANGE },
    { label: 'Notes', value: ActivityType.NOTE },
    { label: 'Emails', value: ActivityType.EMAIL_SENT },
    { label: 'Calls', value: ActivityType.CALL },
    { label: 'Meetings', value: ActivityType.MEETING },
    { label: 'Assignments', value: ActivityType.ASSIGNMENT_CHANGE },
    { label: 'Follow-ups', value: ActivityType.FOLLOW_UP },
  ];

  ngOnInit(): void {}

  onFilterChange(): void {
    this.filterChange.emit(this.selectedType);
  }

  goToPage(page: number): void {
    if (!this.meta) return;
    const totalPages = Math.ceil(this.meta.total / this.meta.limit);
    if (page < 1 || page > totalPages) return;
    this.pageChange.emit({ page, limit: this.meta.limit });
  }

  getActivityColor(type: ActivityType): string {
    const colorMap: Record<string, string> = {
      STATUS_CHANGE: '#3B82F6',
      NOTE: '#6B7280',
      NOTE_ADDED: '#6B7280',
      EMAIL_SENT: '#10B981',
      EMAIL_RECEIVED: '#10B981',
      CALL: '#F59E0B',
      CALL_MADE: '#F59E0B',
      MEETING: '#8B5CF6',
      MEETING_SCHEDULED: '#8B5CF6',
      ASSIGNMENT: '#14B8A6',
      ASSIGNMENT_CHANGE: '#14B8A6',
      FOLLOW_UP: '#EAB308',
      TAG_ADDED: '#6366F1',
      TAG_REMOVED: '#6366F1',
    };
    return colorMap[type] || '#6B7280';
  }

  getActivitySvg(type: ActivityType): string {
    const svgMap: Record<string, string> = {
      STATUS_CHANGE: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>',
      NOTE: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5"/><polyline points="14 2 14 8 20 8"/><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"/></svg>',
      NOTE_ADDED: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5"/><polyline points="14 2 14 8 20 8"/><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"/></svg>',
      EMAIL_SENT: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
      EMAIL_RECEIVED: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
      CALL: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
      CALL_MADE: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
      MEETING: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
      MEETING_SCHEDULED: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
      ASSIGNMENT: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>',
      ASSIGNMENT_CHANGE: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>',
      FOLLOW_UP: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      TAG_ADDED: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>',
      TAG_REMOVED: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>',
    };
    return svgMap[type] || '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg>';
  }

  getActivityLabel(type: ActivityType): string {
    const labelMap: Record<string, string> = {
      STATUS_CHANGE: 'Status Changed',
      NOTE: 'Note Added',
      NOTE_ADDED: 'Note Added',
      EMAIL_SENT: 'Email Sent',
      EMAIL_RECEIVED: 'Email Received',
      CALL: 'Call Made',
      CALL_MADE: 'Call Made',
      MEETING: 'Meeting',
      MEETING_SCHEDULED: 'Meeting Scheduled',
      ASSIGNMENT: 'Assigned',
      ASSIGNMENT_CHANGE: 'Reassigned',
      FOLLOW_UP: 'Follow-up Set',
      TAG_ADDED: 'Tag Added',
      TAG_REMOVED: 'Tag Removed',
    };
    return labelMap[type] || type;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return date.toLocaleDateString();
  }
}
