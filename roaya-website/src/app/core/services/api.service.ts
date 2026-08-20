import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * API Service
 * Handles public-facing form submissions to the backend lead system.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Submit contact form as a lead.
   * Maps the single `name` field to firstName/lastName for the backend.
   */
  submitContactForm(formData: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    service?: string;
    message: string;
  }): Observable<{ success: boolean; data: unknown }> {
    const { firstName, lastName } = this.splitName(formData.name);

    const payload = {
      firstName,
      lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      source: 'CONTACT_FORM',
      message: formData.message,
      formData: {
        service: formData.service,
      },
    };

    return this.http
      .post<{ success: boolean; data: unknown }>(`${this.apiUrl}/leads/submit`, payload);
  }

  /**
   * Submit pricing quote request as a lead.
   */
  submitPricingLead(formData: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    industry?: string;
    employees?: string;
    services?: string[];
    requirements?: string;
  }): Observable<{ success: boolean; data: unknown }> {
    const { firstName, lastName } = this.splitName(formData.name);

    const payload = {
      firstName,
      lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      source: 'PRICING_PAGE',
      message: formData.requirements || undefined,
      formData: {
        industry: formData.industry,
        employees: formData.employees,
        services: formData.services,
      },
    };

    return this.http
      .post<{ success: boolean; data: unknown }>(`${this.apiUrl}/leads/submit`, payload);
  }

  /**
   * Submit ROI calculator lead.
   */
  submitROILead(leadData: {
    calculatorType?: string;
    inputs?: unknown;
    results?: unknown;
    contactInfo: {
      name: string;
      email: string;
      phone?: string;
      company?: string;
      industry?: string;
    };
    currentSpend?: string;
    painPoints?: string[];
  }): Observable<{ success: boolean; data: unknown }> {
    const { firstName, lastName } = this.splitName(leadData.contactInfo.name);

    const payload = {
      firstName,
      lastName,
      email: leadData.contactInfo.email,
      phone: leadData.contactInfo.phone || undefined,
      company: leadData.contactInfo.company || undefined,
      source: 'ROI_CALCULATOR',
      message: leadData.currentSpend
        ? `Current IT Spend: ${leadData.currentSpend}`
        : undefined,
      formData: {
        calculatorType: leadData.calculatorType,
        inputs: leadData.inputs,
        results: leadData.results,
        industry: leadData.contactInfo.industry,
        painPoints: leadData.painPoints,
        currentSpend: leadData.currentSpend,
      },
    };

    return this.http
      .post<{ success: boolean; data: unknown }>(`${this.apiUrl}/leads/submit`, payload);
  }

  /**
   * Split a full name into firstName and lastName.
   * If only one word is provided, lastName defaults to a dot.
   */
  private splitName(fullName: string): { firstName: string; lastName: string } {
    const parts = (fullName || '').trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '.';
    return { firstName, lastName };
  }
}
