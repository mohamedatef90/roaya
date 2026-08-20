import { Component, Input, Output, EventEmitter, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type FieldType = 'text' | 'email' | 'phone' | 'url' | 'select' | 'date';

export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Inline Edit Field Component
 * Click-to-edit fields for lead details
 * Migrated from PrimeNG Inplace to custom Tailwind implementation
 */
@Component({
  selector: 'app-inline-edit-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  template: `
    <div class="inline-edit-field">
      <label class="block text-sm font-medium text-content-secondary mb-1">
        {{ label }}
      </label>

      <!-- Display mode -->
      @if (!editing()) {
        <div
          class="group flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer
                 border border-transparent hover:border-edge-strong
                 hover:bg-surface-hover transition-colors min-h-[42px]"
          (click)="startEditing()"
          (keydown.enter)="startEditing()"
          tabindex="0"
          role="button"
          aria-label="Click to edit"
        >
          @if (displayValue) {
            <span class="text-content-primary">{{ displayValue }}</span>
          } @else {
            <span class="text-neutral-400 italic">Click to edit</span>
          }
          <svg class="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
        </div>
      }

      <!-- Edit mode -->
      @if (editing()) {
        <div class="flex items-center gap-2">
          @switch (type) {
            @case ('text') {
              <input
                #inputRef
                type="text"
                name="inlineEditText"
                [(ngModel)]="editValue"
                [placeholder]="placeholder"
                class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                (keydown.enter)="save()"
                (keydown.escape)="cancel()"
              />
            }
            @case ('email') {
              <input
                #inputRef
                type="email"
                name="inlineEditEmail"
                [(ngModel)]="editValue"
                [placeholder]="placeholder"
                class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                (keydown.enter)="save()"
                (keydown.escape)="cancel()"
              />
            }
            @case ('phone') {
              <input
                #inputRef
                type="tel"
                name="inlineEditPhone"
                [(ngModel)]="editValue"
                [placeholder]="placeholder"
                class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                (keydown.enter)="save()"
                (keydown.escape)="cancel()"
              />
            }
            @case ('url') {
              <input
                #inputRef
                type="url"
                name="inlineEditUrl"
                [(ngModel)]="editValue"
                [placeholder]="placeholder"
                class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                (keydown.enter)="save()"
                (keydown.escape)="cancel()"
              />
            }
            @case ('select') {
              <select
                #inputRef
                name="inlineEditSelect"
                [(ngModel)]="editValue"
                class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
              >
                @for (opt of options; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            }
            @case ('date') {
              <input
                #inputRef
                type="datetime-local"
                name="inlineEditDate"
                [(ngModel)]="editValue"
                [placeholder]="placeholder"
                class="flex h-10 w-full rounded-md border border-edge-strong bg-surface-elevated px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                (keydown.escape)="cancel()"
              />
            }
          }

          <!-- Save button -->
          <button
            type="button"
            class="rounded-full p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            (click)="save()"
            [disabled]="saving()"
            aria-label="Save"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>

          <!-- Cancel button -->
          <button
            type="button"
            class="rounded-full p-2 text-neutral-500 hover:bg-surface-hover transition-colors"
            (click)="cancel()"
            [disabled]="saving()"
            aria-label="Cancel"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
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
export class InlineEditFieldComponent {
  @ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement | HTMLSelectElement>;

  @Input() label = '';
  @Input() value: string | Date | null = null;
  @Input() type: FieldType = 'text';
  @Input() placeholder = '';
  @Input() options: SelectOption[] = [];

  @Output() valueChange = new EventEmitter<string | Date | null>();

  editValue: string | Date | null = null;
  editing = signal(false);
  saving = signal(false);

  get displayValue(): string {
    if (this.value === null || this.value === undefined) {
      return '';
    }

    if (this.type === 'date' && this.value) {
      const date = this.value instanceof Date ? this.value : new Date(this.value);
      return date.toLocaleString();
    }

    if (this.type === 'select' && this.options.length > 0) {
      const option = this.options.find((o) => o.value === this.value);
      return option?.label || String(this.value);
    }

    return String(this.value);
  }

  startEditing(): void {
    this.editValue = this.value;
    this.editing.set(true);

    // Focus after view updates
    setTimeout(() => {
      if (this.inputRef) {
        this.inputRef.nativeElement.focus();
        if (this.inputRef.nativeElement instanceof HTMLInputElement) {
          this.inputRef.nativeElement.select();
        }
      }
    });
  }

  save(): void {
    if (this.editValue !== this.value) {
      this.saving.set(true);
      this.valueChange.emit(this.editValue);
    }
    this.editing.set(false);
  }

  cancel(): void {
    this.editValue = this.value;
    this.editing.set(false);
  }

  // Called from parent after save completes
  setSaved(): void {
    this.saving.set(false);
  }
}
