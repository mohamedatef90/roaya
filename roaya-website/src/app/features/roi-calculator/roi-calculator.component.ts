import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AnalyticsService } from '../../core/services/analytics.service';

/**
 * Calculator Types
 */
type CalculatorType = 'cloud' | 'email' | 'security';

/**
 * Industry risk factors for cybersecurity calculations
 */
interface IndustryRisk {
  name: string;
  factor: number; // Percentage of annual revenue at risk
}

/**
 * Cloud Infrastructure Calculator Inputs
 */
interface CloudInputs {
  currentCost: number;
  serverCount: number;
  maintenanceHours: number;
  hourlyCost: number;
  downtimeHours: number;
  revenuePerHour: number;
}

/**
 * Email Services Calculator Inputs
 */
interface EmailInputs {
  mailboxCount: number;
  costPerMailbox: number;
  itHours: number;
  hourlyCost: number;
}

/**
 * Cybersecurity Calculator Inputs
 */
interface SecurityInputs {
  annualRevenue: number;
  securityCost: number;
  securityStaff: number;
  industry: string;
}

/**
 * Calculation Results
 */
interface CalculationResults {
  totalAnnualSavings: number;
  monthlySavings: number;
  breakdown: {
    label: string;
    value: number;
    percentage: number;
  }[];
  paybackPeriod: number; // in months
}

