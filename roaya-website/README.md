# Roaya IT - Official Website

Modern, high-performance website built with Angular 21, featuring bilingual support (English/Arabic) with RTL, dark mode, and a beautiful responsive design.

## Technology Stack

- **Framework**: Angular 21 (Standalone Components)
- **Styling**: Tailwind CSS v4 + SCSS
- **UI Components**: shadcn-inspired with CVA (Class Variance Authority)
- **Icons**: ng-icons (Lucide)
- **Internationalization**: ngx-translate (English + Arabic with RTL)
- **Theme**: Light/Dark mode with CSS custom properties
- **Build Tool**: Angular CLI with esbuild

## Brand Colors

- **Primary Navy**: `#3D5A80`
- **Secondary Teal**: `#5DB7C2`
- **Accent Purple**: `#6B4C9A`
- **Gradient**: `linear-gradient(135deg, #3D5A80 0%, #5DB7C2 100%)`

## Fonts

- **English**: Inter
- **Arabic**: Tajawal

## Features

- Modern Angular 21 standalone components architecture
- Fully responsive (mobile-first, 320px - 4K)
- Bilingual support (English/Arabic) with automatic RTL switching
- Light/Dark theme with persistence
- Performance optimized (Lighthouse > 95 target)
- Lazy-loaded routes for optimal bundle size
- Accessible (WCAG 2.1 AA compliant)
- Type-safe with TypeScript
- Component library with CVA for variants

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── services/         # Core services (theme, language, navigation)
│   │   ├── guards/           # Route guards
│   │   ├── interceptors/     # HTTP interceptors
│   │   └── models/           # TypeScript interfaces/types
│   ├── shared/
│   │   ├── components/       # Reusable UI components
│   │   ├── directives/       # Custom directives
│   │   ├── pipes/            # Custom pipes
│   │   └── utils/            # Utility functions
│   ├── features/
│   │   ├── home/            # Home page
│   │   ├── services/        # Services page
│   │   ├── industries/      # Industries page
│   │   ├── pricing/         # Pricing page
│   │   ├── about/           # About page
│   │   └── contact/         # Contact page
│   ├── layouts/
│   │   └── main-layout/     # Main layout with header/footer
│   ├── app.config.ts        # Application configuration
│   └── app.routes.ts        # Route definitions
├── assets/
│   ├── i18n/                # Translation files (en.json, ar.json)
│   ├── images/              # Images and logo
│   ├── fonts/               # Custom fonts
│   └── icons/               # Icon assets
├── styles/
│   ├── base/                # Base styles, variables, typography
│   └── utilities/           # Helper classes
└── styles.scss              # Global styles

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Angular CLI 21

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will open at `http://localhost:4200`

### Available Scripts

- `npm start` - Start development server
- `npm run dev` - Start dev server and open browser
- `npm run build` - Build for production
- `npm run build:prod` - Build with production optimizations
- `npm run test` - Run unit tests
- `npm run watch` - Build in watch mode
- `npm run lint` - Lint the codebase

## Core Services

### ThemeService
Manages light/dark mode with localStorage persistence and system preference detection.

```typescript
// Toggle theme
themeService.toggleTheme();

// Set specific theme
themeService.setTheme('dark');

// Check if dark mode
themeService.isDark();
```

### LanguageService
Manages English/Arabic language switching with RTL support.

```typescript
// Toggle language
languageService.toggleLanguage();

// Set specific language
languageService.setLanguage('ar');

// Check if RTL
languageService.isRTL();

// Get translation
languageService.instant('common.home');
```

### NavigationService
Manages navigation state and mobile menu.

```typescript
// Toggle mobile menu
navigationService.toggleMobileMenu();

// Get navigation items
navigationService.getNavItems();

// Check if route is active
navigationService.isActive('/services');
```

## Component Architecture

### Button Component Example

```html
<!-- Primary button -->
<app-button variant="primary" size="lg">
  Get Started
</app-button>

<!-- Outline button -->
<app-button variant="outline" size="md">
  Learn More
</app-button>

<!-- Ghost button -->
<app-button variant="ghost" size="sm">
  Cancel
</app-button>
```

## Styling Approach

### Tailwind CSS
- Utility-first approach for rapid development
- Custom color palette matching brand
- Responsive breakpoints: xs, sm, md, lg, xl, 2xl, 3xl

### CSS Custom Properties
- Theme variables in `src/styles/base/_variables.scss`
- Automatic dark mode switching
- RTL-aware spacing and layout

### SCSS Modules
- Component-scoped styles when needed
- Shared mixins and functions
- Typography system with fluid scaling

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| xs | 320px | Mobile portrait |
| sm | 480px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1536px | Extra large |
| 3xl | 1920px | Full HD |

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.2s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Cumulative Layout Shift | < 0.1 |
| Lighthouse Score | > 95 |

## Accessibility

- Semantic HTML structure
- ARIA attributes and roles
- Keyboard navigation support
- Focus management
- Screen reader tested
- Color contrast ratios (4.5:1 minimum)
- Reduced motion support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

© 2024 Roaya IT. All rights reserved.

## Contact

Website: [www.roaya.co](https://www.roaya.co)

---

Built with Angular 21 by the Super Frontend Engineer
