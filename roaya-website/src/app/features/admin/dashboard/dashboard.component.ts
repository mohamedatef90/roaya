import { Component, OnInit, signal, OnDestroy, DestroyRef, inject, AfterViewInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { interval, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

// Chart.js (direct import instead of PrimeNG wrapper)
import { Chart, registerables } from 'chart.js';

// shadcn-style UI Components
import {
  CardComponent,
  CardHeaderComponent,
  CardContentComponent,
  AlertComponent,
  AlertDescriptionComponent,
  SkeletonComponent,
  TagComponent,
  SpinnerComponent,
} from '../../../shared/components/ui';
import { ButtonComponent } from '../../../shared/components/button/button.component';

// Services
import { LeadService } from '../../../core/services/lead.service';
import {
  DashboardStats,
  Lead,
  LeadStatus,
  LeadSource,
  LEAD_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
} from '../../../core/interfaces/admin.interface';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Dashboard Component
 * Main admin dashboard with statistics and charts
 * Migrated to shadcn-style UI components
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    // shadcn-style components
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    AlertComponent,
    AlertDescriptionComponent,
    SkeletonComponent,
    TagComponent,
    SpinnerComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sourceChart') sourceChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('heatmapChart') heatmapChartRef!: ElementRef<HTMLCanvasElement>;

  stats = signal<DashboardStats | null>(null);
  recentLeads = signal<Lead[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Time period selection
  selectedPeriod = 'month';
  timePeriods = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' }
  ];

  // Trend data for KPI cards (simulated - in production, get from backend)
  trends = {
    totalLeads: { value: 12.5, isPositive: true },
    newToday: { value: 8.3, isPositive: true },
    newThisWeek: { value: 5.2, isPositive: true },
    newThisMonth: { value: -2.1, isPositive: false }
  };

  private statusChart: Chart | null = null;
  private sourceChart: Chart | null = null;
  private heatmapChart: Chart | null = null;

  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef);
  private chartsInitialized = false;

  constructor(private leadService: LeadService) {
    // Clean up on destroy
    this.destroyRef.onDestroy(() => {
      this.destroy$.next();
      this.destroy$.complete();
      this.destroyCharts();
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupAutoRefresh();
  }

  ngAfterViewInit(): void {
    this.chartsInitialized = true;
    // If data loaded before view init, initialize charts on next tick
    if (this.stats()) {
      setTimeout(() => this.initializeCharts(), 0);
    }
  }

  ngOnDestroy(): void {
    // Cleanup handled by destroyRef.onDestroy() in constructor
  }

  private destroyCharts(): void {
    this.statusChart?.destroy();
    this.sourceChart?.destroy();
    this.heatmapChart?.destroy();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load statistics with proper cleanup
    this.leadService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats.set(stats);
          this.loading.set(false);
          // Defer chart init to next tick so Angular renders the *ngIf="stats()" canvases first
          if (this.chartsInitialized) {
            setTimeout(() => this.initializeCharts(), 0);
          }
        },
        error: (error) => {
          // Ignore AbortError (happens during page refresh/navigation)
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            return;
          }
          console.error('Error loading stats:', error);
          this.error.set('Failed to load dashboard statistics');
          this.loading.set(false);
        },
      });

    // Load recent leads with proper cleanup
    this.leadService
      .getLeads({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.recentLeads.set(response.leads);
        },
        error: (error) => {
          // Ignore AbortError (happens during page refresh/navigation)
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            return;
          }
          console.error('Error loading recent leads:', error);
        },
      });
  }

  setupAutoRefresh(): void {
    // Auto-refresh every 60 seconds (initial load handled by loadDashboardData)
    interval(60000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.leadService.getStats())
      )
      .subscribe({
        next: (stats) => {
          this.stats.set(stats);
          if (this.chartsInitialized) {
            setTimeout(() => this.updateCharts(stats), 0);
          }
        },
        error: (error) => {
          // Ignore AbortError (happens during page refresh/navigation)
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            return;
          }
          console.error('Auto-refresh error:', error);
        },
      });
  }

  private initializeCharts(): void {
    const stats = this.stats();
    if (!stats) return;

    // Destroy existing charts before creating new ones
    this.destroyCharts();

    this.initStatusChart(stats);
    this.initSourceChart(stats);
    this.initHeatmapChart(stats);
  }

  private initStatusChart(stats: DashboardStats): void {
    if (!this.statusChartRef?.nativeElement) return;

    const ctx = this.statusChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const statusLabels = Object.keys(stats.leadsByStatus).map(
      (key) => LEAD_STATUS_LABELS[key as LeadStatus]
    );
    const statusData = Object.values(stats.leadsByStatus);

    const statusColors = [
      '#3D5A80', '#F59E0B', '#10B981', '#8B5CF6',
      '#EF4444', '#059669', '#DC2626', '#6B7280',
    ];

    this.statusChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: statusLabels,
        datasets: [{
          label: 'Leads',
          data: statusData,
          backgroundColor: statusColors.slice(0, statusData.length),
          borderRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.05)',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  private initSourceChart(stats: DashboardStats): void {
    if (!this.sourceChartRef?.nativeElement) return;

    const ctx = this.sourceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const sourceLabels = Object.keys(stats.leadsBySource).map(
      (key) => LEAD_SOURCE_LABELS[key as LeadSource]
    );
    const sourceData = Object.values(stats.leadsBySource);

    const sourceColors = [
      '#3D5A80', '#5DB7C2', '#6B4C9A', '#10B981',
      '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899',
    ];

    this.sourceChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: sourceLabels,
        datasets: [{
          data: sourceData,
          backgroundColor: sourceColors.slice(0, sourceData.length),
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
        },
      },
    });
  }

  private initHeatmapChart(stats: DashboardStats): void {
    if (!this.heatmapChartRef?.nativeElement) return;

    const ctx = this.heatmapChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const sources = Object.keys(stats.leadsBySource);
    const sourceLabels = sources.map(key => LEAD_SOURCE_LABELS[key as LeadSource]);

    const statusColors: Record<string, string> = {
      'NEW': '#3B82F6',
      'CONTACTED': '#F59E0B',
      'QUALIFIED': '#10B981',
      'PROPOSAL': '#8B5CF6',
      'NEGOTIATION': '#EF4444',
      'WON': '#059669',
      'LOST': '#DC2626',
      'ARCHIVED': '#6B7280',
    };

    const statuses = Object.values(LeadStatus);
    const datasets = statuses.map(status => {
      const data = sources.map(source => {
        const sourceTotal = stats.leadsBySource[source as LeadSource] || 0;
        const statusTotal = stats.leadsByStatus[status] || 0;
        const totalLeads = stats.totalLeads || 1;
        return Math.round((sourceTotal * statusTotal) / totalLeads);
      });

      return {
        label: LEAD_STATUS_LABELS[status],
        data: data,
        backgroundColor: statusColors[status] || '#6B7280',
        borderWidth: 0,
      };
    });

    this.heatmapChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sourceLabels,
        datasets: datasets,
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 11 },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.05)',
            },
          },
          y: {
            stacked: true,
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  private updateCharts(stats: DashboardStats): void {
    // For simplicity, recreate charts on data update
    this.initializeCharts();
  }

  getStatusVariant(status: LeadStatus): 'success' | 'info' | 'warning' | 'danger' | 'default' {
    const variantMap: Record<LeadStatus, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
      [LeadStatus.NEW]: 'info',
      [LeadStatus.CONTACTED]: 'warning',
      [LeadStatus.QUALIFIED]: 'success',
      [LeadStatus.PROPOSAL]: 'warning',
      [LeadStatus.NEGOTIATION]: 'warning',
      [LeadStatus.WON]: 'success',
      [LeadStatus.LOST]: 'danger',
      [LeadStatus.ARCHIVED]: 'default',
    };
    return variantMap[status] || 'info';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  selectPeriod(period: string): void {
    this.selectedPeriod = period;
    // In production, reload data based on selected period
    console.log('Selected period:', period);
  }

  getPipelineData(): { stage: string; count: number; percentage: number; color: string }[] {
    const stats = this.stats();
    if (!stats) return [];

    const total = stats.totalLeads || 1;
    const pipeline = [
      { stage: 'New', count: stats.leadsByStatus[LeadStatus.NEW] || 0, color: '#3B82F6' },
      { stage: 'Contacted', count: stats.leadsByStatus[LeadStatus.CONTACTED] || 0, color: '#F59E0B' },
      { stage: 'Qualified', count: stats.leadsByStatus[LeadStatus.QUALIFIED] || 0, color: '#10B981' },
      { stage: 'Proposal', count: stats.leadsByStatus[LeadStatus.PROPOSAL] || 0, color: '#8B5CF6' },
      { stage: 'Won', count: stats.leadsByStatus[LeadStatus.WON] || 0, color: '#059669' }
    ];

    return pipeline.map(item => ({
      ...item,
      percentage: (item.count / total) * 100
    }));
  }

  /**
   * Calculate conversion rate (Won / Total * 100)
   */
  getConversionRate(): string {
    const stats = this.stats();
    if (!stats || !stats.totalLeads) return '0.0';
    const wonCount = stats.leadsByStatus[LeadStatus.WON] || 0;
    const rate = (wonCount / stats.totalLeads) * 100;
    return rate.toFixed(1);
  }

  /**
   * Get count of leads in negotiation stage (hot leads)
   */
  getHotLeadsCount(): number {
    const stats = this.stats();
    if (!stats) return 0;
    return (stats.leadsByStatus[LeadStatus.NEGOTIATION] || 0) + 
           (stats.leadsByStatus[LeadStatus.PROPOSAL] || 0);
  }

  /**
   * Get count of qualified leads
   */
  getQualifiedCount(): number {
    const stats = this.stats();
    if (!stats) return 0;
    return stats.leadsByStatus[LeadStatus.QUALIFIED] || 0;
  }

  /**
   * Get count of won deals
   */
  getWonDealsCount(): number {
    const stats = this.stats();
    if (!stats) return 0;
    return stats.leadsByStatus[LeadStatus.WON] || 0;
  }
}
