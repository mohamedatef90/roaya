import { Component, OnInit, signal, DestroyRef, inject, OnDestroy, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

// shadcn-style UI Components
import {
  CardComponent,
  CardHeaderComponent,
  CardContentComponent,
  TagComponent,
  SpinnerComponent,
  MultiSelectComponent,
  DatePickerComponent,
  ConfirmDialogComponent,
  TooltipComponent,
  DropdownMenuComponent,
  DropdownMenuItemComponent,
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogContentComponent,
} from '../../../shared/components/ui';
import { ToastService } from '../../../shared/components/ui/feedback/toast/toast.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

// Services
import { LeadService } from '../../../core/services/lead.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import {
  Lead,
  LeadStatus,
  LeadSource,
  LeadPriority,
  LeadQueryParams,
  LEAD_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_PRIORITY_LABELS,
  PaginationMeta,
  DashboardStats,
  AdminUser,
} from '../../../core/interfaces/admin.interface';

// Stats interface for quick stats
interface LeadStats {
  total: number;
  newToday: number;
  qualified: number;
  won: number;
  newThisWeek: number;
  conversionRate: number;
}

/**
 * Leads List Component
 * Displays leads in a data table with filters, search, pagination, bulk actions, and Kanban view
 */
@Component({
  selector: 'app-leads-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    // shadcn-style components
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    TagComponent,
    SpinnerComponent,
    MultiSelectComponent,
    DatePickerComponent,
    ConfirmDialogComponent,
    TooltipComponent,
    DropdownMenuComponent,
    DropdownMenuItemComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogContentComponent,
    ButtonComponent,
  ],
  templateUrl: './leads-list.component.html',
  styleUrls: ['./leads-list.component.scss'],
  host: {
    'style': 'display: block; width: 100%; max-width: 100%; overflow: hidden;'
  }
})
export class LeadsListComponent implements OnInit, OnDestroy {
  // Expose Math and enums for use in template
  Math = Math;
  LeadStatus = LeadStatus;

  leads = signal<Lead[]>([]);
  loading = signal(false);
  totalRecords = signal(0);

  // Quick Stats
  stats = signal<LeadStats>({
    total: 0,
    newToday: 0,
    qualified: 0,
    won: 0,
    newThisWeek: 0,
    conversionRate: 0,
  });

  // View mode: 'table' or 'kanban'
  viewMode = signal<'table' | 'kanban'>('table');

  // Selected leads for bulk actions
  selectedLeads = signal<Set<string>>(new Set());
  selectAll = signal(false);

  // Bulk action dialog
  showBulkStatusDialog = signal(false);
  bulkStatusTarget = signal<LeadStatus | null>(null);

  // Filters
  selectedStatuses: LeadStatus[] = [];
  selectedSources: LeadSource[] = [];
  selectedPriorities: LeadPriority[] = [];
  searchQuery = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  // Filters visibility (collapsible)
  showFilters = signal(true);

