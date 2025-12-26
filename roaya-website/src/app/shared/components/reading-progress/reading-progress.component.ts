import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  PLATFORM_ID,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

/**
 * Reading Progress Component
 * Shows a progress bar indicating how far the user has scrolled through the article
 */
@Component({
  selector: 'app-reading-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="reading-progress-container fixed top-0 left-0 right-0 z-50 h-1 bg-neutral-200 dark:bg-neutral-800"
      [class.hidden]="!isVisible()"
      role="progressbar"
      [attr.aria-valuenow]="progress()"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Reading progress"
    >
      <div
        class="reading-progress-bar h-full bg-gradient-to-r from-navy to-teal transition-all duration-150 ease-out"
        [style.width.%]="progress()"
      ></div>
    </div>
  `,
  styles: [`
    .reading-progress-container {
      pointer-events: none;
    }

    .reading-progress-bar {
      will-change: width;
    }

    @media (prefers-reduced-motion: reduce) {
      .reading-progress-bar {
        transition: none;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadingProgressComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private scrollListener: (() => void) | null = null;

  progress = signal(0);
  isVisible = signal(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollListener();
    }
  }

  ngOnDestroy(): void {
    this.removeScrollListener();
  }

  private initScrollListener(): void {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight > 0) {
        const scrollPercent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
        this.progress.set(Math.round(scrollPercent));
        this.isVisible.set(scrollTop > 100);
      }
    };

    // Initial call
    updateProgress();

    // Use passive event listener for better performance
    this.scrollListener = updateProgress;
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  private removeScrollListener(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
    }
  }
}
