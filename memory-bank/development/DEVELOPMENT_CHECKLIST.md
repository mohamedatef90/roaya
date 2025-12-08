# Development Checklist - Roaya IT Website
## Code Quality Standards & Best Practices

**Last Updated:** 2025-12-06
**Maintained By:** Super Tech Lead

---

## Purpose

This checklist ensures all code contributions meet the Roaya IT quality standards established during Phase 4 code review. Use this before submitting pull requests or when reviewing code.

---

## TypeScript Checklist

### Type Safety
- [ ] No `any` types used (use `unknown` or specific types)
- [ ] All function parameters have explicit types
- [ ] All function return types are declared
- [ ] Interfaces defined for complex objects
- [ ] Type aliases used for union types (e.g., `type Theme = 'light' | 'dark'`)

### Null Safety
- [ ] Optional chaining used (`?.`) where values might be undefined
- [ ] Nullish coalescing (`??`) used for default values
- [ ] Proper null checks before accessing properties
- [ ] Type guards used for runtime type narrowing

### Code Examples:
```typescript
// ✅ GOOD
interface User {
  name: string;
  email: string;
  avatar?: string;
}

function getUser(id: string): User | undefined {
  return users.find(u => u.id === id);
}

// Using the function safely
const user = getUser('123');
const avatar = user?.avatar ?? '/default-avatar.png';

// ❌ BAD
function getUser(id: any): any {
  return users.find(u => u.id === id);
}
```

---

## Angular Checklist

### Component Structure
- [ ] Component is standalone (`standalone: true`)
- [ ] All imports declared in `imports: []` array
- [ ] Services injected using `inject()` function (not constructor)
- [ ] Signals used for component state (not regular properties)
- [ ] Computed signals for derived state
- [ ] Proper lifecycle hooks implemented (OnInit, OnDestroy if needed)

### Memory Management
- [ ] All subscriptions use `takeUntilDestroyed(this.destroyRef)`
- [ ] DestroyRef injected if using takeUntilDestroyed
- [ ] Intervals/timeouts cleared in ngOnDestroy
- [ ] Event listeners removed in ngOnDestroy
- [ ] No manual subscriptions without cleanup

### Code Example:
```typescript
// ✅ GOOD
export class ExampleComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataService = inject(DataService);

  data = signal<Data[]>([]);
  filteredData = computed(() => this.data().filter(d => d.active));

  ngOnInit(): void {
    this.dataService.getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.data.set(data),
        error: (error) => console.error('Error:', error)
      });
  }
}

// ❌ BAD - Memory leak
export class ExampleComponent implements OnInit {
  data: Data[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getData().subscribe(data => {
      this.data = data;  // No cleanup, memory leak!
    });
  }
}
```

### Reactive Forms
- [ ] FormBuilder injected with `inject(FormBuilder)`
- [ ] All form controls have validators
- [ ] Error messages mapped to user-friendly text
- [ ] Form validation checked before submission
- [ ] `hasFieldError()` and `getFieldError()` methods implemented

### Code Example:
```typescript
// ✅ GOOD
contactForm = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  message: ['', [Validators.required, Validators.minLength(10)]]
});

hasFieldError(field: string): boolean {
  const control = this.contactForm.get(field);
  return control ? control.invalid && control.touched : false;
}

getFieldError(field: string): string | null {
  const control = this.contactForm.get(field);
  if (!control || !control.errors) return null;

  if (control.errors['required']) return 'validation.required';
  if (control.errors['email']) return 'validation.invalidEmail';
  return null;
}
```

---

## Security Checklist

### XSS Prevention
- [ ] No `innerHTML` binding with user input
- [ ] If using `innerHTML`, ensure data is static/controlled
- [ ] Use `DomSanitizer` for dynamic HTML (if absolutely necessary)
- [ ] All template bindings use Angular's default escaping

### External Links
- [ ] All `target="_blank"` links have `rel="noopener noreferrer"`
- [ ] External URLs validated/whitelisted
- [ ] No `javascript:` URLs in href attributes

### Input Validation
- [ ] All form fields have validators
- [ ] Email format validated
- [ ] Phone numbers validated with regex
- [ ] Min/max length requirements enforced
- [ ] No sensitive data in localStorage (only theme/language preferences)

### Code Example:
```typescript
// ✅ GOOD - Controlled data source
export class MegaMenuComponent {
  items: MegaMenuItem[] = [
    { icon: '&#9729;', title: 'Cloud' }  // Static, safe
  ];
}

// ❌ BAD - User input in innerHTML
<div [innerHTML]="userComment"></div>  // XSS vulnerability!

// ✅ GOOD - Proper sanitization
<div>{{ userComment }}</div>  // Angular escapes automatically

// ✅ GOOD - External links
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  Link
</a>
```

---

## Code Organization Checklist

### File Structure
- [ ] Component files in `features/` or `shared/components/`
- [ ] Services in `core/services/`
- [ ] Directives in `shared/directives/`
- [ ] Interfaces in component file or separate `.interface.ts`
- [ ] File naming follows Angular conventions (`*.component.ts`, `*.service.ts`)

