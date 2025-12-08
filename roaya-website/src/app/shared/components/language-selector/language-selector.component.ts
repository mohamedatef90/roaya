import { Component, ElementRef, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language.service';

interface LanguageOption {
  code: 'en' | 'ar';
  name: string;
  nativeName: string;
  flag: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-selector relative">
      <!-- Dropdown Trigger -->
      <button
        (click)="toggleDropdown()"
        [attr.aria-expanded]="isOpen()"
        aria-haspopup="listbox"
        class="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 focus-ring"
        type="button"
      >
        <!-- Current Flag -->
        <span class="text-lg leading-none">{{ currentLanguage().flag }}</span>

        <!-- Language Code -->
        <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {{ currentLanguage().code.toUpperCase() }}
        </span>

        <!-- Chevron -->
        <svg
          class="w-4 h-4 text-neutral-500 transition-transform duration-200"
          [class.rotate-180]="isOpen()"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Panel -->
      @if (isOpen()) {
        <div
          class="absolute top-full mt-2 py-1 bg-white dark:bg-neutral-900 rounded-xl shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-700 min-w-[160px] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          [class.end-0]="languageService.isRTL()"
          [class.start-0]="!languageService.isRTL()"
          role="listbox"
          [attr.aria-activedescendant]="'lang-' + currentLanguage().code"
        >
          @for (lang of languages; track lang.code) {
            <button
              [id]="'lang-' + lang.code"
              (click)="selectLanguage(lang.code)"
              (keydown)="onKeyDown($event, lang.code)"
              class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-ring"
              [class.bg-primary-50]="lang.code === currentLanguage().code"
              [class.dark:bg-primary-900/20]="lang.code === currentLanguage().code"
              role="option"
              [attr.aria-selected]="lang.code === currentLanguage().code"
              type="button"
            >
              <!-- Flag -->
              <span class="text-xl leading-none">{{ lang.flag }}</span>

              <!-- Language Info -->
              <div class="flex flex-col items-start">
                <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {{ lang.nativeName }}
                </span>
                <span class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ lang.name }}
                </span>
              </div>

              <!-- Checkmark for selected -->
              @if (lang.code === currentLanguage().code) {
                <svg class="w-4 h-4 text-primary-600 dark:text-primary-400 ms-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .language-selector {
      position: relative;
    }

    .animate-in {
      animation: animateIn 0.2s ease-out;
    }

    @keyframes animateIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .fade-in {
      animation-name: fadeIn;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .slide-in-from-top-2 {
      --tw-translate-y: -0.5rem;
    }
  `]
})
export class LanguageSelectorComponent {
  readonly languageService = inject(LanguageService);
  private readonly elementRef = inject(ElementRef);

  isOpen = signal(false);

  // Flag emojis
  private egyptFlag = '🇪🇬'; // Egypt flag emoji
  private ukFlag = '🇬🇧'; // UK flag emoji

  languages: LanguageOption[] = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: this.ukFlag
    },
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      flag: this.egyptFlag
    }
  ];

  currentLanguage = computed(() => {
    const code = this.languageService.getCurrentLanguage();
    return this.languages.find(l => l.code === code) || this.languages[0];
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.isOpen.set(false);
  }

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
  }

  selectLanguage(code: 'en' | 'ar'): void {
    this.languageService.setLanguage(code);
    this.isOpen.set(false);
  }

  onKeyDown(event: KeyboardEvent, code: 'en' | 'ar'): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectLanguage(code);
    }
  }
}
