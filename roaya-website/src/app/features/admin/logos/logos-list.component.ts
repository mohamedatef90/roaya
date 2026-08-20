import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { forkJoin } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideGripVertical,
  lucidePencil,
  lucideTrash2,
  lucideEye,
  lucideEyeOff,
  lucideMoon,
  lucideBuilding2,
  lucideUsers,
  lucideUpload,
  lucideX,
  lucideCheck,
  lucideImage,
  lucideAlertCircle,
  lucideArrowUpDown
} from '@ng-icons/lucide';

// Shadcn UI Components
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogDescriptionComponent,
  DialogContentComponent,
  DialogFooterComponent
} from '../../../shared/components/ui/feedback/dialog/dialog.component';
import { TabsComponent } from '../../../shared/components/ui/navigation/tabs/tabs.component';
import { SelectComponent, SelectOption } from '../../../shared/components/ui/form/select/select.component';
import { ToastService } from '../../../shared/components/ui/feedback/toast/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/ui/feedback/confirm-dialog/confirm-dialog.component';
import { SkeletonComponent } from '../../../shared/components/ui/primitives/skeleton/skeleton.component';

// Services
import { LogoService, Logo, LogoCategory } from '../../../core/services/logo.service';

/**
 * Logo Management Component (Shadcn Version)
 * Manages Industry/Sector logos and Client logos for the website
 */
