import { Component, Input, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
        '2xl': 'h-20 w-20 text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

type AvatarVariants = VariantProps<typeof avatarVariants>;

@Component({
  selector: 'ui-avatar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="avatarClass">
      <!-- Image -->
      <img
        *ngIf="src && !imageError()"
        [src]="src"
        [alt]="alt"
        class="aspect-square h-full w-full object-cover"
        (error)="onImageError()"
      />

      <!-- Fallback with initials -->
      <div
        *ngIf="!src || imageError()"
        class="flex h-full w-full items-center justify-center bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 font-medium"
        [style.backgroundColor]="fallbackColor"
        [style.color]="'white'"
      >
        {{ initials }}
      </div>

      <!-- Status indicator -->
      <span
        *ngIf="status"
        class="absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-neutral-900"
        [class]="statusClass"
      ></span>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
  `]
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() alt = '';
  @Input() size: AvatarVariants['size'] = 'md';
  @Input() name?: string;
  @Input() status?: 'online' | 'offline' | 'away' | 'busy';
  @Input() customClass = '';

  imageError = signal(false);

  get avatarClass(): string {
    return avatarVariants({ size: this.size }) + ' ' + this.customClass;
  }

  get initials(): string {
    if (!this.name) return '?';
    const parts = this.name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  get fallbackColor(): string {
    if (!this.name) return '#6b7280';
    // Generate consistent color from name
    let hash = 0;
    for (let i = 0; i < this.name.length; i++) {
      hash = this.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#3D5A80', // Navy
      '#5DB7C2', // Teal
      '#6B4C9A', // Purple
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#3B82F6', // Blue
      '#8B5CF6', // Violet
    ];
    return colors[Math.abs(hash) % colors.length];
  }

  get statusClass(): string {
    const statusSizes: Record<string, string> = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-3.5 w-3.5',
      '2xl': 'h-4 w-4',
    };
    const statusColors: Record<string, string> = {
      online: 'bg-green-500',
      offline: 'bg-neutral-400',
      away: 'bg-amber-500',
      busy: 'bg-red-500',
    };
    const sizeClass = statusSizes[this.size || 'md'];
    const colorClass = statusColors[this.status || 'offline'];
    return `${sizeClass} ${colorClass}`;
  }

  onImageError(): void {
    this.imageError.set(true);
  }
}

// Avatar Group Component
@Component({
  selector: 'ui-avatar-group',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex -space-x-2">
      <ng-container *ngFor="let avatar of displayedAvatars; let i = index">
        <ui-avatar
          [src]="avatar.src"
          [name]="avatar.name"
          [size]="size"
          class="ring-2 ring-white dark:ring-neutral-900"
          [style.z-index]="avatars.length - i"
        ></ui-avatar>
      </ng-container>

      <!-- Overflow count -->
      <div
        *ngIf="overflowCount > 0"
        class="flex items-center justify-center rounded-full bg-neutral-200 text-neutral-600 ring-2 ring-white dark:bg-neutral-700 dark:text-neutral-300 dark:ring-neutral-900 font-medium"
        [class]="overflowClass"
      >
        +{{ overflowCount }}
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
  `]
})
export class AvatarGroupComponent {
  @Input() avatars: { src?: string; name?: string }[] = [];
  @Input() max = 4;
  @Input() size: AvatarVariants['size'] = 'md';

  get displayedAvatars(): { src?: string; name?: string }[] {
    return this.avatars.slice(0, this.max);
  }

  get overflowCount(): number {
    return Math.max(0, this.avatars.length - this.max);
  }

  get overflowClass(): string {
    const sizes: Record<string, string> = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
      '2xl': 'h-20 w-20 text-xl',
    };
    return sizes[this.size || 'md'];
  }
}
