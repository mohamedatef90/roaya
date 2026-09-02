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
  description: string;
  url: string;
  provider: { '@id': string };
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
  | BreadcrumbListNode
  | WebPageNode
  | ArticleNode;

export interface StructuredDataGraph {
  '@context': 'https://schema.org';
  '@graph': StructuredDataNode[];
}
