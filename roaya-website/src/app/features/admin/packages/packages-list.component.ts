import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// shadcn-style UI Components
import {
  TagComponent,
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogContentComponent,
  DialogFooterComponent,
  ConfirmDialogComponent,
  LabelComponent,
  SpinnerComponent,
  SelectComponent,
  SelectOption,
} from '../../../shared/components/ui';
import { ToastService } from '../../../shared/components/ui/feedback/toast/toast.service';

// Services
import {
  ContentAdminService,
  ServicePackage,
  PackageType,
} from '../../../core/services/content-admin.service';

@Component({
  selector: 'app-packages-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    // shadcn components
    TagComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    DialogFooterComponent,
    ConfirmDialogComponent,
    LabelComponent,
    SpinnerComponent,
    SelectComponent,
  ],
  template: `
    <div class="packages-page p-6">
      <!-- Page Header -->
      <div class="mb-6 pb-6 border-b border-edge-subtle">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="flex items-center gap-3 text-2xl font-bold text-content-primary">
              <svg class="h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m7.5 4.27 9 5.15"/>
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="m3.3 7 8.7 5 8.7-5"/>
                <path d="M12 22V12"/>
              </svg>
              {{ 'Service Packages' | translate }}
            </h1>
            <p class="text-sm text-content-muted mt-1">
              {{ 'Manage pricing packages and service tiers' | translate }}
            </p>
          </div>
          <button
            (click)="openCreateDialog()"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            New Package
          </button>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16">
          <ui-spinner size="lg" variant="default"></ui-spinner>
          <p class="mt-4 text-sm text-content-muted">Loading packages...</p>
        </div>
      } @else {
        <!-- Packages Grid -->
        @if (packages().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            @for (pkg of packages(); track pkg.id; let i = $index) {
              <div
                class="group relative rounded-xl border bg-surface-elevated overflow-hidden transition-all hover:shadow-lg"
                [class.border-primary-400]="pkg.isFeatured"
                [class.ring-2]="pkg.isFeatured"
                [class.ring-primary-400/20]="pkg.isFeatured"
                [class.border-neutral-200]="!pkg.isFeatured"
                [class.dark:border-primary-600]="pkg.isFeatured"
                [class.dark:border-neutral-800]="!pkg.isFeatured"
                [class.opacity-60]="!pkg.isActive"
              >
                <!-- Badge (if any) -->
                @if (pkg.badge) {
                  <div
                    class="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold text-white rounded-b-lg"
                    [style.background-color]="pkg.badgeColor || '#3D5A80'"
                  >
                    {{ pkg.badge }}
                  </div>
                }

                <div class="p-6" [class.pt-10]="pkg.badge">
                  <!-- Header -->
                  <div class="flex items-start justify-between mb-4">
                    <div>
                      <h3 class="text-lg font-semibold text-content-primary">
                        {{ pkg.nameEn }}
                      </h3>
                      <p class="text-sm text-content-muted" dir="rtl">
                        {{ pkg.nameAr }}
                      </p>
                    </div>
                    <ui-tag
                      [variant]="pkg.isActive ? 'success' : 'danger'"
                      size="sm"
                    >
                      {{ pkg.isActive ? 'Active' : 'Inactive' }}
                    </ui-tag>
                  </div>

                  <!-- Pricing -->
                  <div class="mb-6">
                    @if (pkg.type === 'CUSTOM') {
                      <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        Custom Pricing
                      </div>
                      <p class="text-sm text-content-muted">Contact for quote</p>
                    } @else {
                      @if (pkg.priceMonthly) {
                        <div class="text-3xl font-bold text-content-primary">
                          {{ formatCurrency(pkg.priceMonthly, pkg.currency) }}
                          <span class="text-sm font-normal text-content-muted">/month</span>
                        </div>
                      }
                      @if (pkg.priceYearly) {
                        <p class="text-sm text-content-muted">
                          or {{ formatCurrency(pkg.priceYearly, pkg.currency) }}/year
                        </p>
                      }
                    }
                  </div>

                  <!-- Features Preview -->
                  @if (getFeatures(pkg).length > 0) {
                    <div class="mb-6">
                      <p class="text-sm font-medium text-content-secondary mb-2">Features:</p>
                      <ul class="space-y-2">
                        @for (feature of getFeatures(pkg); track feature) {
                          <li class="flex items-start gap-2 text-sm text-content-secondary">
                            <svg class="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            <span>{{ feature }}</span>
                          </li>
                        }
                        @if ((pkg.featuresEn?.length || 0) > 3) {
                          <li class="text-sm text-primary-600 dark:text-primary-400">
                            +{{ (pkg.featuresEn?.length || 0) - 3 }} more features
                          </li>
                        }
                      </ul>
                    </div>
                  }

                  <!-- Actions -->
                  <div class="flex items-center justify-between pt-4 border-t border-edge-subtle">
                    <div class="flex items-center gap-2 text-sm text-content-muted">
                      <span>Order: {{ pkg.order }}</span>
                      @if (pkg.isFeatured) {
                        <span class="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400">
                          <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          Featured
                        </span>
                      }
                    </div>
                    <div class="flex items-center gap-1">
                      <button
                        (click)="moveUp(i)"
                        [disabled]="i === 0"
                        class="action-btn"
                        title="Move Up"
                      >
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m18 15-6-6-6 6"/>
                        </svg>
                      </button>
                      <button
                        (click)="moveDown(i)"
                        [disabled]="i === packages().length - 1"
                        class="action-btn"
                        title="Move Down"
                      >
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </button>
                      <button
                        (click)="openEditDialog(pkg)"
                        class="action-btn action-btn-edit"
                        title="Edit"
                      >
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                          <path d="m15 5 4 4"/>
                        </svg>
                      </button>
                      <button
                        (click)="confirmDelete(pkg)"
                        class="action-btn action-btn-delete"
                        title="Delete"
                      >
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-20 h-20 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
              <svg class="h-10 w-10 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m7.5 4.27 9 5.15"/>
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="m3.3 7 8.7 5 8.7-5"/>
                <path d="M12 22V12"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-content-primary mb-2">
              No Packages
            </h3>
            <p class="text-sm text-content-muted mb-6 max-w-sm">
              Create your first service package to display pricing options to your customers.
            </p>
            <button
              (click)="openCreateDialog()"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 border-edge-subtle text-content-secondary hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              Create First Package
            </button>
          </div>
        }
      }
    </div>

    <!-- Create/Edit Dialog -->
    <ui-dialog [open]="showDialog" (openChange)="showDialog = $event" size="lg">
      <ui-dialog-header>
        <ui-dialog-title>
          {{ editingPackage ? 'Edit Package' : 'Create Package' }}
        </ui-dialog-title>
      </ui-dialog-header>

      <ui-dialog-content>
        <form [formGroup]="packageForm" class="space-y-4">
          <!-- Name Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ui-label for="nameEn" [required]="true">Name (English)</ui-label>
              <input
                id="nameEn"
                formControlName="nameEn"
                type="text"
                class="input-field"
                placeholder="Starter Plan"
              />
            </div>
            <div>
              <ui-label for="nameAr" [required]="true">Name (Arabic)</ui-label>
              <input
                id="nameAr"
                formControlName="nameAr"
                type="text"
                class="input-field"
                dir="rtl"
                placeholder="الخطة الأساسية"
              />
            </div>
          </div>

          <!-- Type & Currency -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ui-label for="type">Type</ui-label>
              <ui-select
                formControlName="type"
                [options]="packageTypeOptions"
                placeholder="Select type"
              ></ui-select>
            </div>
            <div>
              <ui-label for="currency">Currency</ui-label>
              <input
                id="currency"
                formControlName="currency"
                type="text"
                class="input-field"
                placeholder="USD"
              />
            </div>
          </div>

          <!-- Pricing -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ui-label for="priceMonthly">Monthly Price</ui-label>
              <input
                id="priceMonthly"
                formControlName="priceMonthly"
                type="number"
                step="0.01"
                min="0"
                class="input-field"
                placeholder="99.00"
              />
            </div>
            <div>
              <ui-label for="priceYearly">Yearly Price</ui-label>
              <input
                id="priceYearly"
                formControlName="priceYearly"
                type="number"
                step="0.01"
                min="0"
                class="input-field"
                placeholder="999.00"
              />
            </div>
          </div>

          <!-- Badge -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ui-label for="badge">Badge Text</ui-label>
              <input
                id="badge"
                formControlName="badge"
                type="text"
                class="input-field"
                placeholder="Most Popular"
              />
            </div>
            <div>
              <ui-label for="badgeColor">Badge Color</ui-label>
              <div class="flex gap-2">
                <input
                  id="badgeColor"
                  formControlName="badgeColor"
                  type="text"
                  class="input-field flex-1"
                  placeholder="#3D5A80"
                />
                <input
                  type="color"
                  [value]="packageForm.get('badgeColor')?.value || '#3D5A80'"
                  (input)="onColorChange($event)"
                  class="h-10 w-10 rounded-lg border border-edge-strong cursor-pointer"
                />
              </div>
            </div>
          </div>

          <!-- Featured Checkbox -->
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              formControlName="isFeatured"
              class="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
            />
            <label for="isFeatured" class="text-sm text-content-secondary">
              Featured Package (highlighted in pricing table)
            </label>
          </div>
        </form>
      </ui-dialog-content>

      <ui-dialog-footer>
        <button
          (click)="closeDialog()"
          class="px-4 py-2 rounded-lg text-sm font-medium border border-edge-strong text-content-secondary hover:bg-surface-hover transition-colors"
        >
          Cancel
        </button>
        <button
          (click)="savePackage()"
          [disabled]="packageForm.invalid || saving()"
          class="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          @if (saving()) {
            <ui-spinner size="sm" variant="white" customClass="mr-2"></ui-spinner>
          }
          {{ editingPackage ? 'Update' : 'Create Package' }}
        </button>
      </ui-dialog-footer>
    </ui-dialog>

    <!-- Confirm Delete Dialog -->
    <ui-confirm-dialog
      [open]="showDeleteConfirm()"
      (openChange)="showDeleteConfirm.set($event)"
      title="Delete Package"
      [message]="deleteConfirmMessage()"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      (confirmed)="deletePackage()"
      (cancelled)="cancelDelete()"
    ></ui-confirm-dialog>
  `,
  styles: [`
    :host {
      display: block;
    }

    .input-field {
      display: flex;
      width: 100%;
      height: 2.5rem;
      border-radius: 0.5rem;
      border: 1px solid rgb(212 212 212);
      background-color: white;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.15s;

      &:focus {
        border-color: var(--color-primary-500, #3D5A80);
        box-shadow: 0 0 0 2px rgba(61, 90, 128, 0.2);
      }

      &::placeholder {
        color: rgb(163 163 163);
      }
    }

    :host-context([data-theme='dark']) .input-field,
    :host-context(.dark) .input-field {
      border-color: rgb(82 82 82);
      background-color: rgb(38 38 38);
      color: rgb(245 245 245);
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: rgb(115 115 115);
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: rgb(245 245 245);
        color: rgb(64 64 64);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    :host-context([data-theme='dark']) .action-btn,
    :host-context(.dark) .action-btn {
      &:hover:not(:disabled) {
        background: rgb(64 64 64);
        color: rgb(229 229 229);
      }
    }

    .action-btn-edit:hover:not(:disabled) {
      background: rgba(61, 90, 128, 0.1);
      color: #3D5A80;
    }

    .action-btn-delete:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  `],
})
export class PackagesListComponent implements OnInit {
  packages = signal<ServicePackage[]>([]);
  loading = signal(true);
  saving = signal(false);

