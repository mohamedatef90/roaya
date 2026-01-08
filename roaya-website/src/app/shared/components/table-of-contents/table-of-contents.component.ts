import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  inject,
  signal,
  PLATFORM_ID,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TocItem } from '../../../core/interfaces/blog.interface';

/**
 * Table of Contents Component
 * Displays navigation for article sections with scroll spy functionality
 */
@Component({
  selector: 'app-table-of-contents',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <nav
      class="toc-container"
      [class.toc-collapsed]="isCollapsed()"
      aria-label="Table of contents"
    >
      <!-- Mobile Toggle -->
      <button
        class="toc-toggle lg:hidden flex items-center justify-between w-full p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-navy dark:focus:ring-teal focus:ring-offset-2"
        (click)="toggleCollapse()"
        [attr.aria-expanded]="!isCollapsed()"
        aria-controls="toc-list"
      >
        <span class="font-semibold text-black/90 dark:text-white">
          {{ 'blog.toc.title' | translate }}
        </span>
        <svg
          class="w-5 h-5 transition-transform"
          [class.rotate-180]="!isCollapsed()"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Desktop Title -->
      <h3 class="hidden lg:block text-sm font-semibold text-black/70 dark:text-neutral-400 uppercase tracking-wider mb-4">
        {{ 'blog.toc.title' | translate }}
      </h3>

      <!-- TOC List -->
      <ul
        id="toc-list"
        class="toc-list space-y-1 overflow-hidden transition-all duration-300"
        [class.max-h-0]="isCollapsed()"
        [class.max-h-[500px]]="!isCollapsed()"
        [class.lg:max-h-none]="true"
      >
        @for (item of items; track item.id) {
          <li
            [class.pl-4]="item.level === 3"
            [class.pl-0]="item.level === 2"
          >
            <a
              [href]="'#' + item.id"
              class="toc-link block py-2 px-3 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-navy dark:focus:ring-teal focus:ring-offset-2"
              [class.toc-link-active]="activeId() === item.id"
              [class.text-navy]="activeId() === item.id"
              [class.dark:text-teal]="activeId() === item.id"
              [class.bg-navy/10]="activeId() === item.id"
              [class.dark:bg-teal/10]="activeId() === item.id"
              [class.font-medium]="activeId() === item.id"
              [class.text-black/70]="activeId() !== item.id"
              [class.dark:text-neutral-400]="activeId() !== item.id"
              [class.hover:text-navy]="activeId() !== item.id"
              [class.dark:hover:text-teal]="activeId() !== item.id"
              [class.hover:bg-neutral-100]="activeId() !== item.id"
              [class.dark:hover:bg-neutral-800]="activeId() !== item.id"
              (click)="scrollToSection($event, item.id)"
            >
              {{ item.text }}
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [`
    .toc-container {
      /* Sticky positioning handled by parent wrapper in blog-detail */
    }

    .toc-link {
      border-left: 2px solid transparent;
    }

    .toc-link-active {
      border-left-color: var(--color-navy);
    }

    :host-context([dir="rtl"]) .toc-link {
      border-left: none;
      border-right: 2px solid transparent;
    }

    :host-context([dir="rtl"]) .toc-link-active {
      border-right-color: var(--color-navy);
    }

    @media (prefers-reduced-motion: reduce) {
      .toc-list {
        transition: none;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableOfContentsComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  @Input() items: TocItem[] = [];

  activeId = signal<string>('');
  isCollapsed = signal(true);

  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Delay observer setup to ensure DOM is ready and content is rendered
      // Increased delay to ensure innerHTML has been fully parsed
      setTimeout(() => this.setupIntersectionObserver(), 1000);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }

  scrollToSection(event: Event, id: string): void {
    event.preventDefault();
    console.log(`[TOC] Click handler triggered for ID: "${id}"`);

    if (isPlatformBrowser(this.platformId)) {
      this.attemptScroll(id, 0);
    }
  }

  private attemptScroll(id: string, attempt: number): void {
    const element = document.getElementById(id);
    const maxAttempts = 5;

    console.log(`[TOC] Attempt ${attempt + 1}/${maxAttempts} - Looking for element with ID: "${id}"`);

    if (element) {
      console.log(`[TOC] ✅ Element found!`, element);
      console.log(`[TOC] Element tag: ${element.tagName}, text: "${element.textContent}"`);

      const offset = 112; // Account for sticky header (matches scroll-mt-28 = 7rem = 112px)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      console.log(`[TOC] Scrolling to position: ${offsetPosition}px (element at ${elementPosition}px, offset ${offset}px)`);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Update active state
      this.activeId.set(id);
      console.log(`[TOC] Active ID set to: "${id}"`);

      // Collapse on mobile after selection
      if (window.innerWidth < 1024) {
        this.isCollapsed.set(true);
        console.log('[TOC] Collapsed mobile menu');
      }
    } else if (attempt < maxAttempts) {
      console.warn(`[TOC] ⚠️ Element not found yet, retrying in ${(attempt + 1) * 100}ms...`);
      // Retry after increasing delay to allow innerHTML to finish rendering
      setTimeout(() => this.attemptScroll(id, attempt + 1), (attempt + 1) * 100);
    } else {
      console.error(`[TOC] ❌ Failed to find heading element with ID "${id}" after ${maxAttempts} attempts.`);
      console.error('[TOC] Available heading IDs in page:', this.getAllHeadingIds());
    }
  }

  private getAllHeadingIds(): string[] {
    const headings = document.querySelectorAll('h2[id], h3[id]');
    return Array.from(headings).map(h => h.id);
  }

  private setupIntersectionObserver(): void {
    console.log('[TOC] Setting up IntersectionObserver for', this.items.length, 'items');

    const options: IntersectionObserverInit = {
      rootMargin: '-112px 0px -66%', // Trigger slightly after the offset to ensure active state
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log(`[TOC] Section "${entry.target.id}" is now visible`);
          this.activeId.set(entry.target.id);
        }
      });
    }, options);

    // Observe all heading elements
    let observedCount = 0;
    this.items.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        this.observer?.observe(element);
        observedCount++;
        console.log(`[TOC] ✅ Observing element with ID: "${item.id}"`);
      } else {
        console.warn(`[TOC] ⚠️ Element with id "${item.id}" not found in DOM`);
      }
    });

    console.log(`[TOC] Setup complete - Observing ${observedCount}/${this.items.length} elements`);

    if (observedCount === 0 && this.items.length > 0) {
      console.error('[TOC] ❌ No heading elements found. Content may not be rendered yet.');
      console.error('[TOC] Available heading IDs in page:', this.getAllHeadingIds());
      console.error('[TOC] Expected IDs from TOC items:', this.items.map(i => i.id));
    }
  }
}
