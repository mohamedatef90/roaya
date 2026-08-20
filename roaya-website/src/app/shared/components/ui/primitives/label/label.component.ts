import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'text-neutral-700 dark:text-neutral-200',
        error: 'text-red-500 dark:text-red-400',
        muted: 'text-neutral-500 dark:text-neutral-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type LabelVariants = VariantProps<typeof labelVariants>;

@Component({
  selector: 'ui-label',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label
      [for]="for"
      [class]="labelClass"
    >
      <ng-content></ng-content>
      <span *ngIf="required" class="text-red-500 ml-1">*</span>
    </label>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class LabelComponent {
  @Input() variant: LabelVariants['variant'] = 'default';
  @Input() for?: string;
  @Input() required = false;
  @Input() customClass = '';

  get labelClass(): string {
    return labelVariants({ variant: this.variant }) + ' ' + this.customClass;
  }
}
