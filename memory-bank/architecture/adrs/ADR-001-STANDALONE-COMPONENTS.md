# ADR 001: Use Angular Standalone Components Exclusively

**Status:** Accepted
**Date:** 2025-12-05
**Decision Makers:** Tech Lead, Development Team

## Context and Problem Statement

Angular 21 offers two approaches for organizing components:
1. Traditional NgModule-based architecture
2. Standalone components without NgModules

We need to decide which approach to use for the Roaya IT website to ensure maintainability, performance, and alignment with Angular's future direction.

## Decision Drivers

- Angular's official recommendation and future direction
- Team productivity and learning curve
- Bundle size and tree-shaking effectiveness
- Code maintainability and simplicity
- Lazy loading capabilities

## Considered Options

### Option 1: NgModule-Based Architecture (Traditional)
**Pros:**
- Well-established patterns
- Extensive documentation and examples
- Team familiarity (if migrating from older Angular)

**Cons:**
- More boilerplate code
- Larger bundle sizes
- Less effective tree-shaking
- Going against Angular's future direction
- More complex dependency management

### Option 2: Standalone Components (SELECTED)
**Pros:**
- Angular's official future direction
- Simpler mental model
- Better tree-shaking and smaller bundles
- Less boilerplate
- Easier to understand component dependencies
- Simplified lazy loading
- Better developer experience

**Cons:**
- Requires learning new patterns for teams from older Angular
- Less mature ecosystem examples (though growing rapidly)

### Option 3: Hybrid Approach
**Pros:**
- Gradual migration path

**Cons:**
- Increased complexity
- Mixed patterns confuse developers
- Maintenance overhead

## Decision Outcome

**SELECTED: Option 2 - Standalone Components Exclusively**

All components, directives, and pipes will be standalone. No NgModules will be created except where absolutely necessary for third-party library integration.

### Implementation Strategy

```typescript
// Every component declaration
@Component({
  selector: 'app-example',
  standalone: true,  // Always set to true
  imports: [
    CommonModule,
    // Directly import what you need
    ReactiveFormsModule,
    OtherStandaloneComponent
  ],
  templateUrl: './example.component.html',
  styleUrl: './example.component.css'
})
export class ExampleComponent {}
```

### Consequences

#### Positive
- 15-20% smaller initial bundle size due to better tree-shaking
- Clearer component dependencies (imports in component decorator)
- Simplified project structure (no module files to maintain)
- Faster onboarding for new developers
- Future-proof codebase aligned with Angular's roadmap
- Easier unit testing (no TestBed module configuration)

#### Negative
- Team must learn new patterns if coming from NgModule background
- Some third-party libraries may require wrapper modules (rare)

#### Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Third-party library incompatibility | Create minimal adapter modules only when necessary |
| Team resistance to new patterns | Provide comprehensive training and examples |
| Lost productivity during learning | Allocate time for team upskilling |

## Validation

Success will be measured by:
- Bundle size: Initial load < 200KB gzipped
- Developer satisfaction: Survey after 1 month
- Build time: < 30 seconds for production builds
- Code review feedback: Minimal confusion about component organization

## Related Decisions

- ADR 002: Project Structure Organization
- ADR 003: Lazy Loading Strategy

## References

- [Angular Standalone Components Guide](https://angular.dev/guide/components/importing)
- [Angular v14+ Standalone Components RFC](https://github.com/angular/angular/discussions/45554)
- Angular CLI default for v17+ projects
