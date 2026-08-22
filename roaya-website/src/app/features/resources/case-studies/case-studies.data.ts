/**
 * Single source of truth for published case studies.
 *
 * Every route under /resources/case-studies/:slug must resolve to an entry
 * here; the homepage previews, the listing page, the detail page and
 * public/sitemap.xml all key off these slugs. Add or rename a study here
 * first, then update the sitemap.
 */

export interface CaseStudyRecord {
  slug: CaseStudySlug;
  translationKey: string;
  industry: string;
  services: string[];
}

export type CaseStudySlug =
  | 'bank-cloud-migration'
  | 'healthcare-soc-implementation'
  | 'government-digital-transformation'
  | 'manufacturing-sap-implementation'
  | 'ecommerce-auto-scaling';

export const CASE_STUDIES: readonly CaseStudyRecord[] = [
  {
    slug: 'bank-cloud-migration',
    translationKey: 'caseStudies.banking',
    industry: 'finance',
    services: ['cloud', 'migration', 'security']
  },
  {
    slug: 'healthcare-soc-implementation',
    translationKey: 'caseStudies.healthcare',
    industry: 'healthcare',
    services: ['security']
  },
  {
    slug: 'government-digital-transformation',
    translationKey: 'caseStudies.government',
    industry: 'government',
    services: ['cloud', 'automation', 'security']
  },
  {
    slug: 'manufacturing-sap-implementation',
    translationKey: 'caseStudies.manufacturing',
    industry: 'manufacturing',
    services: ['sap', 'cloud']
  },
  {
    slug: 'ecommerce-auto-scaling',
    translationKey: 'caseStudies.ecommerce',
    industry: 'retail',
    services: ['cloud', 'security']
  }
];

export const CASE_STUDY_MAP: Readonly<Record<string, CaseStudyRecord>> =
  Object.fromEntries(CASE_STUDIES.map((cs) => [cs.slug, cs]));

export function getCaseStudyBySlug(slug: string): CaseStudyRecord | undefined {
  return CASE_STUDY_MAP[slug];
}
