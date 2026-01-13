import { Component, signal, inject, AfterViewInit, OnDestroy, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { firstValueFrom, filter, take } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ScrollSmootherService } from '../../core/services/scroll-smoother.service';

interface ContactInfo {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string;
  link?: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroSection') heroSection!: ElementRef;
  @ViewChild('contactSection') contactSection!: ElementRef;
  @ViewChild('mapSection') mapSection!: ElementRef;

  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly analytics = inject(AnalyticsService);
  private readonly scrollSmootherService = inject(ScrollSmootherService);
  private readonly platformId = inject(PLATFORM_ID);
  private scrollTriggers: ScrollTrigger[] = [];

  isSubmitting = signal(false);
  isSubmitted = signal(false);
  hasError = signal(false);
  prefersReducedMotion = signal(false);

  contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^\+?[0-9\s\-()]{8,20}$/)]],
    company: [''],
    service: [''],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  services = [
    'contact.form.services.cloud',
    'contact.form.services.security',
    'contact.form.services.email',
    'contact.form.services.managed',
    'contact.form.services.backup',
    'contact.form.services.consulting',
    'contact.form.services.other'
  ];

  contactInfo: ContactInfo[] = [
    {
      icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
      iconBg: 'from-secondary-500 to-secondary-600',
      iconColor: 'text-white',
      title: 'contact.info.address.title',
      value: 'contact.info.address.value'
    },
    {
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      iconBg: 'from-accent-500 to-accent-600',
      iconColor: 'text-white',
      title: 'contact.info.email.title',
      value: 'info@roaya.co',
      link: 'mailto:info@roaya.co'
    },
    {
      icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
      iconBg: 'from-primary-500 to-primary-600',
      iconColor: 'text-white',
      title: 'contact.info.phone.title',
      value: '+201096274996',
      link: 'tel:+201096274996'
    },
    {
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      iconBg: 'from-green-500 to-green-600',
      iconColor: 'text-white',
      title: 'contact.info.hours.title',
      value: 'contact.info.hours.value'
    }
  ];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check for reduced motion preference
    this.prefersReducedMotion.set(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    if (!this.prefersReducedMotion()) {
      // Wait for ScrollSmoother to be ready before initializing GSAP animations
      this.scrollSmootherService.smootherReady$
        .pipe(
          filter(ready => ready),
          take(1)
        )
        .subscribe(() => {
          setTimeout(() => {
            this.initAnimations();
          }, 50);
        });

      // Fallback: If ScrollSmoother isn't ready within 500ms, init anyway
      setTimeout(() => {
        if (!this.scrollSmootherService.isReady()) {
          this.initAnimations();
        }
      }, 500);
    }
  }

  ngOnDestroy(): void {
    // Clean up all ScrollTriggers
    this.scrollTriggers.forEach(trigger => trigger.kill());
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  private initAnimations(): void {
    gsap.registerPlugin(ScrollTrigger);

    // Hero section animations
    const heroTimeline = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });

    heroTimeline
      .from('.hero-badge', {
        opacity: 0,
        y: 20,
        duration: 0.6
      })
      .from('.hero-title', {
        opacity: 0,
        y: 30,
        duration: 0.8
      }, '-=0.3')
      .from('.hero-description', {
        opacity: 0,
        y: 20,
        duration: 0.6
      }, '-=0.4')
      .from('.hero-3d-element', {
        opacity: 0,
        scale: 0.8,
        rotation: -10,
        duration: 1
      }, '-=0.6');

    // Contact info cards stagger animation
    const trigger1 = ScrollTrigger.create({
      trigger: '.contact-info-container',
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.contact-info-card', {
          opacity: 0,
          x: -30,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out'
        });
      },
      once: true
    });
    this.scrollTriggers.push(trigger1);

    // Form card entrance
    const trigger2 = ScrollTrigger.create({
      trigger: '.form-card',
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.form-card', {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: 'power3.out'
        });
      },
      once: true
    });
    this.scrollTriggers.push(trigger2);

    // Floating animation for 3D elements
    gsap.to('.float-element', {
      y: -15,
      duration: 2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    });

    // Parallax effect on hero background elements
    gsap.to('.parallax-slow', {
      y: 100,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    gsap.to('.parallax-fast', {
      y: 200,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });
  }

  // Magnetic hover effect for buttons
  onButtonMouseMove(event: MouseEvent, element: HTMLElement): void {
    if (this.prefersReducedMotion()) return;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    gsap.to(element, {
      x: x * 0.2,
      y: y * 0.2,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  onButtonMouseLeave(element: HTMLElement): void {
    if (this.prefersReducedMotion()) return;

    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    });
  }

  // Check if a field has errors and has been touched
  hasFieldError(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  // Get specific error for a field
  getFieldError(fieldName: string): string | null {
    const field = this.contactForm.get(fieldName);
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
    // Mark all fields as touched to show validation errors
    this.contactForm.markAllAsTouched();

    if (this.contactForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.hasError.set(false);

    try {
      const formData = {
        name: this.contactForm.value.name,
        email: this.contactForm.value.email,
        phone: this.contactForm.value.phone,
        company: this.contactForm.value.company,
        service: this.contactForm.value.service,
        message: this.contactForm.value.message
      };

      await firstValueFrom(this.apiService.submitContactForm(formData));
      
      this.isSubmitted.set(true);
      this.contactForm.reset();
      this.analytics.trackFormSubmission('contact', true);

      // Animate success state
      if (!this.prefersReducedMotion()) {
        gsap.from('.success-icon', {
          scale: 0,
          rotation: -180,
          duration: 0.6,
          ease: 'back.out(1.7)'
        });
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      this.hasError.set(true);
      this.analytics.trackFormSubmission('contact', false);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  resetForm(): void {
    this.contactForm.reset();
    this.isSubmitted.set(false);
  }
}
