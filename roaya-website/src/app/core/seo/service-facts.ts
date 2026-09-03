/**
 * Service Facts — the buyer-answerable record behind each commercial service.
 *
 * The 2026-09-02 action plan (P1.1) asks every service page to answer what an
 * enterprise buyer, or an assistant answering on their behalf, needs before
 * recommending Roaya: who operates the service, on what platforms and in which
 * regions, where the data sits, what the resilience and availability
 * commitments are, how support works, how delivery runs, and on what terms.
 *
 * Almost none of that is decided yet. The registry holds ten verified claims
 * and none of them is an SLA, a support matrix, an RPO/RTO or a price. So this
 * file is deliberately mostly `pending`: it is the shape of the answer plus an
 * honest account of which parts exist, not a wall of invented specifics.
 *
 * ## What may be published
 *
 * A fact reaches the page only with `status: 'published'`, and only when it is
 * one of:
 *   - a value backed by a registry claim (`claimId`), or
 *   - a sentence the page already renders (`valueKey`, an i18n key).
 *
 * Everything else is `pending` with the decision that unblocks it. Pending
 * facts are NOT rendered: a public table reading "SLA: not yet published"
 * tells a buyer less than saying nothing and reads as immaturity. They exist
 * here so the gap is countable, reviewable, and visible to whoever owns the
 * decision — see `docs/decisions/2026-09-02-pending-decisions.md`.
 *
 * ## Why a registry and not page copy
 *
 * These facts must agree across the page, the structured data, the sales deck
 * and the contract. Keeping them in one typed place means a change happens
 * once, and `service-facts-integrity` can check that a governed figure still
 * matches the claim registry that authorised it.
 */

/** The fields a buyer needs, in the order the action plan lists them. */
export type ServiceFactField =
  | 'providerRole'
  | 'platformsRegions'
  | 'dataResidency'
  | 'resilience'
  | 'sla'
  | 'support'
  | 'delivery'
  | 'commercialTerms';

export const SERVICE_FACT_FIELDS: readonly ServiceFactField[] = [
  'providerRole',
  'platformsRegions',
  'dataResidency',
  'resilience',
  'sla',
  'support',
  'delivery',
  'commercialTerms'
];

/** i18n key for a field's label, resolved in both locales. */
export function serviceFactLabelKey(field: ServiceFactField): string {
  return `serviceFacts.fields.${field}`;
}

export interface PublishedServiceFact {
  status: 'published';
  /**
   * i18n key holding the value. Either this or `value` — a key when the
   * wording is prose that must read naturally in Arabic too.
   */
  valueKey?: string;
  /** Literal value, for figures and names that are identical in both locales. */
  value?: string;
  /**
   * Registry claim authorising this value. Required for governed topics
   * (anything stating an availability figure), so the gate can verify the
   * claim is still `verified` and still in scope.
   */
  claimId?: string;
}

export interface PendingServiceFact {
  status: 'pending';
  /** The decision that unblocks it, by document and item. */
  decisionRef: string;
}

export type ServiceFact = PublishedServiceFact | PendingServiceFact;

export interface ServiceFactsRecord {
  /** Locale-independent route the facts describe. */
  path: string;
  /** Last human review of this record, YYYY-MM-DD. */
  lastReviewed: string;
  facts: Partial<Record<ServiceFactField, ServiceFact>>;
}

const PENDING_SLA = 'docs/decisions/2026-09-02-pending-decisions.md#2-authoritative-availability-sla-figures';
const PENDING_SUPPORT = 'docs/decisions/2026-09-02-pending-decisions.md#1-support-coverage-and-response-time-policy';
const PENDING_FACTS = 'docs/decisions/2026-09-02-pending-decisions.md#5-unregistered-quantitative-and-credential-claims';

/**
 * Every field of every commercial service, stated once.
 *
 * Read the `pending` entries as the real status report: on 2026-09-02 the site
 * could prove three facts about one service and two about another. That is the
 * gap between "we describe our services well" — which the site now does — and
 * "a buyer can act on what we publish".
 */
