import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-xl border bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50',
  {
    variants: {
      variant: {
        default: 'border-neutral-200 dark:border-neutral-800',
        elevated: 'border-neutral-200 shadow-lg dark:border-neutral-800',
        outline: 'border-neutral-300 dark:border-neutral-700',
        ghost: 'border-transparent bg-transparent',
        glass: 'border-white/20 bg-white/80 backdrop-blur-lg dark:border-white/10 dark:bg-neutral-900/80',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

const cardHeaderVariants = cva('flex flex-col space-y-1.5', {
  variants: {
    padding: {
      none: '',
      sm: 'p-4 pb-0',
      md: 'p-6 pb-0',
      lg: 'p-8 pb-0',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
});

const cardContentVariants = cva('', {
  variants: {
    padding: {
      none: '',
      sm: 'p-4 pt-4',
      md: 'p-6 pt-4',
      lg: 'p-8 pt-6',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
});

const cardFooterVariants = cva('flex items-center', {
  variants: {
    padding: {
      none: '',
      sm: 'p-4 pt-0',
      md: 'p-6 pt-0',
      lg: 'p-8 pt-0',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
});

type CardVariants = VariantProps<typeof cardVariants>;

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="cardClass">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CardComponent {
  @Input() variant: CardVariants['variant'] = 'default';
  @Input() padding: CardVariants['padding'] = 'md';
  @Input() customClass = '';

  get cardClass(): string {
    return cardVariants({ variant: this.variant, padding: this.padding }) + ' ' + this.customClass;
  }
}

@Component({
  selector: 'ui-card-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="headerClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardHeaderComponent {
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'none';
  @Input() customClass = '';

  get headerClass(): string {
    return cardHeaderVariants({ padding: this.padding }) + ' ' + this.customClass;
  }
}

@Component({
  selector: 'ui-card-title',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h3 class="text-xl font-semibold leading-none tracking-tight" [class]="customClass">
      <ng-content></ng-content>
    </h3>
  `,
})
export class CardTitleComponent {
  @Input() customClass = '';
}

@Component({
  selector: 'ui-card-description',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="text-sm text-neutral-500 dark:text-neutral-400" [class]="customClass">
      <ng-content></ng-content>
    </p>
  `,
})
export class CardDescriptionComponent {
  @Input() customClass = '';
}

@Component({
  selector: 'ui-card-content',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="contentClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardContentComponent {
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'none';
  @Input() customClass = '';

  get contentClass(): string {
    return cardContentVariants({ padding: this.padding }) + ' ' + this.customClass;
  }
}

@Component({
  selector: 'ui-card-footer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="footerClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardFooterComponent {
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'none';
  @Input() customClass = '';

  get footerClass(): string {
    return cardFooterVariants({ padding: this.padding }) + ' ' + this.customClass;
  }
}
