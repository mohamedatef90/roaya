import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SourcePerformance } from '../../../../core/services/analytics-admin.service';

@Component({
  selector: 'app-source-performance',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule],
  template: `
    <div class="source-performance-card">
      <div class="card-header">
        <div class="header-content">
          <h3 class="card-title">
            <i class="pi pi-chart-pie"></i>
            Lead Sources
          </h3>
          <span class="total-badge">{{ totalLeads }} total leads</span>
        </div>
      </div>

      <div class="card-body">
        <div class="content-grid">
          <!-- Chart Section -->
          <div class="chart-section">
            <p-chart
              type="doughnut"
              [data]="chartData"
              [options]="chartOptions"
              height="200px"
            ></p-chart>
          </div>

          <!-- Table Section -->
          <div class="table-section">
            <div class="modern-table">
              <div class="table-header">
                <span class="col-source">Source</span>
                <span class="col-leads">Leads</span>
                <span class="col-conv">Conv. Rate</span>
                <span class="col-revenue">Revenue</span>
              </div>

              @for (source of data; track source.source; let i = $index) {
                <div class="table-row" [class.highlight]="i === 0">
                  <div class="col-source">
                    <span
                      class="source-dot"
                      [style.background]="getSourceColor(source.source)"
                    ></span>
                    <span class="source-name">{{ formatSourceName(source.source) }}</span>
                    @if (i === 0) {
                      <span class="top-badge">Top</span>
                    }
                  </div>
                  <div class="col-leads">
                    <span class="lead-count">{{ source.totalLeads }}</span>
                    <span class="lead-percentage">({{ getPercentage(source.totalLeads) }}%)</span>
                  </div>
                  <div class="col-conv">
                    <div class="conv-wrapper">
                      <span class="conv-value" [class.high]="source.conversionRate >= 20" [class.low]="source.conversionRate < 10">
                        {{ source.conversionRate }}%
                      </span>
                      <div class="conv-bar">
                        <div
                          class="conv-fill"
                          [style.width.%]="source.conversionRate"
                          [style.background]="source.conversionRate >= 20 ? '#10b981' : source.conversionRate < 10 ? '#ef4444' : '#f59e0b'"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div class="col-revenue">
                    <span class="revenue-value">{{ formatCurrency(source.revenue || 0) }}</span>
                  </div>
                </div>
              }

              @if (data.length === 0) {
                <div class="empty-state">
                  <i class="pi pi-inbox"></i>
                  <p>No source data available</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    $navy: #3D5A80;
    $teal: #5DB7C2;
    $purple: #6B4C9A;

    .source-performance-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(61, 90, 128, 0.08);
      border-radius: 20px;
      box-shadow: 0 8px 40px rgba(61, 90, 128, 0.08);
      overflow: hidden;
      height: 100%;
    }

    .card-header {
      background: linear-gradient(180deg, rgba(61, 90, 128, 0.03) 0%, rgba(61, 90, 128, 0.06) 100%);
      border-bottom: 1px solid rgba(61, 90, 128, 0.08);
      padding: 1.25rem 1.5rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: $navy;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i {
        color: $teal;
      }
    }

    .total-badge {
      background: linear-gradient(135deg, rgba($teal, 0.15) 0%, rgba($navy, 0.1) 100%);
      color: $navy;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .card-body {
      padding: 1.5rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 1.5rem;
      align-items: start;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .chart-section {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .table-section {
      min-width: 0;
    }

    .modern-table {
      width: 100%;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1.2fr 1fr;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba($navy, 0.04);
      border-radius: 12px;
      margin-bottom: 0.5rem;

      span {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: rgba($navy, 0.6);
      }

      .col-leads, .col-conv, .col-revenue {
        text-align: right;
      }
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1.2fr 1fr;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 12px;
      transition: all 0.2s ease;
      margin-bottom: 0.25rem;

      &:hover {
        background: rgba($teal, 0.05);
      }

      &.highlight {
        background: linear-gradient(135deg, rgba($teal, 0.08) 0%, rgba($navy, 0.04) 100%);
        border: 1px solid rgba($teal, 0.15);
      }
    }

    .col-source {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .source-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .source-name {
      font-weight: 500;
      font-size: 0.875rem;
      color: $navy;
    }

    .top-badge {
      background: linear-gradient(135deg, $teal 0%, $navy 100%);
      color: white;
      padding: 0.15rem 0.5rem;
      border-radius: 10px;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .col-leads {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
    }

    .lead-count {
      font-weight: 700;
      font-size: 0.9rem;
      color: $navy;
    }

    .lead-percentage {
      font-size: 0.7rem;
      color: rgba($navy, 0.5);
    }

    .col-conv {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .conv-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      width: 100%;
      max-width: 80px;
    }

    .conv-value {
      font-weight: 600;
      font-size: 0.8rem;
      color: #f59e0b;

      &.high {
        color: #10b981;
      }

      &.low {
        color: #ef4444;
      }
    }

    .conv-bar {
      width: 100%;
      height: 4px;
      background: rgba($navy, 0.1);
      border-radius: 2px;
      overflow: hidden;
    }

    .conv-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.5s ease;
    }

    .col-revenue {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .revenue-value {
      font-weight: 600;
      font-size: 0.85rem;
      color: $purple;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: rgba($navy, 0.4);

      i {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
      }
    }

    /* Dark Mode */
    :host-context([data-theme='dark']) {
      .source-performance-card {
        background: rgba(30, 41, 59, 0.85);
        border-color: rgba(255, 255, 255, 0.08);
      }

      .card-header {
        background: rgba(15, 23, 42, 0.5);
        border-bottom-color: rgba(255, 255, 255, 0.08);
      }

      .card-title {
        color: #f1f5f9;
      }

      .total-badge {
        background: rgba(93, 183, 194, 0.2);
        color: #5DB7C2;
      }

      .table-header {
        background: rgba(255, 255, 255, 0.05);

        span {
          color: rgba(255, 255, 255, 0.5);
        }
      }

      .table-row {
        &:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        &.highlight {
          background: rgba(93, 183, 194, 0.1);
          border-color: rgba(93, 183, 194, 0.2);
        }
      }

      .source-name, .lead-count {
        color: #f1f5f9;
      }

      .lead-percentage {
        color: rgba(255, 255, 255, 0.4);
      }

      .conv-bar {
        background: rgba(255, 255, 255, 0.1);
      }

      .revenue-value {
        color: #c4b5fd;
      }
    }
  `],
})
export class SourcePerformanceComponent {
  @Input() set data(value: SourcePerformance[]) {
    this._data = value;
    this.calculateTotalLeads();
    this.updateChart();
  }
  get data(): SourcePerformance[] {
    return this._data;
  }

