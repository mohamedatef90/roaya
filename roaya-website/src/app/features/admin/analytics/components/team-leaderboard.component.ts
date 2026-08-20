import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ProgressBar } from 'primeng/progressbar';
import { TeamPerformance } from '../../../../core/services/analytics-admin.service';

@Component({
  selector: 'app-team-leaderboard',
  standalone: true,
  imports: [CommonModule, CardModule, AvatarModule, ProgressBar],
  template: `
    <p-card header="Team Leaderboard">
      <div class="leaderboard">
        <div
          *ngFor="let member of data; let i = index"
          class="leaderboard-item"
          [class.top-performer]="i === 0"
        >
          <div class="flex items-center gap-3">
            <div class="rank" [class.gold]="i === 0" [class.silver]="i === 1" [class.bronze]="i === 2">
              {{ i + 1 }}
            </div>
            <p-avatar
              [label]="getInitials(member.userName)"
              size="normal"
              [style]="{ 'background-color': getAvatarColor(i), color: 'white' }"
              shape="circle"
            ></p-avatar>
            <div class="flex-1">
              <p class="font-medium mb-1">{{ member.userName }}</p>
              <div class="flex items-center gap-4 text-sm text-surface-500">
                <span>{{ member.assignedLeads }} leads</span>
                <span>{{ member.conversionRate }}% conv.</span>
              </div>
            </div>
            <div class="text-right">
              <p class="font-bold text-lg">{{ formatCurrency(member.totalValue) }}</p>
              <p class="text-xs text-surface-500">total value</p>
            </div>
          </div>

          <!-- Progress bar showing conversion rate -->
          <div class="mt-3">
            <p-progressBar
              [value]="member.conversionRate"
              [showValue]="false"
              [style]="{ height: '6px' }"
              [styleClass]="getProgressClass(i)"
            ></p-progressBar>
          </div>
        </div>

        <div *ngIf="data.length === 0" class="empty-state">
          <i class="pi pi-users text-4xl text-surface-400 mb-2"></i>
          <p class="text-surface-500">No team data available</p>
        </div>
      </div>
    </p-card>
  `,
  styles: [`
    .leaderboard {
      .leaderboard-item {
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 0.75rem;
        background: var(--surface-50);
        transition: all 0.2s ease;

        &:hover {
          background: var(--surface-100);
        }

        &.top-performer {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05));
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .rank {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          background: var(--surface-200);
          color: var(--text-color-secondary);

          &.gold {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            color: white;
          }

          &.silver {
            background: linear-gradient(135deg, #9ca3af, #6b7280);
            color: white;
          }

          &.bronze {
            background: linear-gradient(135deg, #d97706, #b45309);
            color: white;
          }
        }
      }

      .empty-state {
        text-align: center;
        padding: 2rem;
      }
    }

    :host ::ng-deep {
      .progress-gold .p-progressbar-value {
        background: linear-gradient(90deg, #fbbf24, #f59e0b);
      }

      .progress-silver .p-progressbar-value {
        background: linear-gradient(90deg, #9ca3af, #6b7280);
      }

      .progress-bronze .p-progressbar-value {
        background: linear-gradient(90deg, #d97706, #b45309);
      }

      .progress-default .p-progressbar-value {
        background: var(--primary-color);
      }
    }
  `],
})
export class TeamLeaderboardComponent {
  @Input() data: TeamPerformance[] = [];

  private avatarColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getAvatarColor(index: number): string {
    return this.avatarColors[index % this.avatarColors.length];
  }

  getProgressClass(index: number): string {
    if (index === 0) return 'progress-gold';
    if (index === 1) return 'progress-silver';
    if (index === 2) return 'progress-bronze';
    return 'progress-default';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}