@Component({
  selector: 'app-logos-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    DragDropModule,
    NgIcon,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogContentComponent,
    DialogFooterComponent,
    TabsComponent,
    SelectComponent,
    ConfirmDialogComponent,
    SkeletonComponent
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideGripVertical,
      lucidePencil,
      lucideTrash2,
      lucideEye,
      lucideEyeOff,
      lucideMoon,
      lucideBuilding2,
      lucideUsers,
      lucideUpload,
      lucideX,
      lucideCheck,
      lucideImage,
      lucideAlertCircle,
      lucideArrowUpDown
    })
  ],
  template: `
    <div class="p-6 lg:p-8 min-h-screen">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-700">
        <div>
          <h1 class="text-2xl font-bold bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
            Logo Management
          </h1>
          <p class="text-neutral-500 dark:text-neutral-400 mt-1">
            Manage industry and client logos displayed on your website
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            (click)="openSortDialog()"
            [disabled]="filteredLogos().length < 2"
            class="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ng-icon name="lucideArrowUpDown" size="18"></ng-icon>
            Sort
          </button>
          <button
            (click)="openAddDialog()"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <ng-icon name="lucidePlus" size="18"></ng-icon>
            Add Logo
          </button>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="mb-6">
        <div class="inline-flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1 gap-1">
          <button
            *ngFor="let cat of categoryTabs"
            (click)="selectCategory(cat.id)"
            class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
            [class.bg-white]="selectedCategory() === cat.id"
            [class.dark:bg-neutral-900]="selectedCategory() === cat.id"
            [class.text-primary-600]="selectedCategory() === cat.id"
            [class.dark:text-secondary-400]="selectedCategory() === cat.id"
            [class.shadow-sm]="selectedCategory() === cat.id"
            [class.text-neutral-600]="selectedCategory() !== cat.id"
            [class.dark:text-neutral-400]="selectedCategory() !== cat.id"
          >
            <ng-icon [name]="cat.icon" size="18"></ng-icon>
            {{ cat.label }}
            <span
              class="px-2 py-0.5 text-xs rounded-full"
              [class.bg-primary-100]="selectedCategory() === cat.id"
              [class.dark:bg-primary-900/30]="selectedCategory() === cat.id"
              [class.text-primary-700]="selectedCategory() === cat.id"
              [class.dark:text-secondary-400]="selectedCategory() === cat.id"
              [class.bg-neutral-200]="selectedCategory() !== cat.id"
              [class.dark:bg-neutral-700]="selectedCategory() !== cat.id"
            >
              {{ getLogoCount(cat.id) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="mb-6 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
        <div class="flex items-start gap-3">
          <ng-icon name="lucideAlertCircle" size="20" class="text-primary-600 dark:text-secondary-400 mt-0.5"></ng-icon>
          <div class="text-sm">
            <p class="font-medium text-primary-800 dark:text-primary-200">
              {{ selectedCategory() === 'sector' ? 'Sectors We Serve' : 'Trusted By' }} Section
            </p>
            <p class="text-primary-600 dark:text-primary-300 mt-1">
              {{ selectedCategory() === 'sector'
                ? 'These logos appear in the "Sectors We Serve" section showing ministries, banks, and universities.'
                : 'These logos appear in the "Trusted By" section showcasing your client companies.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <ui-skeleton class="w-full h-20 rounded-lg mb-3"></ui-skeleton>
              <ui-skeleton class="w-3/4 h-4 mb-2"></ui-skeleton>
              <ui-skeleton class="w-1/2 h-3"></ui-skeleton>
            </div>
          }
        </div>
      }

      <!-- Logo Grid -->
      @if (!loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          @for (logo of filteredLogos(); track logo.id) {
            <div
              class="group relative p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-all hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-1"
              [class.opacity-50]="!logo.isActive"
            >
              <!-- Order Badge -->
              <div class="absolute top-2 left-2 w-6 h-6 flex items-center justify-center rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                {{ logo.order }}
              </div>

              <!-- Dark Mode Badge -->
              @if (logo.darkModeLogo) {
                <div
                  class="absolute top-2 right-2 p-1.5 rounded-lg bg-neutral-800 text-white text-xs"
                  title="Has dark mode variant"
                >
                  <ng-icon name="lucideMoon" size="14"></ng-icon>
                </div>
              }

              <!-- Logo Image -->
              <div class="h-20 flex items-center justify-center rounded-xl bg-neutral-50 dark:bg-neutral-900 mb-3 overflow-hidden">
                <img
                  [src]="logo.logo"
                  [alt]="logo.name"
                  [class]="'max-w-[80%] max-h-[80%] object-contain transition-all ' + (logo.scale || '')"
                  [class.grayscale]="!logo.isActive"
                  loading="lazy"
                />
              </div>

              <!-- Logo Info -->
              <div class="mb-3">
                <h4 class="font-medium text-sm text-neutral-900 dark:text-white truncate" [title]="logo.name">
                  {{ logo.name }}
                </h4>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate" [title]="logo.nameAr">
                  {{ logo.nameAr }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  (click)="editLogo(logo)"
                  class="p-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-primary-50 dark:text-neutral-400 dark:hover:text-secondary-400 dark:hover:bg-primary-900/30 transition-colors"
                  title="Edit"
                >
                  <ng-icon name="lucidePencil" size="16"></ng-icon>
                </button>
                <button
                  (click)="toggleActive(logo)"
                  class="p-2 rounded-lg transition-colors"
                  [class.text-green-600]="logo.isActive"
                  [class.hover:bg-green-50]="logo.isActive"
                  [class.dark:hover:bg-green-900/30]="logo.isActive"
                  [class.text-neutral-400]="!logo.isActive"
                  [class.hover:text-green-600]="!logo.isActive"
                  [class.hover:bg-neutral-100]="!logo.isActive"
                  [class.dark:hover:bg-neutral-700]="!logo.isActive"
                  [title]="logo.isActive ? 'Deactivate' : 'Activate'"
                >
                  <ng-icon [name]="logo.isActive ? 'lucideEye' : 'lucideEyeOff'" size="16"></ng-icon>
                </button>
                <button
                  (click)="confirmDelete(logo)"
                  class="p-2 rounded-lg text-neutral-600 hover:text-red-600 hover:bg-red-50 dark:text-neutral-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                  title="Delete"
                >
                  <ng-icon name="lucideTrash2" size="16"></ng-icon>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && filteredLogos().length === 0) {
        <div class="text-center py-16">
          <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <ng-icon name="lucideImage" size="40" class="text-neutral-300 dark:text-neutral-600"></ng-icon>
          </div>
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            No {{ selectedCategory() === 'sector' ? 'industry' : 'client' }} logos yet
          </h3>
          <p class="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
            Add your first {{ selectedCategory() === 'sector' ? 'industry/sector' : 'client' }} logo to display in the
            "{{ selectedCategory() === 'sector' ? 'Sectors We Serve' : 'Trusted By' }}" section of your website.
          </p>
          <button
            (click)="openAddDialog()"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <ng-icon name="lucidePlus" size="18"></ng-icon>
            Add First Logo
          </button>
        </div>
      }
    </div>

    <!-- Add/Edit Logo Dialog -->
    <ui-dialog
      [open]="showDialog()"
      (openChange)="showDialog.set($event)"
      size="md"
      [showCloseButton]="true"
    >
      <ui-dialog-header>
        <ui-dialog-title>{{ isEditing() ? 'Edit Logo' : 'Add New Logo' }}</ui-dialog-title>
        <ui-dialog-description>
          {{ isEditing() ? 'Update the logo details below.' : 'Fill in the details to add a new logo to your website.' }}
        </ui-dialog-description>
      </ui-dialog-header>

      <ui-dialog-content>
        <div class="space-y-5">
          <!-- Name (English) -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Name (English) <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="formData.name"
              placeholder="e.g., Cairo University"
              class="w-full px-4 py-2.5 rounded-xl border-0 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500/50 focus:bg-white dark:focus:bg-neutral-900 transition-all"
            />
          </div>

          <!-- Name (Arabic) -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Name (Arabic) <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="formData.nameAr"
              placeholder="e.g., جامعة القاهرة"
              dir="rtl"
              class="w-full px-4 py-2.5 rounded-xl border-0 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500/50 focus:bg-white dark:focus:bg-neutral-900 transition-all"
            />
          </div>

          <!-- Logo Image URL -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Logo Image <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-3">
              <input
                type="text"
                [(ngModel)]="formData.logo"
                placeholder="/assets/images/logos/..."
                class="flex-1 px-4 py-2.5 rounded-xl border-0 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500/50 focus:bg-white dark:focus:bg-neutral-900 transition-all"
              />
              <label class="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer transition-colors">
                <ng-icon name="lucideUpload" size="18"></ng-icon>
                <input
                  type="file"
                  accept="image/*"
                  (change)="onFileSelect($event, 'logo')"
                  class="hidden"
                />
              </label>
            </div>
            @if (formData.logo) {
              <div class="mt-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
                <img
                  [src]="formData.logo"
                  alt="Preview"
                  class="max-h-16 max-w-full object-contain"
                />
              </div>
            }
          </div>

          <!-- Dark Mode Logo (Optional) -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Dark Mode Variant (Optional)
            </label>
            <div class="flex gap-3">
              <input
                type="text"
                [(ngModel)]="formData.darkModeLogo"
                placeholder="/assets/images/logos/...-dark.png"
                class="flex-1 px-4 py-2.5 rounded-xl border-0 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500/50 focus:bg-white dark:focus:bg-neutral-900 transition-all"
              />
              <label class="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer transition-colors">
                <ng-icon name="lucideUpload" size="18"></ng-icon>
                <input
                  type="file"
                  accept="image/*"
                  (change)="onFileSelect($event, 'darkModeLogo')"
                  class="hidden"
                />
              </label>
            </div>
            @if (formData.darkModeLogo) {
              <div class="mt-3 p-3 rounded-xl bg-neutral-900 flex items-center justify-center">
                <img
                  [src]="formData.darkModeLogo"
                  alt="Dark Preview"
                  class="max-h-16 max-w-full object-contain"
                />
              </div>
            }
          </div>

          <!-- Scale Option -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Display Scale
            </label>
            <ui-select
              [options]="scaleOptions"
              [(ngModel)]="formData.scale"
              placeholder="Normal (default)"
            ></ui-select>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Adjust if the logo appears too small in the grid
            </p>
          </div>

          <!-- Active Toggle -->
          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              (click)="formData.isActive = !formData.isActive"
              class="relative w-11 h-6 rounded-full transition-colors"
              [class.bg-green-500]="formData.isActive"
              [class.bg-neutral-300]="!formData.isActive"
              [class.dark:bg-neutral-600]="!formData.isActive"
            >
              <span
                class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                [class.left-0.5]="!formData.isActive"
                [class.left-5]="formData.isActive"
              ></span>
            </button>
            <span class="text-sm text-neutral-700 dark:text-neutral-300">
              {{ formData.isActive ? 'Active - Visible on website' : 'Inactive - Hidden from website' }}
            </span>
          </div>
        </div>
      </ui-dialog-content>

      <ui-dialog-footer>
        <div class="flex gap-3 justify-end">
          <button
            (click)="closeDialog()"
            class="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            (click)="saveLogo()"
            [disabled]="saving() || !isFormValid()"
            class="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            @if (saving()) {
              <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            } @else {
              <ng-icon name="lucideCheck" size="18"></ng-icon>
            }
            {{ isEditing() ? 'Update' : 'Create' }}
          </button>
        </div>
      </ui-dialog-footer>
    </ui-dialog>

    <!-- Sort / Reorder Dialog -->
    <ui-dialog
      [open]="showSortDialog()"
      (openChange)="showSortDialog.set($event)"
      size="md"
      [showCloseButton]="true"
    >
      <ui-dialog-header>
        <ui-dialog-title>Sort Logos</ui-dialog-title>
        <ui-dialog-description>
          Drag and drop to reorder logos. Click Save when done.
        </ui-dialog-description>
      </ui-dialog-header>

      <ui-dialog-content>
        <div
          cdkDropList
          class="space-y-2"
          (cdkDropListDropped)="onSortDrop($event)"
        >
          @for (logo of sortLogos(); track logo.id; let i = $index) {
            <div
              cdkDrag
              class="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 cursor-move"
            >
              <div cdkDragHandle class="p-1 text-neutral-400 hover:text-primary-500 cursor-grab">
                <ng-icon name="lucideGripVertical" size="18"></ng-icon>
              </div>
              <span class="w-6 h-6 flex items-center justify-center rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold">
                {{ i + 1 }}
              </span>
              <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-white dark:bg-neutral-900 overflow-hidden">
                <img
                  [src]="logo.logo"
                  [alt]="logo.name"
                  class="max-w-[80%] max-h-[80%] object-contain"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-neutral-900 dark:text-white truncate">{{ logo.name }}</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate">{{ logo.nameAr }}</p>
              </div>
              @if (!logo.isActive) {
                <span class="px-2 py-0.5 text-xs rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400">
                  Hidden
                </span>
              }
              <div *cdkDragPlaceholder class="h-16 rounded-xl border-2 border-dashed border-primary-400 bg-primary-50/50 dark:bg-primary-900/20"></div>
            </div>
          }
        </div>
      </ui-dialog-content>

      <ui-dialog-footer>
        <div class="flex gap-3 justify-end">
          <button
            (click)="closeSortDialog()"
            class="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            (click)="saveSortOrder()"
            [disabled]="savingSort()"
            class="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            @if (savingSort()) {
              <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            } @else {
              <ng-icon name="lucideCheck" size="18"></ng-icon>
            }
            Save Order
          </button>
        </div>
      </ui-dialog-footer>
    </ui-dialog>

    <!-- Delete Confirmation Dialog -->
    <ui-confirm-dialog
      [open]="showDeleteConfirm()"
      (openChange)="showDeleteConfirm.set($event)"
      title="Delete Logo"
      [message]="'Are you sure you want to delete \\'' + (logoToDelete()?.name || '') + '\\'? This action cannot be undone.'"
      confirmLabel="Delete"
      variant="destructive"
      (confirmed)="deleteLogo()"
    ></ui-confirm-dialog>
  `,
  styles: [`
    :host {
      display: block;
    }

    .cdk-drag-preview {
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      border-radius: 0.75rem;
      opacity: 0.95;
    }

    .cdk-drag-animating {
      transition: transform 150ms ease;
    }

    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 150ms ease;
    }
  `]
})
export class LogosListComponent implements OnInit {
  private logoService = inject(LogoService);
  private toastService = inject(ToastService);

