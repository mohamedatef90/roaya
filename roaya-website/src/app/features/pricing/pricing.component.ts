import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ContentService, ServicePackage } from '../../core/services/content.service';

interface FAQ {
  question: string;
  answer: string;
}

interface IndustryOption {
  value: string;
  label: string;
}

interface ServiceOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslateModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly analytics = inject(AnalyticsService);
  private readonly contentService = inject(ContentService);
  private readonly translateService = inject(TranslateService);

  packages = signal<ServicePackage[]>([]);
  isYearly = signal(false);

  expandedFAQ = signal<number | null>(null);
  isSubmitting = signal(false);
  isSubmitted = signal(false);
  hasError = signal(false);
  selectedServices: string[] = [];

  quoteForm: FormGroup = this.fb.group({
    companyName: ['', [Validators.required, Validators.minLength(2)]],
    industry: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^\+?[0-9\s\-()]{8,20}$/)]],
    employees: [''],
    requirements: ['']
  });

  industries: IndustryOption[] = [
    { value: 'finance', label: 'roiCalculator.industries.finance' },
    { value: 'healthcare', label: 'roiCalculator.industries.healthcare' },
    { value: 'retail', label: 'roiCalculator.industries.retail' },
    { value: 'manufacturing', label: 'roiCalculator.industries.manufacturing' },
    { value: 'government', label: 'roiCalculator.industries.government' },
    { value: 'education', label: 'roiCalculator.industries.education' }
  ];

  services: ServiceOption[] = [
    { value: 'cloud', label: 'contact.form.services.cloud' },
    { value: 'security', label: 'contact.form.services.security' },
    { value: 'email', label: 'contact.form.services.email' },
    { value: 'managed', label: 'contact.form.services.managed' },
    { value: 'backup', label: 'contact.form.services.backup' },
    { value: 'sap', label: 'contact.form.services.sap' },
    { value: 'consulting', label: 'contact.form.services.consulting' }
  ];

  faqs: FAQ[] = [
    { question: 'pricing.faq.q1', answer: 'pricing.faq.a1' },
    { question: 'pricing.faq.q2', answer: 'pricing.faq.a2' },
    { question: 'pricing.faq.q3', answer: 'pricing.faq.a3' },
    { question: 'pricing.faq.q4', answer: 'pricing.faq.a4' },
    { question: 'pricing.faq.q5', answer: 'pricing.faq.a5' }
  ];

  ngOnInit(): void {
    this.contentService.getPackages().subscribe(pkgs => {
      this.packages.set(pkgs);
    });
  }

  get currentLang(): string {
    return this.translateService.currentLang || 'en';
  }

  toggleBilling(): void {
    this.isYearly.update(v => !v);
  }

  getPackagePrice(pkg: ServicePackage): number | null {
    const price = this.isYearly() ? pkg.priceYearly : pkg.priceMonthly;
    return price ?? null;
  }

  getPackageFeatures(pkg: ServicePackage): string[] {
    return this.currentLang === 'ar' ? pkg.featuresAr : pkg.featuresEn;
  }

  toggleFAQ(index: number): void {
    this.expandedFAQ.update(current => current === index ? null : index);
  }

  onServiceChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedServices.push(checkbox.value);
    } else {
      this.selectedServices = this.selectedServices.filter(s => s !== checkbox.value);
    }
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.quoteForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string | null {
    const field = this.quoteForm.get(fieldName);
    if (!field || !field.errors) return null;

    if (field.errors['required']) {
      return 'validation.required';
    }
    if (field.errors['email']) {
      return 'validation.invalidEmail';
    }
    if (field.errors['minlength']) {
      return 'validation.minLength';
    }
    if (field.errors['pattern']) {
      return 'validation.invalidPhone';
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    this.quoteForm.markAllAsTouched();

    if (this.quoteForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.hasError.set(false);

    try {
      const formData = {
        name: this.quoteForm.value.companyName,
        email: this.quoteForm.value.email,
        phone: this.quoteForm.value.phone,
        company: this.quoteForm.value.companyName,
        industry: this.quoteForm.value.industry,
        employees: this.quoteForm.value.employees,
        services: this.selectedServices,
        requirements: this.quoteForm.value.requirements,
      };

      await firstValueFrom(this.apiService.submitPricingLead(formData));

      this.isSubmitted.set(true);
      this.quoteForm.reset();
      this.selectedServices = [];
      this.analytics.trackFormSubmission('roaya-pricing-form', 'pricing_quote', true);
    } catch (error) {
      console.error('Quote form submission error:', error);
      this.hasError.set(true);
      this.analytics.trackFormSubmission('roaya-pricing-form', 'pricing_quote', false);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  resetForm(): void {
    this.quoteForm.reset();
    this.selectedServices = [];
    this.isSubmitted.set(false);
    this.hasError.set(false);
  }
}
