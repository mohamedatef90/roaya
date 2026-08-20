import { Component, Input, ChangeDetectionStrategy, ContentChild, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelComponent } from '../../primitives/label/label.component';

@Component({
  selector: 'ui-form-field',
  standalone: true,
  imports: [CommonModule, LabelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-2" [class]="customClass">
      <!-- Label -->
      <ui-label
        *ngIf="label"
        [for]="id"
        [required]="required"
        [variant]="error ? 'error' : 'default'"
      >
        {{ label }}
      </ui-label>

      <!-- Input slot -->
      <ng-content></ng-content>

      <!-- Description -->
      <p
        *ngIf="description && !error"
        class="text-sm text-content-muted"
        [id]="id ? id + '-description' : undefined"
      >
        {{ description }}
      </p>

      <!-- Error message -->
      <p
        *ngIf="error"
        class="text-sm text-red-500 dark:text-red-400 flex items-center gap-1"
        [id]="id ? id + '-error' : undefined"
        role="alert"
      >
        <svg class="h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="m15 9-6 6"/>
          <path d="m9 9 6 6"/>
        </svg>
        {{ error }}
      </p>

      <!-- Hint -->
      <p
        *ngIf="hint && !error"
        class="text-xs text-content-muted"
      >
        {{ hint }}
      </p>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class FormFieldComponent {
  @Input() label?: string;
  @Input() description?: string;
  @Input() error?: string;
  @Input() hint?: string;
  @Input() required = false;
  @Input() id?: string;
  @Input() customClass = '';
}

// Inline form field for horizontal layout
@Component({
  selector: 'ui-form-field-inline',
  standalone: true,
  imports: [CommonModule, LabelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-start gap-4" [class]="customClass">
      <!-- Label -->
      <ui-label
        *ngIf="label"
        [for]="id"
        [required]="required"
        [variant]="error ? 'error' : 'default'"
        class="w-32 flex-shrink-0 pt-2"
      >
        {{ label }}
      </ui-label>

      <div class="flex-1 space-y-1">
        <!-- Input slot -->
        <ng-content></ng-content>

        <!-- Error message -->
        <p
          *ngIf="error"
          class="text-sm text-red-500 dark:text-red-400"
          role="alert"
        >
          {{ error }}
        </p>

        <!-- Description -->
        <p
          *ngIf="description && !error"
          class="text-sm text-content-muted"
        >
          {{ description }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class FormFieldInlineComponent {
  @Input() label?: string;
  @Input() description?: string;
  @Input() error?: string;
  @Input() required = false;
  @Input() id?: string;
  @Input() customClass = '';
}
