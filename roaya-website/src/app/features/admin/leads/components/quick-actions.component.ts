import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ActivityType, CreateActivityDto } from '../../../../core/interfaces/admin.interface';

interface ActivityFormData {
  type: ActivityType;
  description: string;
  scheduledAt?: string;
}

interface SpeedDialAction {
  type: ActivityType;
  label: string;
  icon: string;
  color: string;
}

/**
 * Quick Actions Component
 * Custom FAB with dropdown for quickly logging activities
 * Migrated from PrimeNG SpeedDial/Dialog to custom Tailwind
 */
@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  template: `
    <div class="quick-actions">
      <!-- FAB Button -->
      <div class="fixed bottom-8 right-8 z-50">
        <!-- Action buttons (shown when expanded) -->
        @if (isExpanded()) {
          <div class="flex flex-col gap-3 mb-3">
            @for (action of actions; track action.type) {
              <button
                (click)="openDialog(action.type)"
                [style.background-color]="action.color"
                class="flex items-center gap-2 px-4 py-2 rounded-full text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                [title]="action.label"
              >
                <span class="text-sm font-medium">{{ action.label }}</span>
                <span [innerHTML]="getActionSvg(action.icon)"></span>
              </button>
            }
          </div>
        }

        <!-- Main FAB -->
        <button
          (click)="toggleExpanded()"
          class="flex items-center justify-center w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg hover:shadow-xl hover:bg-primary-600 transition-all transform hover:scale-105"
          [attr.aria-label]="isExpanded() ? 'Close quick actions' : 'Open quick actions'"
        >
          @if (isExpanded()) {
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          } @else {
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/>
              <path d="M12 5v14"/>
            </svg>
          }
        </button>
      </div>

      <!-- Activity Dialog -->
      @if (showDialog) {
        <div class="dialog-root">
          <!-- Overlay -->
          <div
            class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            (click)="closeDialog()"
            aria-hidden="true"
          ></div>

          <!-- Content -->
          <div class="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-surface-elevated dark:border-neutral-800 p-6 shadow-lg rounded-xl">
            <!-- Close button -->
            <button
              type="button"
              class="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
              (click)="closeDialog()"
              aria-label="Close"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>

            <!-- Header -->
            <h2 class="text-lg font-semibold mb-4 text-content-primary">{{ dialogTitle }}</h2>

            <div class="flex flex-col gap-4">
              <!-- Activity type indicator -->
              <div class="flex items-center gap-3 p-3 bg-surface-secondary rounded-lg">
                <div
                  [style.background-color]="currentActivityColor"
                  class="flex items-center justify-center w-10 h-10 rounded-full text-white"
                >
                  <span [innerHTML]="getActionSvg(currentActivityIcon)"></span>
                </div>
                <span class="font-medium text-content-primary">{{ currentActivityLabel }}</span>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium mb-2 text-content-secondary">Description / Notes</label>
                <textarea
                  name="activityDescription"
                  [(ngModel)]="formData.description"
                  [rows]="4"
                  class="flex min-h-[80px] w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                  [placeholder]="descriptionPlaceholder"
                ></textarea>
              </div>

              <!-- Scheduled time (for meetings/follow-ups) -->
              @if (showScheduledTime) {
                <div>
                  <label class="block text-sm font-medium mb-2 text-content-secondary">Scheduled Time</label>
                  <input
                    type="datetime-local"
                    name="scheduledAt"
                    [(ngModel)]="formData.scheduledAt"
                    class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                  />
                </div>
              }
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-2 mt-6">
              <button
                (click)="closeDialog()"
                [disabled]="saving()"
                class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border border-edge-strong text-content-secondary hover:bg-surface-hover disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                (click)="saveActivity()"
                [disabled]="!isFormValid() || saving()"
                class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
              >
                @if (saving()) {
                  <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                Log Activity
              </button>
            </div>
          </div>
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
export class QuickActionsComponent {
  @Output() activityCreated = new EventEmitter<CreateActivityDto>();

  showDialog = false;
  saving = signal(false);
  isExpanded = signal(false);
  currentActivityType: ActivityType = ActivityType.CALL;

  formData: ActivityFormData = {
    type: ActivityType.CALL,
    description: '',
  };

  actions: SpeedDialAction[] = [
    { type: ActivityType.CALL, label: 'Log Call', icon: 'phone', color: '#f59e0b' },
    { type: ActivityType.EMAIL_SENT, label: 'Log Email', icon: 'email', color: '#10b981' },
    { type: ActivityType.MEETING, label: 'Log Meeting', icon: 'calendar', color: '#8b5cf6' },
    { type: ActivityType.FOLLOW_UP, label: 'Set Follow-up', icon: 'clock', color: '#eab308' },
    { type: ActivityType.NOTE, label: 'Add Note', icon: 'note', color: '#6b7280' },
  ];

  get dialogTitle(): string {
    const titles: Record<string, string> = {
      CALL: 'Log Phone Call', EMAIL_SENT: 'Log Email', MEETING: 'Log Meeting',
      FOLLOW_UP: 'Set Follow-up', NOTE: 'Add Note',
    };
    return titles[this.currentActivityType] || 'Log Activity';
  }

  get currentActivityIcon(): string {
    const icons: Record<string, string> = {
      CALL: 'phone', EMAIL_SENT: 'email', MEETING: 'calendar',
      FOLLOW_UP: 'clock', NOTE: 'note',
    };
    return icons[this.currentActivityType] || 'circle';
  }

  get currentActivityColor(): string {
    const colors: Record<string, string> = {
      CALL: '#f59e0b', EMAIL_SENT: '#10b981', MEETING: '#8b5cf6',
      FOLLOW_UP: '#eab308', NOTE: '#6b7280',
    };
    return colors[this.currentActivityType] || '#6b7280';
  }

  get currentActivityLabel(): string {
    const labels: Record<string, string> = {
      CALL: 'Phone Call', EMAIL_SENT: 'Email', MEETING: 'Meeting',
      FOLLOW_UP: 'Follow-up', NOTE: 'Note',
    };
    return labels[this.currentActivityType] || 'Activity';
  }

  get descriptionPlaceholder(): string {
    const placeholders: Record<string, string> = {
      CALL: 'Describe the call outcome, discussed topics...',
      EMAIL_SENT: 'Email subject and summary...',
      MEETING: 'Meeting agenda, attendees, outcomes...',
      FOLLOW_UP: 'What needs to be followed up on...',
      NOTE: 'Add your notes here...',
    };
    return placeholders[this.currentActivityType] || 'Enter description...';
  }

  get showScheduledTime(): boolean {
    return this.currentActivityType === ActivityType.MEETING ||
           this.currentActivityType === ActivityType.FOLLOW_UP;
  }

  getActionSvg(icon: string): string {
    const svgs: Record<string, string> = {
      phone: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
      email: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
      calendar: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
      clock: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      note: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5"/><polyline points="14 2 14 8 20 8"/><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"/></svg>',
    };
    return svgs[icon] || '';
  }

  toggleExpanded(): void {
    this.isExpanded.set(!this.isExpanded());
  }

  openDialog(type: ActivityType): void {
    this.currentActivityType = type;
    this.formData = { type, description: '', scheduledAt: undefined };
    this.showDialog = true;
    this.isExpanded.set(false);
  }

  closeDialog(): void {
    this.showDialog = false;
    this.formData = { type: ActivityType.CALL, description: '' };
  }

  isFormValid(): boolean {
    return this.formData.description.trim().length > 0;
  }

  saveActivity(): void {
    if (!this.isFormValid()) return;

    this.saving.set(true);

    const activityData: CreateActivityDto = {
      type: this.formData.type,
      description: this.formData.description.trim(),
      metadata: this.formData.scheduledAt
        ? { scheduledAt: new Date(this.formData.scheduledAt).toISOString() }
        : undefined,
    };

    this.activityCreated.emit(activityData);
  }

  onActivitySaved(): void {
    this.saving.set(false);
    this.closeDialog();
  }

  onActivityError(): void {
    this.saving.set(false);
  }
}