  // Dropdown options
  statusOptions = Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({
    label: label as string,
    value,
  }));
  sourceOptions = Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => ({
    label: label as string,
    value,
  }));
  priorityOptions = Object.entries(LEAD_PRIORITY_LABELS).map(([value, label]) => ({
    label: label as string,
    value,
  }));

  // Table state
  currentPage = 1;
  rowsPerPage = 20;
  sortField = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Assign To
  users = signal<AdminUser[]>([]);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  // Search debounce
  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);
  private toastService = inject(ToastService);
  private initialLoadDone = false;

  // Confirm dialog state
  showDeleteConfirm = signal(false);
  leadToDelete = signal<Lead | null>(null);

  // View lead dialog state
  showViewDialog = signal(false);
  leadToView = signal<Lead | null>(null);

  // Computed: leads grouped by status for Kanban view
  leadsByStatus = computed(() => {
    const leads = this.leads();
    const grouped: Record<LeadStatus, Lead[]> = {
      [LeadStatus.NEW]: [],
      [LeadStatus.CONTACTED]: [],
      [LeadStatus.QUALIFIED]: [],
      [LeadStatus.PROPOSAL]: [],
      [LeadStatus.NEGOTIATION]: [],
      [LeadStatus.WON]: [],
      [LeadStatus.LOST]: [],
      [LeadStatus.ARCHIVED]: [],
    };
    leads.forEach(lead => {
      if (grouped[lead.status]) {
        grouped[lead.status].push(lead);
      }
    });
    return grouped;
  });

  // Kanban columns to display (excluding archived)
  kanbanStatuses: LeadStatus[] = [
    LeadStatus.NEW,
    LeadStatus.CONTACTED,
    LeadStatus.QUALIFIED,
    LeadStatus.PROPOSAL,
    LeadStatus.NEGOTIATION,
    LeadStatus.WON,
  ];

  constructor(private leadService: LeadService) {
    // Clean up on destroy
    this.destroyRef.onDestroy(() => {
      this.destroy$.next();
      this.destroy$.complete();
    });
  }

  isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  ngOnInit(): void {
    // Setup search debounce (300ms delay)
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadLeads();
    });

    // Load stats
    this.loadStats();

    // Load users for assignment dropdown (super admin only)
    if (this.authService.isSuperAdmin()) {
      this.loadUsers();
    }

    // Fallback initial load if table lazy event doesn't fire within 500ms
    setTimeout(() => {
      if (!this.initialLoadDone) {
        this.loadLeads();
      }
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Debounced search handler
  onSearchInput(): void {
    this.searchSubject$.next(this.searchQuery);
  }

  // Load quick stats
  loadStats(): void {
    this.leadService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dashboardStats: DashboardStats) => {
          const total = dashboardStats.totalLeads || 0;
          const won = dashboardStats.leadsByStatus?.[LeadStatus.WON] || 0;
          this.stats.set({
            total,
            newToday: dashboardStats.newLeadsToday || 0,
            qualified: dashboardStats.leadsByStatus?.[LeadStatus.QUALIFIED] || 0,
            won,
            newThisWeek: dashboardStats.newLeadsThisWeek || 0,
            conversionRate: total > 0 ? Math.round((won / total) * 100) : 0,
          });
        },
        error: (error) => {
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            return;
          }
          console.error('Error loading stats:', error);
        },
      });
  }

  loadLeads(): void {
    this.loading.set(true);
    this.initialLoadDone = true;

    // Build query params
    const params: LeadQueryParams = {
      page: this.currentPage,
      limit: this.rowsPerPage,
      sortBy: this.sortField,
      sortOrder: this.sortOrder,
    };

    if (this.selectedStatuses.length > 0) {
      params.status = this.selectedStatuses;
    }
    if (this.selectedSources.length > 0) {
      params.source = this.selectedSources;
    }
    if (this.selectedPriorities.length > 0) {
      params.priority = this.selectedPriorities;
    }
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    if (this.dateFrom) {
      params.dateFrom = this.dateFrom.toISOString();
    }
    if (this.dateTo) {
      params.dateTo = this.dateTo.toISOString();
    }

    // Fetch leads with proper cleanup
    this.leadService.getLeads(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Add null checks for response data
          this.leads.set(response?.leads || []);
          this.totalRecords.set(response?.meta?.total || 0);
          this.loading.set(false);
          // Clear selections when data changes
          this.selectedLeads.set(new Set());
          this.selectAll.set(false);
        },
        error: (error) => {
          // Ignore AbortError (happens during page refresh/navigation)
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            return;
          }
          console.error('Error loading leads:', error);
          // Reset to safe defaults on error
          this.leads.set([]);
          this.totalRecords.set(0);
          this.toastService.error('Failed to load leads', 'Error');
          this.loading.set(false);
        },
      });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadLeads();
  }

  clearFilters(): void {
    this.selectedStatuses = [];
    this.selectedSources = [];
    this.selectedPriorities = [];
    this.searchQuery = '';
    this.dateFrom = null;
    this.dateTo = null;
    this.currentPage = 1;
    this.loadLeads();
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchQuery) count++;
    if (this.selectedStatuses.length > 0) count++;
    if (this.selectedSources.length > 0) count++;
    if (this.selectedPriorities.length > 0) count++;
    if (this.dateFrom) count++;
    if (this.dateTo) count++;
    return count;
  }

  // Toggle filters visibility
  toggleFilters(): void {
    this.showFilters.update(v => !v);
  }

  // ============================================================================
  // VIEW MODE
  // ============================================================================

  setViewMode(mode: 'table' | 'kanban'): void {
    this.viewMode.set(mode);
    // For Kanban, load more leads to show in columns
    if (mode === 'kanban') {
      this.rowsPerPage = 100;
      this.loadLeads();
    } else {
      this.rowsPerPage = 20;
    }
  }

  // ============================================================================
  // BULK SELECTION
  // ============================================================================

  toggleSelectAll(): void {
    const current = this.selectAll();
    this.selectAll.set(!current);
    if (!current) {
      // Select all visible leads
      const allIds = new Set(this.leads().map(l => l.id));
      this.selectedLeads.set(allIds);
    } else {
      // Deselect all
      this.selectedLeads.set(new Set());
    }
  }

  toggleLeadSelection(leadId: string): void {
    const selected = new Set(this.selectedLeads());
    if (selected.has(leadId)) {
      selected.delete(leadId);
    } else {
      selected.add(leadId);
    }
    this.selectedLeads.set(selected);
    // Update selectAll state
    this.selectAll.set(selected.size === this.leads().length && this.leads().length > 0);
  }

  isLeadSelected(leadId: string): boolean {
    return this.selectedLeads().has(leadId);
  }

  getSelectedCount(): number {
    return this.selectedLeads().size;
  }

  clearSelection(): void {
    this.selectedLeads.set(new Set());
    this.selectAll.set(false);
  }

  // ============================================================================
  // BULK ACTIONS
  // ============================================================================

  openBulkStatusDialog(status: LeadStatus): void {
    this.bulkStatusTarget.set(status);
    this.showBulkStatusDialog.set(true);
  }

  confirmBulkStatusChange(): void {
    const status = this.bulkStatusTarget();
    const selected = Array.from(this.selectedLeads());
    if (!status || selected.length === 0) return;

    // Update each selected lead
    let completed = 0;
    let errors = 0;

    selected.forEach(leadId => {
      this.leadService.updateLead(leadId, { status })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            completed++;
            if (completed + errors === selected.length) {
              this.finishBulkUpdate(completed, errors);
            }
          },
          error: () => {
            errors++;
            if (completed + errors === selected.length) {
              this.finishBulkUpdate(completed, errors);
            }
          },
        });
    });
  }

  private finishBulkUpdate(completed: number, errors: number): void {
    if (errors === 0) {
      this.toastService.success(`Successfully updated ${completed} leads`, 'Success');
    } else {
      this.toastService.warning(`Updated ${completed} leads, ${errors} failed`, 'Warning');
    }
    this.showBulkStatusDialog.set(false);
    this.bulkStatusTarget.set(null);
    this.clearSelection();
    this.loadLeads();
    this.loadStats();
  }

  cancelBulkStatusChange(): void {
    this.showBulkStatusDialog.set(false);
    this.bulkStatusTarget.set(null);
  }

  bulkDelete(): void {
    // Show confirmation for bulk delete
    if (this.selectedLeads().size === 0) return;
    // Use the existing delete confirm with special message
    this.leadToDelete.set(null); // null indicates bulk delete
    this.showDeleteConfirm.set(true);
  }

  // ============================================================================
  // QUICK STATUS CHANGE
  // ============================================================================

  quickStatusChange(lead: Lead, newStatus: LeadStatus): void {
    if (lead.status === newStatus) return;

    this.leadService.updateLead(lead.id, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success(`Status updated to ${LEAD_STATUS_LABELS[newStatus]}`, 'Success');
          // Update locally for instant feedback
          const updatedLeads = this.leads().map(l =>
            l.id === lead.id ? { ...l, status: newStatus } : l
          );
          this.leads.set(updatedLeads);
          this.loadStats();
        },
        error: (error) => {
          console.error('Error updating status:', error);
          this.toastService.error('Failed to update status', 'Error');
        },
      });
  }

  // ============================================================================
  // ASSIGNMENT
  // ============================================================================

  private loadUsers(): void {
    this.userService.getUsers({ isActive: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => this.users.set(users),
        error: () => {},
      });
  }

  assignLead(lead: Lead, userId: string): void {
    const assignedToId = userId || null;
    this.leadService.updateLead(lead.id, { assignedToId } as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const assignedUser = userId ? this.users().find(u => u.id === userId) : undefined;
          const updatedLeads = this.leads().map(l =>
            l.id === lead.id
              ? { ...l, assignedToId: assignedToId ?? undefined, assignedTo: assignedUser }
              : l
          );
          this.leads.set(updatedLeads);
          this.toastService.success(
            assignedUser
              ? `Lead assigned to ${assignedUser.firstName} ${assignedUser.lastName}`
              : 'Lead unassigned',
            'Success'
          );
        },
        error: (error) => {
          console.error('Error assigning lead:', error);
          this.toastService.error('Failed to assign lead', 'Error');
        },
      });
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  exportLeads(format: 'csv' | 'excel'): void {
    const leads = this.leads();
    if (leads.length === 0) {
      this.toastService.warning('No leads to export', 'Warning');
      return;
    }

    // Determine which leads to export (selected or all)
    const selectedIds = this.selectedLeads();
    const leadsToExport = selectedIds.size > 0
      ? leads.filter(l => selectedIds.has(l.id))
      : leads;

    if (format === 'csv') {
      this.exportToCsv(leadsToExport);
    } else {
      this.exportToExcel(leadsToExport);
    }
  }

  private exportToCsv(leads: Lead[]): void {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Priority', 'Source', 'Created At'];
    const rows = leads.map(lead => [
      `${lead.firstName} ${lead.lastName}`,
      lead.email,
      lead.phone || '',
      lead.company || '',
      LEAD_STATUS_LABELS[lead.status],
      LEAD_PRIORITY_LABELS[lead.priority],
      LEAD_SOURCE_LABELS[lead.source],
      new Date(lead.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    this.downloadFile(csvContent, 'leads-export.csv', 'text/csv');
    this.toastService.success(`Exported ${leads.length} leads to CSV`, 'Success');
  }

  private exportToExcel(leads: Lead[]): void {
    // For Excel, we'll create a simple CSV that Excel can open
    // In a production app, you'd use a library like xlsx
    this.exportToCsv(leads);
    this.toastService.info('Excel export created as CSV (compatible with Excel)', 'Info');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // ============================================================================
  // VIEW LEAD DETAILS
  // ============================================================================

  viewLead(lead: Lead): void {
    this.leadToView.set(lead);
    this.showViewDialog.set(true);
  }

  closeViewDialog(): void {
    this.showViewDialog.set(false);
    this.leadToView.set(null);
  }

  /**
   * Get formatted form data entries for display
   */
  getFormDataEntries(lead: Lead): { key: string; value: string }[] {
    if (!lead.formData) return [];
    return Object.entries(lead.formData).map(([key, value]) => ({
      key: this.formatFormDataKey(key),
      value: this.formatFormDataValue(value),
    }));
  }

  /**
   * Format form data key for display
   */
  private formatFormDataKey(key: string): string {
    // Convert camelCase or snake_case to Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Format form data value for display
   */
  private formatFormDataValue(value: any): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  // ============================================================================
  // DELETE
  // ============================================================================

  deleteLead(lead: Lead): void {
    this.leadToDelete.set(lead);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const lead = this.leadToDelete();

    // Check if this is a bulk delete (lead is null)
    if (!lead) {
      this.confirmBulkDelete();
      return;
    }

    this.leadService.deleteLead(lead.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Lead deleted successfully', 'Success');
          this.loadLeads();
          this.loadStats();
          this.showDeleteConfirm.set(false);
          this.leadToDelete.set(null);
        },
        error: (error) => {
          // Ignore AbortError (happens during page refresh/navigation)
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            return;
          }
          console.error('Error deleting lead:', error);
          this.toastService.error('Failed to delete lead', 'Error');
          this.showDeleteConfirm.set(false);
          this.leadToDelete.set(null);
        },
      });
  }

  private confirmBulkDelete(): void {
    const selected = Array.from(this.selectedLeads());
    let completed = 0;
    let errors = 0;

    selected.forEach(leadId => {
      this.leadService.deleteLead(leadId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            completed++;
            if (completed + errors === selected.length) {
              if (errors === 0) {
                this.toastService.success(`Deleted ${completed} leads`, 'Success');
              } else {
                this.toastService.warning(`Deleted ${completed} leads, ${errors} failed`, 'Warning');
              }
              this.showDeleteConfirm.set(false);
              this.clearSelection();
              this.loadLeads();
              this.loadStats();
            }
          },
          error: () => {
            errors++;
            if (completed + errors === selected.length) {
              this.toastService.warning(`Deleted ${completed} leads, ${errors} failed`, 'Warning');
              this.showDeleteConfirm.set(false);
              this.clearSelection();
              this.loadLeads();
              this.loadStats();
            }
          },
        });
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.leadToDelete.set(null);
  }

  getDeleteConfirmMessage(): string {
    const lead = this.leadToDelete();
    if (lead) {
      return `Are you sure you want to delete ${lead.firstName} ${lead.lastName}? This action cannot be undone.`;
    }
    // Bulk delete
    return `Are you sure you want to delete ${this.selectedLeads().size} selected leads? This action cannot be undone.`;
  }

  /**
   * TrackBy function for leads ngFor
   */
  trackByLeadId(index: number, lead: Lead): string {
    return lead.id;
  }

  /**
   * Navigate to a specific page
   */
  goToPage(page: number): void {
    const totalPages = Math.ceil(this.totalRecords() / this.rowsPerPage);
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
    this.loadLeads();
  }

  // Get status color for Kanban columns
  getStatusColor(status: LeadStatus): string {
    const colors: Record<LeadStatus, string> = {
      [LeadStatus.NEW]: '#3B82F6',
      [LeadStatus.CONTACTED]: '#F59E0B',
      [LeadStatus.QUALIFIED]: '#10B981',
      [LeadStatus.PROPOSAL]: '#8B5CF6',
      [LeadStatus.NEGOTIATION]: '#EC4899',
      [LeadStatus.WON]: '#059669',
      [LeadStatus.LOST]: '#EF4444',
      [LeadStatus.ARCHIVED]: '#6B7280',
    };
    return colors[status] || '#6B7280';
  }

  getStatusSeverity(
    status: LeadStatus
  ): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const severityMap: Record<
      LeadStatus,
      'success' | 'info' | 'warning' | 'danger' | 'secondary'
    > = {
      [LeadStatus.NEW]: 'info',
      [LeadStatus.CONTACTED]: 'warning',
      [LeadStatus.QUALIFIED]: 'success',
      [LeadStatus.PROPOSAL]: 'warning',
      [LeadStatus.NEGOTIATION]: 'warning',
      [LeadStatus.WON]: 'success',
      [LeadStatus.LOST]: 'danger',
      [LeadStatus.ARCHIVED]: 'secondary',
    };
    return severityMap[status] || 'info';
  }

  getPrioritySeverity(
    priority: LeadPriority
  ): 'success' | 'info' | 'warning' | 'danger' {
    const severityMap: Record<LeadPriority, 'success' | 'info' | 'warning' | 'danger'> =
      {
        [LeadPriority.LOW]: 'info',
        [LeadPriority.MEDIUM]: 'warning',
        [LeadPriority.HIGH]: 'warning',
        [LeadPriority.URGENT]: 'danger',
      };
    return severityMap[priority] || 'info';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getInitials(firstName: string, lastName: string): string {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  truncateMessage(message: string, maxLength: number = 50): string {
    if (!message) return '-';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  }

  getStatusLabel(status: LeadStatus): string {
    return LEAD_STATUS_LABELS[status] || status;
  }

  getSourceLabel(source: LeadSource): string {
    return LEAD_SOURCE_LABELS[source] || source;
  }

  getPriorityLabel(priority: LeadPriority): string {
    return LEAD_PRIORITY_LABELS[priority] || priority;
  }

  getStatusIcon(status: LeadStatus): string {
    const iconMap: Record<LeadStatus, string> = {
      [LeadStatus.NEW]: 'pi-star',
      [LeadStatus.CONTACTED]: 'pi-phone',
      [LeadStatus.QUALIFIED]: 'pi-check-circle',
      [LeadStatus.PROPOSAL]: 'pi-file',
      [LeadStatus.NEGOTIATION]: 'pi-comments',
      [LeadStatus.WON]: 'pi-trophy',
      [LeadStatus.LOST]: 'pi-times-circle',
      [LeadStatus.ARCHIVED]: 'pi-inbox',
    };
    return iconMap[status] || 'pi-circle';
  }

  getSourceIcon(source: LeadSource): string {
    const iconMap: Record<LeadSource, string> = {
      [LeadSource.CONTACT_FORM]: 'pi-envelope',
      [LeadSource.PRICING_PAGE]: 'pi-dollar',
      [LeadSource.ROI_CALCULATOR]: 'pi-calculator',
      [LeadSource.NEWSLETTER]: 'pi-inbox',
      [LeadSource.REFERRAL]: 'pi-users',
      [LeadSource.LINKEDIN]: 'pi-linkedin',
      [LeadSource.GOOGLE_ADS]: 'pi-google',
      [LeadSource.ORGANIC]: 'pi-globe',
      [LeadSource.OTHER]: 'pi-question-circle',
    };
    return iconMap[source] || 'pi-circle';
  }

  getPriorityIcon(priority: LeadPriority): string {
    const iconMap: Record<LeadPriority, string> = {
      [LeadPriority.LOW]: 'pi-arrow-down',
      [LeadPriority.MEDIUM]: 'pi-minus',
      [LeadPriority.HIGH]: 'pi-arrow-up',
      [LeadPriority.URGENT]: 'pi-exclamation-triangle',
    };
    return iconMap[priority] || 'pi-circle';
  }

  // ============================================================================
  // XSS SANITIZATION METHODS
  // ============================================================================

  /**
   * Sanitize text to prevent XSS attacks
   * Strips all HTML tags and entities from user-generated content
   */
  sanitizeText(text: string | null | undefined): string {
    if (!text) return '';
    // Create a temporary element to decode HTML entities and strip tags
    const div = document.createElement('div');
    div.textContent = text; // This escapes HTML
    return div.textContent || '';
  }

  /**
   * Get sanitized full name
   */
  getSafeName(lead: Lead): string {
    const firstName = this.sanitizeText(lead.firstName);
    const lastName = this.sanitizeText(lead.lastName);
    return `${firstName} ${lastName}`.trim() || 'Unknown';
  }

  /**
   * Get sanitized email
   */
  getSafeEmail(lead: Lead): string {
    return this.sanitizeText(lead.email);
  }

  /**
   * Get sanitized company name
   */
  getSafeCompany(lead: Lead): string {
    return this.sanitizeText(lead.company) || '-';
  }

  /**
   * Get sanitized phone
   */
  getSafePhone(lead: Lead): string {
    return this.sanitizeText(lead.phone) || '-';
  }

  /**
   * Get sanitized message (truncated and safe)
   */
  getSafeMessage(lead: Lead, maxLength: number = 50): string {
    const safeMessage = this.sanitizeText(lead.message);
    if (!safeMessage) return '-';
    return safeMessage.length > maxLength
      ? safeMessage.substring(0, maxLength) + '...'
      : safeMessage;
  }

  /**
   * Get safe initials from sanitized name
   */
  getSafeInitials(lead: Lead): string {
    const firstName = this.sanitizeText(lead.firstName);
    const lastName = this.sanitizeText(lead.lastName);
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }
}