  private _data: SourcePerformance[] = [];
  totalLeads = 0;

  chartData: {
    labels: string[];
    datasets: { data: number[]; backgroundColor: string[]; borderWidth: number; hoverOffset: number }[];
  } = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [], borderWidth: 0, hoverOffset: 8 }],
  };

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
      },
    },
    cutout: '65%',
  };

  private sourceColors: Record<string, string> = {
    WEBSITE: '#3B82F6',
    REFERRAL: '#10B981',
    LINKEDIN: '#0A66C2',
    COLD_CALL: '#F59E0B',
    TRADE_SHOW: '#8B5CF6',
    PARTNER: '#EC4899',
    OTHER: '#6B7280',
    CONTACT_FORM: '#3B82F6',
    ROI_CALCULATOR: '#10B981',
    PRICING_PAGE: '#F59E0B',
    NEWSLETTER: '#8B5CF6',
    GOOGLE_ADS: '#EF4444',
    ORGANIC: '#06B6D4',
  };

  private calculateTotalLeads(): void {
    this.totalLeads = this._data.reduce((sum, s) => sum + s.totalLeads, 0);
  }

  private updateChart(): void {
    this.chartData = {
      labels: this._data.map((s) => this.formatSourceName(s.source)),
      datasets: [
        {
          data: this._data.map((s) => s.totalLeads),
          backgroundColor: this._data.map((s) => this.getSourceColor(s.source)),
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  }

  getSourceColor(source: string): string {
    return this.sourceColors[source] || '#6B7280';
  }

  formatSourceName(source: string): string {
    return source
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  getPercentage(leads: number): number {
    if (this.totalLeads === 0) return 0;
    return Math.round((leads / this.totalLeads) * 100);
  }

  formatCurrency(value: number): string {
    if (value === 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}
