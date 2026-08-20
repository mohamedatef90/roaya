import { Component, Input, ChangeDetectionStrategy, signal, HostListener, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const tooltipVariants = cva(
  'absolute z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs animate-in fade-in-0 zoom-in-95',
  {
    variants: {
      variant: {
        default: 'bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900',
        light: 'bg-white text-neutral-900 border border-neutral-200 shadow-md dark:bg-neutral-800 dark:text-neutral-50 dark:border-neutral-700',
      },
      side: {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      side: 'top',
    },
  }
);

type TooltipVariants = VariantProps<typeof tooltipVariants>;

@Component({
  selector: 'ui-tooltip',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative inline-block"
      (mouseenter)="showTooltip()"
      (mouseleave)="hideTooltip()"
      (focusin)="showTooltip()"
      (focusout)="hideTooltip()"
    >
      <!-- Trigger -->
      <ng-content></ng-content>

      <!-- Tooltip -->
      <div
        *ngIf="visible()"
        [class]="tooltipClass"
        role="tooltip"
        [attr.id]="tooltipId"
      >
        {{ content }}

        <!-- Arrow -->
        <div [class]="arrowClass"></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-in {
      animation: fadeIn 0.15s ease-out;
    }
  `]
})
export class TooltipComponent {
  @Input() content = '';
  @Input() variant: TooltipVariants['variant'] = 'default';
  @Input() side: TooltipVariants['side'] = 'top';
  @Input() delay = 200;
  @Input() customClass = '';

  visible = signal(false);
  tooltipId = `tooltip-${Math.random().toString(36).substring(2, 9)}`;

  private showTimeout?: ReturnType<typeof setTimeout>;
  private hideTimeout?: ReturnType<typeof setTimeout>;

  get tooltipClass(): string {
    return tooltipVariants({ variant: this.variant, side: this.side }) + ' ' + this.customClass;
  }

  get arrowClass(): string {
    const base = 'absolute w-2 h-2 rotate-45';
    const variantClass = this.variant === 'default'
      ? 'bg-neutral-900 dark:bg-neutral-50'
      : 'bg-white border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700';

    const positionClasses: Record<string, string> = {
      top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-0 border-l-0',
      bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-0 border-r-0',
      left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-0 border-b-0',
      right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-0 border-t-0',
    };

    return `${base} ${variantClass} ${positionClasses[this.side || 'top']}`;
  }

  showTooltip(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    this.showTimeout = setTimeout(() => {
      this.visible.set(true);
    }, this.delay);
  }

  hideTooltip(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    this.hideTimeout = setTimeout(() => {
      this.visible.set(false);
    }, 100);
  }
}

// Directive-style tooltip for simpler usage
import { Directive, TemplateRef, ViewContainerRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[uiTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input('uiTooltip') content = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() tooltipDelay = 200;

  private tooltipElement: HTMLElement | null = null;
  private showTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.renderer.listen(this.el.nativeElement, 'mouseenter', () => this.show());
    this.renderer.listen(this.el.nativeElement, 'mouseleave', () => this.hide());
    this.renderer.listen(this.el.nativeElement, 'focus', () => this.show());
    this.renderer.listen(this.el.nativeElement, 'blur', () => this.hide());
  }

  private show(): void {
    this.showTimeout = setTimeout(() => {
      this.createTooltip();
    }, this.tooltipDelay);
  }

  private hide(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    this.removeTooltip();
  }

  private createTooltip(): void {
    if (this.tooltipElement || !this.content) return;

    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.appendChild(
      this.tooltipElement,
      this.renderer.createText(this.content)
    );

    this.renderer.addClass(this.tooltipElement, 'fixed');
    this.renderer.addClass(this.tooltipElement, 'z-50');
    this.renderer.addClass(this.tooltipElement, 'px-3');
    this.renderer.addClass(this.tooltipElement, 'py-1.5');
    this.renderer.addClass(this.tooltipElement, 'text-xs');
    this.renderer.addClass(this.tooltipElement, 'rounded-md');
    this.renderer.addClass(this.tooltipElement, 'bg-neutral-900');
    this.renderer.addClass(this.tooltipElement, 'text-white');
    this.renderer.addClass(this.tooltipElement, 'pointer-events-none');

    this.renderer.appendChild(document.body, this.tooltipElement);
    this.positionTooltip();
  }

  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();

    let top: number;
    let left: number;

    switch (this.tooltipPosition) {
      case 'top':
        top = hostRect.top - tooltipRect.height - 8;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = hostRect.bottom + 8;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.right + 8;
        break;
    }

    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  private removeTooltip(): void {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }

  ngOnDestroy(): void {
    this.removeTooltip();
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
  }
}