### Imports
- [ ] No unused imports
- [ ] Imports organized (Angular first, then third-party, then local)
- [ ] No wildcard imports (`import * as ...`)
- [ ] Relative imports use `../../` only for parent directories

### Code Example:
```typescript
// ✅ GOOD - Organized imports
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ExampleService } from '../../core/services/example.service';

// ❌ BAD - Unorganized, unused imports
import { ExampleService } from '../../core/services/example.service';
import { Component } from '@angular/core';
import { UnusedService } from './unused.service';
import * as _ from 'lodash';  // Wildcard import
```

---

## Error Handling Checklist

### Subscriptions
- [ ] All subscriptions have error handlers
- [ ] Errors logged with `console.error()`
- [ ] User-friendly error messages displayed
- [ ] Errors don't crash the app

### HTTP Calls (Future)
- [ ] All HTTP calls wrapped in try-catch or have catchError
- [ ] Network errors handled gracefully
- [ ] Loading states shown during async operations
- [ ] Timeout configured for long-running requests

### Code Example:
```typescript
// ✅ GOOD
this.route.params
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe({
    next: (params) => this.handleParams(params),
    error: (error) => {
      console.error('Route params error:', error);
      this.showErrorMessage();
    }
  });

// ❌ BAD - No error handling
this.route.params.subscribe(params => {
  this.handleParams(params);  // What if this throws?
});
```

---

## Performance Checklist

### Lazy Loading
- [ ] All feature routes use `loadComponent()`
- [ ] Heavy components are lazy-loaded
- [ ] No eager imports of large modules

### Change Detection
- [ ] Signals used instead of regular properties (automatic optimization)
- [ ] Computed signals for derived state
- [ ] No unnecessary re-renders

### Assets
- [ ] Images have `loading="lazy"` attribute
- [ ] Images have proper `alt` text
- [ ] SVG files used for icons when possible
- [ ] Large images optimized (compressed, WebP format in future)

### Code Example:
```typescript
// ✅ GOOD - Lazy loading
{
  path: 'admin',
  loadComponent: () => import('./features/admin/admin.component')
    .then(m => m.AdminComponent)
}

// ❌ BAD - Eager loading
import { AdminComponent } from './features/admin/admin.component';

{
  path: 'admin',
  component: AdminComponent  // Loaded immediately, increases bundle size
}
```

---

## Accessibility Checklist

### ARIA Attributes
- [ ] Interactive elements have ARIA labels
- [ ] Menu components have `role="menu"` and `aria-expanded`
- [ ] Buttons have `aria-label` when content is icon-only
- [ ] Focus states visible on all interactive elements

### Keyboard Navigation
- [ ] Escape key closes modals/menus
- [ ] Tab navigation works correctly
- [ ] Enter/Space triggers buttons
- [ ] No keyboard traps

### Motion & Animation
- [ ] Respects `prefers-reduced-motion` media query
- [ ] Animations can be disabled
- [ ] No flashing content (seizure risk)

### Code Example:
```typescript
// ✅ GOOD - Reduced motion support
ngOnInit(): void {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    this.skipAnimations();
    return;
  }

  this.playAnimations();
}

// ✅ GOOD - ARIA attributes
<button
  [attr.aria-expanded]="isOpen()"
  [attr.aria-label]="'Open menu' | translate"
  (click)="toggleMenu()"
>
  <svg>...</svg>
</button>
```

---

## Testing Checklist (Future)

### Unit Tests
- [ ] All services have unit tests
- [ ] Critical component methods tested
- [ ] Edge cases covered
- [ ] Mocks used for dependencies
- [ ] Test coverage > 80%

### E2E Tests
- [ ] Critical user paths tested
- [ ] Form submissions tested
- [ ] Navigation flows tested
- [ ] Error states tested

### Test Example:
```typescript
// ✅ GOOD - Service test
describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    service = new ThemeService();
  });

  it('should initialize with light theme by default', () => {
    expect(service.theme()).toBe('light');
  });

  it('should toggle between light and dark', () => {
    service.toggleTheme();
    expect(service.theme()).toBe('dark');

    service.toggleTheme();
    expect(service.theme()).toBe('light');
  });
});
```

---

## Documentation Checklist

### Code Comments
- [ ] JSDoc comments on all public APIs
- [ ] Complex logic explained with comments
- [ ] TODOs reference issue numbers
- [ ] No commented-out code (use git history)

### Component Documentation
- [ ] Component purpose documented
- [ ] Route documented (if applicable)
- [ ] @Input/@Output properties documented
- [ ] Complex methods documented

