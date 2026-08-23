import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

export type InitStageId = 'connect' | 'secure' | 'optimize' | 'managed' | 'ready';
export type InitStageState = 'pending' | 'active' | 'done';

/** A stage plus the state it should render in, for the template to consume. */
interface RenderStage extends InitStage {
  readonly state: InitStageState;
}

interface InitStage {
  /** Icon selector + trackBy key. */
  readonly id: InitStageId;
  readonly label: string;
  readonly sublabel: string;
  /** Status line shown while this stage is the active one. */
  readonly status: string;
  /** Milliseconds into the intro when this stage lights up. */
  readonly at: number;
  /** Progress value (%) the bar has reached by the time it does. */
  readonly progress: number;
}

/**
 * Enterprise technology initialization intro.
 *
 * A short (~2.2s) visual sequence that introduces Roaya's service pillars —
 * cloud, security, infrastructure, managed services — while the Angular app
 * finishes bootstrapping, then cross-fades into the landing page.
 *
 * The intro is purely presentational: it never blocks the application. The
 * timeline is driven by a single requestAnimationFrame loop so the progress
 * bar and its percentage stay in sync, and it holds at the MANAGED stage
 * (85%) if the app is not ready yet — READY is only shown once a transition
 * is safe. Exit orchestration lives in LoadingService.
 */