export const SERVICE_FACTS: readonly ServiceFactsRecord[] = [
  {
    path: '/services/worldposta',
    lastReviewed: '2026-09-02',
    facts: {
      // Registry: worldposta-exclusive-mena-partnership (verified).
      providerRole: { status: 'published', valueKey: 'serviceFacts.worldposta.providerRole' },
      // Registry: uptime-cloudedge-posta-9999 (verified, scope closed to these
      // two products). The gate re-checks that scope on every build.
      sla: { status: 'published', value: '99.99%', claimId: 'uptime-cloudedge-posta-9999' },
      // Mirrors services.worldposta.heroDescription, which the page renders.
      dataResidency: { status: 'published', valueKey: 'serviceFacts.worldposta.dataResidency' },
      platformsRegions: { status: 'pending', decisionRef: PENDING_FACTS },
      resilience: { status: 'pending', decisionRef: PENDING_FACTS },
      support: { status: 'pending', decisionRef: PENDING_SUPPORT },
      delivery: { status: 'pending', decisionRef: PENDING_FACTS },
      commercialTerms: { status: 'pending', decisionRef: PENDING_FACTS }
    }
  },
  {
    path: '/services/aws',
    lastReviewed: '2026-09-02',
    facts: {
      // Mirrors the partner-tier wording the page already renders. Unregistered:
      // pending decision 5 asks for the AWS Partner Finder link as evidence.
      providerRole: { status: 'published', valueKey: 'serviceFacts.aws.providerRole' },
      platformsRegions: { status: 'published', valueKey: 'serviceFacts.aws.platformsRegions' },
      // Mirrors the page's own residency answer, which is deliberately
      // conditional — it does not promise a region it has not checked.
      dataResidency: { status: 'published', valueKey: 'serviceFacts.aws.dataResidency' },
      resilience: { status: 'pending', decisionRef: PENDING_FACTS },
      sla: { status: 'pending', decisionRef: PENDING_SLA },
      support: { status: 'pending', decisionRef: PENDING_SUPPORT },
      delivery: { status: 'pending', decisionRef: PENDING_FACTS },
      commercialTerms: { status: 'pending', decisionRef: PENDING_FACTS }
    }
  },
  ...(
    [
      '/services/cloud',
      '/services/security',
      '/services/security/penetration-testing',
      '/services/security/soc-solutions',
      '/services/security/incident-response',
      '/services/email',
      '/services/managed',
      '/services/backup',
      '/services/consulting',
      '/services/sap',
      '/services/devops',
      '/services/automation',
      '/services/ai'
    ] as const
  ).map<ServiceFactsRecord>(path => ({
    path,
    lastReviewed: '2026-09-02',
    // Nothing about these services is decided yet. Listing them with every
    // field pending is the point: it is what makes the gap countable instead
    // of a vague sense that "the service pages could say more".
    facts: {
      providerRole: { status: 'pending', decisionRef: PENDING_FACTS },
      platformsRegions: { status: 'pending', decisionRef: PENDING_FACTS },
      dataResidency: { status: 'pending', decisionRef: PENDING_FACTS },
      resilience: { status: 'pending', decisionRef: PENDING_FACTS },
      sla: { status: 'pending', decisionRef: PENDING_SLA },
      support: { status: 'pending', decisionRef: PENDING_SUPPORT },
      delivery: { status: 'pending', decisionRef: PENDING_FACTS },
      commercialTerms: { status: 'pending', decisionRef: PENDING_FACTS }
    }
  }))
];

/** The facts record for a route, or null when the route has none. */
export function serviceFactsFor(path: string): ServiceFactsRecord | null {
  return SERVICE_FACTS.find(record => record.path === path) ?? null;
}

/** Only the fields a page may actually render, in the declared field order. */
export function publishedFacts(
  record: ServiceFactsRecord
): { field: ServiceFactField; fact: PublishedServiceFact }[] {
  return SERVICE_FACT_FIELDS.flatMap(field => {
    const fact = record.facts[field];
    return fact && fact.status === 'published' ? [{ field, fact }] : [];
  });
}

/** Published / total across every service — the coverage the gate reports. */
export function serviceFactsCoverage(): { published: number; total: number } {
  let published = 0;
  let total = 0;
  for (const record of SERVICE_FACTS) {
    for (const field of SERVICE_FACT_FIELDS) {
      const fact = record.facts[field];
      if (!fact) continue;
      total += 1;
      if (fact.status === 'published') published += 1;
    }
  }
  return { published, total };
}
