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
  lucideCloud
} from '@ng-icons/lucide';
import { filter, take } from 'rxjs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ServiceFactsComponent } from '../../../shared/components/service-facts/service-facts.component';
import { ScrollSmootherService } from '../../../core/services/scroll-smoother.service';
import { LocalizeLinkPipe } from '../../../core/i18n/localize-link.pipe';

type CapabilityId = 'platforms' | 'government' | 'mobile' | 'automation';

interface Capability {
  id: CapabilityId;
  icon: string;
  /** i18n namespace under services.enterpriseSoftware.capabilities */
  key: CapabilityId;
}

interface SecurityPhase {
  key: 'design' | 'code' | 'pipeline' | 'release';
  icon: string;
}

interface SimpleEntry {
  key: string;
  icon: string;
}

interface FaqEntry {
  key: string;
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
      lucideCloud
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

  /** Hero delivery pipeline, also the spine of the Delivery section. */
  readonly stages = ['discover', 'design', 'build', 'harden', 'launch', 'run'] as const;

  readonly capabilities: readonly Capability[] = [
    { id: 'platforms', key: 'platforms', icon: 'lucideBuilding2' },
    { id: 'government', key: 'government', icon: 'lucideLandmark' },
    { id: 'mobile', key: 'mobile', icon: 'lucideSmartphone' },
    { id: 'automation', key: 'automation', icon: 'lucideWorkflow' }
  ];

  readonly activeCapability = signal<CapabilityId>('platforms');

  readonly benchRoles: readonly SimpleEntry[] = [
    { key: 'product', icon: 'lucideClipboardList' },
    { key: 'architecture', icon: 'lucideDraftingCompass' },
    { key: 'backend', icon: 'lucideServer' },
    { key: 'frontend', icon: 'lucideMonitor' },
    { key: 'mobile', icon: 'lucideSmartphone' },
    { key: 'qa', icon: 'lucideTestTube' },
    { key: 'devops', icon: 'lucideGitBranch' },
    { key: 'security', icon: 'lucideLock' },
    { key: 'data', icon: 'lucideDatabase' },
    { key: 'ux', icon: 'lucideAccessibility' },
    { key: 'support', icon: 'lucideHeadset' }
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

  readonly stackItemKeys = ['i1', 'i2', 'i3', 'i4'] as const;

  readonly govtPoints: readonly SimpleEntry[] = [
    { key: 'residency', icon: 'lucideGlobe' },
    { key: 'accessibility', icon: 'lucideAccessibility' },
    { key: 'arabic', icon: 'lucideBookOpen' },
    { key: 'audit', icon: 'lucideFileCheck' },
    { key: 'interop', icon: 'lucideNetwork' },
    { key: 'continuity', icon: 'lucideRefreshCw' }
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
    if (!isPlatformBrowser(this.platformId) || this.prefersReducedMotion()) {
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
  }
}
