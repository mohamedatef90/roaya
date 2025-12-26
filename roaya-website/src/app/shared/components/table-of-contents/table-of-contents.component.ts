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
      position: sticky;
      top: 6rem;
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
      // Delay observer setup to ensure DOM is ready
      setTimeout(() => this.setupIntersectionObserver(), 100);
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

    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(id);
      if (element) {
        const offset = 100; // Account for sticky header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Update active state
        this.activeId.set(id);

        // Collapse on mobile after selection
        if (window.innerWidth < 1024) {
          this.isCollapsed.set(true);
        }
      }
    }
  }

  private setupIntersectionObserver(): void {
    const options: IntersectionObserverInit = {
      rootMargin: '-100px 0px -66%',
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeId.set(entry.target.id);
        }
      });
    }, options);

    // Observe all heading elements
    this.items.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        this.observer?.observe(element);
      }
    });
  }
}
