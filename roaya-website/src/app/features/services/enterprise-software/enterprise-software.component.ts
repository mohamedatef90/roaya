import {
  Component,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  inject,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideLandmark,
  lucideSmartphone,
  lucideWorkflow,
  lucideClipboardList,
  lucideDraftingCompass,
  lucideCode,
  lucideShieldCheck,
  lucideRocket,
  lucideLifeBuoy,
  lucideUsers,
  lucideLayers,
  lucideServer,
  lucideMonitor,
  lucideTestTube,
  lucideGitBranch,
  lucideLock,
  lucideDatabase,
  lucideAccessibility,
  lucideHeadset,
  lucideGauge,
  lucideActivity,
  lucideFileSearch,
  lucideScanSearch,
  lucideBug,
  lucideGlobe,
  lucideFileCheck,
  lucideNetwork,
  lucideRefreshCw,
  lucideBookOpen,
  lucideBellRing,
  lucideArrowRight,
  lucidePlus,
  lucideMinus,
  lucideCheck,
  lucideBrain,
  lucideCloud,
  lucideWebhook,
  lucideMail,
  lucideZap,
  lucidePlug,
  lucideCalendarClock,
  lucideScrollText
} from '@ng-icons/lucide';
import { filter, take } from 'rxjs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ServiceFactsComponent } from '../../../shared/components/service-facts/service-facts.component';
import { ScrollSmootherService } from '../../../core/services/scroll-smoother.service';
import { LocalizeLinkPipe } from '../../../core/i18n/localize-link.pipe';

type CapabilityId = 'platforms' | 'government' | 'mobile' | 'automation';
type CapabilityPointKey = 'p1' | 'p2' | 'p3' | 'p4';

interface Capability {
  id: CapabilityId;
  icon: string;
  /** i18n namespace under services.enterpriseSoftware.capabilities */
  key: CapabilityId;
  /** Option B: the point promoted as this category's differentiating claim. */
  lead: CapabilityPointKey;
}

interface SecurityPhase {
  key: 'design' | 'code' | 'pipeline' | 'release';
  icon: string;
}

interface SimpleEntry {
  key: string;
  icon: string;
}

interface BenchGroup {
  key: 'defineDesign' | 'build' | 'verifySecure' | 'run';
  roles: readonly SimpleEntry[];
}

type StackItemKey = 'i1' | 'i2' | 'i3' | 'i4';

interface StackDecisionParts {
  decision: string;
  context: string;
}

interface FaqEntry {
  key: string;
}

/**
 * One syntax-coloured span in the hero editor. `k` selects the .es-tk--* class,
 * `v` is printed verbatim (leading/trailing spaces included), so the rendered
 * line is character-exact without the template adding or collapsing whitespace.
 */
interface CodeToken {
  k: 'kw' | 'ty' | 'fn' | 'st' | 'at' | 'nm' | 'pl';
  v: string;
}

/** One line of the hero editor. `i` is the indent in 4-space units. */
interface CodeLine {
  i: number;
  t: readonly CodeToken[];
}

/**
 * A node on the automation canvas. `kind` drives both the badge and the
 * visual weight — see the palette note in the SCSS: this page spends teal on
 * "built and running" and violet on the security gates only, so the three node
 * types are told apart by intensity and outline rather than by importing a
 * fifth and sixth accent colour.
 */
interface FlowNode {
  key: string;
  kind: 'trigger' | 'action' | 'condition';
  icon: string;
}

/**
 * Enterprise Software & Mobile Apps.
 * Route: /services/enterprise-software
 *
 * Claim discipline (2026-09 AI-readiness): this page publishes capability and
 * engineering practice only. No headcount, no SLA or response-time figure, no
 * certification claim, no uptime figure — none of those has a verified entry
 * in scripts/claim-evidence/registry.json. The team story is told by naming
 * the disciplines on the bench rather than counting people, and the support
 * section says explicitly that response commitments are contractual rather
 * than published (pending decision 1).
 *
 * Motion follows the AWS convention: declarative [data-reveal] items inside
 * [data-reveal-group] sections, collected by gsap.utils.toArray. The template
 * declares what animates; this component stays generic.
 */