@Component({
  selector: 'app-roi-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './roi-calculator.component.html',
  styleUrl: './roi-calculator.component.scss'
})
export class RoiCalculatorComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly analytics = inject(AnalyticsService);

  // Active calculator tab
  activeTab = signal<CalculatorType>('cloud');

  // Industry options for security calculator
  industries: IndustryRisk[] = [
    { name: 'Finance', factor: 0.05 },      // 5% of revenue at risk
    { name: 'Healthcare', factor: 0.04 },   // 4% of revenue at risk
    { name: 'Retail', factor: 0.035 },      // 3.5% of revenue at risk
    { name: 'Manufacturing', factor: 0.03 }, // 3% of revenue at risk
    { name: 'Government', factor: 0.045 },  // 4.5% of revenue at risk
    { name: 'Education', factor: 0.025 }    // 2.5% of revenue at risk
  ];

  // Cloud Infrastructure inputs
  cloudInputs = signal<CloudInputs>({
    currentCost: 10000,
    serverCount: 5,
    maintenanceHours: 40,
    hourlyCost: 200,
    downtimeHours: 50,
    revenuePerHour: 5000
  });

  // Email Services inputs
  emailInputs = signal<EmailInputs>({
    mailboxCount: 50,
    costPerMailbox: 80,
    itHours: 20,
    hourlyCost: 200
  });

  // Cybersecurity inputs
  securityInputs = signal<SecurityInputs>({
    annualRevenue: 5000000,
    securityCost: 15000,
    securityStaff: 2,
    industry: 'Finance'
  });

  // Animated counter for results
  animatedSavings = signal<number>(0);
  private animationInterval: ReturnType<typeof setInterval> | null = null;

  // Computed results based on active tab
  results = computed<CalculationResults>(() => {
    const tab = this.activeTab();

    switch (tab) {
      case 'cloud':
        return this.calculateCloudROI();
      case 'email':
        return this.calculateEmailROI();
      case 'security':
        return this.calculateSecurityROI();
      default:
        return this.getEmptyResults();
    }
  });

  ngOnInit(): void {
    this.animateCounter();
    this.analytics.trackPageView('/roi-calculator');
    this.analytics.trackROICalculator(this.activeTab(), 'started');
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }

  /**
   * Switch calculator tab
   */
  selectTab(tab: CalculatorType): void {
    this.activeTab.set(tab);
    this.stopAnimation();
    this.animatedSavings.set(0);
    this.animateCounter();
    this.analytics.trackROICalculator(tab, 'started');
  }

  /**
   * Submit ROI calculator lead
   */
  async submitROILead(contactInfo: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    industry?: string;
  }): Promise<void> {
    const currentTab = this.activeTab();
    const inputs = currentTab === 'cloud' 
      ? this.cloudInputs() 
      : currentTab === 'email' 
      ? this.emailInputs() 
      : this.securityInputs();

    try {
      await firstValueFrom(this.apiService.submitROILead({
        calculatorType: currentTab,
        inputs,
        results: this.results(),
        contactInfo
      }));

      this.analytics.trackROICalculator(currentTab, 'lead_captured');
      this.analytics.trackFormSubmission('roi_lead', true);
    } catch (error) {
      console.error('ROI lead submission error:', error);
      this.analytics.trackFormSubmission('roi_lead', false);
    }
  }

  /**
   * Update cloud infrastructure inputs
   */
  updateCloudInput(field: keyof CloudInputs, value: number): void {
    this.cloudInputs.update(inputs => ({
      ...inputs,
      [field]: value
    }));
    this.resetAnimation();
  }

  /**
   * Update email services inputs
   */
  updateEmailInput(field: keyof EmailInputs, value: number): void {
    this.emailInputs.update(inputs => ({
      ...inputs,
      [field]: value
    }));
    this.resetAnimation();
  }

  /**
   * Update cybersecurity inputs
   */
  updateSecurityInput(field: keyof SecurityInputs, value: number | string): void {
    this.securityInputs.update(inputs => ({
      ...inputs,
      [field]: value
    }));
    this.resetAnimation();
  }

  /**
   * Calculate Cloud Infrastructure ROI
   */
  private calculateCloudROI(): CalculationResults {
    const inputs = this.cloudInputs();

    // 40% reduction in infrastructure costs
    const infrastructureSavings = inputs.currentCost * 0.4;

    // 60% reduction in maintenance time
    const maintenanceSavings = inputs.maintenanceHours * inputs.hourlyCost * 0.6;

    // Downtime savings (99.9% uptime = 8.76 hours/year max downtime)
    const targetDowntime = 8.76;
    const downtimeSavings = Math.max(0, (inputs.downtimeHours - targetDowntime) * inputs.revenuePerHour);

    // Total annual savings
    const totalAnnualSavings = (infrastructureSavings + maintenanceSavings) * 12 + downtimeSavings;

    // Breakdown
    const breakdown = [
      {
        label: 'roiCalculator.breakdown.infrastructure',
        value: infrastructureSavings * 12,
        percentage: ((infrastructureSavings * 12) / totalAnnualSavings) * 100
      },
      {
        label: 'roiCalculator.breakdown.maintenance',
        value: maintenanceSavings * 12,
        percentage: ((maintenanceSavings * 12) / totalAnnualSavings) * 100
      },
      {
        label: 'roiCalculator.breakdown.downtime',
        value: downtimeSavings,
        percentage: (downtimeSavings / totalAnnualSavings) * 100
      }
    ];

    // Payback period (assuming 3 months implementation cost)
    const implementationCost = inputs.currentCost * 3;
    const paybackPeriod = Math.ceil(implementationCost / (totalAnnualSavings / 12));

    return {
      totalAnnualSavings,
      monthlySavings: totalAnnualSavings / 12,
      breakdown,
      paybackPeriod
    };
  }

  /**
   * Calculate Email Services ROI
   */
  private calculateEmailROI(): CalculationResults {
    const inputs = this.emailInputs();

    // Roaya price: 45 EGP per mailbox
    const roayaPrice = 45;
    const hostingSavings = Math.max(0, (inputs.costPerMailbox - roayaPrice) * inputs.mailboxCount);

    // 70% reduction in IT time for email management
    const itTimeSavings = inputs.itHours * inputs.hourlyCost * 0.7;

    // Total annual savings
    const totalAnnualSavings = (hostingSavings + itTimeSavings) * 12;

    // Breakdown
    const breakdown = [
      {
        label: 'roiCalculator.breakdown.hosting',
        value: hostingSavings * 12,
        percentage: ((hostingSavings * 12) / totalAnnualSavings) * 100
      },
      {
        label: 'roiCalculator.breakdown.itTime',
        value: itTimeSavings * 12,
        percentage: ((itTimeSavings * 12) / totalAnnualSavings) * 100
      }
    ];

    // Payback period (assuming 1 month implementation)
    const implementationCost = inputs.costPerMailbox * inputs.mailboxCount;
    const paybackPeriod = Math.ceil(implementationCost / (totalAnnualSavings / 12));

    return {
      totalAnnualSavings,
      monthlySavings: totalAnnualSavings / 12,
      breakdown,
      paybackPeriod
    };
  }

  /**
   * Calculate Cybersecurity ROI
   */
  private calculateSecurityROI(): CalculationResults {
    const inputs = this.securityInputs();

    // Find industry risk factor
    const industry = this.industries.find(i => i.name === inputs.industry);
    const riskFactor = industry ? industry.factor : 0.03;

    // 80% reduction in breach risk
    const breachRiskReduction = inputs.annualRevenue * riskFactor * 0.8;

    // SOC cost savings (in-house vs managed SOC)
    // In-house: 15,000 EGP/month per staff
    // Managed SOC: 8,000 EGP/month
    const inHouseCost = inputs.securityStaff * 15000 * 12;
    const managedSOCCost = 8000 * 12;
    const socCostSavings = Math.max(0, inHouseCost - managedSOCCost);

    // Total annual value
    const totalAnnualSavings = breachRiskReduction + socCostSavings;

    // Breakdown
    const breakdown = [
      {
        label: 'roiCalculator.breakdown.breachRisk',
        value: breachRiskReduction,
        percentage: (breachRiskReduction / totalAnnualSavings) * 100
      },
      {
        label: 'roiCalculator.breakdown.socCost',
        value: socCostSavings,
        percentage: (socCostSavings / totalAnnualSavings) * 100
      }
    ];

    // Payback period (assuming 2 months implementation)
    const implementationCost = inputs.securityCost * 2;
    const paybackPeriod = Math.ceil(implementationCost / (totalAnnualSavings / 12));

    return {
      totalAnnualSavings,
      monthlySavings: totalAnnualSavings / 12,
      breakdown,
      paybackPeriod
    };
  }

  /**
   * Get empty results
   */
  private getEmptyResults(): CalculationResults {
    return {
      totalAnnualSavings: 0,
      monthlySavings: 0,
      breakdown: [],
      paybackPeriod: 0
    };
  }

  /**
   * Reset and restart animation
   */
  private resetAnimation(): void {
    this.stopAnimation();
    this.animatedSavings.set(0);
    setTimeout(() => this.animateCounter(), 50);
  }

  /**
   * Animate the counter from 0 to target value
   */
  private animateCounter(): void {
    const targetValue = this.results().totalAnnualSavings;
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    this.animationInterval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      this.animatedSavings.set(Math.round(targetValue * easeOutProgress));

      if (currentStep >= steps) {
        this.stopAnimation();
      }
    }, stepDuration);
  }

  /**
   * Stop animation interval
   */
  private stopAnimation(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  /**
   * Format currency (EGP)
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  /**
   * Format number with commas
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-EG').format(Math.round(value));
  }
}
