/**
 * JSON-LD node shapes for the Stage 3.1 structured-data graph (TIFO-13).
 * Every field here must map to an approved, visibly-rendered Roaya fact —
 * see entity-taxonomy.ts for the source values.
 */

export interface OrganizationNode {
  '@type': 'Organization';
  '@id': string;
  name: string;
  url: string;
  foundingDate: string;
  /**
   * References to the address and contact nodes, present only on the page that
   * actually renders those details. Everywhere else the Organization node
   * stays identity-only, so a page that never shows a phone number does not
   * assert one.
   */
  address?: { '@id': string };
  contactPoint?: { '@id': string };
}

export interface WebSiteNode {
  '@type': 'WebSite';
  '@id': string;
  name: string;
  url: string;
  inLanguage: string;
}

export interface ServiceNode {
  '@type': 'Service';
  '@id': string;
  name: string;
  /**
   * Optional on purpose. A service page whose body copy is hard-coded in its
   * component rather than i18n has no sentence this graph is allowed to quote,
   * and a borrowed or invented description would assert more than the page
   * shows. Such a page gets a named Service node with no description.
   */
  description?: string;
  url: string;
  provider: { '@id': string };
  /** Mirrors the Egypt positioning and Cairo address the site already shows. */
  areaServed?: { '@type': 'Country'; name: string };
}

/**
 * A question and its answer, both taken verbatim from text the page renders.
 */
export interface QuestionNode {
  '@type': 'Question';
  name: string;
  acceptedAnswer: { '@type': 'Answer'; text: string };
}

/**
 * A page's visible FAQ. Emitted only where the answers are present in the
 * served HTML — both current accordions collapse with CSS rather than removing
 * their content, so schema and page say the same thing. These nodes repeat
 * whatever the visible answers claim and can never strengthen them.
 */
export interface FAQPageNode {
  '@type': 'FAQPage';
  '@id': string;
  inLanguage: string;
  mainEntity: QuestionNode[];
}

/**
 * How to reach Roaya, repeating what the Contact page shows. `contactType`
 * says what the channel is for, which is what an assistant needs in order to
 * route someone correctly rather than guessing from a bare number.
 */
export interface ContactPointNode {
  '@type': 'ContactPoint';
  '@id': string;
  contactType: string;
  email: string;
  telephone: string;
  areaServed: string;
  availableLanguage: string[];
}

/** The office address the Contact page displays. No coordinates are invented. */
export interface PostalAddressNode {
  '@type': 'PostalAddress';
  '@id': string;
  streetAddress: string;
  addressLocality: string;
  addressCountry: string;
}

export interface BreadcrumbListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

export interface BreadcrumbListNode {
  '@type': 'BreadcrumbList';
  '@id': string;
  itemListElement: BreadcrumbListItem[];
}

/**
 * The page itself. Carries name/url/hierarchy only - never a description:
 * see StructuredDataService.buildNodes for why prose is excluded here.
 */
export interface WebPageNode {
  '@type': 'WebPage';
  '@id': string;
  name: string;
  url: string;
  inLanguage: string;
  isPartOf: { '@id': string };
  about: { '@id': string };
  breadcrumb?: { '@id': string };
}

/**
 * A case-study article (emitted since the 2026-09-01 claim approvals — see
 * docs/decisions/2026-09-01-claim-approvals.md). No datePublished on purpose:
 * the case studies carry no verified publication date, and structured data
 * must never invent one.
 */
export interface ArticleNode {
  '@type': 'Article';
  '@id': string;
  headline: string;
  url: string;
  inLanguage: string;
  mainEntityOfPage: { '@id': string };
  author: { '@id': string };
  publisher: { '@id': string };
}

export type StructuredDataNode =
  | OrganizationNode
  | WebSiteNode
  | ServiceNode
  | FAQPageNode
  | ContactPointNode
  | PostalAddressNode
  | BreadcrumbListNode
  | WebPageNode
  | ArticleNode;

export interface StructuredDataGraph {
  '@context': 'https://schema.org';
  '@graph': StructuredDataNode[];
}
