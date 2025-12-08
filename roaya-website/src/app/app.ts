import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoadingService } from './core/services/loading.service';

/**
 * Root Application Component
 * Roaya IT - Angular 21 Standalone App
 *
 * Loading is handled by the solar system loader in index.html
 * which is dismissed by LoadingService when the app stabilizes.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent],
  template: `
    <!-- Main Application Content with slide-up fade-in animation -->
    <app-main-layout
      class="main-content"
      [class.content-visible]="contentVisible()"
    />
  `,
  styles: [`
    :host {
      display: block;
      overflow-x: hidden;
    }

    /* Main content slide-up fade-in animation - Ultra smooth */
    .main-content {
      opacity: 0;
      transform: translateY(80px);
      transition:
        opacity 1.8s cubic-bezier(0.16, 1, 0.3, 1),
        transform 1.8s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform, opacity;
    }

    .main-content.content-visible {
      opacity: 1;
      transform: none; /* Use 'none' instead of translateY(0) to allow position:fixed to work in children */
      will-change: auto; /* Reset will-change after animation to allow position:fixed in children */
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .main-content {
        transform: none;
        transition: opacity 0.5s ease;
      }
    }
  `]
})
export class App implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly platformId = inject(PLATFORM_ID);

  // Content visibility state
  contentVisible = signal(false);

  ngOnInit(): void {
    // Content becomes visible after the solar system loader starts fading out
    if (isPlatformBrowser(this.platformId)) {
      // Listen for when the loading screen starts to fade out
      // The solar system loader has a min display of 800ms, then fades for 600ms
      // We start revealing content 200ms after fade begins for a seamless transition
      this.observeLoadingScreen();
    }
  }

  private observeLoadingScreen(): void {
    const loadingScreen = document.getElementById('loading-screen');

    if (!loadingScreen) {
      // If loading screen is already gone, show content immediately
      this.contentVisible.set(true);
      return;
    }

    // Create a MutationObserver to detect when fade-out class is added
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (loadingScreen.classList.contains('fade-out')) {
            // Start content reveal 200ms after fade begins
            setTimeout(() => {
              this.contentVisible.set(true);
            }, 200);
            observer.disconnect();
            break;
          }
        }
      }
    });

    observer.observe(loadingScreen, { attributes: true });

    // Fallback: if loading screen is removed without fade-out class
    const removalObserver = new MutationObserver(() => {
      if (!document.getElementById('loading-screen')) {
        this.contentVisible.set(true);
        removalObserver.disconnect();
        observer.disconnect();
      }
    });

    removalObserver.observe(document.body, { childList: true, subtree: true });
  }
}
