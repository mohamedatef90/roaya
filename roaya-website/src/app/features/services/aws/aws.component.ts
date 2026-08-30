import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideClipboardList,
  lucideArrowLeftRight,
  lucideShieldCheck,
  lucidePlus,
  lucideMinus,
  lucideCheck,
  lucideScanSearch,
  lucideDraftingCompass,
  lucideActivity,
  lucideTrendingDown,
  lucideBadgeCheck,
  lucideMapPin,
  lucideHeadset,
  lucideArrowRight,
  lucideChevronLeft,
  lucideChevronRight,
  lucideAward,
  lucideClock,
  lucideLifeBuoy,
  lucideGlobe,
  lucideTarget,
  lucideCloud,
  lucideBuilding2,
  lucideFileText,
  lucideCoins,
  lucideCircleCheckBig,
  lucideKeyRound,
  lucideDatabaseBackup,
  lucideRocket,
  lucideMessageCircle,
  lucidePhone,
  lucideMail,
  lucideLinkedin,
  lucideFacebook,
} from '@ng-icons/lucide';
import { firstValueFrom, filter, take } from 'rxjs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ApiService } from '../../../core/services/api.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ScrollSmootherService } from '../../../core/services/scroll-smoother.service';

type RegionId = 'egypt' | 'ksa' | 'uae' | 'pakistan';
type StageId = 'assess' | 'design' | 'migrate' | 'secure' | 'operate' | 'optimize';
type PillarId = 'local' | 'delivery' | 'security' | 'programmes';

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
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, NgIcon],
  templateUrl: './aws.component.html',
  styleUrl: './aws.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideClipboardList,
      lucideArrowLeftRight,
      lucideShieldCheck,
      lucidePlus,
      lucideMinus,
      lucideCheck,
      lucideScanSearch,
      lucideDraftingCompass,
      lucideActivity,
      lucideTrendingDown,
      lucideBadgeCheck,
      lucideMapPin,
      lucideHeadset,
      lucideArrowRight,
      lucideChevronLeft,
      lucideChevronRight,
      lucideAward,
      lucideClock,
      lucideLifeBuoy,
      lucideGlobe,
      lucideTarget,
      lucideCloud,
      lucideBuilding2,
      lucideFileText,
      lucideCoins,
      lucideCircleCheckBig,
      lucideKeyRound,
      lucideDatabaseBackup,
      lucideRocket,
      lucideMessageCircle,
      lucidePhone,
      lucideMail,
      lucideLinkedin,
      lucideFacebook
    })
  ]
})
export class AwsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly analytics = inject(AnalyticsService);
  private readonly smoother = inject(ScrollSmootherService);
  private readonly platformId = inject(PLATFORM_ID);
  private scrollTriggers: ScrollTrigger[] = [];
  private animationsStarted = false;

  /**
   * Brand marks for the partnership lockup. Both brands ship a light and a
   * reversed variant so the lockup needs no plate behind it: the theme picks
   * the artwork instead of a box being drawn to rescue contrast.
   *
   * aws-mark*.png are un-matted from the supplied logo (the original was
   * matted onto opaque white); the reversed pair keeps the official orange.
   */
  readonly awsLogoPath = '/assets/images/aws/aws-mark.png';
  readonly awsLogoReversedPath = '/assets/images/aws/aws-mark-reversed.png';
  readonly roayaLogoPath = '/assets/images/aws/roaya-mark-ink.png';
  readonly roayaLogoReversedPath = '/assets/images/aws/roaya-mark-reversed.png';

  /** High-signal proof points kept in the first fold beside the main CTA. */
  readonly heroProofs = [
    { id: 'tier', icon: 'lucideAward' },
    { id: 'years', icon: 'lucideClock' },
    { id: 'support', icon: 'lucideLifeBuoy' },
    { id: 'markets', icon: 'lucideGlobe' }
  ] as const;

  /**
   * The six stages of the engagement. They drive one shared topology in the
   * hero — the same estate/transit/AWS mechanism re-lit per stage — rather
   * than six unrelated illustrations.
   */
  readonly journey: { id: StageId; n: string; icon: string }[] = [
    { id: 'assess', n: '01', icon: 'lucideScanSearch' },
    { id: 'design', n: '02', icon: 'lucideDraftingCompass' },
    { id: 'migrate', n: '03', icon: 'lucideArrowLeftRight' },
    { id: 'secure', n: '04', icon: 'lucideShieldCheck' },
    { id: 'operate', n: '05', icon: 'lucideActivity' },
    { id: 'optimize', n: '06', icon: 'lucideTrendingDown' }
  ];

  /**
   * 'Why Roaya' pillars. Like the hero journey, the rail drives one panel:
   * selecting a pillar swaps the story AND its visualisation together.
   */
  readonly pillars: { id: PillarId; n: string; icon: string }[] = [
    { id: 'local', n: '01', icon: 'lucideGlobe' },
    { id: 'delivery', n: '02', icon: 'lucideTarget' },
    { id: 'security', n: '03', icon: 'lucideShieldCheck' },
    { id: 'programmes', n: '04', icon: 'lucideCloud' }
  ];

  /** The single accountable delivery path below the Roaya core. */
  readonly accountStages = [
    { id: 'design', icon: 'lucideDraftingCompass' },
    { id: 'deliver', icon: 'lucideRocket' },
    { id: 'operate', icon: 'lucideActivity' }
  ] as const;

  /** Three secondary indicators per pillar, in template order. */
  readonly pillarSignals: Record<PillarId, string[]> = {
    local: ['lucideClock', 'lucideMapPin', 'lucideLifeBuoy'],
    delivery: ['lucideFileText', 'lucideCoins', 'lucideCircleCheckBig'],
    security: ['lucideKeyRound', 'lucideActivity', 'lucideDatabaseBackup'],
    programmes: ['lucideClipboardList', 'lucideRocket', 'lucideBadgeCheck']
  };

  readonly faqs = [
    'tier',
    'residency',
    'map',
    'timeline',
    'pricing',
    'arabic'
  ] as const;

  readonly regions: { id: RegionId }[] = [
    { id: 'egypt' },
    { id: 'ksa' },
    { id: 'uae' },
    { id: 'pakistan' }
  ];

  /**
   * Operations and support. The stats restate commitments the page already
   * makes elsewhere — no response-time figure is claimed here that an
   * engagement has not agreed. Channels point at the live contact details.
   */
  readonly supportStats = [
    { id: 'clock', icon: 'lucideClock' },
    { id: 'team', icon: 'lucideHeadset' },
    { id: 'lang', icon: 'lucideGlobe' }
  ] as const;

  readonly supportChannels = [
    { id: 'whatsapp', icon: 'lucideMessageCircle', href: 'https://wa.me/201096274996', external: true },
    { id: 'phone', icon: 'lucidePhone', href: 'tel:+20227469708', external: false },
    { id: 'email', icon: 'lucideMail', href: 'mailto:info@roaya.co', external: false },
    { id: 'linkedin', icon: 'lucideLinkedin', href: 'https://www.linkedin.com/company/19047659', external: true },
    { id: 'facebook', icon: 'lucideFacebook', href: 'https://www.facebook.com/RoayaIT', external: true }
  ] as const;

  readonly credentialPath = [
    { id: 'assess', n: '01', icon: 'lucideScanSearch' },
    { id: 'migrate', n: '02', icon: 'lucideArrowLeftRight' },
    { id: 'secure', n: '03', icon: 'lucideShieldCheck' },
    { id: 'operate', n: '04', icon: 'lucideActivity' }
  ] as const;
  readonly markets = ['egypt', 'ksa', 'uae', 'other'] as const;
  readonly topics = ['migration', 'security', 'cost', 'ops', 'data', 'other'] as const;

  readonly motes = this.seedMotes(14, 20260824);

  /** Three abstract territory clusters — a region field, not a coastline. */
  readonly regionDots = this.seedRegion();

  readonly deliverySteps = [
    { id: 'discover', n: '01', x: 96 },
    { id: 'scope', n: '02', x: 224 },
    { id: 'deliver', n: '03', x: 352 },
    { id: 'validate', n: '04', x: 480 }
  ] as const;

  readonly securityLayers = [
    { id: 'identity', x: 62 },
    { id: 'network', x: 171 },
    { id: 'detection', x: 280 },
    { id: 'backup', x: 389 },
    { id: 'compliance', x: 498 }
  ] as const;

  readonly programmeStops = [
    { id: 'assess', n: '01', x: 12 },
    { id: 'mobilise', n: '02', x: 152 },
    { id: 'migrate', n: '03', x: 292 },
    { id: 'optimise', n: '04', x: 432 }
  ] as const;

  readonly programmeLinks = [
    { from: 124, to: 152 },
    { from: 264, to: 292 },
    { from: 404, to: 432 }
  ] as const;

  readonly activeRegion = signal<RegionId>('egypt');
  readonly activeStage = signal<StageId>('assess');
  readonly activeStageIndex = computed(() =>
    this.journey.findIndex((stage) => stage.id === this.activeStage())
  );
  readonly activeStageNumber = computed(() => this.journey[this.activeStageIndex()].n);
  readonly activePillar = signal<PillarId>('local');
  readonly activePillarIndex = computed(() =>
    this.pillars.findIndex((pillar) => pillar.id === this.activePillar())
  );
  readonly activePillarNumber = computed(() => this.pillars[this.activePillarIndex()].n);
  readonly openFaq = signal<number | null>(null);
  readonly isSubmitting = signal(false);
  readonly isSubmitted = signal(false);
  readonly hasError = signal(false);
  readonly prefersReducedMotion = signal(
    isPlatformBrowser(inject(PLATFORM_ID)) &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  readonly questionForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    company: [''],
    market: this.fb.nonNullable.control<(typeof this.markets)[number]>('egypt'),
    topic: this.fb.nonNullable.control<(typeof this.topics)[number]>('migration'),
    message: ['', [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit(): void {
    // SEO metadata for this route comes from the ROUTE_METADATA registry
    // (single SEO writer, TIFO-14) — bilingual and applied on lang change.
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

  selectStage(id: StageId): void {
    this.activeStage.set(id);
  }

  nextStage(): void {
    const last = this.journey.length - 1;
    const index = this.activeStageIndex();
    this.activeStage.set(this.journey[index === last ? 0 : index + 1].id);
  }

  prevStage(): void {
    const last = this.journey.length - 1;
    const index = this.activeStageIndex();
    this.activeStage.set(this.journey[index === 0 ? last : index - 1].id);
  }

  /**
   * Vertical tablist keyboard model: Up/Down cycle, Home/End jump. Roving
   * tabindex means focus has to follow the selection once Angular has
   * rendered the new `tabindex`, hence the deferred focus call.
   */
  selectPillar(id: PillarId): void {
    this.activePillar.set(id);
  }

  nextPillar(): void {
    const last = this.pillars.length - 1;
    const index = this.activePillarIndex();
    this.activePillar.set(this.pillars[index === last ? 0 : index + 1].id);
  }

  prevPillar(): void {
    const last = this.pillars.length - 1;
    const index = this.activePillarIndex();
    this.activePillar.set(this.pillars[index === 0 ? last : index - 1].id);
  }

  /** Keyboard model for the four capability nodes in the accountable team. */
  onPillarKeydown(event: KeyboardEvent): void {
    const last = this.pillars.length - 1;
    const from = this.activePillarIndex();
    let next: number;

    switch (event.key) {
      case 'ArrowDown':
        next = from === last ? 0 : from + 1;
        break;
      case 'ArrowUp':
        next = from === 0 ? last : from - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.activePillar.set(this.pillars[next].id);

    if (!isPlatformBrowser(this.platformId)) return;
    const rail = event.currentTarget as HTMLElement;
    const id = this.pillars[next].id;
    setTimeout(() => rail.querySelector<HTMLElement>('#aws-account-tab-' + id)?.focus(), 0);
  }

  onRailKeydown(event: KeyboardEvent): void {
    const last = this.journey.length - 1;
    const from = this.activeStageIndex();
    let next: number;

    switch (event.key) {
      case 'ArrowDown':
        next = from === last ? 0 : from + 1;
        break;
      case 'ArrowUp':
        next = from === 0 ? last : from - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.activeStage.set(this.journey[next].id);

    if (!isPlatformBrowser(this.platformId)) return;
    const rail = event.currentTarget as HTMLElement;
    const id = this.journey[next].id;
    setTimeout(() => rail.querySelector<HTMLElement>('#aws-stage-tab-' + id)?.focus(), 0);
  }

  toggleFaq(index: number): void {
    this.openFaq.update((open) => (open === index ? null : index));
  }

  scrollToQuestions(): void {
    this.scrollToSection('questions');
  }

  scrollToCredentials(): void {
    this.scrollToSection('credentials');
  }

  scrollToWhy(): void {
    this.scrollToSection('why');
  }

  private scrollToSection(id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const target = document.getElementById(id);
    if (!target) return;

    if (this.smoother.isReady()) {
      // ScrollSmoother can ignore transformed element targets on touch-sized
      // viewports. A numeric position is reliable and keeps ScrollTrigger in
      // sync so the destination's reveal animations still run.
      const headerOffset = 96;
      const top = target.getBoundingClientRect().top + this.smoother.scrollTop() - headerOffset;
      this.smoother.scrollTo(Math.max(0, top), !this.prefersReducedMotion());
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

  /**
   * A deterministic dot field in three clusters, sized so the shape reads as
   * "three markets" without asserting real borders.
   */
  private seedRegion(): { x: number; y: number; z: number }[] {
    let seed = 19470723;
    const prand = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
    const clusters = [
      { cx: 128, cy: 172, rx: 46, ry: 26 },
      { cx: 280, cy: 176, rx: 58, ry: 28 },
      { cx: 432, cy: 172, rx: 46, ry: 26 }
    ];
    const dots: { x: number; y: number; z: number }[] = [];
    clusters.forEach((cluster, ci) => {
      for (let i = 0; i < 34; i++) {
        const angle = prand() * Math.PI * 2;
        const radius = Math.sqrt(prand());
        dots.push({
          x: Math.round(cluster.cx + Math.cos(angle) * radius * cluster.rx),
          y: Math.round(cluster.cy + Math.sin(angle) * radius * cluster.ry),
          z: (ci + i) % 3
        });
      }
    });
    return dots;
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
