import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AnalyticsService } from '../../core/services/analytics.service';

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
export class PricingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly analytics = inject(AnalyticsService);

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
        service: this.selectedServices.join(', '),
        message: `Industry: ${this.quoteForm.value.industry || 'Not specified'}\nEmployees: ${this.quoteForm.value.employees || 'Not specified'}\nServices: ${this.selectedServices.join(', ') || 'Not specified'}\n\nRequirements:\n${this.quoteForm.value.requirements || 'Not specified'}`
      };

      await firstValueFrom(this.apiService.submitContactForm(formData));

      this.isSubmitted.set(true);
      this.quoteForm.reset();
      this.selectedServices = [];
      this.analytics.trackFormSubmission('contact', true);
    } catch (error) {
      console.error('Quote form submission error:', error);
      this.hasError.set(true);
      this.analytics.trackFormSubmission('contact', false);
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
