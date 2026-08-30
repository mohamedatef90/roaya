import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-inplace-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="inline-block" [class]="customClass">
      <!-- Display mode -->
      <div
        *ngIf="!editing()"
        class="group flex items-center gap-2 cursor-pointer rounded px-2 py-1 -mx-2 -my-1 hover:bg-surface-hover transition-colors"
        (click)="startEditing()"
        (keydown.enter)="startEditing()"
        [attr.tabindex]="disabled ? -1 : 0"
        [attr.role]="'button'"
        [attr.aria-label]="'Click to edit'"
      >
        <span [class.text-neutral-400]="!value">
          {{ value || placeholder }}
        </span>
        <svg
          class="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
        </svg>
      </div>

      <!-- Edit mode -->
      <div *ngIf="editing()" class="flex items-center gap-2">
        <ng-container [ngSwitch]="type">
          <!-- Text input -->
          <input
            *ngSwitchCase="'text'"
            #inputRef
            type="text"
            class="rounded-md border border-edge-strong px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800"
            [value]="editValue()"
            (input)="onInput($event)"
            (keydown.enter)="save()"
            (keydown.escape)="cancel()"
            (blur)="onBlur()"
          />

          <!-- Textarea -->
          <textarea
            *ngSwitchCase="'textarea'"
            #inputRef
            class="rounded-md border border-edge-strong px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 min-w-[200px]"
            [rows]="rows"
            [value]="editValue()"
            (input)="onInput($event)"
            (keydown.escape)="cancel()"
            (blur)="onBlur()"
          ></textarea>

          <!-- Select -->
          <select
            *ngSwitchCase="'select'"
            #inputRef
            class="rounded-md border border-edge-strong px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800"
            [value]="editValue()"
            (change)="onSelectChange($event)"
            (blur)="onBlur()"
          >
            <option *ngFor="let option of options" [value]="option.value">
              {{ option.label }}
            </option>
          </select>
        </ng-container>

        <!-- Action buttons -->
        <div *ngIf="showButtons" class="flex items-center gap-1">
          <button
            type="button"
            class="rounded p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            (click)="save()"
            [attr.aria-label]="'Save'"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
          <button
            type="button"
            class="rounded p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            (click)="cancel()"
            [attr.aria-label]="'Cancel'"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class InplaceEditComponent implements AfterViewInit {
  @ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

  @Input() value: any;
  @Input() type: 'text' | 'textarea' | 'select' = 'text';
  @Input() placeholder = 'Click to edit';
  @Input() disabled = false;
  @Input() showButtons = true;
  @Input() saveOnBlur = false;
  @Input() rows = 3;
  @Input() options: { label: string; value: any }[] = [];
  @Input() customClass = '';

  @Output() valueChange = new EventEmitter<any>();
  @Output() saved = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  editing = signal(false);
  editValue = signal<any>('');
  private pendingFocus = false;

  ngAfterViewInit(): void {
    if (this.pendingFocus && this.inputRef) {
      setTimeout(() => {
        this.inputRef?.nativeElement.focus();
        if (this.inputRef?.nativeElement instanceof HTMLInputElement) {
          this.inputRef.nativeElement.select();
        }
      });
      this.pendingFocus = false;
    }
  }

  startEditing(): void {
    if (this.disabled) return;
    this.editValue.set(this.value);
    this.editing.set(true);
    this.pendingFocus = true;

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

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.editValue.set(target.value);
  }

  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.editValue.set(target.value);
    this.save();
  }

  onBlur(): void {
    if (this.saveOnBlur && !this.showButtons) {
      setTimeout(() => this.save(), 100);
    }
  }

  save(): void {
    const newValue = this.editValue();
    this.value = newValue;
    this.valueChange.emit(newValue);
    this.saved.emit(newValue);
    this.editing.set(false);
  }

  cancel(): void {
    this.editing.set(false);
    this.cancelled.emit();
  }
}
