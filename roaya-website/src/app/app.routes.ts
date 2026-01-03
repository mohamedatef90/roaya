import { Routes } from '@angular/router';

/**
 * Application Routes
 * Roaya IT - Lazy loaded feature routes for optimal performance
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Roaya IT - Innovative Technology Solutions'
  },
  {
    path: 'services',
    loadComponent: () => import('./features/services/services.component').then(m => m.ServicesComponent),
    title: 'Services - Roaya IT'
  },
  // Dedicated Service Routes (alphabetical order, before generic :id route)
  {
    path: 'services/automation',
    loadComponent: () => import('./features/services/automation/automation.component').then(m => m.AutomationComponent),
    title: 'IT Automation & AI Solutions - Roaya IT'
  },
  {
    path: 'services/backup',
    loadComponent: () => import('./features/services/backup/backup.component').then(m => m.BackupComponent),
    title: 'Backup & Disaster Recovery Solutions - Roaya IT'
  },
  {
    path: 'services/cloud',
    loadComponent: () => import('./features/services/cloud/cloud.component').then(m => m.CloudComponent),
    title: 'Cloud Solutions & Infrastructure Management - Roaya IT'
  },
  {
    path: 'services/consulting',
    loadComponent: () => import('./features/services/consulting/consulting.component').then(m => m.ConsultingComponent),
    title: 'IT Consulting & Digital Transformation - Roaya IT'
  },
  {
    path: 'services/ai',
    loadComponent: () => import('./features/services/ai/ai.component').then(m => m.AiComponent),
    title: 'AI Services - Machine Learning, AI Agents, Analytics | Roaya IT'
  },
  {
    path: 'services/devops',
    loadComponent: () => import('./features/services/devops/devops.component').then(m => m.DevopsComponent),
    title: 'DevOps Services - CI/CD, Kubernetes, GitOps | Roaya IT'
  },
  {
    path: 'services/email',
    loadComponent: () => import('./features/services/email/email.component').then(m => m.EmailComponent),
    title: 'Email & Collaboration Solutions - Roaya IT'
  },
  {
    path: 'services/managed',
    loadComponent: () => import('./features/services/managed/managed.component').then(m => m.ManagedComponent),
    title: 'Managed IT Services & Support - Roaya IT'
  },
  {
    path: 'services/sap',
    loadComponent: () => import('./features/services/sap/sap.component').then(m => m.SapComponent),
    title: 'SAP Cloud Operations & Basis Management - Roaya IT'
  },
  {
    path: 'services/security',
    loadComponent: () => import('./features/services/security/security.component').then(m => m.SecurityComponent),
    title: 'Cybersecurity Solutions & Threat Protection - Roaya IT'
  },
  {
    path: 'services/security/penetration-testing',
    loadComponent: () => import('./features/services/security/penetration-testing/penetration-testing.component').then(m => m.PenetrationTestingComponent),
    title: 'Penetration Testing & Security Assessment Services - Roaya IT'
  },
  {
    path: 'services/security/soc-solutions',
    loadComponent: () => import('./features/services/security/soc-solutions/soc-solutions.component').then(m => m.SocSolutionsComponent),
    title: '24/7 Security Operations Center (SOC) Services - Roaya IT'
  },
  {
    path: 'services/security/incident-response',
    loadComponent: () => import('./features/services/security/incident-response/incident-response.component').then(m => m.IncidentResponseComponent),
    title: 'Incident Response & Digital Forensics - Roaya IT'
  },
  {
    path: 'services/security/pentest-v2',
    loadComponent: () => import('./features/services/security/pentest-v2/pentest-v2.component').then(m => m.PentestV2Component),
    title: 'AI-Assisted Penetration Testing & Security Assessment - Roaya IT'
  },
  {
    path: 'services/worldposta',
    loadComponent: () => import('./features/services/worldposta/worldposta.component').then(m => m.WorldpostaComponent),
    title: 'WorldPosta Cloud Services - Business Email, Storage & Apps | Roaya IT'
  },
  // Fallback for any unknown service routes
  {
    path: 'services/:id',
    loadComponent: () => import('./features/services/service-detail/service-detail.component').then(m => m.ServiceDetailComponent),
    title: 'Service Details - Roaya IT'
  },
  {
    path: 'industries',
    loadComponent: () => import('./features/industries/industries.component').then(m => m.IndustriesComponent),
    title: 'Industries - Roaya IT'
  },
  {
    path: 'industries/:id',
    loadComponent: () => import('./features/industries/industry-detail/industry-detail.component').then(m => m.IndustryDetailComponent),
    title: 'Industry Solutions - Roaya IT'
  },
  {
    path: 'pricing',
    redirectTo: 'contact',
    pathMatch: 'full'
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent),
    title: 'About Us - Roaya IT'
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact Us - Roaya IT'
  },
  {
    path: 'roi-calculator',
    loadComponent: () => import('./features/roi-calculator/roi-calculator.component').then(m => m.RoiCalculatorComponent),
    title: 'ROI Calculator - Roaya IT'
  },
  {
    path: 'resources',
    loadComponent: () => import('./features/resources/resources.component').then(m => m.ResourcesComponent),
    title: 'Resources - Roaya IT'
  },
  {
    path: 'resources/blog',
    loadComponent: () => import('./features/resources/blog/blog.component').then(m => m.BlogComponent),
    title: 'Blog - Roaya IT'
  },
  {
    path: 'resources/blog/:slug',
    loadComponent: () => import('./features/resources/blog/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent),
    title: 'Blog Post - Roaya IT'
  },
  {
    path: 'resources/case-studies',
    loadComponent: () => import('./features/resources/case-studies/case-studies.component').then(m => m.CaseStudiesComponent),
    title: 'Case Studies - Roaya IT'
  },
  {
    path: 'resources/case-studies/:slug',
    loadComponent: () => import('./features/resources/case-studies/case-study-detail/case-study-detail.component').then(m => m.CaseStudyDetailComponent),
    title: 'Case Study - Roaya IT'
  },
  {
    path: 'resources/whitepapers',
    loadComponent: () => import('./features/resources/whitepapers/whitepapers.component').then(m => m.WhitepapersComponent),
    title: 'Whitepapers Coming Soon - Roaya IT'
  },
  {
    path: 'resources/documentation',
    loadComponent: () => import('./features/resources/documentation/documentation.component').then(m => m.DocumentationComponent),
    title: 'Documentation Coming Soon - Roaya IT'
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/legal/privacy/privacy.component').then(m => m.PrivacyComponent),
    title: 'Privacy Policy - Roaya IT'
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/terms/terms.component').then(m => m.TermsComponent),
    title: 'Terms of Service - Roaya IT'
  },
  {
    path: 'cookies',
    loadComponent: () => import('./features/legal/cookies/cookies.component').then(m => m.CookiesComponent),
    title: 'Cookie Policy - Roaya IT'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
