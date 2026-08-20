import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ConversionFunnelData } from '../../../../core/services/analytics-admin.service';

@Component({
  selector: 'app-conversion-funnel',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card header="Conversion Funnel">
      <div class="funnel-container">
        <div
          *ngFor="let stage of data; let i = index"
          class="funnel-stage"
          [style.width]="getWidth(stage.percentage) + '%'"
        >
          <div class="stage-bar" [style.background]="getColor(i)">
            <div class="stage-info">
              <span class="stage-name">{{ formatStageName(stage.stage) }}</span>
              <span class="stage-count">{{ stage.count }}</span>
            </div>
          </div>
          <div class="stage-percentage">{{ stage.percentage }}%</div>
        </div>

        <div *ngIf="data.length === 0" class="empty-state">
          <i class="pi pi-filter text-4xl text-surface-400 mb-2"></i>
          <p class="text-surface-500">No funnel data available</p>
        </div>
      </div>
    </p-card>
  `,
  styles: [`
    .funnel-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 0;

      .funnel-stage {
        width: 100%;
        margin-bottom: 0.5rem;
        transition: width 0.3s ease;

        .stage-bar {
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          color: white;
          min-height: 50px;
          display: flex;
          align-items: center;

          .stage-info {
            display: flex;
            justify-content: space-between;
            width: 100%;
            font-weight: 500;

            .stage-name {
              text-transform: capitalize;
            }

            .stage-count {
              font-weight: 700;
            }
          }
        }

        .stage-percentage {
          text-align: center;
          font-size: 0.75rem;
          color: var(--text-color-secondary);
          margin-top: 0.25rem;
        }
      }

      .empty-state {
        text-align: center;
        padding: 2rem;
      }
    }
  `],
})
export class ConversionFunnelComponent {
  @Input() data: ConversionFunnelData[] = [];

  private colors = [
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Purple
    '#A855F7', // Violet
    '#D946EF', // Fuchsia
    '#10B981', // Emerald (converted)
  ];

  getWidth(percentage: number): number {
    // Minimum width of 30% to ensure visibility
    return Math.max(30, percentage);
  }

  getColor(index: number): string {
    return this.colors[index % this.colors.length];
  }

  formatStageName(stage: string): string {
    return stage.toLowerCase().replace(/_/g, ' ');
  }
}
