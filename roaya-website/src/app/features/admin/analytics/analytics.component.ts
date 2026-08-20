import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// Keep Chart.js for charts (no shadcn equivalent)
import { ChartModule } from 'primeng/chart';

// shadcn-style UI Components
import { SpinnerComponent } from '../../../shared/components/ui';
import { ToastService } from '../../../shared/components/ui/feedback/toast/toast.service';

// Services
import {
  AnalyticsAdminService,
  OverviewMetrics,
  ConversionFunnelData,
  SourcePerformance,
  TeamPerformance,
  TrendData,
  DateRange,
} from '../../../core/services/analytics-admin.service';
import { ErrorLoggingService } from '../../../core/services/error-handler.service';

// Sub-components
import { ConversionFunnelComponent } from './components/conversion-funnel.component';
import { SourcePerformanceComponent } from './components/source-performance.component';
import { TeamLeaderboardComponent } from './components/team-leaderboard.component';
import { DateRangePickerComponent } from './components/date-range-picker.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ChartModule,
    SpinnerComponent,
    ConversionFunnelComponent,
    SourcePerformanceComponent,
    TeamLeaderboardComponent,
    DateRangePickerComponent,
  ],
  template: `
    <div class="analytics-page p-6">
      <!-- Page Header -->
      <div class="mb-6 pb-6 border-b border-edge-subtle">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 class="flex items-center gap-3 text-2xl font-bold text-content-primary">
              <svg class="h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
              {{ 'Analytics Dashboard' | translate }}
            </h1>
            <p class="text-sm text-content-muted mt-1">
              {{ 'Track your sales performance and lead metrics' | translate }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <app-date-range-picker
              [startDate]="dateRange().startDate"
              [endDate]="dateRange().endDate"
              (dateRangeChange)="onDateRangeChange($event)"
            />
            <button
              (click)="exportData()"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-edge-subtle text-content-secondary hover:bg-surface-hover transition-colors"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16">
          <ui-spinner size="lg" variant="default"></ui-spinner>
          <p class="mt-4 text-sm text-content-muted">Loading analytics...</p>
        </div>
      } @else {
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <!-- Total Leads -->
          <div class="kpi-card">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-content-muted mb-1">Total Leads</p>
                <h2 class="text-3xl font-bold text-content-primary">
                  {{ overview()?.totalLeads || 0 }}
                </h2>
              </div>
              <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg class="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
            </div>
            @if (overview()?.leadsChange !== undefined && overview()?.leadsChange !== null) {
              <div class="mt-4 flex items-center gap-2">
                <span
                  class="text-sm font-medium flex items-center"
                  [class.text-emerald-500]="(overview()?.leadsChange ?? 0) >= 0"
                  [class.text-red-500]="(overview()?.leadsChange ?? 0) < 0"
                >
                  @if ((overview()?.leadsChange ?? 0) >= 0) {
                    <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m18 15-6-6-6 6"/>
                    </svg>
                  } @else {
                    <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  }
                  {{ Math.abs(overview()?.leadsChange ?? 0) }}%
                </span>
                <span class="text-neutral-400 text-sm">vs last month</span>
              </div>
            }
          </div>

          <!-- New This Month -->
          <div class="kpi-card">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-content-muted mb-1">New This Month</p>
                <h2 class="text-3xl font-bold text-content-primary">
                  {{ overview()?.newLeadsThisMonth || 0 }}
                </h2>
              </div>
              <div class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <svg class="h-6 w-6 text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"/><path d="M12 5v14"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Conversion Rate -->
          <div class="kpi-card">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-content-muted mb-1">Conversion Rate</p>
                <h2 class="text-3xl font-bold text-content-primary">
                  {{ overview()?.conversionRate || 0 }}%
                </h2>
              </div>
              <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg class="h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" x2="5" y1="5" y2="19"/>
                  <circle cx="6.5" cy="6.5" r="2.5"/>
                  <circle cx="17.5" cy="17.5" r="2.5"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Total Revenue -->
          <div class="kpi-card">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-content-muted mb-1">Total Revenue</p>
                <h2 class="text-3xl font-bold text-content-primary">
                  {{ formatCurrency(overview()?.totalRevenue || 0) }}
                </h2>
              </div>
              <div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <svg class="h-6 w-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" x2="12" y1="2" y2="22"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
            </div>
            @if (overview()?.revenueChange !== undefined && overview()?.revenueChange !== null) {
              <div class="mt-4 flex items-center gap-2">
                <span
                  class="text-sm font-medium flex items-center"
                  [class.text-emerald-500]="(overview()?.revenueChange ?? 0) >= 0"
                  [class.text-red-500]="(overview()?.revenueChange ?? 0) < 0"
                >
                  @if ((overview()?.revenueChange ?? 0) >= 0) {
                    <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m18 15-6-6-6 6"/>
                    </svg>
                  } @else {
                    <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  }
                  {{ Math.abs(overview()?.revenueChange ?? 0) }}%
                </span>
                <span class="text-neutral-400 text-sm">vs last month</span>
              </div>
            }
          </div>
        </div>

        <!-- Charts Row 1 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Trends Chart -->
          <div class="chart-card">
            <div class="chart-card-header">
              <h3>Lead Trends</h3>
            </div>
            <div class="p-4">
              <p-chart
                type="line"
                [data]="trendChartData()"
                [options]="lineChartOptions"
                height="350px"
              ></p-chart>
            </div>
          </div>

          <!-- Conversion Funnel -->
          <app-conversion-funnel [data]="funnelData()"></app-conversion-funnel>
        </div>

        <!-- Charts Row 2 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Source Performance -->
          <app-source-performance [data]="sourceData()"></app-source-performance>

          <!-- Team Leaderboard -->
          <app-team-leaderboard [data]="teamData()"></app-team-leaderboard>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .kpi-card {
      background: white;
      border: 1px solid rgb(229 229 229);
      border-radius: 1rem;
      padding: 1.5rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #3D5A80 0%, #5DB7C2 50%, #6B4C9A 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

        &::before {
          opacity: 1;
        }
      }
    }

    :host-context([data-theme='dark']) .kpi-card,
    :host-context(.dark) .kpi-card {
      background: rgb(23 23 23);
      border-color: rgb(64 64 64);
    }

    .chart-card {
      background: white;
      border: 1px solid rgb(229 229 229);
      border-radius: 1rem;
      overflow: hidden;
    }

    :host-context([data-theme='dark']) .chart-card,
    :host-context(.dark) .chart-card {
      background: rgb(23 23 23);
      border-color: rgb(64 64 64);
    }

    .chart-card-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgb(229 229 229);
      background: rgb(250 250 250);

      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: rgb(64 64 64);
      }
    }

    :host-context([data-theme='dark']) .chart-card-header,
    :host-context(.dark) .chart-card-header {
      background: rgb(38 38 38);
      border-color: rgb(64 64 64);

      h3 {
        color: rgb(229 229 229);
      }
    }
  `],
})
export class AnalyticsComponent implements OnInit {
  private analyticsService = inject(AnalyticsAdminService);
  private toastService = inject(ToastService);
  private errorLogging = inject(ErrorLoggingService);

