import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface OverviewMetrics {
  totalLeads: number;
  newLeadsThisMonth: number;
  conversionRate: number;
  totalRevenue: number;
  leadsChange: number;
  revenueChange: number;
}

export interface ConversionFunnelData {
  stage: string;
  count: number;
  percentage: number;
}

export interface SourcePerformance {
  source: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalValue: number;
  revenue?: number;
}

export interface TeamPerformance {
  userId: string;
  userName: string;
  assignedLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalValue: number;
}

export interface TrendData {
  date: string;
  leads: number;
  conversions: number;
  revenue: number;
}

export interface SalesCycleData {
  stage: string;
  averageDays: number;
  count: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsAdminService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/analytics`;
  private readonly USE_MOCK_DATA = false;

  /**
   * Generate mock overview data
   */
  private getMockOverview(): OverviewMetrics {
    return {
      totalLeads: 156,
      newLeadsThisMonth: 89,
      conversionRate: 18.5,
      totalRevenue: 425000,
      leadsChange: 15.2,
      revenueChange: 22.8,
    };
  }

  /**
   * Generate mock funnel data
   */
  private getMockFunnel(): ConversionFunnelData[] {
    return [
      { stage: 'New', count: 156, percentage: 100 },
      { stage: 'Contacted', count: 98, percentage: 62.8 },
      { stage: 'Qualified', count: 65, percentage: 41.7 },
      { stage: 'Proposal', count: 38, percentage: 24.4 },
      { stage: 'Negotiation', count: 22, percentage: 14.1 },
      { stage: 'Won', count: 15, percentage: 9.6 },
    ];
  }

  /**
   * Generate mock source performance
   */
  private getMockSourcePerformance(): SourcePerformance[] {
    return [
      { source: 'Website', totalLeads: 52, convertedLeads: 14, conversionRate: 26.9, totalValue: 125000, revenue: 125000 },
      { source: 'Referral', totalLeads: 38, convertedLeads: 18, conversionRate: 47.4, totalValue: 185000, revenue: 185000 },
      { source: 'LinkedIn', totalLeads: 28, convertedLeads: 7, conversionRate: 25.0, totalValue: 65000, revenue: 65000 },
      { source: 'Google Ads', totalLeads: 22, convertedLeads: 5, conversionRate: 22.7, totalValue: 42000, revenue: 42000 },
      { source: 'Email Campaign', totalLeads: 12, convertedLeads: 3, conversionRate: 25.0, totalValue: 28000, revenue: 28000 },
      { source: 'Events', totalLeads: 8, convertedLeads: 4, conversionRate: 50.0, totalValue: 95000, revenue: 95000 },
    ];
  }

  /**
   * Generate mock team performance
   */
  private getMockTeamPerformance(): TeamPerformance[] {
    return [
      { userId: '1', userName: 'Mohamed Ali', assignedLeads: 42, convertedLeads: 15, conversionRate: 35.7, totalValue: 145000 },
      { userId: '2', userName: 'Sara Ahmed', assignedLeads: 35, convertedLeads: 11, conversionRate: 31.4, totalValue: 98000 },
      { userId: '3', userName: 'Hassan Youssef', assignedLeads: 38, convertedLeads: 13, conversionRate: 34.2, totalValue: 112000 },
      { userId: '4', userName: 'Mariam Saleh', assignedLeads: 28, convertedLeads: 8, conversionRate: 28.6, totalValue: 70000 },
      { userId: '5', userName: 'Karim Farouk', assignedLeads: 22, convertedLeads: 6, conversionRate: 27.3, totalValue: 55000 },
    ];
  }

  /**
   * Generate mock trend data with realistic patterns
   */
  private getMockTrends(): TrendData[] {
    const trends: TrendData[] = [];
    const now = new Date();
    
    // Generate 30 days of data with realistic variation
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Weekend dip effect
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseLeads = isWeekend ? 3 : 8;
      const baseConversions = isWeekend ? 1 : 3;
      
      // Add some randomness
      const leads = baseLeads + Math.floor(Math.random() * 6);
      const conversions = Math.min(leads, baseConversions + Math.floor(Math.random() * 2));
      const revenue = conversions * (15000 + Math.floor(Math.random() * 10000));
      
      trends.push({
        date: date.toISOString(),
        leads,
        conversions,
        revenue,
      });
    }
    return trends;
  }

  /**
   * Get dashboard overview metrics
   */
  getOverview(dateRange?: DateRange): Observable<ApiResponse<OverviewMetrics>> {
    // Return mock data directly if mock mode is enabled
    if (this.USE_MOCK_DATA) {
      return of({ success: true, data: this.getMockOverview() });
    }

    let params = new HttpParams();
    if (dateRange) {
      params = params
        .set('startDate', dateRange.startDate.toISOString())
        .set('endDate', dateRange.endDate.toISOString());
    }
    return this.http.get<ApiResponse<OverviewMetrics>>(`${this.baseUrl}/overview`, { params }).pipe(
      catchError((error) => {
        console.error('Get overview error:', error);
        throw error;
      })
    );
  }

  /**
   * Get conversion funnel data
   */
  getConversionFunnel(): Observable<ApiResponse<ConversionFunnelData[]>> {
    // Return mock data directly if mock mode is enabled
    if (this.USE_MOCK_DATA) {
      return of({ success: true, data: this.getMockFunnel() });
    }

    return this.http.get<ApiResponse<ConversionFunnelData[]>>(`${this.baseUrl}/conversion-funnel`).pipe(
      catchError((error) => {
        console.error('Get funnel error:', error);
        throw error;
      })
    );
  }

  /**
   * Get average time per stage
   */
  getSalesCycle(): Observable<ApiResponse<SalesCycleData[]>> {
    // Return mock data directly if mock mode is enabled
    if (this.USE_MOCK_DATA) {
      return of({
        success: true,
        data: [
          { stage: 'New → Contacted', averageDays: 2, count: 45 },
          { stage: 'Contacted → Qualified', averageDays: 5, count: 38 },
          { stage: 'Qualified → Proposal', averageDays: 7, count: 28 },
          { stage: 'Proposal → Won', averageDays: 14, count: 15 },
        ],
      });
    }

    return this.http.get<ApiResponse<SalesCycleData[]>>(`${this.baseUrl}/sales-cycle`).pipe(
      catchError((error) => {
        console.error('Get sales cycle error:', error);
        throw error;
      })
    );
  }

  /**
   * Get lead source performance
   */
  getSourcePerformance(): Observable<ApiResponse<SourcePerformance[]>> {
    // Return mock data directly if mock mode is enabled
    if (this.USE_MOCK_DATA) {
      return of({ success: true, data: this.getMockSourcePerformance() });
    }

    return this.http.get<ApiResponse<SourcePerformance[]>>(`${this.baseUrl}/source-performance`).pipe(
      catchError((error) => {
        console.error('Get source performance error:', error);
        throw error;
      })
    );
  }

  /**
   * Get team performance metrics
   */
  getTeamPerformance(): Observable<ApiResponse<TeamPerformance[]>> {
    // Return mock data directly if mock mode is enabled
    if (this.USE_MOCK_DATA) {
      return of({ success: true, data: this.getMockTeamPerformance() });
    }

    return this.http.get<ApiResponse<TeamPerformance[]>>(`${this.baseUrl}/team-performance`).pipe(
      catchError((error) => {
        console.error('Get team performance error:', error);
        throw error;
      })
    );
  }

  /**
   * Get trend data over time
   */
  getTrends(dateRange?: DateRange): Observable<ApiResponse<TrendData[]>> {
    // Return mock data directly if mock mode is enabled
    if (this.USE_MOCK_DATA) {
      return of({ success: true, data: this.getMockTrends() });
    }

    let params = new HttpParams();
    if (dateRange) {
      params = params
        .set('startDate', dateRange.startDate.toISOString())
        .set('endDate', dateRange.endDate.toISOString());
    }
    return this.http.get<ApiResponse<TrendData[]>>(`${this.baseUrl}/trends`, { params }).pipe(
      catchError((error) => {
        console.error('Get trends error:', error);
        throw error;
      })
    );
  }

  /**
   * Export analytics data
   */
  exportData(format: 'csv' | 'json', dateRange?: DateRange): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (dateRange) {
      params = params
        .set('startDate', dateRange.startDate.toISOString())
        .set('endDate', dateRange.endDate.toISOString());
    }
    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob',
    }).pipe(
      catchError((error) => {
        console.error('Export error:', error);
        // Return empty blob for mock
        if (this.USE_MOCK_DATA) {
          return of(new Blob(['Mock export data'], { type: 'text/csv' }));
        }
        throw error;
      })
    );
  }
}
