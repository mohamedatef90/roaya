import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  Lead,
  LeadActivity,
  LeadNote,
  LeadQueryParams,
  DashboardStats,
  UpdateLeadDto,
  CreateNoteDto,
  UpdateNoteDto,
  AddTagToLeadDto,
  CreateActivityDto,
  ActivityQueryParams,
  PaginationMeta,
  LeadStatus,
  LeadSource,
  LeadPriority,
} from '../interfaces/admin.interface';

/**
 * Lead Service
 * Handles all lead-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private readonly API_URL = `${environment.apiUrl}/leads`;
  private readonly USE_MOCK_DATA = false;

  constructor(private http: HttpClient) {}

  /**
   * Generate mock leads for development
   */
  private getMockLeads(): Lead[] {
    return [
      {
        id: '1',
        firstName: 'Ahmed',
        lastName: 'Hassan',
        email: 'ahmed.hassan@techcorp.com',
        phone: '+20 100 123 4567',
        company: 'TechCorp Egypt',
        jobTitle: 'IT Director',
        website: 'https://techcorp-eg.com',
        message: 'Interested in cybersecurity solutions for banking operations. We have around 500 employees and need comprehensive security audit and implementation.',
        status: LeadStatus.NEW,
        source: LeadSource.CONTACT_FORM,
        priority: LeadPriority.HIGH,
        estimatedValue: 75000,
        formData: {
          companySize: '250-500 employees',
          industry: 'Banking & Finance',
          budget: '$50,000 - $100,000',
          timeline: 'Q2 2026',
          servicesInterested: ['Cybersecurity Audit', 'SOC Setup', 'Employee Training'],
          howDidYouHear: 'Google Search',
          preferredContactMethod: 'Email',
        },
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'cybersecurity-2026',
        ipAddress: '196.219.xxx.xxx',
        referrer: 'https://www.google.com/search?q=cybersecurity+egypt',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        tags: [{ id: '1', name: 'Enterprise', color: '#3b82f6', createdAt: new Date().toISOString() }],
        notes: [],
        activities: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        firstName: 'Sara',
        lastName: 'Mohamed',
        email: 'sara.m@innovate.sa',
        phone: '+966 50 987 6543',
        company: 'Innovate Solutions',
        jobTitle: 'CTO',
        message: 'Looking for cloud migration services. Budget approved for Q2. We need to migrate 15 legacy applications to AWS.',
        status: LeadStatus.CONTACTED,
        source: LeadSource.REFERRAL,
        priority: LeadPriority.HIGH,
        estimatedValue: 120000,
        formData: {
          companySize: '100-250 employees',
          industry: 'Technology',
          currentInfrastructure: 'On-premises servers',
          targetCloud: 'AWS',
          applicationsToMigrate: 15,
          urgency: 'High - Lease ending Q3',
          referredBy: 'Khalid from ABC Corp',
        },
        tags: [{ id: '2', name: 'Cloud', color: '#10b981', createdAt: new Date().toISOString() }],
        notes: [],
        activities: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: '3',
        firstName: 'Omar',
        lastName: 'Al-Rashid',
        email: 'omar@petrogas.ae',
        phone: '+971 55 111 2222',
        company: 'PetroGas Industries',
        jobTitle: 'VP of Operations',
        website: 'https://petrogas.ae',
        message: 'Enterprise SAP integration project. Need to connect SAP S/4HANA with existing legacy systems.',
        status: LeadStatus.QUALIFIED,
        source: LeadSource.LINKEDIN,
        priority: LeadPriority.HIGH,
        estimatedValue: 250000,
        formData: {
          companySize: '1000+ employees',
          industry: 'Oil & Gas',
          currentERP: 'SAP ECC 6.0',
          targetSystem: 'SAP S/4HANA',
          integrationPoints: ['Legacy Systems', 'IoT Sensors', 'BI Platform'],
          projectPhase: 'RFP Stage',
          decisionMakers: 3,
        },
        utmSource: 'linkedin',
        utmMedium: 'social',
        tags: [
          { id: '3', name: 'SAP', color: '#f59e0b', createdAt: new Date().toISOString() },
          { id: '4', name: 'Enterprise', color: '#3b82f6', createdAt: new Date().toISOString() }
        ],
        notes: [],
        activities: [],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '4',
        firstName: 'Fatima',
        lastName: 'Khalil',
        email: 'f.khalil@healthplus.eg',
        phone: '+20 111 222 3333',
        company: 'HealthPlus Medical',
        jobTitle: 'Operations Manager',
        message: 'Proposal sent for managed IT services. Need 24/7 support for 3 hospital locations.',
        status: LeadStatus.PROPOSAL,
        source: LeadSource.CONTACT_FORM,
        priority: LeadPriority.MEDIUM,
        estimatedValue: 48000,
        formData: {
          companySize: '500-1000 employees',
          industry: 'Healthcare',
          locations: 3,
          supportHours: '24/7',
          currentProvider: 'In-house IT team',
          painPoints: ['Response time', 'Expertise gaps', 'Cost optimization'],
          complianceRequirements: ['HIPAA', 'Local health data regulations'],
        },
        tags: [{ id: '5', name: 'Healthcare', color: '#ef4444', createdAt: new Date().toISOString() }],
        notes: [],
        activities: [],
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: '5',
        firstName: 'Khalid',
        lastName: 'Abdullah',
        email: 'khalid@financegroup.com',
        phone: '+973 3344 5566',
        company: 'Finance Group Bahrain',
        jobTitle: 'Group IT Manager',
        message: 'Met at GITEX. Negotiating contract terms for managed security services.',
        status: LeadStatus.NEGOTIATION,
        source: LeadSource.OTHER,
        priority: LeadPriority.HIGH,
        tags: [
          { id: '6', name: 'VIP', color: '#8b5cf6', createdAt: new Date().toISOString() },
          { id: '7', name: 'Finance', color: '#06b6d4', createdAt: new Date().toISOString() }
        ],
        notes: [],
        activities: [],
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '6',
        firstName: 'Layla',
        lastName: 'Nasser',
        email: 'layla@edutech.jo',
        phone: '+962 79 888 9999',
        company: 'EduTech Jordan',
        message: 'Signed 2-year contract for DevOps services',
        status: LeadStatus.WON,
        source: LeadSource.GOOGLE_ADS,
        priority: LeadPriority.MEDIUM,
        tags: [{ id: '8', name: 'DevOps', color: '#059669', createdAt: new Date().toISOString() }],
        notes: [],
        activities: [],
        createdAt: new Date(Date.now() - 432000000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        id: '7',
        firstName: 'Youssef',
        lastName: 'Mahmoud',
        email: 'youssef@retail.eg',
        phone: '+20 122 333 4444',
        company: 'RetailMax Egypt',
        message: 'Went with competitor due to pricing',
        status: LeadStatus.LOST,
        source: LeadSource.ORGANIC,
        priority: LeadPriority.LOW,
        tags: [],
        notes: [],
        activities: [],
        createdAt: new Date(Date.now() - 518400000).toISOString(),
        updatedAt: new Date(Date.now() - 432000000).toISOString(),
      },
      {
        id: '8',
        firstName: 'Nadia',
        lastName: 'Ibrahim',
        email: 'nadia@govtech.eg',
        phone: '+20 100 555 6666',
        company: 'Government Tech Authority',
        message: 'Government tender opportunity. Large scale project.',
        status: LeadStatus.NEW,
        source: LeadSource.CONTACT_FORM,
        priority: LeadPriority.HIGH,
        tags: [
          { id: '9', name: 'Government', color: '#6366f1', createdAt: new Date().toISOString() },
          { id: '10', name: 'Tender', color: '#f97316', createdAt: new Date().toISOString() }
        ],
        notes: [],
        activities: [],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  }

  /**
   * Generate mock stats for development
   */
  private getMockStats(): DashboardStats {
    return {
      totalLeads: 156,
      newLeadsToday: 8,
      newLeadsThisWeek: 34,
      newLeadsThisMonth: 89,
      conversionRate: 18.5,
      leadsByStatus: {
        [LeadStatus.NEW]: 42,
        [LeadStatus.CONTACTED]: 28,
        [LeadStatus.QUALIFIED]: 35,
        [LeadStatus.PROPOSAL]: 18,
        [LeadStatus.NEGOTIATION]: 12,
        [LeadStatus.WON]: 15,
        [LeadStatus.LOST]: 4,
        [LeadStatus.ARCHIVED]: 2,
      },
      leadsBySource: {
        [LeadSource.CONTACT_FORM]: 45,
        [LeadSource.PRICING_PAGE]: 12,
        [LeadSource.ROI_CALCULATOR]: 8,
        [LeadSource.NEWSLETTER]: 5,
        [LeadSource.REFERRAL]: 32,
        [LeadSource.LINKEDIN]: 22,
        [LeadSource.GOOGLE_ADS]: 18,
        [LeadSource.ORGANIC]: 10,
        [LeadSource.OTHER]: 4,
      },
    };
  }

  /**
   * Get paginated list of leads with filters
   */
  getLeads(
    params?: LeadQueryParams
  ): Observable<{ leads: Lead[]; meta: PaginationMeta }> {
    // Return mock data directly if mock mode is enabled
    if (this.USE_MOCK_DATA) {
      const mockLeads = this.getMockLeads();
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const totalPages = Math.ceil(mockLeads.length / limit);
      return of({
        leads: mockLeads,
        meta: {
          total: mockLeads.length,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    }

    let httpParams = new HttpParams();

    if (params) {
      // Pagination
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);

      // Filters
      if (params.status) {
        const statuses = Array.isArray(params.status) ? params.status : [params.status];
        statuses.forEach((status) => {
          httpParams = httpParams.append('status', status);
        });
      }

      if (params.source) {
        const sources = Array.isArray(params.source) ? params.source : [params.source];
        sources.forEach((source) => {
          httpParams = httpParams.append('source', source);
        });
      }

      if (params.priority) {
        const priorities = Array.isArray(params.priority)
          ? params.priority
          : [params.priority];
        priorities.forEach((priority) => {
          httpParams = httpParams.append('priority', priority);
        });
      }

      if (params.assignedToId) {
        httpParams = httpParams.set('assignedToId', params.assignedToId);
      }

      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }

      if (params.dateFrom) {
        httpParams = httpParams.set('dateFrom', params.dateFrom);
      }

      if (params.dateTo) {
        httpParams = httpParams.set('dateTo', params.dateTo);
      }

      if (params.tags && params.tags.length > 0) {
        params.tags.forEach((tag) => {
          httpParams = httpParams.append('tags', tag);
        });
      }
    }

    return this.http
      .get<ApiResponse<{ leads: Lead[]; meta: PaginationMeta }>>(this.API_URL, {
        params: httpParams,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to get leads');
          }
          return response.data;
        }),
        catchError((error) => {
          // Silently ignore AbortError (happens during page refresh/navigation)
          if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
            return throwError(() => error);
          }
          console.error('Get leads error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get dashboard statistics
   */
  getStats(): Observable<DashboardStats> {
    // Return mock data directly if mock mode is enabled
    if (this.USE_MOCK_DATA) {
      return of(this.getMockStats());
    }

    return this.http.get<ApiResponse<DashboardStats>>(`${this.API_URL}/stats`).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to get stats');
        }
        return response.data;
      }),
      catchError((error) => {
        // Silently ignore AbortError (happens during page refresh/navigation)
        if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
          return throwError(() => error);
        }
        console.error('Get stats error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get single lead by ID with full details
   */
  getLead(id: string): Observable<Lead> {
    return this.http.get<ApiResponse<Lead>>(`${this.API_URL}/${id}`).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to get lead');
        }
        return response.data;
      }),
      catchError((error) => {
        console.error('Get lead error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update lead
   */
  updateLead(id: string, data: UpdateLeadDto): Observable<Lead> {
    return this.http.patch<ApiResponse<Lead>>(`${this.API_URL}/${id}`, data).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to update lead');
        }
        return response.data;
      }),
      catchError((error) => {
        console.error('Update lead error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete lead
   */
  deleteLead(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to delete lead');
        }
      }),
      catchError((error) => {
        console.error('Delete lead error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Add note to lead
   */
  addNote(leadId: string, note: CreateNoteDto): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.API_URL}/${leadId}/notes`, note)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error?.message || 'Failed to add note');
          }
        }),
        catchError((error) => {
          console.error('Add note error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Add tag to lead
   */
  addTag(leadId: string, tagData: AddTagToLeadDto): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.API_URL}/${leadId}/tags`, tagData)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error?.message || 'Failed to add tag');
          }
        }),
        catchError((error) => {
          console.error('Add tag error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Remove tag from lead
   */
  removeTag(leadId: string, tagId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.API_URL}/${leadId}/tags/${tagId}`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error?.message || 'Failed to remove tag');
          }
        }),
        catchError((error) => {
          console.error('Remove tag error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update note
   */
  updateNote(noteId: string, data: UpdateNoteDto): Observable<LeadNote> {
    return this.http
      .patch<ApiResponse<LeadNote>>(`${this.API_URL}/notes/${noteId}`, data)
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to update note');
          }
          return response.data;
        }),
        catchError((error) => {
          console.error('Update note error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete note
   */
  deleteNote(noteId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.API_URL}/notes/${noteId}`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.error?.message || 'Failed to delete note');
          }
        }),
        catchError((error) => {
          console.error('Delete note error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get lead activities (paginated)
   */
  getActivities(
    leadId: string,
    params?: ActivityQueryParams
  ): Observable<{ activities: LeadActivity[]; meta: PaginationMeta }> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.type) httpParams = httpParams.set('type', params.type);
    }

    return this.http
      .get<ApiResponse<LeadActivity[]>>(`${this.API_URL}/${leadId}/activities`, {
        params: httpParams,
      })
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to get activities');
          }
          return {
            activities: response.data,
            meta: response.meta!,
          };
        }),
        catchError((error) => {
          console.error('Get activities error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Create manual activity (call, email, meeting)
   */
  createActivity(leadId: string, data: CreateActivityDto): Observable<LeadActivity> {
    return this.http
      .post<ApiResponse<LeadActivity>>(`${this.API_URL}/${leadId}/activities`, data)
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Failed to create activity');
          }
          return response.data;
        }),
        catchError((error) => {
          console.error('Create activity error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Export leads to CSV
   * Note: This will be implemented in a future phase
   */
  exportLeads(params?: LeadQueryParams): Observable<Blob> {
    let httpParams = new HttpParams();

    if (params) {
      // Add same filters as getLeads
      // Implementation similar to getLeads param building
    }

    return this.http
      .get(`${this.API_URL}/export`, {
        params: httpParams,
        responseType: 'blob',
      })
      .pipe(
        catchError((error) => {
          console.error('Export leads error:', error);
          return throwError(() => error);
        })
      );
  }
}
