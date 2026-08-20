import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const separatorVariants = cva(
  'shrink-0 bg-neutral-200 dark:bg-neutral-700',
  {
    variants: {
      orientation: {
        horizontal: 'h-px w-full',
        vertical: 'h-full w-px',
      },
      decorative: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      decorative: true,
    },
  }
);

type SeparatorVariants = VariantProps<typeof separatorVariants>;

@Component({
  selector: 'ui-separator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="separatorClass"
      [attr.role]="decorative ? 'none' : 'separator'"
      [attr.aria-orientation]="decorative ? null : orientation"
    ></div>
  `,
  styles: [`
    :host {
      display: block;
    }
    :host([data-orientation="vertical"]) {
      display: inline-block;
    }
  `]
})
export class SeparatorComponent {
  @Input() orientation: SeparatorVariants['orientation'] = 'horizontal';
  @Input() decorative = true;
  @Input() customClass = '';

  get separatorClass(): string {
    return separatorVariants({ orientation: this.orientation }) + ' ' + this.customClass;
  }
}