@Component({
  selector: 'app-init-loader',
  standalone: true,
  templateUrl: './init-loader.component.html',
  styleUrl: './init-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitLoaderComponent implements OnInit, OnDestroy {
  /** Stage the sequence holds on until the app reports it can transition. */
  private static readonly READY_GATE_MS = 1600;
  /** READY lights up here; the exit cross-fade starts at COMPLETE_MS. */
  private static readonly COMPLETE_MS = 2200;
  /** Reduced-motion path: skip the sequence, hold the end state briefly. */
  private static readonly REDUCED_MOTION_MS = 700;

  /** Shelf offsets for the background server-rack outlines. */
  readonly rackUnits = [0, 1, 2, 3, 4, 5];

  readonly heading = 'Building your digital environment';
  readonly serviceLine = ['Cloud', 'Cybersecurity', 'Infrastructure', 'Managed Services'];
  readonly footnote = 'Enterprise-grade solutions. Built for reliability. Designed for growth.';

  readonly stages: readonly InitStage[] = [
    {
      id: 'connect',
      label: 'Connect',
      sublabel: 'Infrastructure',
      status: 'Connecting cloud infrastructure…',
      at: 400,
      progress: 20,
    },
    {
      id: 'secure',
      label: 'Secure',
      sublabel: 'Operations',
      status: 'Securing digital operations…',
      at: 800,
      progress: 40,
    },
    {
      id: 'optimize',
      label: 'Optimize',
      sublabel: 'Performance',
      status: 'Optimizing performance…',
      at: 1200,
      progress: 65,
    },
    {
      id: 'managed',
      label: 'Managed',
      sublabel: 'Services',
      status: 'Preparing managed services…',
      at: 1600,
      progress: 85,
    },
    {
      id: 'ready',
      label: 'Ready',
      sublabel: 'Experience',
      status: 'Your digital experience is ready',
      at: 2000,
      progress: 100,
    },
  ];

  /** -1 until the first stage activates, so the intro can breathe. */
  private readonly activeIndex = signal(-1);
  private readonly progressValue = signal(0);

  readonly progress = computed(() => this.progressValue());
  readonly percent = computed(() => Math.round(this.progressValue()));
  readonly statusText = computed(() => {
    const index = this.activeIndex();
    return index < 0 ? 'Initializing environment…' : this.stages[index].status;
  });
  /** Mobile shows the stage name here instead of under each icon. */
  readonly activeStageLabel = computed(() => {
    const index = this.activeIndex();
    return index < 0 ? '' : this.stages[index].label;
  });
  readonly isComplete = computed(() => this.activeIndex() === this.stages.length - 1);
  /**
   * The stage rows the template renders. Derived as a computed rather than
   * read per row through a method call: the rows live in an @for embedded
   * view, and a computed guarantees they re-render the moment the active
   * stage moves instead of waiting for an unrelated change-detection pass.
   */
  readonly renderStages = computed<readonly RenderStage[]>(() => {
    const active = this.activeIndex();
    return this.stages.map((stage, index) => ({
      ...stage,
      state: index < active ? 'done' : index === active ? 'active' : 'pending',
    }));
  });
  /**
   * Connector fill as a 0–1 scale factor for the line spanning the stage
   * icons. Driven by the stage index rather than raw progress so the line
   * always lands exactly on the node that is lighting up.
   */
  readonly trackFill = computed(() => {
    const index = this.activeIndex();
    return index <= 0 ? 0 : index / (this.stages.length - 1);
  });

  private readonly loadingService = inject(LoadingService);
  private readonly isBrowser: boolean;

  private frameId = 0;
  private completionTimer: ReturnType<typeof setTimeout> | null = null;
  private startedAt = 0;
  /** Time spent waiting for the app at the READY gate, excluded from elapsed. */
  private heldFor = 0;
  private finished = false;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.activeIndex.set(this.stages.length - 1);
      this.progressValue.set(100);
      this.completionTimer = setTimeout(
        () => this.finish(),
        InitLoaderComponent.REDUCED_MOTION_MS
      );
      return;
    }

    this.startedAt = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  ngOnDestroy(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }
    if (this.completionTimer) {
      clearTimeout(this.completionTimer);
      this.completionTimer = null;
    }
  }

  private readonly tick = (now: number): void => {
    let elapsed = now - this.startedAt - this.heldFor;

    // Hold the sequence at MANAGED / 85% until the app can safely transition,
    // rather than showing READY over an app that is still bootstrapping.
    if (elapsed > InitLoaderComponent.READY_GATE_MS && !this.loadingService.contentReady()) {
      this.heldFor = now - this.startedAt - InitLoaderComponent.READY_GATE_MS;
      elapsed = InitLoaderComponent.READY_GATE_MS;
    }

    this.activeIndex.set(this.resolveActiveIndex(elapsed));
    this.progressValue.set(this.resolveProgress(elapsed));

    if (elapsed >= InitLoaderComponent.COMPLETE_MS) {
      this.frameId = 0;
      this.finish();
      return;
    }

    this.frameId = requestAnimationFrame(this.tick);
  };

  private resolveActiveIndex(elapsed: number): number {
    let index = -1;
    for (let i = 0; i < this.stages.length; i++) {
      if (elapsed >= this.stages[i].at) {
        index = i;
      }
    }
    return index;
  }

  /**
   * Eases the bar up to each stage's figure over the first part of that
   * stage's window, then rests there — so the number on screen matches the
   * stage being announced, and the bar glides rather than jumping.
   */
  private resolveProgress(elapsed: number): number {
    if (elapsed < this.stages[0].at) {
      return 0;
    }

    for (let i = 0; i < this.stages.length; i++) {
      const stage = this.stages[i];
      const windowEnd =
        i + 1 < this.stages.length ? this.stages[i + 1].at : InitLoaderComponent.COMPLETE_MS;
      if (elapsed >= windowEnd) {
        continue;
      }

      const from = i === 0 ? 0 : this.stages[i - 1].progress;
      const ramp = (windowEnd - stage.at) * 0.7;
      const fraction = ramp > 0 ? (elapsed - stage.at) / ramp : 1;
      return from + (stage.progress - from) * this.ease(fraction);
    }

    return 100;
  }

  private ease(t: number): number {
    const clamped = Math.min(Math.max(t, 0), 1);
    return clamped < 0.5
      ? 4 * clamped * clamped * clamped
      : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
  }

  private finish(): void {
    if (this.finished) {
      return;
    }
    this.finished = true;
    this.activeIndex.set(this.stages.length - 1);
    this.progressValue.set(100);
    this.loadingService.completeIntro();
  }
}
