import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

/**
 * Scroll Indicator Component
 * Right sidebar indicator showing active section based on scroll position
 * Inspired by Oknoplast website design
 */
@Component({
  selector: 'app-scroll-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="c-scroll-indicator">
      <div
        *ngFor="let section of sections(); let i = index"
        class="bar"
        [class.active]="activeIndex() === i"
        (click)="scrollToSection(i)"
        [attr.aria-label]="'Jump to section ' + (i + 1)"
        role="button"
        tabindex="0"
        (keydown.enter)="scrollToSection(i)"
        (keydown.space)="scrollToSection(i); $event.preventDefault()"
      >
        <div class="indicator"></div>
      </div>
    </div>
  `,
  styles: [`
    .c-scroll-indicator {
      position: fixed;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 50;
      display: flex;
      flex-direction: column;
      gap: 4px;
      opacity: 0;
      animation: fadeIn 0.6s ease-out 0.5s forwards;
    }

    .bar {
      width: 1px;
      height: 50px;
      background-color: rgba(255, 255, 255, 0.3);
      position: relative;
      cursor: pointer;
      transition: background-color 0.3s ease;
      border-radius: 0;
    }

    .bar:hover {
      background-color: rgba(255, 255, 255, 0.5);
    }

    .bar.active {
      background-color: rgba(255, 255, 255, 0.5);
    }

    .indicator {
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%) scale(0);
      width: 4px;
      height: 4px;
      background-color: rgb(138, 74, 227); /* purple-500 */
      border-radius: 50%;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .bar.active .indicator {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }

    .bar:focus {
      outline: 2px solid rgba(139, 92, 246, 0.5);
      outline-offset: 4px;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-50%) translateX(10px);
      }
      to {
        opacity: 1;
        transform: translateY(-50%) translateX(0);
      }
    }

    /* Hide on mobile */
    @media (max-width: 768px) {
      .c-scroll-indicator {
        display: none;
      }
    }

    /* Dark mode adjustments */
    :host-context(.dark) .bar {
      background-color: rgba(255, 255, 255, 0.3);
    }

    :host-context(.dark) .bar:hover {
      background-color: rgba(255, 255, 255, 0.5);
    }

    :host-context(.dark) .bar.active {
      background-color: rgba(255, 255, 255, 0.5);
    }

    :host-context(.dark) .indicator {
      background-color: rgb(167, 139, 250); /* secondary-400 */
    }
  `]
})
export class ScrollIndicatorComponent implements OnInit, OnDestroy {
  sections = signal<string[]>([]);
  activeIndex = signal<number>(0);
  
  private scrollSubscription?: any;
  private intersectionObserver?: IntersectionObserver;

  ngOnInit(): void {
    this.initializeSections();
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  private initializeSections(): void {
    // Delay initialization to ensure DOM is ready
    setTimeout(() => {
      // Find all sections with IDs (typically main page sections)
      const sectionElements = document.querySelectorAll('section[id], [data-section]');
      const sectionIds = Array.from(sectionElements).map(el => el.id || el.getAttribute('data-section') || '');
      const filteredIds = sectionIds.filter(id => id && id !== 'main-content');
      this.sections.set(filteredIds);
      
      // Setup observer after sections are initialized
      if (filteredIds.length > 0) {
        this.setupIntersectionObserver();
      }
    }, 100);
  }

  private setupScrollListener(): void {
    // Throttle scroll events for performance
    this.scrollSubscription = fromEvent(window, 'scroll', { passive: true })
      .pipe(throttleTime(100))
      .subscribe(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9da7e5db-fa88-4678-9ed0-e6343df6afcb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scroll-indicator.component.ts:164',message:'Scroll indicator scroll event',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        this.updateActiveSection();
      });
  }

  private setupIntersectionObserver(): void {
    // Use Intersection Observer for more accurate section detection
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id || entry.target.getAttribute('data-section');
          if (sectionId) {
            const index = this.sections().indexOf(sectionId);
            if (index !== -1) {
              this.activeIndex.set(index);
            }
          }
        }
      });
    }, options);

    // Observe all sections
    this.sections().forEach(sectionId => {
      const element = document.getElementById(sectionId) || document.querySelector(`[data-section="${sectionId}"]`);
      if (element) {
        this.intersectionObserver?.observe(element);
      }
    });
  }

  private updateActiveSection(): void {
    const startTime = performance.now();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9da7e5db-fa88-4678-9ed0-e6343df6afcb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scroll-indicator.component.ts:200',message:'updateActiveSection entry',data:{sectionCount:this.sections().length},sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const sections = this.sections();
    if (sections.length === 0) return;

    const scrollPosition = window.scrollY + window.innerHeight / 3; // Check at 1/3 from top

    let activeIndex = 0;
    let domQueryCount = 0;
    sections.forEach((sectionId, index) => {
      const beforeQuery = performance.now();
      const element = document.getElementById(sectionId) || document.querySelector(`[data-section="${sectionId}"]`);
      domQueryCount++;
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const elementBottom = elementTop + rect.height;

        if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
          activeIndex = index;
        }
      }
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9da7e5db-fa88-4678-9ed0-e6343df6afcb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scroll-indicator.component.ts:219',message:'updateActiveSection exit',data:{domQueryCount,activeIndex,totalTime:performance.now()-startTime},sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    this.activeIndex.set(activeIndex);
  }

  scrollToSection(index: number): void {
    const sections = this.sections();
    if (index >= 0 && index < sections.length) {
      const sectionId = sections[index];
      const element = document.getElementById(sectionId) || document.querySelector(`[data-section="${sectionId}"]`);
      
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update active index immediately for better UX
        this.activeIndex.set(index);
      }
    }
  }
}

