import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent {
  isYearly = signal(false);
  expandedFAQ = signal<number | null>(null);

  plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'pricing.plans.starter.name',
      description: 'pricing.plans.starter.description',
      price: { monthly: 4999, yearly: 49990 },
      features: [
        'pricing.plans.starter.features.users',
        'pricing.plans.starter.features.storage',
        'pricing.plans.starter.features.support',
        'pricing.plans.starter.features.backup',
        'pricing.plans.starter.features.monitoring'
      ]
    },
    {
      id: 'professional',
      name: 'pricing.plans.professional.name',
      description: 'pricing.plans.professional.description',
      price: { monthly: 14999, yearly: 149990 },
      highlighted: true,
      badge: 'pricing.mostPopular',
      features: [
        'pricing.plans.professional.features.users',
        'pricing.plans.professional.features.storage',
        'pricing.plans.professional.features.support',
        'pricing.plans.professional.features.backup',
        'pricing.plans.professional.features.monitoring',
        'pricing.plans.professional.features.security',
        'pricing.plans.professional.features.sla'
      ]
    },
    {
      id: 'enterprise',
      name: 'pricing.plans.enterprise.name',
      description: 'pricing.plans.enterprise.description',
      price: { monthly: 0, yearly: 0 },
      features: [
        'pricing.plans.enterprise.features.users',
        'pricing.plans.enterprise.features.storage',
        'pricing.plans.enterprise.features.support',
        'pricing.plans.enterprise.features.backup',
        'pricing.plans.enterprise.features.monitoring',
        'pricing.plans.enterprise.features.security',
        'pricing.plans.enterprise.features.sla',
        'pricing.plans.enterprise.features.dedicated',
        'pricing.plans.enterprise.features.custom'
      ]
    }
  ];

  faqs: FAQ[] = [
    { question: 'pricing.faq.q1', answer: 'pricing.faq.a1' },
    { question: 'pricing.faq.q2', answer: 'pricing.faq.a2' },
    { question: 'pricing.faq.q3', answer: 'pricing.faq.a3' },
    { question: 'pricing.faq.q4', answer: 'pricing.faq.a4' },
    { question: 'pricing.faq.q5', answer: 'pricing.faq.a5' }
  ];

  toggleBilling(): void {
    this.isYearly.update(v => !v);
  }

  toggleFAQ(index: number): void {
    this.expandedFAQ.update(current => current === index ? null : index);
  }

  getPrice(plan: PricingPlan): number {
    return this.isYearly() ? plan.price.yearly : plan.price.monthly;
  }

  getSavings(plan: PricingPlan): number {
    const monthlyTotal = plan.price.monthly * 12;
    if (monthlyTotal === 0 || plan.price.yearly === 0) {
      return 0;
    }
    return Math.round((monthlyTotal - plan.price.yearly) / monthlyTotal * 100);
  }
}
