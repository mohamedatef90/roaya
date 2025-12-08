# Roaya IT Website - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed

## Installation & Setup

### 1. Install Dependencies

```bash
cd /Users/mohamedatef/Downloads/roaya/roaya-website
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will automatically open at `http://localhost:4200`

## Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run dev` | Start dev server and open browser |
| `npm run build` | Build for production |
| `npm run build:prod` | Build with optimizations |
| `npm test` | Run unit tests |
| `npm run watch` | Build in watch mode |

## Project Features

### Light/Dark Mode
- Automatic system preference detection
- Manual toggle available in header
- Persisted to localStorage

### Bilingual Support (English/Arabic)
- Language toggle in header
- Automatic RTL layout for Arabic
- Persisted to localStorage
- Translation files in `src/assets/i18n/`

### Responsive Design
- Mobile-first approach
- Breakpoints: xs (320px) to 3xl (1920px)
- Touch-friendly mobile navigation

## Project Structure

```
src/
├── app/
│   ├── core/services/      # Theme, Language, Navigation services
│   ├── shared/components/  # Reusable UI components
│   ├── features/          # Page components (home, services, etc.)
│   ├── layouts/           # Layout components
│   ├── app.config.ts      # App configuration
│   └── app.routes.ts      # Route definitions
├── assets/
│   ├── i18n/             # Translation files
│   └── images/           # Images and logo
└── styles/               # SCSS styles

## Making Changes

### Adding a New Page

1. Create component:
```bash
ng generate component features/new-page --standalone
```

2. Add route in `src/app/app.routes.ts`:
```typescript
{
  path: 'new-page',
  loadComponent: () => import('./features/new-page/new-page.component')
    .then(m => m.NewPageComponent),
  title: 'New Page - Roaya IT'
}
```

3. Add navigation item in `src/app/core/services/navigation.service.ts`:
```typescript
navItems: NavItem[] = [
  // ...existing items
  { label: 'common.newPage', route: '/new-page' }
]
```

4. Add translations in `src/assets/i18n/en.json` and `ar.json`:
```json
{
  "common": {
    "newPage": "New Page"  // "الصفحة الجديدة" in ar.json
  }
}
```

### Customizing Styles

#### Brand Colors
Edit `tailwind.config.js` to update brand colors.

#### Theme Variables
Edit `src/styles/base/_variables.scss` for CSS custom properties.

#### Component Styles
- Use Tailwind utilities in templates
- Add custom styles in component `.scss` files
- Use utility classes from `src/styles/utilities/_helpers.scss`

### Adding Translations

1. Add keys to `src/assets/i18n/en.json`:
```json
{
  "home": {
    "title": "Welcome to Roaya IT",
    "subtitle": "Innovative Technology Solutions"
  }
}
```

2. Add Arabic translations to `src/assets/i18n/ar.json`:
```json
{
  "home": {
    "title": "مرحبا بك في رؤيا لتقنية المعلومات",
    "subtitle": "حلول تقنية مبتكرة"
  }
}
```

3. Use in templates:
```html
<h1>{{ 'home.title' | translate }}</h1>
<p>{{ 'home.subtitle' | translate }}</p>
```

## Deployment

### Build for Production

```bash
npm run build:prod
```

Output will be in `dist/roaya-website/`

### Deploy to Server

1. Upload contents of `dist/roaya-website/` to your web server
2. Configure server to serve `index.html` for all routes (for Angular routing)
3. Set proper MIME types for assets

### Environment Configuration

For different environments (dev, staging, prod), create environment files:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.roaya.co'
};
```

## Troubleshooting

### Development Server Won't Start
- Ensure Node.js 18+ is installed
- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Check if port 4200 is already in use

### Build Fails
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors in terminal
- Ensure all imports are correct

### Translations Not Loading
- Check that JSON files are in `src/assets/i18n/`
- Verify paths in `app.config.ts`
- Check browser console for 404 errors

### Dark Mode Not Working
- Check browser localStorage for `roaya-theme` key
- Verify ThemeService is imported and initialized
- Check CSS custom properties in browser DevTools

## Next Steps

1. Customize home page content
2. Add actual service descriptions
3. Create industry-specific pages
4. Implement contact form
5. Add backend API integration
6. Setup analytics and SEO
7. Add blog/news section
8. Implement case studies

## Support

For questions or issues:
- Email: info@roaya.co
- Website: www.roaya.co

---

Built with Angular 21 | December 2024
