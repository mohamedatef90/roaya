import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Tag } from '../../../../core/interfaces/admin.interface';

/**
 * Tag Manager Component
 * Tag search and management for leads
 * Migrated from PrimeNG Chip/AutoComplete to custom Tailwind
 */
@Component({
  selector: 'app-tag-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  template: `
    <div class="tag-manager">
      <label class="block text-sm font-medium text-content-secondary mb-2">
        Tags
      </label>

      <!-- Current tags -->
      <div class="flex flex-wrap gap-2 mb-3">
        @for (tag of currentTags; track tag.id) {
          <span
            [style.background-color]="tag.color"
            [style.color]="getContrastColor(tag.color)"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
          >
            {{ tag.name }}
            <button
              (click)="removeTag(tag)"
              class="ml-1 hover:opacity-75 transition-opacity"
              [attr.aria-label]="'Remove ' + tag.name"
            >
              <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          </span>
        }
        @if (currentTags.length === 0) {
          <span class="text-neutral-400 text-sm italic">No tags assigned</span>
        }
      </div>

      <!-- Add tag search -->
      <div class="relative">
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <input
              type="text"
              name="tagSearch"
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              (focus)="showSuggestions.set(true)"
              [placeholder]="loading ? 'Loading...' : 'Search or add tag...'"
              [disabled]="loading"
              class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <!-- Suggestions dropdown -->
            @if (showSuggestions() && filteredTags().length > 0) {
              <div class="absolute z-50 w-full mt-1 bg-surface-elevated border border-edge-subtle rounded-md shadow-md max-h-60 overflow-auto">
                @for (tag of filteredTags(); track tag.id) {
                  <button
                    (click)="selectTag(tag)"
                    class="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-hover transition-colors text-left"
                  >
                    <span
                      class="w-4 h-4 rounded-full shrink-0"
                      [style.background-color]="tag.color"
                    ></span>
                    <span class="text-content-primary">{{ tag.name }}</span>
                  </button>
                }
              </div>
            }
          </div>

          <button
            (click)="addNewTag()"
            [disabled]="!canAddNew() || loading"
            class="inline-flex items-center justify-center rounded-md h-10 w-10 shrink-0 border border-edge-strong text-content-secondary hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-50 transition-colors"
            title="Add as new tag"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/>
              <path d="M12 5v14"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Create new tag prompt -->
      @if (showCreatePrompt()) {
        <div class="mt-3 p-4 bg-surface-secondary border border-edge-subtle rounded-lg">
          <p class="text-sm mb-3 text-content-secondary">Create new tag "{{ newTagName }}"?</p>
          <div class="flex items-center gap-2">
            <input
              type="color"
              name="tagColor"
              [(ngModel)]="newTagColor"
              class="w-10 h-10 rounded cursor-pointer border border-edge-strong"
              title="Choose tag color"
            />
            <button
              (click)="createTag()"
              [disabled]="creating()"
              class="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              @if (creating()) {
                <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              Create
            </button>
            <button
              (click)="cancelCreate()"
              class="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium border border-edge-strong text-content-secondary hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class TagManagerComponent implements OnInit {
  @Input() currentTags: Tag[] = [];
  @Input() availableTags: Tag[] = [];
  @Input() loading = false;

  @Output() addTag = new EventEmitter<string>();
  @Output() removeTagEvent = new EventEmitter<Tag>();
  @Output() createNewTag = new EventEmitter<{ name: string; color: string }>();

  searchQuery = '';
  filteredTags = signal<Tag[]>([]);
  showSuggestions = signal(false);
  showCreatePrompt = signal(false);
  creating = signal(false);
  newTagName = '';
  newTagColor = '#3B82F6';

  ngOnInit(): void {}

  onSearchInput(): void {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredTags.set([]);
      this.showSuggestions.set(false);
      this.showCreatePrompt.set(false);
      return;
    }

    const currentTagIds = new Set(this.currentTags.map((t) => t.id));
    const filtered = this.availableTags.filter(
      (tag) => tag.name.toLowerCase().includes(query) && !currentTagIds.has(tag.id)
    );

    this.filteredTags.set(filtered);
    this.showSuggestions.set(filtered.length > 0);

    this.newTagName = this.searchQuery;
    const exactMatch = this.availableTags.some(
      (tag) => tag.name.toLowerCase() === query
    );
    this.showCreatePrompt.set(!exactMatch && query.length > 0 && filtered.length === 0);
  }

  selectTag(tag: Tag): void {
    if (tag && tag.id) {
      this.addTag.emit(tag.id);
      this.searchQuery = '';
      this.filteredTags.set([]);
      this.showSuggestions.set(false);
    }
  }

  removeTag(tag: Tag): void {
    this.removeTagEvent.emit(tag);
  }

  canAddNew(): boolean {
    return this.searchQuery.trim().length > 0;
  }

  addNewTag(): void {
    if (this.searchQuery.trim()) {
      this.newTagName = this.searchQuery.trim();
      this.showCreatePrompt.set(true);
      this.showSuggestions.set(false);
    }
  }

  createTag(): void {
    if (this.newTagName.trim()) {
      this.creating.set(true);
      this.createNewTag.emit({
        name: this.newTagName.trim(),
        color: this.newTagColor,
      });
    }
  }

  cancelCreate(): void {
    this.showCreatePrompt.set(false);
    this.newTagName = '';
    this.newTagColor = '#3B82F6';
  }

  onTagCreated(): void {
    this.creating.set(false);
    this.showCreatePrompt.set(false);
    this.searchQuery = '';
    this.newTagName = '';
  }

  getContrastColor(hexColor: string): string {
    if (!hexColor) return '#000000';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
}
