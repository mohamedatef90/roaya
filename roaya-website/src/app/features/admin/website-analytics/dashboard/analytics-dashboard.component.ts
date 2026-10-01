import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';

import {
  WebsiteAnalyticsService,
  DateRange,
  AnalyticsEventsSummary,
} from '../../../../core/services/website-analytics.service';
import { AnalyticsWebSocketService } from '../../../../core/services/analytics-websocket.service';

interface AnalyticsStat {
  label: string;
  value: string;
  change: number;
  icon: string;
  color: string;
}

interface TopPageRow {
  url: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  avgDuration: number;
  bounceRate: number;
}

interface FunnelStep {
  label: string;
  value: number;
  percent: number;
  icon: string;
}

interface BehaviorSignal {
  label: string;
  value: number;
  helper: string;
  icon: string;
  route: string;
  tone: 'warning' | 'danger' | 'info' | 'success';
}

/**
 * Website Analytics Dashboard Component
 * Overview of website visitor analytics (Hotjar-like)
 */
@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    CardModule,
    ButtonModule,
    SelectModule,
    ChartModule,
    ToastModule,
    TooltipModule,
    ProgressBarModule,
    TableModule,
  ],
  providers: [MessageService],
  template: `
    <div class="analytics-dashboard">
      <p-toast></p-toast>

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>Website Analytics</h1>
          <p class="text-content-muted">
            Monitor website traffic, user behavior, and engagement metrics
          </p>
        </div>
        <div class="header-actions">
          <p-select
            [options]="dateRangeOptions"
            [(ngModel)]="selectedDateRange"
            (ngModelChange)="onDateRangeChange()"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Date Range"
            styleClass="date-range-select"
          ></p-select>
          <div class="export-dropdown">
            <button
              class="export-button"
              (click)="showExportMenu = !showExportMenu"
              type="button"
            >
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
              Export Report
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            @if (showExportMenu) {
              <div class="export-menu">
                <button (click)="exportReport('csv')" type="button" class="export-menu-item">
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" x2="8" y1="13" y2="13"/>
                    <line x1="16" x2="8" y1="17" y2="17"/>
                    <line x1="10" x2="8" y1="9" y2="9"/>
                  </svg>
                  Export as CSV
                </button>
                <button (click)="exportReport('json')" type="button" class="export-menu-item">
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
      <div class="stats-grid">
        @for (stat of stats(); track stat.label) {
        <div class="stat-card" [style.--accent-color]="stat.color">
          <div class="stat-icon">
            <i [class]="stat.icon"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
            <div class="stat-change" [class.positive]="stat.change > 0" [class.negative]="stat.change < 0">
              <i [class]="stat.change > 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
              {{ Math.abs(stat.change) }}%
              <span class="vs-text">vs last period</span>
            </div>
          </div>
        </div>
        }
      </div>

      <!-- Conversion journey: GA-style funnel + Hotjar-style behavior signals -->
      <section class="journey-workspace" aria-labelledby="journey-title">
        <div class="section-heading">
          <div>
            <span class="section-kicker">Experience intelligence</span>
            <h2 id="journey-title">From first visit to qualified lead</h2>
            <p>Follow the conversion path, then jump into recordings to understand where people struggle.</p>
          </div>
          <a routerLink="/admin/website-analytics/recordings" class="text-link">
            Inspect recordings <i class="pi pi-arrow-up-right"></i>
          </a>
        </div>

        <div class="journey-grid">
          <article class="funnel-panel">
            <div class="panel-heading">
              <div>
                <span class="panel-label">Conversion funnel</span>
                <strong>{{ conversionRate() | number:'1.1-1' }}%</strong>
                <small>session-to-lead conversion</small>
              </div>
              <span class="signal-chip"><i class="pi pi-sparkles"></i> Live tracking</span>
            </div>

            <div class="funnel-track">
              @for (step of funnelSteps(); track step.label; let i = $index) {
                <div class="funnel-step">
                  <div class="funnel-meta">
                    <span class="step-icon"><i [class]="step.icon"></i></span>
                    <span class="step-copy">
                      <span>{{ step.label }}</span>
                      <strong>{{ step.value | number }}</strong>
                    </span>
                    <span class="step-percent">{{ step.percent | number:'1.0-0' }}%</span>
                  </div>
                  <div class="funnel-bar" role="progressbar" [attr.aria-label]="step.label" [attr.aria-valuenow]="step.percent" aria-valuemin="0" aria-valuemax="100">
                    <span [style.width.%]="step.percent"></span>
                  </div>
                  @if (i < funnelSteps().length - 1) {
                    <i class="pi pi-angle-down funnel-connector" aria-hidden="true"></i>
                  }
                </div>
              }
            </div>
          </article>

          <aside class="behavior-panel">
            <div class="panel-title-row">
              <div>
                <span class="panel-label">Behavior signals</span>
                <h3>What needs attention</h3>
              </div>
              <a routerLink="/admin/website-analytics/heatmaps" aria-label="Open heatmaps"><i class="pi pi-arrow-right"></i></a>
            </div>

            <div class="signal-list">
              @for (signal of behaviorSignals(); track signal.label) {
                <a [routerLink]="signal.route" [class]="'signal-row ' + signal.tone">
                  <span class="signal-icon"><i [class]="signal.icon"></i></span>
                  <span class="signal-copy">
                    <strong>{{ signal.value | number }}</strong>
                    <span>{{ signal.label }}</span>
                    <small>{{ signal.helper }}</small>
                  </span>
                  <i class="pi pi-chevron-right"></i>
                </a>
              }
            </div>
          </aside>
        </div>
      </section>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Visitors Chart -->
        <div class="lg:col-span-2">
          <p-card styleClass="glass-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
                <i class="pi pi-chart-line mr-2 text-teal-500"></i>
                Visitors Overview
              </h3>
              <div class="chart-toggle">
                @for (period of chartPeriods; track period.value) {
                <button
                  class="period-btn"
                  [class.active]="selectedChartPeriod === period.value"
                  (click)="onChartPeriodChange(period.value)"
                >
                  {{ period.label }}
                </button>
                }
              </div>
            </div>
            <p-chart type="line" [data]="visitorsChartData()" [options]="lineChartOptions" height="300px"></p-chart>
          </p-card>
        </div>

        <!-- Device Breakdown -->
        <div>
          <p-card styleClass="glass-card h-full">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              <i class="pi pi-desktop mr-2 text-purple-500"></i>
              Device Breakdown
            </h3>
            <div class="device-chart-container">
              <p-chart type="doughnut" [data]="deviceChartData()" [options]="doughnutChartOptions" height="200px"></p-chart>
            </div>
            <div class="device-legend">
              @for (device of deviceBreakdown(); track device.type) {
              <div class="legend-item">
                <span class="legend-dot" [style.background]="device.color"></span>
                <span class="legend-label">{{ device.type }}</span>
                <span class="legend-value">{{ device.percent }}%</span>
              </div>
              }
            </div>
          </p-card>
        </div>
      </div>

      <!-- Quick Actions & Real-time -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <!-- Real-time Active Users -->
        <div class="lg:col-span-1">
          <p-card styleClass="glass-card realtime-card">
            <div class="realtime-content">
              <div class="realtime-header">
                <span class="live-indicator">
                  <span class="pulse"></span>
                  LIVE
                </span>
              </div>
              <div class="realtime-value">
                <span class="number">{{ activeUsers() }}</span>
                <span class="label">Active Users</span>
              </div>
              <div class="realtime-breakdown">
                <div class="breakdown-item">
                  <i class="pi pi-desktop"></i>
                  <span>{{ Math.round(activeUsers() * 0.6) }}</span>
                </div>
                <div class="breakdown-item">
                  <i class="pi pi-mobile"></i>
                  <span>{{ Math.round(activeUsers() * 0.35) }}</span>
                </div>
                <div class="breakdown-item">
                  <i class="pi pi-tablet"></i>
                  <span>{{ Math.round(activeUsers() * 0.05) }}</span>
                </div>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Quick Actions -->
        <div class="lg:col-span-3">
          <p-card styleClass="glass-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              <i class="pi pi-bolt mr-2 text-orange-500"></i>
              Quick Actions
            </h3>
            <div class="quick-actions-grid">
              <a routerLink="/admin/website-analytics/heatmaps" class="action-card">
                <div class="action-icon heatmap">
                  <i class="pi pi-th-large"></i>
                </div>
                <div class="action-content">
                  <span class="action-title">View Heatmaps</span>
                  <span class="action-subtitle">{{ heatmapCount() }} pages tracked</span>
                </div>
                <i class="pi pi-arrow-right"></i>
              </a>

              <a routerLink="/admin/website-analytics/recordings" class="action-card">
                <div class="action-icon recordings">
                  <i class="pi pi-video"></i>
                </div>
                <div class="action-content">
                  <span class="action-title">Session Recordings</span>
                  <span class="action-subtitle">{{ recordingsCount() }} new recordings</span>
                </div>
                <i class="pi pi-arrow-right"></i>
              </a>

              <a routerLink="/admin/website-analytics/tracking" class="action-card">
                <div class="action-icon tracking">
                  <i class="pi pi-code"></i>
                </div>
                <div class="action-content">
                  <span class="action-title">Tracking Code</span>
                  <span class="action-subtitle">Manage installation</span>
                </div>
                <i class="pi pi-arrow-right"></i>
              </a>
            </div>
          </p-card>
        </div>
      </div>

      <section class="intelligence-grid" aria-label="Acquisition and events overview">
        <article class="insight-panel">
          <div class="panel-title-row">
            <div>
              <span class="panel-label">Acquisition</span>
              <h3>Where sessions come from</h3>
            </div>
            <i class="pi pi-compass panel-corner-icon"></i>
          </div>
          <div class="ranked-list">
            @for (source of trafficSources(); track source.label; let i = $index) {
              <div class="ranked-row">
                <span class="rank">{{ i + 1 }}</span>
                <span class="rank-copy"><strong>{{ source.label }}</strong><small>{{ source.value | number }} sessions</small></span>
                <span class="rank-bar"><span [style.width.%]="source.percent"></span></span>
                <span class="rank-percent">{{ source.percent | number:'1.0-0' }}%</span>
              </div>
            } @empty {
              <div class="empty-insight">Traffic sources will appear after the first tracked visits.</div>
            }
          </div>
        </article>

        <article class="insight-panel event-panel">
          <div class="panel-title-row">
            <div>
              <span class="panel-label">Event stream</span>
              <h3>Top interactions</h3>
            </div>
            <i class="pi pi-bolt panel-corner-icon"></i>
          </div>
          <div class="event-cloud">
            @for (event of eventsSummary().topEvents.slice(0, 6); track event.eventName) {
              <div class="event-pill">
                <span>{{ formatEventName(event.eventName) }}</span>
                <strong>{{ event.count | number }}</strong>
              </div>
            } @empty {
              <div class="empty-insight">CTA clicks, scroll depth, forms and errors will appear here.</div>
            }
          </div>
        </article>
      </section>

      <!-- Bottom Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Pages -->
        <p-card styleClass="glass-card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
              <i class="pi pi-file mr-2 text-blue-500"></i>
              Top Pages
            </h3>
            <p-button label="View All" [text]="true" size="small"></p-button>
          </div>

          <p-table [value]="topPages()" [rows]="5" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Page</th>
                <th class="text-right">Views</th>
                <th class="text-right">Avg. Duration</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-page>
              <tr>
                <td>
                  <div class="page-cell">
                    <span class="page-title">{{ page.path }}</span>
                  </div>
                </td>
                <td class="text-right font-semibold">{{ page.views | number }}</td>
                <td class="text-right">{{ formatDuration(page.avgDuration) }}</td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>

        <!-- Geographic Distribution -->
        <p-card styleClass="glass-card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
              <i class="pi pi-globe mr-2 text-green-500"></i>
              Top Countries
            </h3>
            <p-button label="View Map" [text]="true" size="small"></p-button>
          </div>

          <div class="countries-list">
            @for (country of topCountries(); track country.country) {
            <div class="country-item">
              <div class="country-info">
                <span class="country-flag">{{ getCountryFlag(country.country || 'Unknown') }}</span>
                <span class="country-name">{{ country.country || 'Unknown' }}</span>
              </div>
              <div class="country-stats">
                <div class="country-bar">
                  <div
                    class="country-bar-fill"
                    [style.width.%]="topCountries().length > 0 ? (country.sessions / topCountries()[0].sessions) * 100 : 0"
                  ></div>
                </div>
                <span class="country-visitors">{{ country.sessions | number }}</span>
              </div>
            </div>
            }
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [
    `
      // Brand Colors
      $navy: #3d5a80;
      $teal: #5db7c2;
      $purple: #6b4c9a;

      .analytics-dashboard {
        padding: 2rem;
        min-height: 100vh;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid rgba($navy, 0.1);

        h1 {
          margin: 0 0 0.25rem 0;
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, $navy 0%, $teal 50%, $purple 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        p {
          margin: 0;
          font-size: 0.9rem;
        }
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      // Export Dropdown
      .export-dropdown {
        position: relative;
      }

      .export-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 1rem;
        background: white;
        border: 1px solid rgba($navy, 0.15);
        border-radius: 12px;
        font-size: 0.875rem;
        font-weight: 500;
        color: $navy;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: rgba($teal, 0.05);
          border-color: $teal;
          color: $teal;
        }

        svg {
          width: 1.25rem;
          height: 1.25rem;

          &:last-child {
            width: 1rem;
            height: 1rem;
          }
        }
      }

      .export-menu {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        min-width: 180px;
        background: white;
        border: 1px solid rgba($navy, 0.1);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba($navy, 0.15);
        overflow: hidden;
        z-index: 100;
        animation: slideDown 0.2s ease;
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

      .export-menu-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem 1rem;
        background: white;
        border: none;
        font-size: 0.875rem;
        font-weight: 500;
        color: #475569;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          background: rgba($teal, 0.08);
          color: $navy;

          svg {
            color: $teal;
          }
        }

        svg {
          width: 1rem;
          height: 1rem;
          color: #94a3b8;
          transition: color 0.15s ease;
        }
      }

      // Stats Grid
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
        margin-bottom: 1.5rem;

        @media (max-width: 1024px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 640px) {
          grid-template-columns: 1fr;
        }
      }

      .stat-card {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba($navy, 0.08);
        border-radius: 20px;
        box-shadow: 0 8px 40px rgba($navy, 0.08);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 48px rgba($navy, 0.12);
        }
      }

      .stat-icon {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--accent-color);
        border-radius: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

        i {
          font-size: 1.5rem;
          color: white;
        }
      }

      .stat-content {
        flex: 1;
      }

      .stat-value {
        display: block;
        font-size: 1.75rem;
        font-weight: 700;
        color: $navy;
        line-height: 1.2;
      }

      .stat-label {
        display: block;
        font-size: 0.875rem;
        color: #64748b;
        margin-bottom: 0.25rem;
      }

      .stat-change {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;

        &.positive {
          color: #059669;
          background: rgba(5, 150, 105, 0.1);
        }

        &.negative {
          color: #dc2626;
          background: rgba(220, 38, 38, 0.1);
        }

        .vs-text {
          font-weight: 400;
          color: #94a3b8;
          margin-left: 0.25rem;
        }
      }

      // Glass Card
      :host ::ng-deep .glass-card {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba($navy, 0.08);
        border-radius: 20px;
        box-shadow: 0 8px 40px rgba($navy, 0.08);

        .p-card-body {
          padding: 1.5rem;
        }
      }

      // Chart Toggle
      .chart-toggle {
        display: flex;
        gap: 0.25rem;
        padding: 0.25rem;
        background: rgba($navy, 0.05);
        border-radius: 8px;
      }

      .period-btn {
        padding: 0.375rem 0.75rem;
        border: none;
        background: transparent;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 500;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          color: $navy;
        }

        &.active {
          background: white;
          color: $navy;
          box-shadow: 0 2px 8px rgba($navy, 0.1);
        }
      }

      // Device Chart
      .device-chart-container {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;
      }

      .device-legend {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 4px;
      }

      .legend-label {
        flex: 1;
        font-size: 0.875rem;
        color: #64748b;
      }

      .legend-value {
        font-weight: 600;
        font-size: 0.875rem;
        color: $navy;
      }

      // Real-time Card
      :host ::ng-deep .realtime-card {
        background: linear-gradient(135deg, $navy 0%, #2d4a6a 100%);
        border: none;

        .p-card-body {
          padding: 1.5rem;
        }
      }

      .realtime-content {
        color: white;
        text-align: center;
      }

      .realtime-header {
        margin-bottom: 1rem;
      }

      .live-indicator {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.75rem;
        background: rgba(239, 68, 68, 0.2);
        border-radius: 9999px;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 1px;
        color: #fca5a5;

        .pulse {
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.5;
          transform: scale(0.9);
        }
      }

      .realtime-value {
        margin-bottom: 1.5rem;

        .number {
          display: block;
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1;
          background: linear-gradient(135deg, white 0%, rgba(255, 255, 255, 0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .label {
          display: block;
          font-size: 0.875rem;
          opacity: 0.7;
          margin-top: 0.5rem;
        }
      }

      .realtime-breakdown {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
      }

      .breakdown-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;

        i {
          font-size: 1rem;
          opacity: 0.7;
        }

        span {
          font-weight: 600;
          font-size: 0.875rem;
        }
      }

      // Quick Actions
      .quick-actions-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .action-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba($navy, 0.03);
        border-radius: 12px;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s ease;

        &:hover {
          background: rgba($teal, 0.08);
          transform: translateX(4px);

          .pi-arrow-right {
            transform: translateX(4px);
          }
        }
      }

      .action-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;

        i {
          font-size: 1.25rem;
          color: white;
        }

        &.heatmap {
          background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
        }
        &.recordings {
          background: linear-gradient(135deg, $purple 0%, #8b5cf6 100%);
        }
        &.tracking {
          background: linear-gradient(135deg, $navy 0%, $teal 100%);
        }
      }

      .action-content {
        flex: 1;
      }

      .action-title {
        display: block;
        font-weight: 600;
        font-size: 0.9rem;
        color: $navy;
      }

      .action-subtitle {
        font-size: 0.75rem;
        color: #64748b;
      }

      .action-card .pi-arrow-right {
        color: #94a3b8;
        transition: transform 0.2s ease;
      }

      // Top Pages Table
      :host ::ng-deep .p-datatable-sm {
        .p-datatable-thead > tr > th {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba($navy, 0.08);
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          padding: 0.75rem 0.5rem;
        }

        .p-datatable-tbody > tr {
          > td {
            border: none;
            border-bottom: 1px solid rgba($navy, 0.05);
            padding: 0.75rem 0.5rem;
          }

          &:last-child > td {
            border-bottom: none;
          }

          &:hover {
            background: rgba($teal, 0.05);
          }
        }
      }

      .page-cell {
        .page-title {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
          color: $navy;
        }

        .page-url {
          font-size: 0.75rem;
          color: #64748b;
        }
      }

      .bounce-rate {
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;

        &.high {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        &.low {
          background: rgba(5, 150, 105, 0.1);
          color: #059669;
        }
      }

      // Countries List
      .countries-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .country-item {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .country-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 120px;

        .country-flag {
          font-size: 1.25rem;
        }

        .country-name {
          font-weight: 500;
          font-size: 0.875rem;
          color: $navy;
        }
      }

      .country-stats {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .country-bar {
        flex: 1;
        height: 8px;
        background: rgba($navy, 0.08);
        border-radius: 4px;
        overflow: hidden;
      }

      .country-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, $teal 0%, $purple 100%);
        border-radius: 4px;
        transition: width 0.5s ease;
      }

      .country-visitors {
        min-width: 60px;
        text-align: right;
        font-weight: 600;
        font-size: 0.875rem;
        color: $navy;
      }

      // Analytics command center
      .journey-workspace {
        margin: 0 0 1.5rem;
        padding: 1.5rem;
        border: 1px solid rgba($navy, 0.1);
        border-radius: 24px;
        background:
          radial-gradient(circle at 86% 10%, rgba($teal, 0.13), transparent 28%),
          linear-gradient(145deg, #ffffff 0%, #f7f9fc 100%);
        box-shadow: 0 18px 50px rgba($navy, 0.08);
      }

      .section-heading,
      .panel-title-row,
      .panel-heading {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
      }

      .section-heading {
        margin-bottom: 1.25rem;

        h2 {
          margin: 0.2rem 0 0.25rem;
          color: #263c59;
          font-size: clamp(1.15rem, 2vw, 1.45rem);
          line-height: 1.2;
        }

        p {
          margin: 0;
          color: #64748b;
          font-size: 0.86rem;
        }
      }

      .section-kicker,
      .panel-label {
        display: block;
        color: $teal;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.04em;
      }

      .text-link {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        flex: 0 0 auto;
        color: $navy;
        font-size: 0.8rem;
        font-weight: 700;
        text-decoration: none;

        &:hover { color: $teal; }
      }

      .journey-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.75fr);
        gap: 1rem;
      }

      .funnel-panel {
        padding: 1.35rem;
        border-radius: 18px;
        color: white;
        background:
          radial-gradient(circle at 90% 15%, rgba(93, 183, 194, 0.42), transparent 30%),
          linear-gradient(145deg, #314a69 0%, #425b7a 55%, #4c477a 100%);
        overflow: hidden;
      }

      .panel-heading {
        strong { display: block; margin-top: 0.25rem; font-size: 2.1rem; line-height: 1; }
        small { color: rgba(255, 255, 255, 0.68); }
        .panel-label { color: #9fe1e8; }
      }

      .signal-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.4rem 0.65rem;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        font-size: 0.72rem;
      }

      .funnel-track { margin-top: 1.35rem; }
      .funnel-step { position: relative; }
      .funnel-meta { display: flex; align-items: center; gap: 0.65rem; }
      .step-icon {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        border-radius: 10px;
        color: #bff1f5;
        background: rgba(255, 255, 255, 0.1);
      }
      .step-copy {
        flex: 1;
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;

        span { color: rgba(255, 255, 255, 0.78); font-size: 0.78rem; }
        strong { color: white; font-size: 1rem; }
      }
      .step-percent { width: 40px; text-align: right; color: #bff1f5; font-size: 0.72rem; font-weight: 700; }
      .funnel-bar {
        height: 7px;
        margin: 0.55rem 0 0 44px;
        border-radius: 99px;
        background: rgba(255, 255, 255, 0.1);
        overflow: hidden;

        span { display: block; height: 100%; min-width: 2px; border-radius: inherit; background: linear-gradient(90deg, #5db7c2, #9fe1e8); transition: width 0.45s ease; }
      }
      .funnel-connector { display: block; margin: 0.25rem 0 0.15rem 54px; color: rgba(255, 255, 255, 0.34); font-size: 0.75rem; }

      .behavior-panel,
      .insight-panel {
        padding: 1.25rem;
        border: 1px solid rgba($navy, 0.08);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.88);
      }

      .panel-title-row {
        h3 { margin: 0.2rem 0 0; color: #263c59; font-size: 1rem; }
        > a, .panel-corner-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          color: $navy;
          background: rgba($teal, 0.12);
          text-decoration: none;
        }
      }

      .signal-list { display: grid; gap: 0.55rem; margin-top: 1rem; }
      .signal-row {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.7rem;
        border-radius: 12px;
        color: $navy;
        background: #f7f9fc;
        text-decoration: none;
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:hover { transform: translateX(3px); box-shadow: 0 7px 18px rgba($navy, 0.08); }
        > .pi-chevron-right { margin-left: auto; color: #94a3b8; font-size: 0.7rem; }
        &.danger .signal-icon { color: #dc2626; background: #fee2e2; }
        &.warning .signal-icon { color: #d97706; background: #fef3c7; }
        &.info .signal-icon { color: $purple; background: rgba($purple, 0.12); }
        &.success .signal-icon { color: #15803d; background: #dcfce7; }
      }
      .signal-icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; }
      .signal-copy {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: baseline;
        column-gap: 0.4rem;
        flex: 1;
        min-width: 0;

        strong { color: #263c59; font-size: 1rem; }
        span { color: #475569; font-size: 0.78rem; font-weight: 600; }
        small { grid-column: 1 / -1; color: #94a3b8; font-size: 0.66rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      }

      .intelligence-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }
      .ranked-list { display: grid; gap: 0.8rem; margin-top: 1.1rem; }
      .ranked-row { display: grid; grid-template-columns: 24px minmax(105px, 0.8fr) minmax(90px, 1.2fr) 42px; align-items: center; gap: 0.7rem; }
      .rank { color: #94a3b8; font-size: 0.72rem; font-weight: 700; }
      .rank-copy { display: grid; min-width: 0; strong { overflow: hidden; color: #334155; font-size: 0.8rem; text-overflow: ellipsis; white-space: nowrap; } small { color: #94a3b8; font-size: 0.66rem; } }
      .rank-bar { height: 6px; border-radius: 99px; background: #edf2f7; overflow: hidden; span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, $teal, $purple); } }
      .rank-percent { color: #64748b; font-size: 0.72rem; text-align: right; }
      .event-cloud { display: flex; flex-wrap: wrap; gap: 0.65rem; margin-top: 1.1rem; }
      .event-pill { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex: 1 1 145px; padding: 0.75rem 0.85rem; border-left: 3px solid $teal; border-radius: 4px 12px 12px 4px; background: #f7f9fc; color: #475569; font-size: 0.75rem; strong { color: $navy; } }
      .empty-insight { padding: 1rem; border: 1px dashed rgba($navy, 0.16); border-radius: 12px; color: #94a3b8; font-size: 0.78rem; text-align: center; }

      @media (max-width: 960px) {
        .journey-grid,
        .intelligence-grid { grid-template-columns: 1fr; }
      }

      @media (max-width: 640px) {
        .analytics-dashboard { padding: 1rem; }
        .page-header, .section-heading { flex-direction: column; }
        .header-actions { width: 100%; flex-wrap: wrap; }
        .journey-workspace { padding: 1rem; border-radius: 18px; }
        .ranked-row { grid-template-columns: 20px minmax(90px, 1fr) 42px; }
        .rank-bar { display: none; }
      }
    `,
  ],
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  private readonly messageService = inject(MessageService);
  private readonly analytics = inject(WebsiteAnalyticsService);
  private readonly wsService = inject(AnalyticsWebSocketService);
  Math = Math;

  private activeUsersInterval: ReturnType<typeof setInterval> | null = null;
  showExportMenu = false;

  // Signals
  selectedDateRange = 'last7days';
  selectedChartPeriod = 'daily';
  loading = signal(false);
  activeUsers = signal(0);
  heatmapCount = signal(0);
  recordingsCount = signal(0);
  totalSessions = signal(0);
  bounceRate = signal(0);
  eventsSummary = signal<AnalyticsEventsSummary>({
    topEvents: [],
    categoryBreakdown: [],
    eventsOverTime: [],
  });
  trafficSources = signal<{ label: string; value: number; percent: number }[]>([]);

  funnelSteps = computed<FunnelStep[]>(() => {
    const sessions = this.totalSessions();
    const engaged = Math.max(0, Math.round(sessions * (1 - this.bounceRate() / 100)));
    const formStarts = this.eventCount('form_start');
    const leads = this.eventCount('lead_submit');
    const percentage = (value: number) => sessions > 0 ? Math.min(100, (value / sessions) * 100) : 0;

    return [
      { label: 'Sessions', value: sessions, percent: sessions > 0 ? 100 : 0, icon: 'pi pi-globe' },
      { label: 'Engaged sessions', value: engaged, percent: percentage(engaged), icon: 'pi pi-eye' },
      { label: 'Forms started', value: formStarts, percent: percentage(formStarts), icon: 'pi pi-pencil' },
      { label: 'Qualified leads', value: leads, percent: percentage(leads), icon: 'pi pi-verified' },
    ];
  });

  conversionRate = computed(() => {
    const sessions = this.totalSessions();
    return sessions > 0 ? (this.eventCount('lead_submit') / sessions) * 100 : 0;
  });

  behaviorSignals = computed<BehaviorSignal[]>(() => [
    { label: 'Rage clicks', value: this.eventCount('rage_click'), helper: 'Repeated clicks in under one second', icon: 'pi pi-bolt', route: '/admin/website-analytics/recordings', tone: 'danger' },
    { label: 'Dead clicks', value: this.eventCount('dead_click'), helper: 'Clickable-looking elements with no action', icon: 'pi pi-ban', route: '/admin/website-analytics/heatmaps', tone: 'warning' },
    { label: 'JavaScript errors', value: this.eventCount('javascript_error'), helper: 'Client-side failures during visits', icon: 'pi pi-exclamation-triangle', route: '/admin/website-analytics/recordings', tone: 'info' },
    { label: 'Deep scrolls', value: this.eventCount('scroll_90'), helper: 'Visitors reaching 90% of a page', icon: 'pi pi-arrow-down', route: '/admin/website-analytics/heatmaps', tone: 'success' },
  ]);

  dateRangeOptions = [
    { label: 'Last 7 days', value: 'last7days' },
    { label: 'Last 30 days', value: 'last30days' },
    { label: 'Last 90 days', value: 'last90days' },
  ];

  chartPeriods = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ];

  // Data signals (populated from API)
  stats = signal<AnalyticsStat[]>([]);
  deviceBreakdown = signal<{ type: string; percent: number; color: string }[]>([]);
  topPages = signal<{ path: string; views: number; avgDuration: number }[]>([]);
  topCountries = signal<{ country: string | null; sessions: number }[]>([]);

  // Chart options
  lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
    },
  };

  doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    cutout: '70%',
  };

  visitorsChartData = signal<any>({ labels: [], datasets: [] });
  deviceChartData = signal<any>({ labels: [], datasets: [] });

  ngOnInit(): void {
    this.loadDashboard();
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    if (this.activeUsersInterval) clearInterval(this.activeUsersInterval);
    this.wsService.disconnect();
  }

  /** Called when date range selector changes */
  onDateRangeChange(): void {
    this.loadDashboard();
  }

  /** Called when chart period toggle changes */
  onChartPeriodChange(period: string): void {
    this.selectedChartPeriod = period;
    this.loadPageViewsChart();
  }

  loadDashboard(): void {
    this.loading.set(true);
    const range = this.buildDateRange();

    // Fire all requests in parallel
    this.analytics.getOverview(range).subscribe((overview) => {
      this.totalSessions.set(overview.totalSessions);
      this.bounceRate.set(overview.bounceRate);
      this.stats.set([
        {
          label: 'Unique Visitors',
          value: this.formatNumber(overview.uniqueVisitors),
          change: 0,
          icon: 'pi pi-users',
          color: '#3D5A80',
        },
        {
          label: 'Page Views',
          value: this.formatNumber(overview.totalPageViews),
          change: 0,
          icon: 'pi pi-eye',
          color: '#5DB7C2',
        },
        {
          label: 'Avg. Session Duration',
          value: this.formatDuration(overview.avgSessionDuration),
          change: 0,
          icon: 'pi pi-clock',
          color: '#6B4C9A',
        },
        {
          label: 'Bounce Rate',
          value: overview.bounceRate.toFixed(1) + '%',
          change: 0,
          icon: 'pi pi-sign-out',
          color: '#10B981',
        },
      ]);
      this.heatmapCount.set(overview.topPages?.length ?? 0);
      this.loading.set(false);
    });

    this.loadPageViewsChart();

    this.analytics.getDevices(range).subscribe((devices) => {
      const colors = ['#3D5A80', '#5DB7C2', '#6B4C9A', '#10B981', '#F59E0B'];
      this.deviceBreakdown.set(
        devices.map((d, i) => ({
          type: (d.device || 'Unknown'),
          percent: Math.round(d.percentage),
          color: colors[i % colors.length],
        })),
      );
      this.deviceChartData.set({
        labels: devices.map((d) => d.device || 'Unknown'),
        datasets: [
          {
            data: devices.map((d) => d.count),
            backgroundColor: devices.map((_, i) => colors[i % colors.length]),
            borderWidth: 0,
          },
        ],
      });
    });

    this.analytics.getTopPages(range, 5).subscribe((pages) => {
      this.topPages.set(pages);
    });

    this.analytics.getCountries(range).subscribe((countries) => {
      this.topCountries.set(countries);
    });

    this.analytics.getSessions({ ...range, limit: 1 }).subscribe((res) => {
      this.recordingsCount.set(res.meta.total);
    });

    this.analytics.getEventsSummary(range).subscribe((summary) => {
      this.eventsSummary.set(summary);
    });

    this.analytics.getReferrers(range).subscribe((referrers) => {
      const sorted = [...referrers].sort((a, b) => b.sessions - a.sessions).slice(0, 5);
      const total = sorted.reduce((sum, item) => sum + item.sessions, 0);
      this.trafficSources.set(sorted.map((item) => ({
        label: this.formatReferrer(item.referrer),
        value: item.sessions,
        percent: total > 0 ? (item.sessions / total) * 100 : 0,
      })));
    });
  }

  private eventCount(eventName: string): number {
    return this.eventsSummary().topEvents.find((event) => event.eventName === eventName)?.count ?? 0;
  }

  formatEventName(eventName: string): string {
    return eventName.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private formatReferrer(referrer: string | null): string {
    if (!referrer) return 'Direct / none';
    try {
      return new URL(referrer).hostname.replace(/^www\./, '');
    } catch {
      return referrer;
    }
  }

  private loadPageViewsChart(): void {
    const range = this.buildDateRange();
    const granularity = this.selectedChartPeriod === 'daily'
      ? 'day'
      : this.selectedChartPeriod === 'weekly'
        ? 'week'
        : 'month';

    this.analytics.getPageViews(range, granularity as any).subscribe((series) => {
      this.visitorsChartData.set({
        labels: series.map((s) => {
          const d = new Date(s.date);
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [
          {
            label: 'Page Views',
            data: series.map((s) => s.views),
            borderColor: '#5DB7C2',
            backgroundColor: 'rgba(93, 183, 194, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#5DB7C2',
          },
        ],
      });
    });
  }

  /**
   * Connect to WebSocket for real-time active visitor updates
   * Falls back to polling if WebSocket fails
   */
  private connectWebSocket(): void {
    // Try to connect via WebSocket
    this.wsService.connect();

    // Subscribe to WebSocket data
    this.wsService.activeVisitors$.subscribe((data) => {
      this.activeUsers.set(data.activeVisitors);
    });

    // Subscribe to connection state for debugging/fallback
    // If WebSocket fails, fall back to polling
    setTimeout(() => {
      const state = this.wsService.getConnectionState();
      if (state === 'error' || state === 'disconnected') {
        console.warn('[Dashboard] WebSocket failed, falling back to HTTP polling');
        this.pollActiveVisitors();
      }
    }, 2000); // Give WebSocket 2 seconds to connect
  }

  /**
   * Fallback: Poll for active visitors using HTTP
   * Used if WebSocket connection fails
   */
  private pollActiveVisitors(): void {
    // Fetch immediately then every 30 seconds
    this.analytics.getActiveVisitors().subscribe((n) => this.activeUsers.set(n));
    this.activeUsersInterval = setInterval(() => {
      this.analytics.getActiveVisitors().subscribe((n) => this.activeUsers.set(n));
    }, 30_000);
  }

  private buildDateRange(): DateRange {
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

  private formatNumber(n: number): string {
    return n.toLocaleString('en-US');
  }

  formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '0m 0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
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

  /**
   * Export dashboard report in CSV or JSON format
   * Includes all dashboard data: stats, top pages, device breakdown, countries
   */
  exportReport(format: 'csv' | 'json'): void {
    this.showExportMenu = false;
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `analytics-report-${dateStr}`;

    if (format === 'csv') {
      this.exportAsCSV(filename);
    } else {
      this.exportAsJSON(filename);
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Export Complete',
      detail: `Report exported as ${format.toUpperCase()}`,
      life: 3000,
    });
  }

  private exportAsCSV(filename: string): void {
    const sections: string[] = [];

    // 1. Overview Stats
    sections.push('# OVERVIEW STATISTICS\n');
    const statsHeaders = ['Metric', 'Value', 'Change (%)'];
    const statsRows = this.stats().map(stat => [
      stat.label,
      stat.value,
      stat.change.toString()
    ]);
    sections.push(this.arrayToCSV(statsHeaders, statsRows));
    sections.push('\n');

    // 2. Top Pages
    sections.push('# TOP PAGES\n');
    const pagesHeaders = ['Page Path', 'Views', 'Avg Duration (s)'];
    const pagesRows = this.topPages().map(page => [
      page.path,
      page.views.toString(),
      page.avgDuration.toString()
    ]);
    sections.push(this.arrayToCSV(pagesHeaders, pagesRows));
    sections.push('\n');

    // 3. Device Breakdown
    sections.push('# DEVICE BREAKDOWN\n');
    const devicesHeaders = ['Device Type', 'Percentage'];
    const devicesRows = this.deviceBreakdown().map(device => [
      device.type,
      device.percent.toString() + '%'
    ]);
    sections.push(this.arrayToCSV(devicesHeaders, devicesRows));
    sections.push('\n');

    // 4. Top Countries
    sections.push('# TOP COUNTRIES\n');
    const countriesHeaders = ['Country', 'Sessions'];
    const countriesRows = this.topCountries().map(country => [
      country.country || 'Unknown',
      country.sessions.toString()
    ]);
    sections.push(this.arrayToCSV(countriesHeaders, countriesRows));

    const csvContent = sections.join('\n');
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  private exportAsJSON(filename: string): void {
    const exportData = {
      exportedAt: new Date().toISOString(),
      dateRange: this.selectedDateRange,
      overview: {
        stats: this.stats().map(stat => ({
          label: stat.label,
          value: stat.value,
          change: stat.change,
          icon: stat.icon,
          color: stat.color
        })),
        activeUsers: this.activeUsers(),
      },
      topPages: this.topPages(),
      deviceBreakdown: this.deviceBreakdown(),
      topCountries: this.topCountries(),
      summary: {
        heatmapCount: this.heatmapCount(),
        recordingsCount: this.recordingsCount(),
      },
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
}