  showDialog = false;
  editingPackage: ServicePackage | null = null;
  packageForm!: FormGroup;

  // Delete confirmation
  showDeleteConfirm = signal(false);
  packageToDelete = signal<ServicePackage | null>(null);

  packageTypeOptions: SelectOption[] = [
    { label: 'Subscription', value: PackageType.SUBSCRIPTION },
    { label: 'One-Time', value: PackageType.ONE_TIME },
    { label: 'Custom', value: PackageType.CUSTOM },
  ];

  private contentService = inject(ContentAdminService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.initForm();
    this.loadPackages();
  }

  private initForm(): void {
    this.packageForm = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      type: [PackageType.SUBSCRIPTION],
      priceMonthly: [null],
      priceYearly: [null],
      currency: ['USD'],
      featuresEn: [[]],
      featuresAr: [[]],
      isFeatured: [false],
      badge: [''],
      badgeColor: [''],
    });
  }

  loadPackages(): void {
    this.loading.set(true);
    this.contentService.getPackages(true).subscribe({
      next: (response) => {
        this.packages.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading packages:', error);
        this.toastService.error('Failed to load packages', 'Error');
        this.loading.set(false);
      },
    });
  }

  openCreateDialog(): void {
    this.editingPackage = null;
    this.packageForm.reset({
      type: PackageType.SUBSCRIPTION,
      currency: 'USD',
      isFeatured: false,
      featuresEn: [],
      featuresAr: [],
    });
    this.showDialog = true;
  }

  openEditDialog(pkg: ServicePackage): void {
    this.editingPackage = pkg;
    this.packageForm.patchValue({
      nameEn: pkg.nameEn,
      nameAr: pkg.nameAr,
      type: pkg.type,
      priceMonthly: pkg.priceMonthly,
      priceYearly: pkg.priceYearly,
      currency: pkg.currency,
      featuresEn: pkg.featuresEn,
      featuresAr: pkg.featuresAr,
      isFeatured: pkg.isFeatured,
      badge: pkg.badge,
      badgeColor: pkg.badgeColor,
    });
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingPackage = null;
  }

  onColorChange(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.packageForm.patchValue({ badgeColor: color });
  }

  savePackage(): void {
    if (this.packageForm.invalid) return;

    this.saving.set(true);
    const data = this.packageForm.value;

    if (this.editingPackage) {
      this.contentService.updatePackage(this.editingPackage.id, data).subscribe({
        next: () => {
          this.toastService.success('Package updated successfully', 'Updated');
          this.closeDialog();
          this.loadPackages();
          this.saving.set(false);
        },
        error: () => {
          this.toastService.error('Failed to update package', 'Error');
          this.saving.set(false);
        },
      });
    } else {
      this.contentService.createPackage(data).subscribe({
        next: () => {
          this.toastService.success('Package created successfully', 'Created');
          this.closeDialog();
          this.loadPackages();
          this.saving.set(false);
        },
        error: () => {
          this.toastService.error('Failed to create package', 'Error');
          this.saving.set(false);
        },
      });
    }
  }

  confirmDelete(pkg: ServicePackage): void {
    this.packageToDelete.set(pkg);
    this.showDeleteConfirm.set(true);
  }

  deleteConfirmMessage(): string {
    const pkg = this.packageToDelete();
    return pkg
      ? `Are you sure you want to delete "${pkg.nameEn}"? This action cannot be undone.`
      : 'Are you sure you want to delete this package?';
  }

  cancelDelete(): void {
    this.packageToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  deletePackage(): void {
    const pkg = this.packageToDelete();
    if (!pkg) return;

    this.showDeleteConfirm.set(false);
    this.contentService.deletePackage(pkg.id).subscribe({
      next: () => {
        this.toastService.success('Package deleted successfully', 'Deleted');
        this.packageToDelete.set(null);
        this.loadPackages();
      },
      error: () => {
        this.toastService.error('Failed to delete package', 'Error');
        this.packageToDelete.set(null);
      },
    });
  }

  moveUp(index: number): void {
    if (index === 0) return;
    const items = [...this.packages()];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    this.updateOrder(items);
  }

  moveDown(index: number): void {
    const items = [...this.packages()];
    if (index === items.length - 1) return;
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    this.updateOrder(items);
  }

  private updateOrder(items: ServicePackage[]): void {
    const orderedIds = items.map((p) => p.id);
    this.contentService.reorderPackages(orderedIds).subscribe({
      next: () => {
        this.packages.set(items);
        this.toastService.success('Package order updated', 'Reordered');
      },
      error: () => {
        this.toastService.error('Failed to reorder packages', 'Error');
      },
    });
  }

  getFeatures(pkg: ServicePackage): string[] {
    const features = pkg.featuresEn || [];
    return Array.isArray(features) ? features.slice(0, 3) : [];
  }

  formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  }
}
