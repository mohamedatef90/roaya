import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const timelineItemVariants = cva(
  'relative pb-8 last:pb-0',
  {
    variants: {
      variant: {
        default: '',
        alternate: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type TimelineItemVariants = VariantProps<typeof timelineItemVariants>;

export interface TimelineEvent {
  id: string | number;
  title: string;
  description?: string;
  date?: string | Date;
  icon?: string;
  status?: 'default' | 'success' | 'warning' | 'error' | 'info';
  content?: any;
}

@Component({
  selector: 'ui-timeline',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative" [class]="customClass">
      <div
        *ngFor="let event of events; let i = index; let last = last"
        class="relative pb-8"
        [class.last:pb-0]="last"
      >
        <!-- Connector line -->
        <span
          *ngIf="!last"
          class="absolute left-4 top-8 -ml-px h-full w-0.5 bg-neutral-200 dark:bg-neutral-700"
          [class.left-1/2]="alternate && i % 2 === 1"
          aria-hidden="true"
        ></span>

        <div
          class="relative flex items-start"
          [class.flex-row-reverse]="alternate && i % 2 === 1"
          [class.text-right]="alternate && i % 2 === 1"
        >
          <!-- Marker -->
          <div class="flex-shrink-0">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white dark:ring-neutral-900"
              [class]="getMarkerClass(event.status)"
            >
              <ng-container *ngIf="event.icon; else defaultIcon">
                <span [innerHTML]="event.icon"></span>
              </ng-container>
              <ng-template #defaultIcon>
                <svg class="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </ng-template>
            </span>
          </div>

          <!-- Content -->
          <div
            class="min-w-0 flex-1 px-4"
            [class.pr-4]="!alternate || i % 2 === 0"
            [class.pl-4]="!alternate || i % 2 === 1"
          >
            <div class="flex items-center gap-2 mb-1" [class.flex-row-reverse]="alternate && i % 2 === 1">
              <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {{ event.title }}
              </p>
              <time
                *ngIf="event.date"
                class="text-xs text-neutral-500 dark:text-neutral-400"
              >
                {{ formatDate(event.date) }}
              </time>
            </div>
            <p
              *ngIf="event.description"
              class="text-sm text-neutral-600 dark:text-neutral-400"
            >
              {{ event.description }}
            </p>
            <ng-container *ngIf="event.content">
              <div class="mt-2">
                {{ event.content }}
              </div>
            </ng-container>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        *ngIf="events.length === 0"
        class="text-center py-8 text-neutral-500 dark:text-neutral-400"
      >
        {{ emptyMessage }}
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TimelineComponent {
  @Input() events: TimelineEvent[] = [];
  @Input() alternate = false;
  @Input() emptyMessage = 'No events to display';
  @Input() customClass = '';

  getMarkerClass(status?: string): string {
    const statusColors: Record<string, string> = {
      default: 'bg-neutral-500',
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
    };
    return statusColors[status || 'default'];
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

// Individual Timeline Item Component
@Component({
  selector: 'ui-timeline-item',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative pb-8 last:pb-0">
      <!-- Connector line -->
      <span
        *ngIf="!isLast"
        class="absolute left-4 top-8 -ml-px h-full w-0.5 bg-neutral-200 dark:bg-neutral-700"
        aria-hidden="true"
      ></span>

      <div class="relative flex items-start">
        <!-- Marker -->
        <div class="flex-shrink-0">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white dark:ring-neutral-900"
            [class]="markerClass"
          >
            <ng-content select="[timelineIcon]"></ng-content>
          </span>
        </div>

        <!-- Content -->
        <div class="min-w-0 flex-1 px-4">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class TimelineItemComponent {
  @Input() status: 'default' | 'success' | 'warning' | 'error' | 'info' = 'default';
  @Input() isLast = false;

  get markerClass(): string {
    const statusColors: Record<string, string> = {
      default: 'bg-neutral-500',
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
    };
    return statusColors[this.status];
  }
}