### Code Example:
```typescript
/**
 * Theme Service
 * Manages light/dark mode theme switching with localStorage persistence
 *
 * Features:
 * - Automatic system preference detection
 * - SSR-safe localStorage access
 * - Reactive state with Angular signals
 *
 * @example
 * ```typescript
 * const themeService = inject(ThemeService);
 * themeService.toggleTheme();
 * console.log(themeService.theme()); // 'dark'
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /**
   * Current theme signal
   * @readonly
   */
  theme = signal<Theme>(this.getInitialTheme());

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    this.theme.update(current => current === 'light' ? 'dark' : 'light');
  }
}
```

---

## SSR Safety Checklist

### Browser API Access
- [ ] All `window` access wrapped in `typeof window !== 'undefined'`
- [ ] All `document` access wrapped in `typeof document !== 'undefined'`
- [ ] All `localStorage` access wrapped in `typeof localStorage !== 'undefined'`
- [ ] All browser-only APIs have SSR fallbacks

### Code Example:
```typescript
// ✅ GOOD - SSR safe
private getInitialTheme(): Theme {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  return 'light';  // SSR fallback
}

// ❌ BAD - Crashes on SSR
private getInitialTheme(): Theme {
  const saved = localStorage.getItem('theme');  // Error on server!
  return saved || 'light';
}
```

---

## Code Style Checklist

### Naming Conventions
- [ ] Classes/Interfaces: PascalCase (`ThemeService`, `NavItem`)
- [ ] Variables/Functions: camelCase (`isLoading`, `toggleTheme()`)
- [ ] Constants: UPPER_SNAKE_CASE (`THEME_KEY`, `API_URL`)
- [ ] Files: kebab-case (`theme.service.ts`, `main-layout.component.ts`)
- [ ] Component selectors: app- prefix (`app-header`, `app-button`)

### Code Quality
- [ ] Functions max 50 lines
- [ ] Max nesting depth: 3 levels
- [ ] No duplicate code (DRY principle)
- [ ] Early returns for guard clauses
- [ ] Descriptive variable names (no `x`, `temp`, `data2`)

### Code Example:
```typescript
// ✅ GOOD - Early return, clear naming
hasFieldError(fieldName: string): boolean {
  const field = this.contactForm.get(fieldName);
  if (!field) return false;  // Early return

  return field.invalid && (field.dirty || field.touched);
}

// ❌ BAD - Deep nesting, unclear names
hasFieldError(f: string): boolean {
  const x = this.contactForm.get(f);
  if (x) {
    if (x.invalid) {
      if (x.dirty || x.touched) {
        return true;
      }
    }
  }
  return false;
}
```

---

## Pull Request Checklist

Before submitting a PR:
- [ ] All checklist items above addressed
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] No console errors in browser
- [ ] Code formatted (Prettier if configured)
- [ ] No unused variables/imports
- [ ] Tested in light and dark mode
- [ ] Tested in English and Arabic (RTL)
- [ ] Mobile responsive (test on 375px width minimum)
- [ ] No accessibility regressions
- [ ] Documentation updated (if adding new features)
- [ ] CLAUDE.md updated (if changing architecture)

---

## Common Mistakes to Avoid

### ❌ Memory Leaks
```typescript
// BAD
ngOnInit() {
  this.service.data$.subscribe(data => this.data = data);
}
```

### ❌ Using `any` Type
```typescript
// BAD
function process(data: any): any { ... }
```

### ❌ Constructor DI (Old Pattern)
```typescript
// BAD
constructor(private service: Service) {}
```

### ❌ No Error Handling
```typescript
// BAD
this.http.get('/api/data').subscribe(data => this.data = data);
```

### ❌ Not SSR Safe
```typescript
// BAD
const theme = localStorage.getItem('theme');
```

---

## Quick Reference: Modern Angular Patterns

### Dependency Injection
```typescript
// ✅ Modern (Angular 14+)
private readonly service = inject(Service);

// ❌ Old (still works but verbose)
constructor(private service: Service) {}
```

### State Management
```typescript
// ✅ Signals (Angular 16+)
count = signal(0);
doubleCount = computed(() => this.count() * 2);

// ❌ Old (Zone.js change detection)
count = 0;
get doubleCount() { return this.count * 2; }
```

### Subscription Cleanup
```typescript
// ✅ Modern (Angular 16+)
private readonly destroyRef = inject(DestroyRef);

ngOnInit() {
  this.source$.pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({...});
}

// ❌ Old (manual cleanup)
private subscription: Subscription;

ngOnDestroy() {
  this.subscription?.unsubscribe();
}
```

---

## Resources

- **Angular Docs:** https://angular.dev
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Angular Style Guide:** https://angular.dev/style-guide
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Project CLAUDE.md:** `/CLAUDE.md`
- **Code Quality Report:** `/docs/CODE_QUALITY_REPORT.md`
- **Security Review:** `/docs/SECURITY_REVIEW.md`

---

## Getting Help

- **Code Review Questions:** Ask Super Tech Lead
- **Architecture Decisions:** Refer to ADRs in CLAUDE.md
- **Security Concerns:** Review SECURITY_REVIEW.md
- **Best Practices:** This checklist + CODE_QUALITY_REPORT.md

---

**Maintained By:** Super Tech Lead
**Last Updated:** 2025-12-06
**Version:** 1.0

*This checklist should be reviewed before every pull request and updated when new patterns are established.*