  // State
  loading = signal(true);
  saving = signal(false);
  selectedCategory = signal<LogoCategory>('sector');
  showDialog = signal(false);
  showDeleteConfirm = signal(false);
  isEditing = signal(false);
  editingId = signal<string | null>(null);
  logoToDelete = signal<Logo | null>(null);

  // Sort dialog state
  showSortDialog = signal(false);
  sortLogos = signal<Logo[]>([]);
  savingSort = signal(false);

  // Form data
  formData: Partial<Logo> = this.getEmptyForm();

  // Category tabs config
  categoryTabs = [
    { id: 'sector' as LogoCategory, label: 'Industry / Sectors', icon: 'lucideBuilding2' },
    { id: 'client' as LogoCategory, label: 'Clients', icon: 'lucideUsers' }
  ];

  // Scale options for select
  scaleOptions: SelectOption[] = [
    { label: 'Normal', value: '' },
    { label: 'Large (1.25x)', value: 'scale-125' },
    { label: 'Extra Large (1.5x)', value: 'scale-150' }
  ];

  // Computed logos based on selected category
  sectorLogos = signal<Logo[]>([]);
  clientLogos = signal<Logo[]>([]);

  filteredLogos = computed(() => {
    const logos = this.selectedCategory() === 'sector' ? this.sectorLogos() : this.clientLogos();
    return logos.sort((a, b) => a.order - b.order);
  });

