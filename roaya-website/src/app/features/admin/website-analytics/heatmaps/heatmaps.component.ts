import { Component, OnInit, OnDestroy, signal, inject, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';

import {
  WebsiteAnalyticsService,
  DateRange,
  TopPage,
  HeatmapPoint,
} from '../../../../core/services/website-analytics.service';

interface HeatmapPage {
  url: string;
  title: string;
  totalClicks: number;
  sessions: number;
  lastUpdated: string;
  avgScrollDepth?: number;
  avgTimeOnPage?: number;
}

interface ClickPoint {
  x: number;
  y: number;
  intensity: number;
}

/**
 * Heatmaps Component
 * Visualize user click and scroll behavior on website pages
 */
@Component({
  selector: 'app-heatmaps',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    CardModule,
    ButtonModule,
    SelectModule,
    ToastModule,
    TooltipModule,
    TabsModule,
    ProgressBarModule,
  ],
  providers: [MessageService],
  template: `
    <div class="heatmaps">
      <p-toast></p-toast>

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>Heatmaps</h1>
          <p class="text-content-muted">
            Visualize where users click and how far they scroll
          </p>
        </div>
        <div class="header-actions">
          <p-select
            [options]="dateRangeOptions"
            [(ngModel)]="selectedDateRange"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Date Range"
            styleClass="date-range-select"
          ></p-select>
          <p-button
            label="Generate Report"
            icon="pi pi-download"
            severity="secondary"
            [outlined]="true"
          ></p-button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Page Selector Sidebar -->
        <div class="lg:col-span-1">
          <p-card styleClass="glass-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
                <i class="pi pi-list mr-2 text-teal-500"></i>
                Pages
              </h3>
              <span class="text-xs text-content-muted">
                {{ pages().length }} tracked
              </span>
            </div>

            <!-- Search -->
            <div class="relative mb-4">
              <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="Search pages..."
                class="page-search-input"
                [(ngModel)]="pageSearchQuery"
              />
            </div>

            <!-- Page List -->
            <div class="pages-list">
              @for (page of filteredPages(); track page.url) {
              <div
                class="page-item"
                [class.selected]="selectedPage()?.url === page.url"
                (click)="selectPage(page)"
              >
                <div class="page-info">
                  <div class="page-title">{{ page.title }}</div>
                  <div class="page-url">{{ page.url }}</div>
                </div>
                <div class="page-stats">
                  <span class="click-count">{{ page.totalClicks | number }}</span>
                  <span class="label">clicks</span>
                </div>
              </div>
              }
            </div>
          </p-card>
        </div>

        <!-- Heatmap Viewer -->
        <div class="lg:col-span-3">
          <p-card styleClass="glass-card heatmap-card">
            @if (selectedPage()) {
            <!-- Heatmap Controls -->
            <div class="heatmap-controls">
              <div class="control-group">
                <p-tabs>
                  <p-tabpanel>
                    <ng-template #header>
                      <div class="tab-header">
                        <i class="pi pi-th-large"></i>
                        <span>Click Map</span>
                      </div>
                    </ng-template>
                    <!-- Click map content handled by active tab -->
                  </p-tabpanel>
                  <p-tabpanel>
                    <ng-template #header>
                      <div class="tab-header">
                        <i class="pi pi-arrows-v"></i>
                        <span>Scroll Map</span>
                      </div>
                    </ng-template>
                  </p-tabpanel>
                  <p-tabpanel>
                    <ng-template #header>
                      <div class="tab-header">
                        <i class="pi pi-arrows-alt"></i>
                        <span>Move Map</span>
                      </div>
                    </ng-template>
                  </p-tabpanel>
                </p-tabs>
              </div>

              <div class="flex items-center gap-4">
                <!-- Radius Control -->
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold text-content-secondary">Radius:</span>
                  @for (option of radiusOptions; track option.value) {
                    <button
                      class="radius-btn"
                      [class.active]="heatmapRadius() === option.value"
                      (click)="setHeatmapRadius(option.value)"
                      [pTooltip]="option.description"
                      tooltipPosition="top"
                    >
                      {{ option.label }}
                    </button>
                  }
                </div>

                <!-- Device Filters -->
                <div class="device-filters">
                  @for (device of deviceTypes; track device.value) {
                  <button
                    class="device-btn"
                    [class.active]="selectedDevice() === device.value"
                    (click)="selectedDevice.set(device.value); onDeviceChange()"
                    [pTooltip]="device.label"
                    tooltipPosition="top"
                  >
                    <i [class]="device.icon"></i>
                  </button>
                  }
                </div>

                <!-- Legend Toggle -->
                <button
                  class="legend-toggle-btn"
                  (click)="showLegend.set(!showLegend())"
                  [pTooltip]="showLegend() ? 'Hide Legend' : 'Show Legend'"
                  tooltipPosition="top"
                >
                  <i class="pi" [class.pi-eye]="showLegend()" [class.pi-eye-slash]="!showLegend()"></i>
                </button>
              </div>
            </div>

            <!-- Heatmap Display -->
            <div class="heatmap-container" #heatmapContainer>
              <!-- Page Screenshot Preview -->
              <div class="page-preview">
                <div class="browser-chrome">
                  <div class="browser-dots">
                    <span class="dot red"></span>
                    <span class="dot yellow"></span>
                    <span class="dot green"></span>
                  </div>
                  <div class="url-bar">
                    <i class="pi pi-lock text-green-500 mr-2"></i>
                    <span>{{ selectedPage()?.url }}</span>
                  </div>
                </div>

                <!-- Heatmap Canvas -->
                <div class="heatmap-viewport" #heatmapViewport>
                  <!-- Real page iframe -->
                  <iframe
                    #pageIframe
                    [src]="iframeSrc()"
                    sandbox="allow-same-origin"
                    class="heatmap-iframe"
                    [style.width.px]="iframeNativeWidth()"
                    [style.height.px]="iframeNativeHeight()"
                    [style.transform]="'scale(' + iframeScale() + ')'"
                    style="transform-origin: top left; pointer-events: none; border: none;"
                    (load)="onIframeLoad()"
                  ></iframe>

                  <!-- heatmap.js overlay (click tab) -->
                  @if (activeTab() !== 'scroll') {
                  <div
                    #heatmapOverlay
                    class="heatmap-overlay"
                    [style.width.px]="iframeNativeWidth()"
                    [style.height.px]="iframeNativeHeight()"
                    [style.transform]="'scale(' + iframeScale() + ')'"
                    style="transform-origin: top left;"
                  ></div>
                  }

                  <!-- Scroll depth indicator -->
                  @if (activeTab() === 'scroll') {
                  <div class="scroll-depth-overlay">
                    <div class="scroll-zone zone-100" style="height: 20%">
                      <span class="zone-label">100% viewed</span>
                    </div>
                    <div class="scroll-zone zone-75" style="height: 25%">
                      <span class="zone-label">75% viewed</span>
                    </div>
                    <div class="scroll-zone zone-50" style="height: 25%">
                      <span class="zone-label">50% viewed</span>
                    </div>
                    <div class="scroll-zone zone-25" style="height: 30%">
                      <span class="zone-label">25% viewed</span>
                    </div>
                  </div>
                  }
                </div>
              </div>

              <!-- Enhanced Intensity Scale Legend -->
              @if (showLegend()) {
                <div class="heatmap-legend-enhanced">
                  <div class="legend-header">
                    <span class="legend-title">Click Intensity</span>
                    <button
                      class="legend-close"
                      (click)="showLegend.set(false)"
                      aria-label="Close legend"
                    >
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                  <div class="legend-content">
                    <div class="legend-scale">
                      <div class="legend-gradient-bar"></div>
                      <div class="legend-labels">
                        <span class="legend-label-item">Low</span>
                        <span class="legend-label-item">Medium</span>
                        <span class="legend-label-item">High</span>
                      </div>
                    </div>
                    <div class="legend-info">
                      <div class="legend-stat">
                        <i class="pi pi-circle-fill" style="color: #3b82f6; font-size: 8px;"></i>
                        <span>Few clicks</span>
                      </div>
                      <div class="legend-stat">
                        <i class="pi pi-circle-fill" style="color: #f59e0b; font-size: 8px;"></i>
                        <span>Moderate activity</span>
                      </div>
                      <div class="legend-stat">
                        <i class="pi pi-circle-fill" style="color: #ef4444; font-size: 8px;"></i>
                        <span>High engagement</span>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Page Stats -->
            <div class="page-stats-bar">
              <div class="stat-item">
                <i class="pi pi-mouse text-teal-500"></i>
                <div>
                  <span class="stat-value">{{ selectedPage()?.totalClicks | number }}</span>
                  <span class="stat-label">Total Clicks</span>
                </div>
              </div>
              <div class="stat-item">
                <i class="pi pi-users text-purple-500"></i>
                <div>
                  <span class="stat-value">{{ selectedPage()?.sessions | number }}</span>
                  <span class="stat-label">Sessions</span>
                </div>
              </div>
              <div class="stat-item">
                <i class="pi pi-percentage text-blue-500"></i>
                <div>
                  <span class="stat-value">{{ formatScrollDepth(selectedPage()?.avgScrollDepth) }}</span>
                  <span class="stat-label">Avg. Scroll Depth</span>
                </div>
              </div>
              <div class="stat-item">
                <i class="pi pi-clock text-orange-500"></i>
                <div>
                  <span class="stat-value">{{ formatDuration(selectedPage()?.avgTimeOnPage) }}</span>
                  <span class="stat-label">Avg. Time on Page</span>
                </div>
              </div>
            </div>
            } @else {
            <!-- Empty State -->
            <div class="empty-state">
              <i class="pi pi-image text-6xl text-slate-300 dark:text-slate-600 mb-4"></i>
              <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select a Page
              </h3>
              <p class="text-content-muted">
                Choose a page from the list to view its heatmap
              </p>
            </div>
            }
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      // Brand Colors
      $navy: #3d5a80;
      $teal: #5db7c2;
      $purple: #6b4c9a;

      .heatmaps {
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

      :host ::ng-deep .date-range-select {
        min-width: 180px;
      }

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

      .page-search-input {
        width: 100%;
        padding: 0.75rem 0.75rem 0.75rem 2.5rem;
        border: 1px solid rgba($navy, 0.12);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.8);
        font-size: 0.875rem;
        transition: all 0.2s ease;

        &:focus {
          outline: none;
          border-color: $teal;
          box-shadow: 0 0 0 3px rgba($teal, 0.15);
        }

        &::placeholder {
          color: #94a3b8;
        }
      }

      .pages-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 500px;
        overflow-y: auto;
      }

      .page-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.875rem 1rem;
        border-radius: 12px;
        background: rgba($navy, 0.03);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: rgba($teal, 0.08);
          transform: translateX(4px);
        }

        &.selected {
          background: linear-gradient(135deg, rgba($navy, 0.1) 0%, rgba($teal, 0.1) 100%);
          border-left: 3px solid $teal;
        }
      }

      .page-info {
        min-width: 0;
        flex: 1;
      }

      .page-title {
        font-weight: 600;
        font-size: 0.875rem;
        color: $navy;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .page-url {
        font-size: 0.75rem;
        color: #64748b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .page-stats {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        margin-left: 0.75rem;

        .click-count {
          font-weight: 700;
          font-size: 0.875rem;
          color: $teal;
        }

        .label {
          font-size: 0.65rem;
          color: #94a3b8;
          text-transform: uppercase;
        }
      }

      // Heatmap Card
      :host ::ng-deep .heatmap-card {
        .p-card-body {
          padding: 0;
        }
      }

      .heatmap-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid rgba($navy, 0.08);
        background: rgba($navy, 0.02);
        flex-wrap: wrap;
        gap: 1rem;
      }

      .tab-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
      }

      .device-filters {
        display: flex;
        gap: 0.5rem;
      }

      .radius-btn {
        padding: 0.5rem 1rem;
        border: 1px solid rgba($navy, 0.12);
        border-radius: 8px;
        background: transparent;
        color: #64748b;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: $teal;
          color: $teal;
        }

        &.active {
          background: linear-gradient(135deg, $navy 0%, $teal 100%);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba($navy, 0.25);
        }
      }

      .device-btn {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba($navy, 0.12);
        border-radius: 10px;
        background: transparent;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: $teal;
          color: $teal;
        }

        &.active {
          background: linear-gradient(135deg, $navy 0%, $teal 100%);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba($navy, 0.25);
        }
      }

      .legend-toggle-btn {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba($navy, 0.12);
        border-radius: 10px;
        background: transparent;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: $teal;
          color: $teal;
          background: rgba($teal, 0.05);
        }
      }

      .heatmap-container {
        padding: 1.5rem;
      }

      .page-preview {
        border: 1px solid rgba($navy, 0.12);
        border-radius: 12px;
        overflow: hidden;
        background: #f8fafc;
      }

      .browser-chrome {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1rem;
        background: linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%);
        border-bottom: 1px solid rgba($navy, 0.1);
      }

      .browser-dots {
        display: flex;
        gap: 6px;

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;

          &.red {
            background: #ef4444;
          }
          &.yellow {
            background: #f59e0b;
          }
          &.green {
            background: #10b981;
          }
        }
      }

      .url-bar {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;
        background: white;
        border-radius: 6px;
        font-size: 0.8rem;
        color: #64748b;
      }

      .heatmap-viewport {
        position: relative;
        min-height: 400px;
        overflow: hidden;
        background: white;
      }

      .heatmap-iframe {
        display: block;
      }

      .heatmap-overlay {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 2;
      }

      .scroll-depth-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;

        .scroll-zone {
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          padding: 0.5rem;

          &.zone-100 {
            background: rgba(16, 185, 129, 0.3);
          }
          &.zone-75 {
            background: rgba(59, 130, 246, 0.3);
          }
          &.zone-50 {
            background: rgba(245, 158, 11, 0.3);
          }
          &.zone-25 {
            background: rgba(239, 68, 68, 0.3);
          }

          .zone-label {
            font-size: 0.7rem;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.6);
            background: rgba(255, 255, 255, 0.8);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
          }
        }
      }

      .heatmap-legend {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        margin-top: 1rem;

        .legend-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
        }

        .legend-gradient {
          width: 150px;
          height: 12px;
          border-radius: 6px;
          background: linear-gradient(90deg, #3b82f6 0%, #10b981 25%, #f59e0b 50%, #ef4444 75%, #7c3aed 100%);
        }
      }

      .heatmap-legend-enhanced {
        position: absolute;
        bottom: 1.5rem;
        right: 1.5rem;
        z-index: 10;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba($navy, 0.12);
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 8px 24px rgba($navy, 0.15);
        min-width: 200px;

        .legend-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba($navy, 0.1);

          .legend-title {
            font-size: 0.75rem;
            font-weight: 700;
            color: $navy;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .legend-close {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: transparent;
            color: #94a3b8;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s ease;

            &:hover {
              background: rgba($navy, 0.08);
              color: $navy;
            }

            i {
              font-size: 0.7rem;
            }
          }
        }

        .legend-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .legend-scale {
          .legend-gradient-bar {
            width: 100%;
            height: 16px;
            border-radius: 8px;
            background: linear-gradient(90deg, #3b82f6 0%, #10b981 25%, #f59e0b 50%, #ef4444 75%, #7c3aed 100%);
            margin-bottom: 0.5rem;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .legend-labels {
            display: flex;
            justify-content: space-between;

            .legend-label-item {
              font-size: 0.65rem;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
            }
          }
        }

        .legend-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .legend-stat {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.7rem;
            color: #64748b;

            i {
              flex-shrink: 0;
            }
          }
        }
      }

      .page-stats-bar {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        padding: 1.25rem 1.5rem;
        background: linear-gradient(180deg, rgba($navy, 0.02) 0%, rgba($navy, 0.05) 100%);
        border-top: 1px solid rgba($navy, 0.08);
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        i {
          font-size: 1.25rem;
        }

        .stat-value {
          display: block;
          font-weight: 700;
          font-size: 1.125rem;
          color: $navy;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
        }
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;
      }

      // Dark Mode
      [data-theme='dark'] {
        .heatmaps {
          .page-header {
            border-bottom-color: rgba(255, 255, 255, 0.1);

            h1 {
              background: linear-gradient(135deg, #93c5fd 0%, $teal 50%, #c4b5fd 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
          }

          :host ::ng-deep .glass-card {
            background: rgba(30, 41, 59, 0.85);
            border-color: rgba(255, 255, 255, 0.08);
          }

          .page-search-input {
            background: rgba(15, 23, 42, 0.6);
            border-color: rgba(255, 255, 255, 0.1);
            color: #e2e8f0;
          }

          .page-item {
            background: rgba(255, 255, 255, 0.03);

            &:hover {
              background: rgba($teal, 0.1);
            }

            &.selected {
              background: linear-gradient(
                135deg,
                rgba($navy, 0.2) 0%,
                rgba($teal, 0.15) 100%
              );
            }
          }

          .page-title {
            color: #f1f5f9;
          }

          .heatmap-controls {
            background: rgba(15, 23, 42, 0.5);
            border-bottom-color: rgba(255, 255, 255, 0.08);
          }

          .device-btn {
            border-color: rgba(255, 255, 255, 0.1);
            color: #94a3b8;
          }

          .page-preview {
            border-color: rgba(255, 255, 255, 0.1);
            background: #1e293b;
          }

          .browser-chrome {
            background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
            border-bottom-color: rgba(255, 255, 255, 0.1);
          }

          .url-bar {
            background: #0f172a;
            color: #94a3b8;
          }

          .heatmap-viewport {
            background: #1e293b;
          }

          .heatmap-iframe {
            filter: none;
          }

          .page-stats-bar {
            background: rgba(15, 23, 42, 0.5);
            border-top-color: rgba(255, 255, 255, 0.08);
          }

          .stat-item .stat-value {
            color: #f1f5f9;
          }

          .heatmap-legend-enhanced {
            background: rgba(30, 41, 59, 0.95);
            border-color: rgba(255, 255, 255, 0.1);

            .legend-header {
              border-bottom-color: rgba(255, 255, 255, 0.1);

              .legend-title {
                color: #f1f5f9;
              }

              .legend-close {
                color: #94a3b8;

                &:hover {
                  background: rgba(255, 255, 255, 0.08);
                  color: #f1f5f9;
                }
              }
            }

            .legend-info .legend-stat {
              color: #94a3b8;
            }
          }

          .radius-btn {
            border-color: rgba(255, 255, 255, 0.1);
            color: #94a3b8;

            &:hover {
              border-color: $teal;
              color: $teal;
            }
          }

          .legend-toggle-btn {
            border-color: rgba(255, 255, 255, 0.1);
            color: #94a3b8;

            &:hover {
              border-color: $teal;
              color: $teal;
            }
          }
        }
      }
    `,
  ],
})
export class HeatmapsComponent implements OnInit, OnDestroy {
  private readonly messageService = inject(MessageService);
  private readonly analytics = inject(WebsiteAnalyticsService);
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('heatmapViewport') heatmapViewportRef!: ElementRef<HTMLElement>;
  @ViewChild('heatmapOverlay') heatmapOverlayRef!: ElementRef<HTMLElement>;
  @ViewChild('pageIframe') pageIframeRef!: ElementRef<HTMLIFrameElement>;

