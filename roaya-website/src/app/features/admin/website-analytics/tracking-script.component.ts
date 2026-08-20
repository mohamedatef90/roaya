import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { environment } from '../../../../environments/environment';

/**
 * Tracking Script Component
 * Generate and manage website tracking code (Hotjar-like functionality)
 */
@Component({
  selector: 'app-tracking-script',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    ToggleSwitch,
    DividerModule,
    TooltipModule,
  ],
  providers: [MessageService],
  template: `
    <div class="tracking-script">
      <p-toast></p-toast>

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>Tracking Code</h1>
          <p class="text-content-muted">
            Install the tracking script to capture user behavior on your website
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-content-secondary">Tracking Status:</span>
          <span
            class="status-badge"
            [class.active]="trackingEnabled()"
            [class.inactive]="!trackingEnabled()"
          >
            {{ trackingEnabled() ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Built-in Tracking Status -->
          <p-card styleClass="glass-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
                <i class="pi pi-check-circle mr-2 text-green-500"></i>
                Built-in Tracking — Active
              </h3>
            </div>
            <div class="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 mb-4">
              <i class="pi pi-info-circle mt-0.5 text-green-600 dark:text-green-400"></i>
              <div class="text-sm text-green-800 dark:text-green-300">
                <p class="font-semibold mb-1">Tracking is built into this Angular application</p>
                <p class="text-green-700 dark:text-green-400">
                  The <code>VisitorTrackingService</code> automatically tracks page views, sessions, and clicks
                  for all public (non-admin) pages. No external script is needed.
                </p>
              </div>
            </div>
            <div class="site-id-display mb-4">
              <div class="flex-1">
                <div class="text-xs text-content-muted uppercase font-semibold mb-1">Backend Tracking Endpoint</div>
                <code class="site-id-code">{{ trackingEndpointUrl }}</code>
              </div>
              <p-button
                icon="pi pi-copy"
                [text]="true"
                [rounded]="true"
                severity="secondary"
                pTooltip="Copy URL"
                tooltipPosition="top"
                (onClick)="copyToClipboard(trackingEndpointUrl, 'Tracking URL')"
              ></p-button>
            </div>
          </p-card>

          <!-- Standalone Script for Non-Angular Pages -->
          <p-card styleClass="glass-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
                <i class="pi pi-code mr-2 text-purple-500"></i>
                Standalone Script (Non-Angular Pages)
              </h3>
              <p-button
                label="Copy Script Tag"
                icon="pi pi-copy"
                severity="secondary"
                [outlined]="true"
                size="small"
                (onClick)="copyToClipboard(standaloneScriptTag(), 'Script tag')"
              ></p-button>
            </div>
            <p class="text-sm text-content-muted mb-4">
              If you have non-Angular pages that also need tracking, add this <code>&lt;script&gt;</code> tag:
            </p>
            <div class="script-container">
              <pre class="script-code"><code>{{ standaloneScriptTag() }}</code></pre>
            </div>
          </p-card>

          <!-- Privacy Settings -->
          <p-card styleClass="glass-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              <i class="pi pi-shield mr-2 text-green-500"></i>
              Privacy Settings
            </h3>
            <div class="space-y-4">
              @for (setting of privacySettings(); track setting.key) {
              <div class="privacy-setting">
                <div class="flex-1">
                  <div class="font-medium text-slate-800 dark:text-slate-200">
                    {{ setting.label }}
                  </div>
                  <div class="text-sm text-content-muted">
                    {{ setting.description }}
                  </div>
                </div>
                <p-toggleSwitch [(ngModel)]="setting.enabled"></p-toggleSwitch>
              </div>
              }
            </div>
          </p-card>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Stats -->
          <p-card styleClass="glass-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              <i class="pi pi-chart-line mr-2 text-teal-500"></i>
              Quick Stats
            </h3>
            <div class="stats-grid">
              @for (stat of quickStats(); track stat.label) {
              <div class="stat-item">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
              }
            </div>
          </p-card>

          <!-- Tracked Pages -->
          <p-card styleClass="glass-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
                <i class="pi pi-file mr-2 text-blue-500"></i>
                Tracked Pages
              </h3>
              <span class="text-sm text-content-muted">
                {{ trackedPages().length }} pages
              </span>
            </div>
            <div class="tracked-pages-list">
              @for (page of trackedPages(); track page.url) {
              <div class="tracked-page">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <i class="pi pi-circle-fill text-xs" [class]="page.active ? 'text-green-500' : 'text-slate-300'"></i>
                  <span class="truncate text-sm text-slate-700 dark:text-slate-300">{{ page.url }}</span>
                </div>
                <p-toggleSwitch [(ngModel)]="page.active" [style]="{ transform: 'scale(0.8)' }"></p-toggleSwitch>
              </div>
              }
            </div>
            <p-button
              label="View All Pages"
              [text]="true"
              styleClass="w-full mt-3"
              size="small"
            ></p-button>
          </p-card>

          <!-- Installation Status -->
          <p-card styleClass="glass-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              <i class="pi pi-check-circle mr-2 text-green-500"></i>
              Installation Status
            </h3>
            <div class="space-y-3">
              @for (check of installationChecks(); track check.label) {
              <div class="installation-check">
                <i
                  class="pi"
                  [class.pi-check-circle]="check.passed"
                  [class.pi-times-circle]="!check.passed"
                  [class.text-green-500]="check.passed"
                  [class.text-red-500]="!check.passed"
                ></i>
                <span class="text-sm text-slate-700 dark:text-slate-300">{{ check.label }}</span>
              </div>
              }
            </div>
            <p-button
              label="Verify Installation"
              icon="pi pi-sync"
              styleClass="w-full mt-4"
              [outlined]="true"
              size="small"
              (onClick)="verifyInstallation()"
            ></p-button>
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

      .tracking-script {
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

      .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.375rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;

        &.active {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
        }

        &.inactive {
          background: rgba(100, 116, 139, 0.2);
          color: #64748b;
        }
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

      .site-id-display {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: linear-gradient(135deg, rgba($navy, 0.05) 0%, rgba($teal, 0.05) 100%);
        border-radius: 12px;
        border: 1px solid rgba($navy, 0.1);
      }

      .site-id-code {
        flex: 1;
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 1rem;
        font-weight: 600;
        color: $navy;
        letter-spacing: 1px;
      }

      .script-container {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border-radius: 12px;
        padding: 1.25rem;
        overflow-x: auto;
      }

      .script-code {
        margin: 0;
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 0.8rem;
        color: #e2e8f0;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-all;

        code {
          color: inherit;
        }
      }

      .privacy-setting {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem;
        background: rgba($navy, 0.03);
        border-radius: 12px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba($teal, 0.05);
        }
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .stat-item {
        text-align: center;
        padding: 1rem;
        background: linear-gradient(135deg, rgba($navy, 0.03) 0%, rgba($teal, 0.03) 100%);
        border-radius: 12px;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, $navy 0%, $teal 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .stat-label {
        font-size: 0.75rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 0.25rem;
      }

      .tracked-pages-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 200px;
        overflow-y: auto;
      }

      .tracked-page {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        background: rgba($navy, 0.03);
        border-radius: 8px;

        &:hover {
          background: rgba($teal, 0.05);
        }
      }

      .installation-check {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      // Dark Mode
      [data-theme='dark'] {
        .tracking-script {
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

          .site-id-display {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
          }

          .site-id-code {
            color: $teal;
          }

          .privacy-setting,
          .stat-item,
          .tracked-page {
            background: rgba(255, 255, 255, 0.03);

            &:hover {
              background: rgba($teal, 0.08);
            }
          }

          .stat-value {
            background: linear-gradient(135deg, #93c5fd 0%, $teal 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        }
      }
    `,
  ],
})
export class TrackingScriptComponent implements OnInit {
  private readonly messageService = inject(MessageService);

