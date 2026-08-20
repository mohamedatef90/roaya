import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const skeletonVariants = cva(
  'animate-pulse bg-neutral-200 dark:bg-neutral-700',
  {
    variants: {
      variant: {
        default: 'rounded-md',
        circular: 'rounded-full',
        rectangular: 'rounded-none',
        text: 'rounded h-4',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type SkeletonVariants = VariantProps<typeof skeletonVariants>;

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="skeletonClass"
      [style.width]="width"
      [style.height]="height"
      [attr.aria-hidden]="true"
    ></div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SkeletonComponent {
  @Input() variant: SkeletonVariants['variant'] = 'default';
  @Input() width?: string;
  @Input() height?: string;
  @Input() customClass = '';

  get skeletonClass(): string {
    return skeletonVariants({ variant: this.variant }) + ' ' + this.customClass;
  }
}

// Pre-built skeleton patterns
@Component({
  selector: 'ui-skeleton-card',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-3">
      <ui-skeleton height="200px" width="100%"></ui-skeleton>
      <ui-skeleton variant="text" width="80%"></ui-skeleton>
      <ui-skeleton variant="text" width="60%"></ui-skeleton>
    </div>
  `,
})
export class SkeletonCardComponent {}

@Component({
  selector: 'ui-skeleton-table-row',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-4 py-3">
      <ui-skeleton variant="circular" width="40px" height="40px"></ui-skeleton>
      <div class="flex-1 space-y-2">
        <ui-skeleton variant="text" width="60%"></ui-skeleton>
        <ui-skeleton variant="text" width="40%"></ui-skeleton>
      </div>
      <ui-skeleton width="80px" height="24px"></ui-skeleton>
    </div>
  `,
})
export class SkeletonTableRowComponent {}

@Component({
  selector: 'ui-skeleton-avatar',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-3">
      <ui-skeleton variant="circular" [width]="size" [height]="size"></ui-skeleton>
      <div *ngIf="showText" class="space-y-2">
        <ui-skeleton variant="text" width="120px"></ui-skeleton>
        <ui-skeleton variant="text" width="80px"></ui-skeleton>
      </div>
    </div>
  `,
})
export class SkeletonAvatarComponent {
  @Input() size = '48px';
  @Input() showText = true;
}