@Component({
  selector: 'app-enterprise-software',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgIcon, ServiceFactsComponent, LocalizeLinkPipe],
  templateUrl: './enterprise-software.component.html',
  styleUrl: './enterprise-software.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideLandmark,
      lucideSmartphone,
      lucideWorkflow,
      lucideClipboardList,
      lucideDraftingCompass,
      lucideCode,
      lucideShieldCheck,
      lucideRocket,
      lucideLifeBuoy,
      lucideUsers,
      lucideLayers,
      lucideServer,
      lucideMonitor,
      lucideTestTube,
      lucideGitBranch,
      lucideLock,
      lucideDatabase,
      lucideAccessibility,
      lucideHeadset,
      lucideGauge,
      lucideActivity,
      lucideFileSearch,
      lucideScanSearch,
      lucideBug,
      lucideGlobe,
      lucideFileCheck,
      lucideNetwork,
      lucideRefreshCw,
      lucideBookOpen,
      lucideBellRing,
      lucideArrowRight,
      lucidePlus,
      lucideMinus,
      lucideCheck,
      lucideBrain,
      lucideCloud,
      lucideWebhook,
      lucideMail,
      lucideZap,
      lucidePlug,
      lucideCalendarClock,
      lucideScrollText
    })
  ]
})
export class EnterpriseSoftwareComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scrollSmoother = inject(ScrollSmootherService);

  private scrollTriggers: ScrollTrigger[] = [];
  /**
   * Guards the ready-or-500ms-fallback race below. Without it a smoother that
   * becomes ready after the fallback has already fired initialises the motion
   * twice, duplicating every ScrollTrigger on the page.
   */
  private animationsInitialized = false;
  private fallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private heroStageCleanup: (() => void) | null = null;

  /**
   * The hero editor's C#. Decorative (the whole composition is one role="img"),
   * but it is real ASP.NET Core shape rather than lorem: an authorised service
   * that validates before it writes and writes an audit record after — the two
   * engineering practices the Security and Government sections below describe.
   *
   * Deliberately carries no figure, metric or product name: the composition is
   * rendered into both locales and swept by published-claim-sweep like any
   * other page text.
   */
  readonly heroCode: readonly CodeLine[] = [
    { i: 0, t: [
      { k: 'pl', v: '[' }, { k: 'at', v: 'Authorize' }, { k: 'pl', v: '(' },
      { k: 'nm', v: 'Policy' }, { k: 'pl', v: ' = ' }, { k: 'st', v: '"Records.Submit"' },
      { k: 'pl', v: ')]' }
    ] },
    { i: 0, t: [
      { k: 'kw', v: 'public sealed class ' }, { k: 'ty', v: 'CaseService' },
      { k: 'pl', v: ' : ' }, { k: 'ty', v: 'ICaseService' }
    ] },
    { i: 0, t: [{ k: 'pl', v: '{' }] },
    { i: 1, t: [
      { k: 'kw', v: 'public async ' }, { k: 'ty', v: 'Task<Result<CaseFile>>' },
      { k: 'pl', v: ' ' }, { k: 'fn', v: 'SubmitAsync' }, { k: 'pl', v: '(' }
    ] },
    { i: 2, t: [
      { k: 'ty', v: 'CaseRequest' }, { k: 'pl', v: ' request, ' },
      { k: 'ty', v: 'CancellationToken' }, { k: 'pl', v: ' ct)' }
    ] },
    { i: 1, t: [{ k: 'pl', v: '{' }] },
    { i: 2, t: [
      { k: 'kw', v: 'var ' }, { k: 'pl', v: 'check = ' }, { k: 'kw', v: 'await ' },
      { k: 'nm', v: '_validator' }, { k: 'pl', v: '.' }, { k: 'fn', v: 'ValidateAsync' },
      { k: 'pl', v: '(request, ct);' }
    ] },
    { i: 2, t: [{ k: 'kw', v: 'if ' }, { k: 'pl', v: '(!check.IsValid)' }] },
    { i: 3, t: [
      { k: 'kw', v: 'return ' }, { k: 'ty', v: 'Result' }, { k: 'pl', v: '.' },
      { k: 'fn', v: 'Invalid' }, { k: 'pl', v: '(check.Errors);' }
    ] },
    { i: 0, t: [] },
    { i: 2, t: [
      { k: 'kw', v: 'var ' }, { k: 'pl', v: 'file = ' }, { k: 'kw', v: 'await ' },
      { k: 'nm', v: '_repo' }, { k: 'pl', v: '.' }, { k: 'fn', v: 'CreateAsync' },
      { k: 'pl', v: '(request.ToCase(), ct);' }
    ] },
    { i: 2, t: [
      { k: 'kw', v: 'await ' }, { k: 'nm', v: '_audit' }, { k: 'pl', v: '.' },
      { k: 'fn', v: 'RecordAsync' }, { k: 'pl', v: '(file.Id, ' },
      { k: 'ty', v: 'Actor' }, { k: 'pl', v: '.Current, ct);' }
    ] },
    { i: 0, t: [] },
    { i: 2, t: [
      { k: 'kw', v: 'return ' }, { k: 'ty', v: 'Result' }, { k: 'pl', v: '.' },
      { k: 'fn', v: 'Ok' }, { k: 'pl', v: '(file);' }
    ] },
    { i: 1, t: [{ k: 'pl', v: '}' }] },
    { i: 0, t: [{ k: 'pl', v: '}' }] }
  ];

  /**
   * The two device mocks in the hero: a case console, which is what the C#
   * on the screen behind them actually serves.
   *
   * Every string is a real interface label, translated like the rest of the
   * page — an Arabic reader sees an Arabic app, which is the "Arabic-first and
   * RTL native" line three inches to the left being demonstrated rather than
   * asserted. What the mock deliberately has *no* room for is a number: not a
   * count, a total or a metric anywhere. A fabricated figure inside a
   * decorative graphic is still a figure on a page whose whole discipline is
   * that it publishes none (see the class comment).
   */
  readonly appNav: readonly string[] = ['dashboard', 'cases', 'requests', 'reports', 'settings'];
  readonly appChips: readonly string[] = ['all', 'open', 'review'];
  readonly appRows: readonly { key: string; tone: 'review' | 'ok' | 'open' }[] = [
    { key: 'licence', tone: 'review' },
    { key: 'permit', tone: 'ok' },
    { key: 'records', tone: 'open' }
  ];
  readonly appTabs: readonly { key: string; icon: string }[] = [
    { key: 'home', icon: 'lucideLayers' },
    { key: 'cases', icon: 'lucideClipboardList' },
    { key: 'tasks', icon: 'lucideCheck' },
    { key: 'more', icon: 'lucidePlus' }
  ];
  /** Chart columns, as a share of the plot height. Axis-free and label-free. */
  readonly mockBars = [0.42, 0.68, 0.38, 0.82, 0.55, 0.9, 0.64] as const;

  readonly capabilities: readonly Capability[] = [
    { id: 'platforms', key: 'platforms', icon: 'lucideBuilding2', lead: 'p4' },
    { id: 'government', key: 'government', icon: 'lucideLandmark', lead: 'p3' },
    { id: 'mobile', key: 'mobile', icon: 'lucideSmartphone', lead: 'p4' },
    { id: 'automation', key: 'automation', icon: 'lucideWorkflow', lead: 'p3' }
  ];

  readonly activeCapability = signal<CapabilityId>('platforms');

  readonly benchGroups: readonly BenchGroup[] = [
    {
      key: 'defineDesign',
      roles: [
        { key: 'product', icon: 'lucideClipboardList' },
        { key: 'architecture', icon: 'lucideDraftingCompass' },
        { key: 'ux', icon: 'lucideAccessibility' }
      ]
    },
    {
      key: 'build',
      roles: [
        { key: 'backend', icon: 'lucideServer' },
        { key: 'frontend', icon: 'lucideMonitor' },
        { key: 'mobile', icon: 'lucideSmartphone' },
        { key: 'data', icon: 'lucideDatabase' }
      ]
    },
    {
      key: 'verifySecure',
      roles: [
        { key: 'qa', icon: 'lucideTestTube' },
        { key: 'security', icon: 'lucideLock' }
      ]
    },
    {
      key: 'run',
      roles: [
        { key: 'devops', icon: 'lucideGitBranch' },
        { key: 'support', icon: 'lucideHeadset' }
      ]
    }
  ];

  readonly securityPhases: readonly SecurityPhase[] = [
    { key: 'design', icon: 'lucideDraftingCompass' },
    { key: 'code', icon: 'lucideCode' },
    { key: 'pipeline', icon: 'lucideScanSearch' },
    { key: 'release', icon: 'lucideBug' }
  ];

  readonly securityStandards = ['asvs', 'masvs', 'top10', 'cwe', 'ssdf'] as const;

  /**
   * Delivery phases as a bento.
   *
   * `size` is not decoration: it encodes how much of a real engagement each
   * phase occupies. Build and Run dominate a project's calendar, Launch is a
   * day, so their tiles are sized that way and the section says so in its
   * legend. Changing a size therefore means claiming the shape of an
   * engagement has changed.
   *
   * DOM order stays chronological — the grid positions the tiles in CSS — so
   * the <ol> still reads as the real sequence for a screen reader or a crawler.
   */
  readonly deliverySteps: readonly { key: string; size: 'sm' | 'wide' | 'long' | 'xl'; weight?: boolean }[] = [
    { key: 'discovery', size: 'sm' },
    { key: 'architecture', size: 'sm' },
    { key: 'build', size: 'xl', weight: true },
    { key: 'harden', size: 'wide' },
    { key: 'launch', size: 'sm' },
    { key: 'run', size: 'long', weight: true }
  ];

  readonly stackGroups: readonly SimpleEntry[] = [
    { key: 'architecture', icon: 'lucideLayers' },
    { key: 'integration', icon: 'lucideNetwork' },
    { key: 'mobileEng', icon: 'lucideSmartphone' },
    { key: 'data', icon: 'lucideDatabase' },
    { key: 'cicd', icon: 'lucideGitBranch' },
    { key: 'observability', icon: 'lucideActivity' }
  ];

  readonly stackItemKeys: readonly StackItemKey[] = ['i1', 'i2', 'i3', 'i4'];

  /**
   * Option A splits each translated sentence at its existing natural clause.
   * Both locale markers live here so the source copy and translation keys stay
   * untouched; this is presentation metadata, not a second copy deck.
   */
  private readonly stackDecisionMarkers: Readonly<
    Record<string, Readonly<Record<StackItemKey, readonly string[]>>>
  > = {
    architecture: {
      i1: [' where ', ' حين '],
      i2: [' where ', ' حين '],
      i3: [' for ', ' للتدفقات'],
      i4: [' where ', ' حين ']
    },
    integration: {
      i1: [' with ', ' بعقود '],
      i2: [' for ', ' لتدفقات '],
      i3: [' for ', ' للأنظمة '],
      i4: [' that ', ' تُبقي ']
    },
    mobileEng: {
      i1: [' for ', ' للتطبيقات '],
      i2: [' for ', ' للتسليم '],
      i3: [' and background processing', ' والمعالجة في الخلفية'],
      i4: [', biometrics', ' والمصادقة الحيوية']
    },
    data: {
      i1: [' chosen ', ' تُختار '],
      i2: [', reversible', '، قابلة'],
      i3: [' separated ', ' عن '],
      i4: [' and handled ', ' والتعامل ']
    },
    cicd: {
      i1: [' with ', ' ببوابات '],
      i2: [', so ', '، فتصبح '],
      i3: [' where ', ' حين '],
      i4: [' and a rollback ', ' ومسار ']
    },
    observability: {
      i1: [' with ', ' مع '],
      i2: [' from ', ' منذ '],
      i3: [' tied ', ' مرتبطة '],
      i4: [' where ', ' حيث ']
    }
  };

  splitStackDecision(text: string, groupKey: string, itemKey: StackItemKey): StackDecisionParts {
    const markers = this.stackDecisionMarkers[groupKey]?.[itemKey] ?? [];
    const marker = markers.find(candidate => text.includes(candidate));
    if (!marker) return { decision: text, context: '' };

    const splitAt = text.indexOf(marker);
    return {
      decision: text.slice(0, splitAt).trim().replace(/[,،]$/, ''),
      context: text.slice(splitAt).trim().replace(/^[,،]\s*/, '')
    };
  }

  readonly govtPoints: readonly SimpleEntry[] = [
    { key: 'residency', icon: 'lucideGlobe' },
    { key: 'accessibility', icon: 'lucideAccessibility' },
    { key: 'arabic', icon: 'lucideBookOpen' },
    { key: 'audit', icon: 'lucideFileCheck' },
    { key: 'interop', icon: 'lucideNetwork' },
    { key: 'continuity', icon: 'lucideRefreshCw' }
  ];

  /**
   * The automation canvas: one worked example of a request crossing systems,
   * which is the same journey the hero's CaseService.SubmitAsync sits inside.
   *
   * Labelled as an example in the UI rather than presented as a live customer
   * workflow, and carrying no throughput, volume or timing figure — the page
   * publishes none.
   */
  readonly flowNodes: readonly FlowNode[] = [
    { key: 'receive', kind: 'trigger', icon: 'lucideWebhook' },
    { key: 'validate', kind: 'action', icon: 'lucideShieldCheck' },
    { key: 'route', kind: 'condition', icon: 'lucideGitBranch' },
    { key: 'record', kind: 'action', icon: 'lucideDatabase' },
    { key: 'notify', kind: 'action', icon: 'lucideMail' }
  ];

  readonly flowLegend: readonly string[] = ['trigger', 'action', 'condition'];

  readonly automationKinds: readonly SimpleEntry[] = [
    { key: 'process', icon: 'lucideRefreshCw' },
    { key: 'integration', icon: 'lucidePlug' },
    { key: 'events', icon: 'lucideZap' },
    { key: 'scheduled', icon: 'lucideCalendarClock' }
  ];

  readonly qualityLayers: readonly SimpleEntry[] = [
    { key: 'unit', icon: 'lucideTestTube' },
    { key: 'integration', icon: 'lucideNetwork' },
    { key: 'e2e', icon: 'lucideWorkflow' },
    { key: 'performance', icon: 'lucideGauge' },
    { key: 'accessibility', icon: 'lucideAccessibility' },
    { key: 'security', icon: 'lucideShieldCheck' }
  ];

  readonly supportElements: readonly SimpleEntry[] = [
    { key: 'triage', icon: 'lucideFileSearch' },
    { key: 'runbooks', icon: 'lucideBookOpen' },
    { key: 'observability', icon: 'lucideBellRing' },
    { key: 'patching', icon: 'lucideRefreshCw' },
    { key: 'evolution', icon: 'lucideRocket' },
    { key: 'handover', icon: 'lucideUsers' }
  ];

  readonly faqItems: readonly FaqEntry[] = [
    { key: 'team' },
    { key: 'mobile' },
    { key: 'security' },
    { key: 'standards' },
    { key: 'existing' },
    { key: 'after' },
    { key: 'bilingual' }
  ];

  /**
   * Open FAQ index. The panels are collapsed by CSS rather than removed from
   * the DOM: FAQ_ENTITY_KEYS emits a FAQPage node for this route, and schema
   * may only repeat text the served HTML actually contains.
   */
  readonly openFaq = signal<number | null>(0);

  readonly relatedServices: readonly { key: string; path: string; icon: string }[] = [
    { key: 'security', path: '/services/security/penetration-testing', icon: 'lucideShieldCheck' },
    { key: 'devops', path: '/services/devops', icon: 'lucideGitBranch' },
    { key: 'automation', path: '/services/automation', icon: 'lucideWorkflow' },
    { key: 'ai', path: '/services/ai', icon: 'lucideBrain' },
    { key: 'cloud', path: '/services/cloud', icon: 'lucideCloud' }
  ];

  selectCapability(id: CapabilityId): void {
    this.activeCapability.set(id);
  }

  toggleFaq(index: number): void {
    this.openFaq.update(current => (current === index ? null : index));
  }

  private prefersReducedMotion(): boolean {
    return (
      isPlatformBrowser(this.platformId) &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // The active timeline marker communicates reading position rather than
    // decoration, so it remains available when motion is reduced. Its CSS
    // transition is removed in that mode.
    if (this.prefersReducedMotion()) {
      gsap.registerPlugin(ScrollTrigger);
      this.initBenchProgress();
      return;
    }

    this.scrollSmoother.smootherReady$
      .pipe(
        filter(ready => ready),
        take(1)
      )
      .subscribe(() => this.initMotion());

    // Fallback: initialise anyway if the smoother has not arrived in time.
    // initMotion() is idempotent, so a late smoother cannot double-register.
    this.fallbackTimer = setTimeout(() => this.initMotion(), 500);
  }

  ngOnDestroy(): void {
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    this.scrollTriggers.forEach(trigger => trigger.kill());
    this.scrollTriggers = [];
    this.heroStageCleanup?.();
    this.heroStageCleanup = null;
  }

  /**
   * The hero composition: the editor types its C#, then the two device mocks
   * arrive and the chart fills.
   *
   * Typed once, never looped — the 2026-09-14 motion inventory's first finding
   * is that this site has 225 always-on animations and pauses none of them, so
   * nothing here repeats except the caret. The static DOM is the *finished*
   * state, which is what SSR serves and what a reader with
   * prefers-reduced-motion keeps: initMotion() is never reached in that case.
   *
   * Each line is typed by tweening the width of its own inline-block ink span
   * from 0 to its measured width, then handing the width back to the layout
   * (`style.width = ''`) so a later viewport resize still reflows the line.
   */
  private animateHeroStage(): void {
    const stage = document.querySelector<HTMLElement>('.es-stage');
    if (!stage) return;

    const inks = gsap.utils.toArray<HTMLElement>('.es-code__ink', stage);
    const caret = stage.querySelector<HTMLElement>('.es-code__caret');
    const tl = gsap.timeline({ delay: 0.15 });

    if (caret) {
      tl.set(caret, { autoAlpha: 0 }, 0);
    }

    inks.forEach(ink => {
      const width = ink.offsetWidth;
      if (width === 0) return;

      tl.fromTo(
        ink,
        { width: 0 },
        {
          width,
          // ~260 characters a second: fast enough that the whole file lands in
          // about three seconds (a hero cannot make the reader wait for its
          // own decoration), floored so a two-character line still reads as
          // typed rather than as a flicker.
          duration: Math.max(0.07, ink.textContent!.length / 260),
          ease: 'none',
          onStart: () => ink.classList.add('is-typing'),
          onComplete: () => {
            ink.classList.remove('is-typing');
            ink.style.width = '';
          }
        }
      );
    });

    if (caret) {
      tl.to(caret, { autoAlpha: 1, duration: 0.2 });
    }

    // The devices fade in while the last lines are still typing. Their
    // transform belongs to the Studio Float CSS loop, so the entrance does
    // not write an inline y/scale transform that would fight that motion.
    const devices = gsap.utils.toArray<HTMLElement>('.es-stage__device', stage);
    if (devices.length) {
      tl.from(
        devices,
        {
          opacity: 0,
          duration: 0.55,
          stagger: 0.12,
          ease: 'power3.out'
        },
        '-=0.6'
      );
    }

    const bars = gsap.utils.toArray<HTMLElement>('.es-mock__bar', stage);
    if (bars.length) {
      tl.from(
        bars,
        {
          scaleY: 0,
          transformOrigin: 'bottom center',
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out'
        },
        '-=0.25'
      );
    }
  }

  /**
   * Adds a small pointer-reactive tilt to the complete product stack. The
   * three screens keep their own independent CSS float, so the stage movement
   * reads as camera parallax rather than another animation on the devices.
   */
  private initHeroStageParallax(): void {
    const stage = document.querySelector<HTMLElement>('.es-stage');
    if (!stage || !window.matchMedia('(pointer: fine)').matches) return;

    const onMove = (event: PointerEvent): void => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      stage.style.transform = `rotateY(${x * 1.8}deg) rotateX(${-y * 1.5}deg)`;
    };
    const onLeave = (): void => {
      stage.style.transform = '';
    };

    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);
    this.heroStageCleanup = () => {
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      stage.style.transform = '';
    };
  }

  private initMotion(): void {
    if (this.animationsInitialized || !isPlatformBrowser(this.platformId)) return;
    this.animationsInitialized = true;
    gsap.registerPlugin(ScrollTrigger);

    const heroItems = gsap.utils.toArray<HTMLElement>('.es-hero [data-reveal]');
    if (heroItems.length) {
      gsap.from(heroItems, {
        opacity: 0,
        y: 14,
        duration: 0.45,
        stagger: 0.07,
        ease: 'power2.out'
      });
    }

    this.animateHeroStage();
    this.initHeroStageParallax();

    const groups = gsap.utils.toArray<HTMLElement>('.es-page [data-reveal-group]');
    groups.forEach(group => {
      const items = group.querySelectorAll<HTMLElement>('[data-reveal]');
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: 14 });
      const trigger = ScrollTrigger.create({
        trigger: group,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.06,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });
      this.scrollTriggers.push(trigger);
    });

    this.gateAutomationFlow();
    this.runQualitySuite();
    this.runSecurityGates();
    this.initBenchProgress();
  }

  /**
   * Lights the seam marker belonging to the delivery moment currently crossing
   * the reader's focal band. Only one marker is active at a time; leaving the
   * Team section clears the state so the timeline does not appear "current"
   * while the reader is elsewhere on the page.
   */
  private initBenchProgress(): void {
    const bench = document.querySelector<HTMLElement>('.es-bench');
    if (!bench) return;

    const groups = gsap.utils.toArray<HTMLElement>('.es-bench__group', bench);
    if (!groups.length) return;

    const activate = (activeGroup: HTMLElement | null): void => {
      groups.forEach(group => group.classList.toggle('is-active', group === activeGroup));
    };

    groups.forEach(group => {
      const trigger = ScrollTrigger.create({
        trigger: group,
        start: 'top 58%',
        end: 'bottom 42%',
        onEnter: () => activate(group),
        onEnterBack: () => activate(group)
      });
      this.scrollTriggers.push(trigger);
    });

    const sectionTrigger = ScrollTrigger.create({
      trigger: bench,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => activate(groups[0]),
      onEnterBack: () => activate(groups.at(-1) ?? null),
      onLeave: () => activate(null),
      onLeaveBack: () => activate(null)
    });
    this.scrollTriggers.push(sectionTrigger);
  }

  /**
   * The quality panel: six rows resolving in order — track fills, then the
   * pass chip arrives with its tick drawing itself.
   *
   * once:true. A suite that re-runs every time you scroll past is a spinner,
   * not a result; this plays when the reader first reaches it and then holds
   * the finished state, which is also the state SSR serves and the state a
   * reader with prefers-reduced-motion keeps.
   */
  private runQualitySuite(): void {
    const suite = document.querySelector<HTMLElement>('.es-suite');
    if (!suite) return;

    const fills = gsap.utils.toArray<HTMLElement>('.es-suite__fill', suite);
    const chips = gsap.utils.toArray<HTMLElement>('.es-suite__chip', suite);
    const ticks = gsap.utils.toArray<SVGPathElement>('.es-suite__tick path', suite);
    if (!fills.length) return;

    gsap.set(fills, { scaleX: 0 });
    gsap.set(chips, { autoAlpha: 0, x: 6 });
    // Measured rather than assumed: the tick's length depends on the viewBox
    // path, and a hard-coded dash array would show a stub on any edit to it.
    ticks.forEach(tick => {
      const len = tick.getTotalLength();
      gsap.set(tick, { strokeDasharray: len, strokeDashoffset: len });
    });

    const trigger = ScrollTrigger.create({
      trigger: suite,
      start: 'top 78%',
      once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        fills.forEach((fill, i) => {
          tl.to(fill, { scaleX: 1, duration: 0.45, ease: 'power2.out' }, i * 0.18)
            .to(chips[i], { autoAlpha: 1, x: 0, duration: 0.25, ease: 'power2.out' }, i * 0.18 + 0.35)
            .to(ticks[i], { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' }, i * 0.18 + 0.4);
        });
      }
    });
    this.scrollTriggers.push(trigger);
  }

  /**
   * The security gates: each card's ring draws, then a single scan pass
   * crosses it. One pass per card, on first reveal only — these are
   * checkpoints, and a checkpoint that keeps re-checking is noise.
   */
  private runSecurityGates(): void {
    const sequence = document.querySelector<HTMLElement>('.es-gates');
    const gates = gsap.utils.toArray<HTMLElement>('.es-gate');
    if (!sequence || !gates.length) return;

    gates.forEach(gate => {
      const ring = gate.querySelector<SVGCircleElement>('.es-gate__ring-draw');
      const scan = gate.querySelector<HTMLElement>('.es-gate__scan');

      if (ring) {
        const len = ring.getTotalLength();
        gsap.set(ring, { strokeDasharray: len, strokeDashoffset: len });
      }
      if (scan) {
        gsap.set(scan, { xPercent: -100, autoAlpha: 0 });
      }

      const trigger = ScrollTrigger.create({
        trigger: gate,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          if (ring) {
            tl.to(ring, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 0);
          }
          if (scan) {
            // Crosses the card in the reading direction, so it mirrors in RTL
            // with the rest of the page rather than sweeping backwards.
            const dir = getComputedStyle(gate).direction === 'rtl' ? -1 : 1;
            tl.set(scan, { xPercent: -100 * dir, autoAlpha: 1 }, 0.15)
              .to(scan, { xPercent: 220 * dir, duration: 0.9, ease: 'power1.inOut' }, 0.15)
              .set(scan, { autoAlpha: 0 });
          }
        }
      });
      this.scrollTriggers.push(trigger);
    });

    const rippleTrigger = ScrollTrigger.create({
      trigger: sequence,
      start: 'top 90%',
      end: 'bottom 10%',
      onEnter: () => sequence.classList.add('is-live'),
      onEnterBack: () => sequence.classList.add('is-live'),
      onLeave: () => sequence.classList.remove('is-live'),
      onLeaveBack: () => sequence.classList.remove('is-live')
    });
    this.scrollTriggers.push(rippleTrigger);
  }

  /** Keep the workflow card wave idle outside the viewport. */
  private gateAutomationFlow(): void {
    const canvas = document.querySelector<HTMLElement>('.es-flow');
    if (!canvas) return;

    const setLive = (live: boolean) => canvas.classList.toggle('is-live', live);

    const trigger = ScrollTrigger.create({
      trigger: canvas,
      start: 'top 90%',
      end: 'bottom 10%',
      onEnter: () => setLive(true),
      onEnterBack: () => setLive(true),
      onLeave: () => setLive(false),
      onLeaveBack: () => setLive(false)
    });
    this.scrollTriggers.push(trigger);
  }
}