  // Signals
  loading = signal(true);
  overview = signal<OverviewMetrics | null>(null);
  funnelData = signal<ConversionFunnelData[]>([]);
  sourceData = signal<SourcePerformance[]>([]);
  teamData = signal<TeamPerformance[]>([]);
  trendData = signal<TrendData[]>([]);

  // Date range - default to last 30 days
  dateRange = signal<DateRange>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });

  // Chart data computed from trends
  trendChartData = signal<{
    labels: string[];
    datasets: { label: string; data: number[]; borderColor: string; backgroundColor: string; fill: boolean; tension: number }[];
  }>({
    labels: [],
    datasets: [],
  });

  // Chart options
  lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  // Math reference for template
  Math = Math;

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading.set(true);

    Promise.all([
      this.loadOverview(),
      this.loadFunnel(),
      this.loadSources(),
      this.loadTeam(),
      this.loadTrends(),
    ])
      .then(() => {
        this.loading.set(false);
      })
      .catch((error) => {
        this.errorLogging.captureError(error, {
          component: 'AnalyticsComponent',
          action: 'loadAllData',
          dateRange: JSON.stringify(this.dateRange()),
        });
        console.error('Error loading analytics:', error);
        this.toastService.error('Failed to load analytics data', 'Error');
        this.loading.set(false);
      });
  }

  private loadOverview(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.analyticsService.getOverview(this.dateRange()).subscribe({
        next: (response) => {
          this.overview.set(response.data);
          resolve();
        },
        error: reject,
      });
    });
  }

  private loadFunnel(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.analyticsService.getConversionFunnel().subscribe({
        next: (response) => {
          this.funnelData.set(response.data);
          resolve();
        },
        error: reject,
      });
    });
  }

  private loadSources(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.analyticsService.getSourcePerformance().subscribe({
        next: (response) => {
          this.sourceData.set(response.data);
          resolve();
        },
        error: reject,
      });
    });
  }

  private loadTeam(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.analyticsService.getTeamPerformance().subscribe({
        next: (response) => {
          this.teamData.set(response.data);
          resolve();
        },
        error: reject,
      });
    });
  }

  private loadTrends(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.analyticsService.getTrends(this.dateRange()).subscribe({
        next: (response) => {
          this.trendData.set(response.data);
          this.updateTrendChart(response.data);
          resolve();
        },
        error: reject,
      });
    });
  }

  private updateTrendChart(data: TrendData[]): void {
    this.trendChartData.set({
      labels: data.map((d) => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Leads',
          data: data.map((d) => d.leads),
          borderColor: '#3D5A80',
          backgroundColor: 'rgba(61, 90, 128, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Conversions',
          data: data.map((d) => d.conversions),
          borderColor: '#5DB7C2',
          backgroundColor: 'rgba(93, 183, 194, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    });
  }

  onDateRangeChange(range: DateRange): void {
    this.dateRange.set(range);
    this.loadAllData();
  }

  exportData(): void {
    this.analyticsService.exportData('csv', this.dateRange()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.toastService.success('Analytics data exported successfully', 'Success');
      },
      error: (error) => {
        this.errorLogging.captureError(error, {
          component: 'AnalyticsComponent',
          action: 'exportData',
          format: 'csv',
        });
        console.error('Export error:', error);
        this.toastService.error('Failed to export data', 'Error');
      },
    });
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