  ngOnInit(): void {
    this.loadLogos();

    // Subscribe to logo updates
    this.logoService.sectorLogos$.subscribe(logos => this.sectorLogos.set(logos));
    this.logoService.clientLogos$.subscribe(logos => this.clientLogos.set(logos));
  }

  private loadLogos(): void {
    this.loading.set(true);

    forkJoin([
      this.logoService.getLogos('sector'),
      this.logoService.getLogos('client')
    ]).subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.toastService.error('Error', 'Failed to load logos from server');
      }
    });
  }

  selectCategory(category: LogoCategory): void {
    this.selectedCategory.set(category);
  }

  getLogoCount(category: LogoCategory): number {
    return category === 'sector' ? this.sectorLogos().length : this.clientLogos().length;
  }

  openAddDialog(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.formData = this.getEmptyForm();
    this.showDialog.set(true);
  }

  editLogo(logo: Logo): void {
    this.isEditing.set(true);
    this.editingId.set(logo.id);
    this.formData = { ...logo };
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.formData = this.getEmptyForm();
  }

  toggleActive(logo: Logo): void {
    this.logoService.toggleActive(this.selectedCategory(), logo.id).subscribe({
      next: (updatedLogo) => {
        this.toastService.success(
          updatedLogo.isActive ? 'Logo activated' : 'Logo deactivated',
          `${logo.name} is now ${updatedLogo.isActive ? 'visible on' : 'hidden from'} the website`
        );
      },
      error: () => {
        this.toastService.error('Error', 'Failed to update logo status');
      }
    });
  }

  confirmDelete(logo: Logo): void {
    this.logoToDelete.set(logo);
    this.showDeleteConfirm.set(true);
  }

  deleteLogo(): void {
    const logo = this.logoToDelete();
    if (!logo) return;

    this.logoService.deleteLogo(this.selectedCategory(), logo.id).subscribe({
      next: () => {
        this.toastService.success('Logo deleted', `${logo.name} has been removed`);
        this.showDeleteConfirm.set(false);
        this.logoToDelete.set(null);
      },
      error: () => {
        this.toastService.error('Error', 'Failed to delete logo');
      }
    });
  }

  // ── Sort Dialog Methods ──────────────────────────────────────────

  openSortDialog(): void {
    const logos = [...this.filteredLogos()];
    this.sortLogos.set(logos);
    this.showSortDialog.set(true);
  }

  closeSortDialog(): void {
    this.showSortDialog.set(false);
    this.sortLogos.set([]);
  }

  onSortDrop(event: CdkDragDrop<Logo[]>): void {
    const logos = [...this.sortLogos()];
    moveItemInArray(logos, event.previousIndex, event.currentIndex);
    logos.forEach((logo, index) => {
      logo.order = index + 1;
    });
    this.sortLogos.set(logos);
  }

  saveSortOrder(): void {
    this.savingSort.set(true);
    const logos = this.sortLogos();
    const logoIds = logos.map(l => l.id);

    this.logoService.updateOrder(this.selectedCategory(), logoIds).subscribe({
      next: () => {
        // Update local state with new order
        if (this.selectedCategory() === 'sector') {
          this.sectorLogos.set(logos);
        } else {
          this.clientLogos.set(logos);
        }
        this.savingSort.set(false);
        this.showSortDialog.set(false);
        this.toastService.success('Order saved', 'Logo display order has been updated');
      },
      error: () => {
        this.savingSort.set(false);
        this.toastService.error('Error', 'Failed to save logo order');
      }
    });
  }

  onFileSelect(event: Event, field: 'logo' | 'darkModeLogo'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      // For demo: Convert to base64 data URL
      // In production: Upload to server and get URL
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.formData[field] = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  isFormValid(): boolean {
    return !!(this.formData.name && this.formData.nameAr && this.formData.logo);
  }

  saveLogo(): void {
    if (!this.isFormValid()) {
      this.toastService.error('Validation Error', 'Please fill in all required fields');
      return;
    }

    this.saving.set(true);

    const category = this.selectedCategory();

    if (this.isEditing() && this.editingId()) {
      this.logoService.updateLogo(category, this.editingId()!, this.formData).subscribe({
        next: () => {
          this.toastService.success('Logo updated', `${this.formData.name} has been updated`);
          this.saving.set(false);
          this.closeDialog();
        },
        error: () => {
          this.toastService.error('Error', 'Failed to update logo');
          this.saving.set(false);
        }
      });
    } else {
      const newLogo = {
        ...this.formData,
        order: this.filteredLogos().length + 1
      } as Omit<Logo, 'id' | 'createdAt' | 'updatedAt'>;

      this.logoService.createLogo(category, newLogo).subscribe({
        next: () => {
          this.toastService.success('Logo created', `${this.formData.name} has been added`);
          this.saving.set(false);
          this.closeDialog();
        },
        error: () => {
          this.toastService.error('Error', 'Failed to create logo');
          this.saving.set(false);
        }
      });
    }
  }

  private getEmptyForm(): Partial<Logo> {
    return {
      name: '',
      nameAr: '',
      logo: '',
      darkModeLogo: '',
      scale: '',
      isActive: true
    };
  }
}