  // Signals
  trackingEnabled = signal(true);
  trackingEndpointUrl = `${environment.apiUrl}/website-analytics/tracking`;

  privacySettings = signal([
    {
      key: 'respectDnt',
      label: 'Respect Do Not Track',
      description: "Built-in: visitors with DNT enabled are not tracked",
      enabled: true,
    },
    {
      key: 'skipAdmin',
      label: 'Skip Admin Routes',
      description: 'Built-in: admin pages (/admin/*) are never tracked',
      enabled: true,
    },
    {
      key: 'throttleClicks',
      label: 'Throttle Click Tracking',
      description: 'Built-in: clicks are throttled to 1 per 500ms to reduce noise',
      enabled: true,
    },
  ]);

  quickStats = signal([
    { label: 'Total Sessions', value: '--' },
    { label: 'Active Now', value: '--' },
    { label: 'Page Views', value: '--' },
    { label: 'Top Pages', value: '--' },
  ]);

  trackedPages = signal<{ url: string; active: boolean }[]>([]);

  installationChecks = signal([
    { label: 'VisitorTrackingService injected in App root', passed: true },
    { label: 'Click tracking enabled', passed: true },
    { label: 'Auth interceptor skips tracking endpoints', passed: true },
    { label: 'Backend tracking routes accessible', passed: true },
    { label: 'Session replay (rrweb) integration', passed: false },
  ]);

  // Standalone script tag for non-Angular pages
  standaloneScriptTag = computed(() => {
    return `<script src="${environment.apiUrl}/website-analytics/tracking/script" async></script>`;
  });

  ngOnInit(): void {
    // Intentionally left empty — stats are loaded in the dashboard
  }

  copyToClipboard(text: string, label: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied!',
        detail: `${label} copied to clipboard`,
      });
    });
  }

  verifyInstallation(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Verifying...',
      detail: 'Checking tracking service status',
    });

    // Check if the tracking endpoint is reachable
    fetch(`${this.trackingEndpointUrl}/script`, { method: 'GET' })
      .then((res) => {
        if (res.ok) {
          this.messageService.add({
            severity: 'success',
            summary: 'Verification Complete',
            detail: 'Backend tracking endpoints are reachable',
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Backend returned status ' + res.status,
          });
        }
      })
      .catch(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not reach backend tracking endpoint. Is the server running?',
        });
      });
  }
}
