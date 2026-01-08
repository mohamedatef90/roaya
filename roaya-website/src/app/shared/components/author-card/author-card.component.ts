import {
  Component,
  Input,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLinkedin } from '@ng-icons/lucide';
import { Author } from '../../../core/interfaces/blog.interface';
import { LanguageService } from '../../../core/services/language.service';

/**
 * Author Card Component
 * Displays author information with bio and social links
 */
@Component({
  selector: 'app-author-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgIcon],
  providers: [
    provideIcons({ lucideLinkedin })
  ],
  template: `
    @if (author) {
      <div class="author-card rounded-2xl p-6 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-4">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            @if (imageError) {
              <!-- Initials Fallback -->
              <div
                class="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xl bg-gradient-to-br from-navy to-teal ring-2 ring-neutral-200 dark:ring-neutral-700"
                [attr.aria-label]="'Avatar for ' + currentName"
              >
                {{ initials }}
              </div>
            } @else {
              <!-- Avatar Image -->
              <img
                [src]="author.avatar"
                [alt]="currentName"
                class="w-16 h-16 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700"
                loading="lazy"
                (error)="onImageError($event)"
              />
            }
          </div>

          <!-- Name and Role -->
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-black/70 dark:text-neutral-400 uppercase tracking-wider mb-1">
              {{ 'blog.author.writtenBy' | translate }}
            </p>
            <h4 class="text-lg font-semibold text-black/90 dark:text-white truncate">
              {{ currentName }}
            </h4>
            <p class="text-sm text-navy dark:text-teal truncate">
              {{ currentRole }}
            </p>
          </div>
        </div>

        <!-- Bio -->
        <p class="text-sm text-black/70 dark:text-neutral-400 leading-relaxed mb-4">
          {{ currentBio }}
        </p>

        <!-- Social Links -->
        @if (author.linkedin) {
          <div class="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <a
              [href]="author.linkedin"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-black/70 dark:text-neutral-400 hover:text-navy dark:hover:text-teal hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-navy dark:focus:ring-teal focus:ring-offset-2"
              [attr.aria-label]="'LinkedIn profile of ' + currentName"
            >
              <ng-icon name="lucideLinkedin" size="18" aria-hidden="true"></ng-icon>
              <span>LinkedIn</span>
            </a>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .author-card {
      transition: all 0.3s ease;
    }

    .author-card:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    :host-context(.dark) .author-card:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorCardComponent {
  private readonly languageService = inject(LanguageService);

  @Input() author: Author | null = null;
  imageError = false;

  get currentName(): string {
    if (!this.author) return '';
    return this.languageService.getCurrentLanguage() === 'ar'
      ? this.author.nameAr
      : this.author.name;
  }

  get currentRole(): string {
    if (!this.author) return '';
    return this.languageService.getCurrentLanguage() === 'ar'
      ? this.author.roleAr
      : this.author.role;
  }

  get currentBio(): string {
    if (!this.author) return '';
    return this.languageService.getCurrentLanguage() === 'ar'
      ? this.author.bioAr
      : this.author.bio;
  }

  get initials(): string {
    if (!this.author) return '';
    const name = this.currentName;
    const parts = name.split(' ');

    if (parts.length >= 2) {
      // Get first letter of first name and first letter of last name
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length >= 2) {
      // Get first two letters of single name
      return parts[0].substring(0, 2).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  }

  onImageError(event: Event): void {
    this.imageError = true;
  }
}
