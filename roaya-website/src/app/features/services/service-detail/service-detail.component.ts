import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  faCircleCheck,
  faBuilding,
  faEnvelope
} from '@ng-icons/font-awesome/regular';
import { faCreditCard } from '@ng-icons/font-awesome/regular';
import { NavigationService, ServiceItem } from '../../../core/services/navigation.service';

/**
 * Service Detail Component
 * Displays comprehensive information about a specific service
 * Route: /services/:id
 */
@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.scss',
  providers: [
    provideIcons({
      faCircleCheck,
      faBuilding,
      faCreditCard,
      faEnvelope
    })
  ]
})
export class ServiceDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly navigationService = inject(NavigationService);

  // Current service ID from route
  serviceId = signal<string>('');

  // Current service data
  service = computed<ServiceItem | undefined>(() => {
    const id = this.serviceId();
    return this.navigationService.getServiceItems().find(s => s.id === id);
  });

  // Related services (excluding current service)
  relatedServices = computed<ServiceItem[]>(() => {
    const currentId = this.serviceId();
    return this.navigationService.getServiceItems()
      .filter(s => s.id !== currentId)
      .slice(0, 3);
  });

  // Sample industries served (these would be dynamic based on service)
  industries = [
    'Banking & Finance',
    'Healthcare',
    'Manufacturing',
    'Retail',
    'Education',
    'Government'
  ];

  // Sample benefits (common across all services)
  benefits = [
    { key: 'security', icon: 'faCircleCheck' },
    { key: 'support', icon: 'faCircleCheck' },
    { key: 'scalable', icon: 'faCircleCheck' },
    { key: 'compliance', icon: 'faCircleCheck' },
    { key: 'performance', icon: 'faCircleCheck' },
    { key: 'costEffective', icon: 'faCircleCheck' }
  ];

  // Service-specific pricing tiers
  pricingTiers = computed(() => {
    const id = this.serviceId();
    // Different pricing based on service type
    switch(id) {
      case 'cloud':
      case 'security':
      case 'managed':
        return [
          { name: 'Starter', price: '5,000', period: 'month' },
          { name: 'Professional', price: '15,000', period: 'month' },
          { name: 'Enterprise', price: 'Custom', period: 'custom' }
        ];
      case 'email':
      case 'backup':
        return [
          { name: 'Basic', price: '2,500', period: 'month' },
          { name: 'Business', price: '7,500', period: 'month' },
          { name: 'Enterprise', price: 'Custom', period: 'custom' }
        ];
      case 'consulting':
      case 'sap':
      case 'automation':
        return [
          { name: 'Consultation', price: '10,000', period: 'project' },
          { name: 'Implementation', price: '50,000', period: 'project' },
          { name: 'Custom Solution', price: 'Custom', period: 'custom' }
        ];
      default:
        return [];
    }
  });

  ngOnInit(): void {
    // Get service ID from route parameter with proper cleanup to prevent memory leak
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (params) => {
          const id = params.get('id');
          if (id) {
            this.serviceId.set(id);

            // Redirect to services page if service not found
            if (!this.service()) {
              this.router.navigate(['/services']);
            }
          } else {
            this.router.navigate(['/services']);
          }
        },
        error: (error) => {
          console.error('Error loading service:', error);
          this.router.navigate(['/services']);
        }
      });
  }

  /**
   * Scroll to contact section (would need to implement contact form on page)
   */
  scrollToContact(): void {
    this.router.navigate(['/contact']);
  }

  /**
   * Navigate to pricing page
   */
  goToPricing(): void {
    this.router.navigate(['/pricing']);
  }

  /**
   * Get feature keys for current service
   */
  getFeatureKeys(): string[] {
    const id = this.serviceId();
    if (!id) return [];

    // Return feature keys based on service ID
    // These correspond to translation keys like 'services.cloud.features.infrastructure'
    return ['infrastructure', 'migration', 'optimization', 'monitoring']
      .map((_, index) => Object.keys(this.getServiceFeatures())[index])
      .filter(Boolean);
  }

  /**
   * Get service features object
   */
  private getServiceFeatures(): Record<string, string> {
    // This is a helper to work with the translation structure
    // Features are defined in translation files under services.<id>.features
    return {
      feature1: 'Feature 1',
      feature2: 'Feature 2',
      feature3: 'Feature 3',
      feature4: 'Feature 4'
    };
  }
}
