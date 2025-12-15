import { Routes } from '@angular/router';

/**
 * Legal Pages Routes
 * Roaya IT - Privacy, Terms, and Cookie Policy pages
 */
export const legalRoutes: Routes = [
  {
    path: 'privacy',
    loadComponent: () => import('./privacy/privacy.component').then(m => m.PrivacyComponent),
    title: 'Privacy Policy - Roaya IT'
  },
  {
    path: 'terms',
    loadComponent: () => import('./terms/terms.component').then(m => m.TermsComponent),
    title: 'Terms of Service - Roaya IT'
  },
  {
    path: 'cookies',
    loadComponent: () => import('./cookies/cookies.component').then(m => m.CookiesComponent),
    title: 'Cookie Policy - Roaya IT'
  }
];
