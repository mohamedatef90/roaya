import { prisma } from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';
import { LeadStatus, LeadSource } from '@prisma/client';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

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
  source: LeadSource;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalValue: number;
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

export class AnalyticsService {
  /**
   * Get overview dashboard metrics
   */
  async getOverview(dateRange?: DateRange): Promise<OverviewMetrics> {
    logger.info('Fetching analytics overview', { dateRange });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total leads
    const totalLeads = await prisma.lead.count();

    // New leads this month
    const newLeadsThisMonth = await prisma.lead.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // New leads last month (for comparison)
    const newLeadsLastMonth = await prisma.lead.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Converted leads
    const convertedLeads = await prisma.lead.count({
      where: {
        status: LeadStatus.WON,
      },
    });

    // Conversion rate
    const conversionRate = totalLeads > 0
      ? Math.round((convertedLeads / totalLeads) * 100 * 10) / 10
      : 0;

    // Total revenue (estimated value of converted leads)
    const revenueResult = await prisma.lead.aggregate({
      where: {
        status: LeadStatus.WON,
      },
      _sum: {
        estimatedValue: true,
      },
    });
    const totalRevenue = revenueResult._sum.estimatedValue?.toNumber() || 0;

    // Revenue this month
    const revenueThisMonthResult = await prisma.lead.aggregate({
      where: {
        status: LeadStatus.WON,
        updatedAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        estimatedValue: true,
      },
    });

    // Revenue last month
    const revenueLastMonthResult = await prisma.lead.aggregate({
      where: {
        status: LeadStatus.WON,
        updatedAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
      _sum: {
        estimatedValue: true,
      },
    });

    const revenueThisMonth = revenueThisMonthResult._sum.estimatedValue?.toNumber() || 0;
    const revenueLastMonth = revenueLastMonthResult._sum.estimatedValue?.toNumber() || 0;

    // Calculate percentage changes
    const leadsChange = newLeadsLastMonth > 0
      ? Math.round(((newLeadsThisMonth - newLeadsLastMonth) / newLeadsLastMonth) * 100)
      : newLeadsThisMonth > 0 ? 100 : 0;

    const revenueChange = revenueLastMonth > 0
      ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
      : revenueThisMonth > 0 ? 100 : 0;

    return {
      totalLeads,
      newLeadsThisMonth,
      conversionRate,
      totalRevenue,
      leadsChange,
      revenueChange,
    };
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(): Promise<ConversionFunnelData[]> {
    logger.info('Fetching conversion funnel data');

    const statusCounts = await prisma.lead.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const totalLeads = statusCounts.reduce((sum, s) => sum + s._count.id, 0);

    // Define funnel stages in order
    const funnelStages: LeadStatus[] = [
      LeadStatus.NEW,
      LeadStatus.CONTACTED,
      LeadStatus.QUALIFIED,
      LeadStatus.PROPOSAL,
      LeadStatus.NEGOTIATION,
      LeadStatus.WON,
    ];

    return funnelStages.map((stage) => {
      const stageData = statusCounts.find((s) => s.status === stage);
      const count = stageData?._count.id || 0;
      return {
        stage,
        count,
        percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100 * 10) / 10 : 0,
      };
    });
  }

  /**
   * Get average sales cycle time per stage
   */
  async getSalesCycle(): Promise<SalesCycleData[]> {
    logger.info('Fetching sales cycle data');

    // Get all leads with their status history via activities
    const activities = await prisma.leadActivity.findMany({
      where: {
        type: 'STATUS_CHANGE',
      },
      select: {
        leadId: true,
        createdAt: true,
        metadata: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group activities by lead and calculate time between status changes
    const leadActivities = new Map<string, { createdAt: Date; metadata: unknown }[]>();

    activities.forEach((activity) => {
      const existing = leadActivities.get(activity.leadId) || [];
      existing.push({ createdAt: activity.createdAt, metadata: activity.metadata });
      leadActivities.set(activity.leadId, existing);
    });

    // Calculate average time per stage transition
    const stageTimings: Record<string, number[]> = {};

    leadActivities.forEach((activities) => {
      for (let i = 1; i < activities.length; i++) {
        const prev = activities[i - 1]!;
        const curr = activities[i]!;
        const days = Math.round(
          (curr.createdAt.getTime() - prev.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        const details = curr.metadata as { toStatus?: string } | null;
        const stage = details?.toStatus || 'unknown';

        if (!stageTimings[stage]) {
          stageTimings[stage] = [];
        }
        stageTimings[stage].push(days);
      }
    });

    // Calculate averages
    return Object.entries(stageTimings).map(([stage, timings]) => ({
      stage,
      averageDays: timings.length > 0
        ? Math.round((timings.reduce((a, b) => a + b, 0) / timings.length) * 10) / 10
        : 0,
      count: timings.length,
    }));
  }

  /**
   * Get lead source performance
   */
  async getSourcePerformance(): Promise<SourcePerformance[]> {
    logger.info('Fetching source performance data');

    const sources = Object.values(LeadSource);

    const results = await Promise.all(
      sources.map(async (source) => {
        const totalLeads = await prisma.lead.count({
          where: { source },
        });

        const convertedLeads = await prisma.lead.count({
          where: {
            source,
            status: LeadStatus.WON,
          },
        });

        const valueResult = await prisma.lead.aggregate({
          where: {
            source,
            status: LeadStatus.WON,
          },
          _sum: {
            estimatedValue: true,
          },
        });

        return {
          source,
          totalLeads,
          convertedLeads,
          conversionRate: totalLeads > 0
            ? Math.round((convertedLeads / totalLeads) * 100 * 10) / 10
            : 0,
          totalValue: valueResult._sum.estimatedValue?.toNumber() || 0,
        };
      })
    );

    return results.filter((r) => r.totalLeads > 0).sort((a, b) => b.totalLeads - a.totalLeads);
  }

  /**
   * Get team/sales rep performance
   */
  async getTeamPerformance(): Promise<TeamPerformance[]> {
    logger.info('Fetching team performance data');

    const users = await prisma.adminUser.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        assignedLeads: {
          select: {
            id: true,
            status: true,
            estimatedValue: true,
          },
        },
      },
    });

    return users
      .map((user) => {
        const assignedLeads = user.assignedLeads.length;
        const convertedLeads = user.assignedLeads.filter(
          (l) => l.status === LeadStatus.WON
        ).length;
        const totalValue = user.assignedLeads
          .filter((l) => l.status === LeadStatus.WON)
          .reduce((sum, l) => sum + (l.estimatedValue?.toNumber() || 0), 0);

        return {
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          assignedLeads,
          convertedLeads,
          conversionRate: assignedLeads > 0
            ? Math.round((convertedLeads / assignedLeads) * 100 * 10) / 10
            : 0,
          totalValue,
        };
      })
      .filter((u) => u.assignedLeads > 0)
      .sort((a, b) => b.totalValue - a.totalValue);
  }

  /**
   * Get trend data over time
   */
  async getTrends(dateRange: DateRange): Promise<TrendData[]> {
    logger.info('Fetching trend data', { dateRange });

    const { startDate, endDate } = dateRange;

    // Get all leads within date range
    const leads = await prisma.lead.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        status: true,
        estimatedValue: true,
        updatedAt: true,
      },
    });

    // Group by date
    const trendMap = new Map<string, { leads: number; conversions: number; revenue: number }>();

    // Initialize all dates in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0]!;
      trendMap.set(dateKey, { leads: 0, conversions: 0, revenue: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count leads per day
    leads.forEach((lead) => {
      const dateKey = lead.createdAt.toISOString().split('T')[0]!;
      const existing = trendMap.get(dateKey);
      if (existing) {
        existing.leads++;
        if (lead.status === LeadStatus.WON) {
          existing.conversions++;
          existing.revenue += lead.estimatedValue?.toNumber() || 0;
        }
      }
    });

    return Array.from(trendMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Export analytics data
   */
  async exportData(format: 'csv' | 'json', dateRange?: DateRange): Promise<string> {
    logger.info('Exporting analytics data', { format, dateRange });

    const [overview, funnel, sources, team] = await Promise.all([
      this.getOverview(dateRange),
      this.getConversionFunnel(),
      this.getSourcePerformance(),
      this.getTeamPerformance(),
    ]);

    const data = {
      exportDate: new Date().toISOString(),
      overview,
      conversionFunnel: funnel,
      sourcePerformance: sources,
      teamPerformance: team,
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // CSV format - simplified flat structure
    const rows: string[] = [];

    // Overview section
    rows.push('OVERVIEW');
    rows.push('Metric,Value');
    rows.push(`Total Leads,${overview.totalLeads}`);
    rows.push(`New Leads This Month,${overview.newLeadsThisMonth}`);
    rows.push(`Conversion Rate,${overview.conversionRate}%`);
    rows.push(`Total Revenue,${overview.totalRevenue}`);
    rows.push('');

    // Funnel section
    rows.push('CONVERSION FUNNEL');
    rows.push('Stage,Count,Percentage');
    funnel.forEach((f) => {
      rows.push(`${f.stage},${f.count},${f.percentage}%`);
    });
    rows.push('');

    // Source performance section
    rows.push('SOURCE PERFORMANCE');
    rows.push('Source,Total Leads,Converted,Conversion Rate,Total Value');
    sources.forEach((s) => {
      rows.push(`${s.source},${s.totalLeads},${s.convertedLeads},${s.conversionRate}%,${s.totalValue}`);
    });
    rows.push('');

    // Team performance section
    rows.push('TEAM PERFORMANCE');
    rows.push('Name,Assigned,Converted,Conversion Rate,Total Value');
    team.forEach((t) => {
      rows.push(`${t.userName},${t.assignedLeads},${t.convertedLeads},${t.conversionRate}%,${t.totalValue}`);
    });

    return rows.join('\n');
  }
}

export const analyticsService = new AnalyticsService();
