# Roaya IT - Project Structure

## Complete Directory Tree

```
roaya-website/
├── src/
│   ├── app/
│   │   ├── core/                          # Core application modules
│   │   │   ├── services/
│   │   │   │   ├── theme.service.ts       # Light/Dark mode management
│   │   │   │   ├── language.service.ts    # i18n and RTL management
│   │   │   │   └── navigation.service.ts  # Navigation state management
│   │   │   ├── guards/                    # Route guards (future)
│   │   │   ├── interceptors/              # HTTP interceptors (future)
│   │   │   └── models/                    # TypeScript interfaces (future)
│   │   │
│   │   ├── shared/                        # Shared/reusable modules
│   │   │   ├── components/
│   │   │   │   └── button/
│   │   │   │       └── button.component.ts # Reusable button with CVA
│   │   │   ├── directives/                # Custom directives (future)
│   │   │   ├── pipes/                     # Custom pipes (future)
│   │   │   └── utils/                     # Utility functions (future)
│   │   │
│   │   ├── features/                      # Feature modules
│   │   │   ├── home/
│   │   │   │   └── home.component.ts      # Home page component
│   │   │   ├── services/
│   │   │   │   └── services.component.ts  # Services page component
│   │   │   ├── industries/
│   │   │   │   └── industries.component.ts # Industries page component
│   │   │   ├── pricing/
│   │   │   │   └── pricing.component.ts   # Pricing page component
│   │   │   ├── about/
│   │   │   │   └── about.component.ts     # About page component
│   │   │   └── contact/
│   │   │       └── contact.component.ts   # Contact page component
│   │   │
│   │   ├── layouts/                       # Layout components
│   │   │   ├── main-layout/
│   │   │   │   ├── main-layout.component.ts    # Main layout TS
│   │   │   │   ├── main-layout.component.html  # Main layout template
│   │   │   │   └── main-layout.component.scss  # Main layout styles
│   │   │   └── auth-layout/               # Auth layout (future)
│   │   │
│   │   ├── app.ts                         # Root component
│   │   ├── app.config.ts                  # Application config
│   │   └── app.routes.ts                  # Route definitions
│   │
│   ├── assets/
│   │   ├── i18n/
│   │   │   ├── en.json                    # English translations
│   │   │   └── ar.json                    # Arabic translations
│   │   ├── images/
│   │   │   └── roaya-logo.png             # Company logo
│   │   ├── fonts/                         # Custom fonts (if needed)
│   │   └── icons/                         # Icon assets
│   │
│   ├── styles/
│   │   ├── base/
│   │   │   ├── _variables.scss            # CSS custom properties
│   │   │   ├── _reset.scss                # CSS reset
│   │   │   └── _typography.scss           # Typography styles
│   │   └── utilities/
│   │       └── _helpers.scss              # Utility classes
│   │
│   ├── main.ts                            # Application entry point
│   ├── index.html                         # HTML entry point
│   └── styles.scss                        # Global styles
│
├── public/                                # Static assets
│   └── favicon.ico
│
├── .vscode/                               # VS Code settings
├── angular.json                           # Angular CLI config
├── package.json                           # NPM dependencies
├── tsconfig.json                          # TypeScript config
├── tailwind.config.js                     # Tailwind config
├── postcss.config.js                      # PostCSS config
├── README.md                              # Project documentation
└── PROJECT_STRUCTURE.md                   # This file
```

## Key Files Explained

### Configuration Files

#### `tailwind.config.js`
- Custom color palette matching Roaya brand
- Extended breakpoints (xs to 3xl)
- Custom animations and keyframes
- Dark mode configuration
- Tailwind plugins integration

#### `angular.json`
- Build configurations
- Asset management
- Style preprocessing
- Performance budgets

#### `app.config.ts`
- Angular application providers
- Router configuration
- HTTP client setup
- i18n configuration

#### `app.routes.ts`
- Lazy-loaded route definitions
- Route titles for SEO
- Wildcard route handling

### Core Services

#### `theme.service.ts`
```typescript
Features:
- Light/Dark mode toggle
- localStorage persistence
- System preference detection
- Reactive signals for theme state
```

#### `language.service.ts`
```typescript
Features:
- English/Arabic language switching
- Automatic RTL direction handling
- localStorage persistence
- Browser language detection
- ngx-translate integration
```

#### `navigation.service.ts`
```typescript
Features:
- Mobile menu state management
- Current route tracking
- Navigation items configuration
- Route active state checking
```

### Styling System

#### `styles/base/_variables.scss`
- CSS custom properties for theming
- Brand colors (primary, secondary, accent)
- Semantic colors (background, foreground, surface)
- Spacing scale
- Border radius scale
- Typography system
- Shadow definitions
- Z-index layers
- Transition timings

#### `styles/base/_reset.scss`
- Modern CSS reset
- Box-sizing border-box
- Text rendering optimization
- Reduced motion support
- Focus visible styling
- Selection colors

#### `styles/base/_typography.scss`
- Google Fonts imports (Inter, Tajawal)
- Fluid typography with clamp()
- Heading styles (h1-h6)
- Paragraph styles
- Link styles
- List styles
- Blockquote styles
- Code styles
- Gradient text utilities

#### `styles/utilities/_helpers.scss`
- Container utilities
- Flexbox utilities
- Grid utilities
- Visibility utilities
- Screen reader utilities
- Text truncation
- Aspect ratios
- Gradient backgrounds
- Glass effect
- Animations
- RTL utilities

### Component Structure

Each feature component follows this pattern:
```typescript
@Component({
  selector: 'app-[feature]',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `...`,  // or templateUrl
  styles: `...`     // or styleUrls
})
export class [Feature]Component {}
```

### Layout Components

#### `main-layout.component`
- Sticky header with navigation
- Desktop + mobile menu
- Theme toggle button
- Language toggle button
- Router outlet for page content
- Footer with links and copyright

## Future Enhancements

### Planned Components (shared/)
- Card component
- Input component
- Modal/Dialog component
- Toast/Notification component
- Dropdown component
- Tabs component
- Accordion component
- Loading spinner component
- Avatar component
- Badge component

### Planned Features (features/)
- Blog module
- Case studies module
- Team members module
- Testimonials module
- FAQ module
- Newsletter subscription

### Planned Services (core/)
- API service for backend communication
- SEO service for meta tags
- Analytics service
- Form validation service
- Error handling service

## Development Guidelines

### Component Creation
```bash
# Generate new component
ng generate component features/[feature-name] --standalone

# Generate new service
ng generate service core/services/[service-name]
```

### Styling Conventions
1. Use Tailwind utilities first
2. Use CSS custom properties for theming
3. Use SCSS only for complex component styles
4. Follow BEM naming for custom CSS classes
5. Ensure dark mode compatibility
6. Test RTL layout for Arabic

### TypeScript Conventions
1. Use strict mode
2. Define interfaces for all data structures
3. Use signals for reactive state
4. Use standalone components
5. Follow Angular style guide
6. Add JSDoc comments for public APIs

### Performance Best Practices
1. Lazy load routes
2. Use OnPush change detection where possible
3. Optimize images (WebP, lazy loading)
4. Code splitting for large libraries
5. Tree-shakeable imports
6. Minimize bundle size

### Accessibility Requirements
1. Semantic HTML elements
2. ARIA labels and roles
3. Keyboard navigation
4. Focus management
5. Color contrast compliance
6. Screen reader testing
7. Reduced motion support

---

Last Updated: December 2024
Version: 1.0.0
