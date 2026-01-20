import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AnalyticsService } from '../../core/services/analytics.service';

interface PainPoint {
  value: string;
  label: string;
}

@Component({
  selector: 'app-roi-calculator',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslateModule],
  templateUrl: './roi-calculator.component.html',
  styleUrl: './roi-calculator.component.scss'
})
export class RoiCalculatorComponent {
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly analytics = inject(AnalyticsService);

  isSubmitting = signal(false);
  isSubmitted = signal(false);
  hasError = signal(false);
  selectedPainPoints: string[] = [];

  roiForm: FormGroup = this.fb.group({
    companyName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^\+?[0-9\s\-()]{8,20}$/)]],
    currentSpend: ['']
  });

  painPoints: PainPoint[] = [
    { value: 'highCosts', label: 'roiCalculator.leadCapture.form.painPointOptions.highCosts' },
    { value: 'security', label: 'roiCalculator.leadCapture.form.painPointOptions.security' },
    { value: 'downtime', label: 'roiCalculator.leadCapture.form.painPointOptions.downtime' },
    { value: 'scalability', label: 'roiCalculator.leadCapture.form.painPointOptions.scalability' },
    { value: 'compliance', label: 'roiCalculator.leadCapture.form.painPointOptions.compliance' },
    { value: 'management', label: 'roiCalculator.leadCapture.form.painPointOptions.management' }
  ];

  onPainPointChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedPainPoints.push(checkbox.value);
    } else {
      this.selectedPainPoints = this.selectedPainPoints.filter(p => p !== checkbox.value);
    }
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.roiForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.roiForm.get(fieldName);
    if (!field || !field.errors) return 'validation.required';

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
    return 'validation.required';
  }

  async onSubmit(): Promise<void> {
    this.roiForm.markAllAsTouched();

    if (this.roiForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.hasError.set(false);

    try {
      const formData = {
        name: this.roiForm.value.companyName,
        email: this.roiForm.value.email,
        phone: this.roiForm.value.phone,
        company: this.roiForm.value.companyName,
        service: 'ROI Analysis Request',
        message: `Current IT Spend: ${this.roiForm.value.currentSpend || 'Not specified'}\nPain Points: ${this.selectedPainPoints.join(', ') || 'None specified'}`
      };

      await firstValueFrom(this.apiService.submitContactForm(formData));

      this.isSubmitted.set(true);
      this.roiForm.reset();
      this.selectedPainPoints = [];
      this.analytics.trackFormSubmission('roi_lead', true);
    } catch (error) {
      console.error('ROI form submission error:', error);
      this.hasError.set(true);
      this.analytics.trackFormSubmission('roi_lead', false);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  resetForm(): void {
    this.roiForm.reset();
    this.selectedPainPoints = [];
    this.isSubmitted.set(false);
    this.hasError.set(false);
  }
}
