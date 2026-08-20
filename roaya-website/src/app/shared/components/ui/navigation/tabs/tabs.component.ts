import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, ContentChildren, QueryList, AfterContentInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';

const tabListVariants = cva(
  'inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800',
        underline: 'border-b border-neutral-200 dark:border-neutral-700',
        pills: 'gap-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const tabTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'rounded-md data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-900 dark:data-[state=active]:text-neutral-50',
        underline: 'border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400',
        pills: 'rounded-full bg-transparent data-[state=active]:bg-primary-500 data-[state=active]:text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type TabsVariants = VariantProps<typeof tabListVariants>;

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  content?: TemplateRef<any>;
}

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="customClass">
      <!-- Tab list -->
      <div [class]="tabListClass" role="tablist" [attr.aria-label]="ariaLabel">
        <button
          *ngFor="let tab of tabs"
          type="button"
          role="tab"
          [class]="getTabTriggerClass(tab.id)"
          [attr.aria-selected]="activeTab() === tab.id"
          [attr.aria-controls]="'panel-' + tab.id"
          [attr.data-state]="activeTab() === tab.id ? 'active' : 'inactive'"
          [disabled]="tab.disabled"
          [id]="'tab-' + tab.id"
          (click)="selectTab(tab.id)"
          (keydown)="onKeyDown($event, tab.id)"
        >
          <span *ngIf="tab.icon" class="mr-2" [innerHTML]="tab.icon"></span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab panels -->
      <div class="mt-4">
        <div
          *ngFor="let tab of tabs"
          [id]="'panel-' + tab.id"
          role="tabpanel"
          [attr.aria-labelledby]="'tab-' + tab.id"
          [hidden]="activeTab() !== tab.id"
          [class.animate-fade-in]="activeTab() === tab.id"
        >
          <ng-container *ngIf="tab.content">
            <ng-container *ngTemplateOutlet="tab.content"></ng-container>
          </ng-container>
        </div>

        <!-- Default content slot for simple usage -->
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
  `]
})
export class TabsComponent {
  @Input() tabs: Tab[] = [];
  @Input() defaultTab?: string;
  @Input() variant: TabsVariants['variant'] = 'default';
  @Input() ariaLabel = 'Tabs';
  @Input() customClass = '';

  @Output() tabChange = new EventEmitter<string>();

  activeTab = signal<string>('');

  ngOnInit(): void {
    if (this.defaultTab) {
      this.activeTab.set(this.defaultTab);
    } else if (this.tabs.length > 0) {
      this.activeTab.set(this.tabs[0].id);
    }
  }

  get tabListClass(): string {
    return tabListVariants({ variant: this.variant });
  }

  getTabTriggerClass(tabId: string): string {
    return tabTriggerVariants({ variant: this.variant });
  }

  selectTab(tabId: string): void {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      this.activeTab.set(tabId);
      this.tabChange.emit(tabId);
    }
  }

  onKeyDown(event: KeyboardEvent, currentTabId: string): void {
    const enabledTabs = this.tabs.filter(t => !t.disabled);
    const currentIndex = enabledTabs.findIndex(t => t.id === currentTabId);

    let newIndex: number;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : enabledTabs.length - 1;
        this.selectTab(enabledTabs[newIndex].id);
        break;
      case 'ArrowRight':
        event.preventDefault();
        newIndex = currentIndex < enabledTabs.length - 1 ? currentIndex + 1 : 0;
        this.selectTab(enabledTabs[newIndex].id);
        break;
      case 'Home':
        event.preventDefault();
        this.selectTab(enabledTabs[0].id);
        break;
      case 'End':
        event.preventDefault();
        this.selectTab(enabledTabs[enabledTabs.length - 1].id);
        break;
    }
  }
}

// Individual tab content component for slot-based usage
@Component({
  selector: 'ui-tab-content',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
})
export class TabContentComponent {
  @Input() tabId!: string;
}
