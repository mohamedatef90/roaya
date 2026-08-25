import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  inject,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideClipboardList,
  lucideArrowLeftRight,
  lucideBoxes,
  lucideShieldCheck,
  lucideDatabase,
  lucideGauge,
  lucidePlus,
  lucideMinus,
  lucideCheck
} from '@ng-icons/lucide';
import { firstValueFrom, filter, take } from 'rxjs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ApiService } from '../../../core/services/api.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ScrollSmootherService } from '../../../core/services/scroll-smoother.service';
import { SEOService } from '../../../core/services/seo.service';

type RegionId = 'egypt' | 'ksa' | 'uae';

/**
 * AWS Partnership landing page.
 * Route: /services/aws
 *
 * Content and section order come from the partnership brief.
 * Visual language comes from the live Roaya design system.
 */
@Component({
  selector: 'app-aws',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslateModule, NgIcon],
  templateUrl: './aws.component.html',
  styleUrl: './aws.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideClipboardList,
      lucideArrowLeftRight,
      lucideBoxes,
      lucideShieldCheck,
      lucideDatabase,
      lucideGauge,
      lucidePlus,
      lucideMinus,
      lucideCheck
    })
  ]
})
export class AwsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly analytics = inject(AnalyticsService);
  private readonly smoother = inject(ScrollSmootherService);
  private readonly seo = inject(SEOService);
  private readonly platformId = inject(PLATFORM_ID);
  private scrollTriggers: ScrollTrigger[] = [];
  private animationsStarted = false;

  readonly markPath = '/assets/images/aws/roaya-mark.png';
  readonly lockupPath = '/assets/images/aws/roaya-horizontal-reversed.png';

  readonly whyItems = [
    { id: 'local', n: '01' },
    { id: 'pricing', n: '02' },
    { id: 'security', n: '03' },
    { id: 'programmes', n: '04' }
  ] as const;

  readonly services = [
    { id: 'assess', icon: 'lucideClipboardList' },
    { id: 'migrate', icon: 'lucideArrowLeftRight' },
    { id: 'modernise', icon: 'lucideBoxes' },
    { id: 'secure', icon: 'lucideShieldCheck' },
    { id: 'data', icon: 'lucideDatabase' },
    { id: 'operate', icon: 'lucideGauge' }
  ] as const;

  readonly processSteps = ['discover', 'propose', 'migrate', 'operate'] as const;

  readonly faqs = [
    'tier',
    'residency',
    'map',
    'timeline',
    'pricing',
    'arabic'
  ] as const;

  readonly regions: { id: RegionId; code: string }[] = [
    { id: 'egypt', code: 'CAI-HYB' },
    { id: 'ksa', code: 'ME-SOUTH-1' },
    { id: 'uae', code: 'ME-CENTRAL-1' }
  ];

  readonly practices = ['cloud', 'security', 'email', 'managed'] as const;
  readonly markets = ['egypt', 'ksa', 'uae', 'other'] as const;
  readonly topics = ['migration', 'security', 'cost', 'ops', 'data', 'other'] as const;

  readonly opsRows = [
    { id: 'landing', state: 'ready' },
    { id: 'cost', state: 'progress' },
    { id: 'watch', state: 'live' }
  ] as const;

  readonly motes = this.seedMotes(26, 20260824);

  readonly activeRegion = signal<RegionId>('egypt');
  readonly openFaq = signal<number | null>(null);
  readonly isSubmitting = signal(false);
  readonly isSubmitted = signal(false);
  readonly hasError = signal(false);
  readonly prefersReducedMotion = signal(false);

  readonly questionForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    company: [''],
    market: this.fb.nonNullable.control<(typeof this.markets)[number]>('egypt'),
    topic: this.fb.nonNullable.control<(typeof this.topics)[number]>('migration'),
    message: ['', [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit(): void {
    this.seo.updateSEO({
      title: 'AWS Advanced Tier Partner — Roaya IT',
      description:
        'Roaya assesses, designs, migrates, secures and operates AWS environments for enterprises across Egypt, Saudi Arabia and the UAE.',
      keywords:
        'AWS partner Egypt, AWS Advanced Tier, AWS migration, AWS managed services, Roaya AWS, cloud Egypt, AWS Saudi Arabia, AWS UAE me-central-1',
      type: 'website'
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.prefersReducedMotion.set(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    if (this.prefersReducedMotion()) return;

    this.smoother.smootherReady$
      .pipe(filter((ready) => ready), take(1))
      .subscribe(() => {
        setTimeout(() => this.initMotion(), 50);
      });

    setTimeout(() => {
      if (!this.animationsStarted) this.initMotion();
    }, 600);
  }

  ngOnDestroy(): void {
    this.scrollTriggers.forEach((trigger) => trigger.kill());
    this.scrollTriggers = [];
  }

  selectRegion(id: RegionId): void {
    this.activeRegion.set(id);
  }

  toggleFaq(index: number): void {
    this.openFaq.update((open) => (open === index ? null : index));
  }

  scrollToQuestions(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const target = document.getElementById('questions');
    if (!target) return;

    if (this.smoother.isReady()) {
      this.smoother.scrollTo(target, true, 'top 96px');
      return;
    }

    target.scrollIntoView({ behavior: this.prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  hasFieldError(field: string): boolean {
    const control = this.questionForm.get(field);
    return !!control && control.invalid && control.touched;
  }

  async onSubmit(): Promise<void> {
    this.questionForm.markAllAsTouched();
    if (this.questionForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.hasError.set(false);

    const value = this.questionForm.getRawValue();
    const message = [
      `[AWS Partnership — ${value.topic} — ${value.market}]`,
      value.message
    ].join('\n\n');

    try {
      await firstValueFrom(
        this.api.submitContactForm({
          name: value.name,
          email: value.email,
          company: value.company || undefined,
          service: 'AWS Partnership',
          message
        })
      );

      this.isSubmitted.set(true);
      this.questionForm.reset({
        name: '',
        email: '',
        company: '',
        market: 'egypt',
        topic: 'migration',
        message: ''
      });
      this.analytics.trackFormSubmission('roaya-aws-question-form', 'contact', true);
    } catch {
      this.hasError.set(true);
      this.analytics.trackFormSubmission('roaya-aws-question-form', 'contact', false);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onHeroPointer(event: PointerEvent): void {
    if (this.prefersReducedMotion()) return;
    const scene = event.currentTarget as HTMLElement;
    const rect = scene.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    scene.style.setProperty('--anr-mx', x.toFixed(3));
    scene.style.setProperty('--anr-my', y.toFixed(3));
  }

  resetHeroPointer(event: PointerEvent): void {
    const scene = event.currentTarget as HTMLElement;
    scene.style.setProperty('--anr-mx', '0');
    scene.style.setProperty('--anr-my', '0');
  }

  private initMotion(): void {
    if (this.animationsStarted || !isPlatformBrowser(this.platformId)) return;
    this.animationsStarted = true;
    gsap.registerPlugin(ScrollTrigger);

    const heroItems = gsap.utils.toArray<HTMLElement>('.aws-hero [data-reveal]');
    if (heroItems.length) {
      gsap.from(heroItems, {
        opacity: 0,
        y: 12,
        duration: 0.42,
        stagger: 0.07,
        ease: 'power2.out'
      });
    }

    const sections = gsap.utils.toArray<HTMLElement>('.aws-page [data-reveal-group]');
    sections.forEach((section) => {
      const items = section.querySelectorAll<HTMLElement>('[data-reveal]');
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: 12 });
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.38,
            stagger: 0.06,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });
      this.scrollTriggers.push(trigger);
    });
  }

  private seedMotes(count: number, seedStart: number): { x: number; y: number; r: number; v: number }[] {
    let seed = seedStart;
    const prand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
    return Array.from({ length: count }, (_, i) => ({
      x: Math.round(prand() * 1600),
      y: Math.round(prand() * 900),
      r: +(0.9 + prand() * 1.8).toFixed(1),
      v: i % 4
    }));
  }
}