  // Signals
  pageSearchQuery = '';
  selectedPage = signal<HeatmapPage | null>(null);
  selectedDevice = signal<string>('all');
  selectedDateRange = 'last7days';
  activeTab = signal<string>('click');
  loadingPages = signal(false);
  loadingHeatmap = signal(false);

  // Iframe / heatmap state
  iframeScale = signal(1);
  iframeNativeWidth = signal(1440);
  iframeNativeHeight = signal(900);
  private heatmapInstance: any = null;
  private rawClickPoints: HeatmapPoint[] = [];

  // Heatmap intensity controls
  heatmapRadius = signal(25); // Default: Normal (25px)
  heatmapOpacity = signal(0.7); // Max opacity
  showLegend = signal(true);
  radiusOptions = [
    { label: 'Tight', value: 10, description: 'Precise click positions' },
    { label: 'Normal', value: 25, description: 'Balanced view (default)' },
    { label: 'Wide', value: 40, description: 'Broader patterns' },
  ];

  // Computed iframe src (sanitized for Angular resource URL security)
  iframeSrc = computed<SafeResourceUrl | string>(() => {
    const page = this.selectedPage();
    if (!page) return '';
    const url = page.url + (page.url.includes('?') ? '&' : '?') + '_heatmap_preview=1';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  // Device filter options
  deviceTypes = [
    { value: 'all', label: 'All Devices', icon: 'pi pi-desktop' },
    { value: 'desktop', label: 'Desktop', icon: 'pi pi-desktop' },
    { value: 'tablet', label: 'Tablet', icon: 'pi pi-tablet' },
    { value: 'mobile', label: 'Mobile', icon: 'pi pi-mobile' },
  ];

  dateRangeOptions = [
    { label: 'Last 7 days', value: 'last7days' },
    { label: 'Last 30 days', value: 'last30days' },
    { label: 'Last 90 days', value: 'last90days' },
  ];

  // Pages populated from API
  pages = signal<HeatmapPage[]>([]);

  // Computed filtered pages
  filteredPages = computed(() => {
    const query = this.pageSearchQuery.toLowerCase();
    if (!query) return this.pages();
    return this.pages().filter(
      (page) =>
        page.title.toLowerCase().includes(query) ||
        page.url.toLowerCase().includes(query),
    );
  });

  // Click points from API (kept for compatibility)
  clickPoints = signal<ClickPoint[]>([]);

  ngOnInit(): void {
    this.loadPages();
    this.updateIframeWidth();
  }

  ngOnDestroy(): void {
    this.destroyHeatmap();
  }

  selectPage(page: HeatmapPage): void {
    this.selectedPage.set(page);
    this.destroyHeatmap();
    this.loadHeatmapData(page.url);
  }

  onDeviceChange(): void {
    this.updateIframeWidth();
    this.recalculateScale();
    // Re-render heatmap with new dimensions
    if (this.rawClickPoints.length > 0) {
      setTimeout(() => this.renderHeatmap(), 100);
    }
  }

  onDateRangeChange(): void {
    this.loadPages();
    const selected = this.selectedPage();
    if (selected) this.loadHeatmapData(selected.url);
  }

  setHeatmapRadius(radius: number): void {
    this.heatmapRadius.set(radius);
    // Re-render heatmap with new radius
    if (this.rawClickPoints.length > 0) {
      setTimeout(() => this.renderHeatmap(), 100);
    }
  }

  onIframeLoad(): void {
    // Try to get the actual document height from the iframe
    try {
      const iframe = this.pageIframeRef?.nativeElement;
      if (iframe?.contentDocument) {
        const docHeight = iframe.contentDocument.documentElement.scrollHeight;
        if (docHeight > 0) {
          this.iframeNativeHeight.set(docHeight);
        }
      }
    } catch {
      // Cross-origin or sandbox restriction – use default height
    }
    this.recalculateScale();
    // Render heatmap once iframe is ready
    if (this.rawClickPoints.length > 0) {
      setTimeout(() => this.renderHeatmap(), 200);
    }
  }

  private updateIframeWidth(): void {
    const device = this.selectedDevice();
    switch (device) {
      case 'mobile':
        this.iframeNativeWidth.set(375);
        break;
      case 'tablet':
        this.iframeNativeWidth.set(768);
        break;
      default:
        this.iframeNativeWidth.set(1440);
    }
  }

  private recalculateScale(): void {
    const viewport = this.heatmapViewportRef?.nativeElement;
    if (!viewport) return;
    const containerWidth = viewport.clientWidth;
    const scale = Math.min(1, containerWidth / this.iframeNativeWidth());
    this.iframeScale.set(scale);
  }

  private async renderHeatmap(): Promise<void> {
    this.destroyHeatmap();

    const overlay = this.heatmapOverlayRef?.nativeElement;
    if (!overlay || this.rawClickPoints.length === 0) return;

    try {
      const h337 = (await import('heatmap.js')).default;

      this.heatmapInstance = h337.create({
        container: overlay,
        radius: this.heatmapRadius(),
        maxOpacity: this.heatmapOpacity(),
        minOpacity: 0.05,
        blur: 0.85,
        gradient: {
          '0.0': '#3b82f6',
          '0.25': '#10b981',
          '0.5': '#f59e0b',
          '0.75': '#ef4444',
          '1.0': '#7c3aed',
        },
      });

      const w = this.iframeNativeWidth();
      const h = this.iframeNativeHeight();

      // Map percentage coordinates to pixel positions
      const data = this.rawClickPoints.map((p) => ({
        x: Math.round((p.x / 100) * w),
        y: Math.round((p.y / 100) * h),
        value: 1,
      }));

      // Group overlapping points to get value counts
      const grouped = new Map<string, { x: number; y: number; value: number }>();
      for (const d of data) {
        const key = `${d.x},${d.y}`;
        const existing = grouped.get(key);
        if (existing) {
          existing.value++;
        } else {
          grouped.set(key, { ...d });
        }
      }

      const points = Array.from(grouped.values());
      const max = points.reduce((m, p) => Math.max(m, p.value), 1);

      this.heatmapInstance.setData({
        max,
        data: points,
      });
    } catch {
      // heatmap.js failed to load – fall back to no overlay
    }
  }

  private destroyHeatmap(): void {
    this.heatmapInstance = null;
    // Clear the heatmap canvas from the overlay
    const overlay = this.heatmapOverlayRef?.nativeElement;
    if (overlay) {
      const canvas = overlay.querySelector('canvas');
      if (canvas) canvas.remove();
    }
  }

  private loadPages(): void {
    this.loadingPages.set(true);
    const range = this.buildDateRange();

    this.analytics.getTopPages(range, 20).subscribe((topPages) => {
      const heatmapPages: HeatmapPage[] = topPages.map((tp) => ({
        url: tp.path,
        title: tp.path === '/' ? 'Home Page' : tp.path.replace(/^\//, '').replace(/-/g, ' '),
        totalClicks: tp.views, // Approximation – actual click count loaded per page
        sessions: 0,
        lastUpdated: new Date().toISOString(),
        avgScrollDepth: 0, // TODO: Add scroll depth tracking to backend
        avgTimeOnPage: tp.avgDuration, // Seconds from backend
      }));
      this.pages.set(heatmapPages);
      this.loadingPages.set(false);

      // Auto-select first page
      if (heatmapPages.length > 0 && !this.selectedPage()) {
        this.selectPage(heatmapPages[0]);
      }
    });
  }

  loadHeatmapData(url: string): void {
    this.loadingHeatmap.set(true);
    const range = this.buildDateRange();

    this.analytics.getHeatmap(url, range).subscribe((points) => {
      this.rawClickPoints = points;

      // Also update legacy signal for compatibility
      const maxCount = points.length;
      this.clickPoints.set(
        points.map((p, i) => ({
          x: p.x,
          y: p.y,
          intensity: maxCount > 0 ? Math.max(0.3, 1 - i / maxCount) : 0.5,
        })),
      );
      this.loadingHeatmap.set(false);

      // Render heatmap.js overlay
      setTimeout(() => this.renderHeatmap(), 300);
    });
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

  // Format helpers for displaying stats
  formatScrollDepth(depth?: number): string {
    if (depth === undefined || depth === null || depth === 0) {
      return '—';
    }
    return `${Math.round(depth)}%`;
  }

  formatDuration(seconds?: number): string {
    if (seconds === undefined || seconds === null || seconds === 0) {
      return '—';
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);

    if (mins === 0) {
      return `${secs}s`;
    } else if (secs === 0) {
      return `${mins}m`;
    } else {
      return `${mins}m ${secs}s`;
    }
  }
}
