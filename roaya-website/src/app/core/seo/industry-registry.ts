/**
 * Closed registry of exactly 6 approved industry IDs.
 *
 * This registry is the single source of truth for industry route validation.
 * Any industry ID not in this list MUST trigger a real HTTP 404 response
 * from the SSR layer - it must never render as a generic indexable 200.
 *
 * The translation keys below map to existing approved content in
 * src/assets/i18n/en.json and ar.json (industries.<id>.title, etc.).
 */

export type IndustryId =
  | 'finance'
  | 'healthcare'
  | 'government'
  | 'manufacturing'
  | 'retail'
  | 'education';

export interface IndustryMetadata {
  readonly id: IndustryId;
  /** ngx-translate key for the industry's short title (breadcrumb/nav label). */
  readonly titleKey: string;
  /** ngx-translate key for the industry's headline (page title). */
  readonly headlineKey: string;
  /** ngx-translate key for the industry's description (meta description). */
  readonly descriptionKey: string;
}

/**
 * The complete, closed set of approved industries. This array is exhaustive:
 * any industry ID not present here is undefined and must 404.
 */
export const APPROVED_INDUSTRIES: readonly IndustryMetadata[] = [
  {
    id: 'finance',
    titleKey: 'industries.finance.title',
    headlineKey: 'industries.finance.headline',
    descriptionKey: 'industries.finance.description',
  },
  {
    id: 'healthcare',
    titleKey: 'industries.healthcare.title',
    headlineKey: 'industries.healthcare.headline',
    descriptionKey: 'industries.healthcare.description',
  },
  {
    id: 'government',
    titleKey: 'industries.government.title',
    headlineKey: 'industries.government.headline',
    descriptionKey: 'industries.government.description',
  },
  {
    id: 'manufacturing',
    titleKey: 'industries.manufacturing.title',
    headlineKey: 'industries.manufacturing.headline',
    descriptionKey: 'industries.manufacturing.description',
  },
  {
    id: 'retail',
    titleKey: 'industries.retail.title',
    headlineKey: 'industries.retail.headline',
    descriptionKey: 'industries.retail.description',
  },
  {
    id: 'education',
    titleKey: 'industries.education.title',
    headlineKey: 'industries.education.headline',
    descriptionKey: 'industries.education.description',
  },
] as const;

/** Set of valid industry IDs for O(1) lookup. */
export const VALID_INDUSTRY_IDS: ReadonlySet<string> = new Set(
  APPROVED_INDUSTRIES.map((i) => i.id),
);

/**
 * Type guard to check if a string is a valid IndustryId.
 */
export function isValidIndustryId(id: string | undefined): id is IndustryId {
  return typeof id === 'string' && VALID_INDUSTRY_IDS.has(id);
}

/**
 * Get industry metadata by ID, or undefined if not a valid industry.
 */
export function getIndustryMetadata(id: string): IndustryMetadata | undefined {
  return APPROVED_INDUSTRIES.find((industry) => industry.id === id);
}
