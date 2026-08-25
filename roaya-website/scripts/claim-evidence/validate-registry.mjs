#!/usr/bin/env node
/**
 * Deterministic validator for scripts/claim-evidence/registry.json against
 * the contract documented in scripts/claim-evidence/registry.schema.json
 * (TIFO-16). No schema-validation library is a project dependency, so this
 * is a hand-written validator; it must stay in lockstep with the schema doc.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const CATEGORIES = ['business_decision', 'deferred_claim', 'case_study'];
const STATUSES = ['verified', 'deferred', 'blocked'];
const SOURCE_TYPES = ['i18n_key', 'component_source', 'decision_record', 'known_gap', 'pending'];
const TOPICS = ['uptime', null];
const SCOPE_VALUES = ['cloudedge', 'posta'];

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isStrictlyFutureCalendarDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return false;

  const tomorrow = new Date();
  tomorrow.setUTCHours(0, 0, 0, 0);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return date >= tomorrow;
}
// Relative in-repo path, optionally with a '#fragment' locator. No leading
// '/', no '..' traversal, no scheme (rules out bare URLs).
const SOURCE_POINTER_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._/-]*\.[A-Za-z0-9]+(#[A-Za-z0-9._:-]+)?$/;

// Secrets-like value detection — deliberately generic, over-inclusive is fine
// here since the registry should never carry credential-shaped strings.
const SECRET_PATTERNS = [
  { name: 'AWS access key', pattern: /AKIA[0-9A-Z]{16}/ },
  { name: 'generic API/secret key literal', pattern: /\b(sk|pk|api[_-]?key|secret)[_-]?[:=]\s*['"]?[A-Za-z0-9/+_-]{16,}/i },
  { name: 'PEM private key block', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'bearer token', pattern: /Bearer\s+[A-Za-z0-9._-]{20,}/ },
  { name: 'password assignment', pattern: /password\s*[:=]\s*['"]?\S{6,}/i },
];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function pushError(errors, claimId, message) {
  errors.push(claimId ? `[${claimId}] ${message}` : message);
}

function validateClaimShape(claim, errors) {
  if (typeof claim !== 'object' || claim === null || Array.isArray(claim)) {
    pushError(errors, null, 'Claim entry is not an object.');
    return null;
  }

  const id = typeof claim.id === 'string' ? claim.id : null;

  const baseRequired = [
    'id',
    'category',
    'status',
    'topic',
    'scope',
    'sourceType',
    'sourcePointer',
    'decisionReference',
    'reviewDate',
    'notes',
  ];
  for (const key of baseRequired) {
    if (!(key in claim)) {
      pushError(errors, id, `Missing required field "${key}".`);
    }
  }

  const baseAllowed = new Set([
    ...baseRequired,
    'slug',
    'clientApprovalReference',
    'metricEvidencePointer',
    'exceptionOwner',
    'exceptionExpiry',
    'exceptionApproval',
  ]);
  for (const key of Object.keys(claim)) {
    if (!baseAllowed.has(key)) {
      pushError(errors, id, `Unknown field "${key}" is not permitted by the schema.`);
    }
  }

  if (!isNonEmptyString(claim.id) || !ID_PATTERN.test(claim.id)) {
    pushError(errors, id, `"id" must be a non-empty kebab-case string, got: ${JSON.stringify(claim.id)}`);
  }

  if (!CATEGORIES.includes(claim.category)) {
    pushError(errors, id, `Invalid "category": ${JSON.stringify(claim.category)}. Must be one of ${CATEGORIES.join(', ')}.`);
  }

  if (!STATUSES.includes(claim.status)) {
    pushError(errors, id, `Invalid "status": ${JSON.stringify(claim.status)}. Must be one of ${STATUSES.join(', ')}.`);
  }

  if (!TOPICS.includes(claim.topic)) {
    pushError(errors, id, `Invalid "topic": ${JSON.stringify(claim.topic)}. Must be one of ${TOPICS.map((t) => JSON.stringify(t)).join(', ')}.`);
  }

  if (claim.scope !== null) {
    if (!Array.isArray(claim.scope) || claim.scope.some((s) => !SCOPE_VALUES.includes(s))) {
      pushError(errors, id, `Invalid "scope": ${JSON.stringify(claim.scope)}. Must be null or an array subset of ${SCOPE_VALUES.join(', ')}.`);
    }
  }

  if (!SOURCE_TYPES.includes(claim.sourceType)) {
    pushError(errors, id, `Invalid "sourceType": ${JSON.stringify(claim.sourceType)}. Must be one of ${SOURCE_TYPES.join(', ')}.`);
  }

  if (claim.sourcePointer !== null) {
    if (!isNonEmptyString(claim.sourcePointer)) {
      pushError(errors, id, `"sourcePointer" must be null or a non-empty string, got: ${JSON.stringify(claim.sourcePointer)}`);
    } else if (
      claim.sourcePointer.startsWith('/') ||
      claim.sourcePointer.includes('..') ||
      /^[a-z]+:\/\//i.test(claim.sourcePointer) ||
      !SOURCE_POINTER_PATTERN.test(claim.sourcePointer)
    ) {
      pushError(errors, id, `Malformed "sourcePointer" (must be a relative in-repo path with an extension, optional "#fragment", no ".." traversal, no absolute path, no URL): ${JSON.stringify(claim.sourcePointer)}`);
    }
  }

  if (claim.reviewDate !== null) {
    if (!isNonEmptyString(claim.reviewDate) || !DATE_PATTERN.test(claim.reviewDate)) {
      pushError(errors, id, `Malformed "reviewDate" (must be null or "YYYY-MM-DD"): ${JSON.stringify(claim.reviewDate)}`);
    } else {
      const [y, m, d] = claim.reviewDate.split('-').map(Number);
      const asDate = new Date(Date.UTC(y, m - 1, d));
      if (asDate.getUTCFullYear() !== y || asDate.getUTCMonth() !== m - 1 || asDate.getUTCDate() !== d) {
        pushError(errors, id, `"reviewDate" is not a real calendar date: ${JSON.stringify(claim.reviewDate)}`);
      }
    }
  }

  if (claim.decisionReference !== null && !isNonEmptyString(claim.decisionReference)) {
    pushError(errors, id, `"decisionReference" must be null or a non-empty string, got: ${JSON.stringify(claim.decisionReference)}`);
  }

  if (claim.notes !== null && !isNonEmptyString(claim.notes)) {
    pushError(errors, id, `"notes" must be null or a non-empty string, got: ${JSON.stringify(claim.notes)}`);
  }

  if (claim.category === 'case_study') {
    if (!isNonEmptyString(claim.slug)) {
      pushError(errors, id, '"slug" is required and must be a non-empty string for category "case_study".');
    }
    if (!('clientApprovalReference' in claim)) {
      pushError(errors, id, '"clientApprovalReference" is required for category "case_study".');
    } else if (claim.clientApprovalReference !== null && !isNonEmptyString(claim.clientApprovalReference)) {
      pushError(errors, id, `"clientApprovalReference" must be null or a non-empty string, got: ${JSON.stringify(claim.clientApprovalReference)}`);
    }
    if (!('metricEvidencePointer' in claim)) {
      pushError(errors, id, '"metricEvidencePointer" is required for category "case_study".');
    } else if (claim.metricEvidencePointer !== null && !isNonEmptyString(claim.metricEvidencePointer)) {
      pushError(errors, id, `"metricEvidencePointer" must be null or a non-empty string, got: ${JSON.stringify(claim.metricEvidencePointer)}`);
    }
  } else {
    for (const forbidden of ['slug', 'clientApprovalReference', 'metricEvidencePointer']) {
      if (forbidden in claim) {
        pushError(errors, id, `"${forbidden}" is only permitted for category "case_study".`);
      }
    }
  }

  return id;
}

function validateSecrets(claim, errors) {
  for (const [key, value] of Object.entries(claim)) {
    if (typeof value !== 'string') continue;
    for (const { name, pattern } of SECRET_PATTERNS) {
      if (pattern.test(value)) {
        pushError(errors, claim.id, `Field "${key}" matches a secrets-like pattern (${name}). Remove it — the registry must never carry credential-shaped values.`);
      }
    }
  }
}

// Public surface paths where blocked copy appearing would fail AI-readiness.
// These are i18n files and component sources that render to the public website.
const PUBLIC_SURFACE_PREFIXES = [
  'src/assets/i18n/',
  'src/app/features/',
  'src/app/shared/',
];

// Exact policy for blocked claims whose former sourcePointer is intentionally
// null after remediation. This closes the registry-only loophole: a blocked
// claim cannot be silently reintroduced into its known public surface.
//
// Each entry maps a blocked claim ID to an array of { path, forbidden } rules.
// forbidden is an array of exact substrings that must NOT appear in the file.
// Using exact values avoids false-positive regex matches.
const BLOCKED_PUBLIC_SURFACE_POLICY = {
  // ── pricing-truth-ranges ────────────────────────────────────────────────────
  // Blocked EGP price claims removed per Stage 0 decision 9.
  'pricing-truth-ranges': [
    {
      path: 'src/assets/i18n/en.json',
      forbidden: [
        'From 2,500 EGP/mo',
        'From 8,500 EGP/mo',
        '$1.50/user/month',
        'CloudSpace plans start at $1.50 per user/month',
        '$0.50/user/month',
        '1.50/user',
        '0.50/user',
      ],
    },
    {
      path: 'src/assets/i18n/ar.json',
      forbidden: [
        'From 2,500 EGP/mo',
        'From 8,500 EGP/mo',
        '2,500 جنيه',
        '8,500 جنيه',
        '$1.50/user/month',
        'CloudSpace plans start at $1.50 per user/month',
        '$0.50/user/month',
        '1.50/user',
        '0.50/user',
      ],
    },
  ],

  // ── iso-certification ───────────────────────────────────────────────────────
  // Unverified ISO Certification claim. "ISO Certified" in footer is blocked
  // until written ISO certificate reference is provided.
  // Each rule declares exactly ONE forbidden scalar value for separate authorization.
  'iso-certification': [
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#footer.certified',
      forbidden: 'ISO Certified',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#about.milestones.certification.title',
      forbidden: 'ISO Certification',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#footer.certified',
      forbidden: 'معتمد ISO',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#about.milestones.certification.title',
      forbidden: 'شهادة ISO',
    },
  ],

  // ── cloudspace-definition-taxonomy ──────────────────────────────────────────
  // CloudSpace removed from WorldPosta products; JSON-LD exclusion in place.
  // Prevent reintroduction of CloudSpace plan pricing (.50 claim variants).
  'cloudspace-definition-taxonomy': [
    {
      path: 'src/assets/i18n/en.json',
      forbidden: [
        '"CloudSpace"',
        'CloudSpace plan',
        '$1.50/user',
        '$0.50/user',
      ],
    },
    {
      path: 'src/assets/i18n/ar.json',
      forbidden: [
        '"CloudSpace"',
        'CloudSpace plan',
        'كلاود سبيس',
      ],
    },
  ],

  // ── blocked social proof / guaranteed ROI variants ──────────────────────────
  // "Guaranteed ROI" is an unverified marketing claim. The pricing page trust
  // section must not promise guaranteed ROI until evidence is provided.
  // "40% promo" / promotional savings guarantees are also blocked.
  'uptime-generic-outside-cloudedge-posta': [
    {
      path: 'src/assets/i18n/en.json',
      forbidden: [
        '"roi": "Guaranteed ROI"',
        'guaranteed ROI',
        '40% promo',
        'save 40%',
        'Save 40%',
        'Save up to 40%',
        '40% promotional savings with guaranteed ROI',
      ],
    },
    {
      path: 'src/assets/i18n/ar.json',
      forbidden: [
        '"roi": "عائد استثمار مضمون"',
        'عائد استثمار مضمون',
        'خصم 40%',
        'توفير 40%',
        'وفر حتى 40%',
        'توفير ترويجي 40% مع عائد استثمار مضمون',
      ],
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════════
  // BLOCKED CASE STUDY PUBLIC SURFACE POLICY
  // ══════════════════════════════════════════════════════════════════════════════
  // Each blocked case study must not render public claims (meta.title,
  // meta.description, hero.title, hero.subtitle, results.metrics) with specific
  // outcome figures (% reductions, uptime guarantees, named audit examples) until
  // documented client approval and metric evidence are provided.
  //
  // The case study detail component template must not dynamically render
  // .results.metrics. keys for blocked case studies. Each case study entry
  // covers both EN and AR i18n files with exact blocked public surfaces.
  // ══════════════════════════════════════════════════════════════════════════════

  // ── bank-cloud-migration (banking) ─────────────────────────────────────────
  // Blocked: 42% cost reduction, 99.94% uptime, 60% faster deployment claims
  // Current public surface: AR meta.description contains "42%" and "دون أي توقف"
  // Each key-aware rule has ONE scalar forbidden token for separate authorization.
  'case-study-bank-cloud-migration': [
    { path: 'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html', forbidden: ['.results.metrics.'] },
    // EN meta.title
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.banking.meta.title',
      forbidden: '42% Cost Reduction - Roaya IT',
    },
    // EN hero.title
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.banking.hero.title',
      forbidden: 'Achieves 42% Cost Reduction',
    },
    // EN results.metrics - split into separate rules
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.banking.results.metrics',
      forbidden: '99.94%',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.banking.results.metrics',
      forbidden: '60% Faster Deployment',
    },
    // AR meta.description - split into separate rules for each token
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.banking.meta.description',
      forbidden: 'لخفض 42%',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.banking.meta.description',
      forbidden: 'دون أي توقف',
    },
    // AR hero.title
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.banking.hero.title',
      forbidden: 'دون أي توقف',
    },
    // AR results.metrics - prevents meta.description exception from authorizing same token here
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.banking.results.metrics',
      forbidden: 'لخفض 42%',
    },
    // AR whole-file rules (no sourcePointer = no key-aware authorization)
    {
      path: 'src/assets/i18n/ar.json',
      forbidden: [
        // meta.title blocked claim
        'خفض التكاليف 42%',
        // hero.title blocked claim
        'يحقق خفض 42%',
        // hero blocked metrics - use specific context to avoid false positives on services.ai.statistics
        '"value": "99.94%"',
        // 60% deployment is allowed in services section; bank case study already qualified to "بانتظار الموافقة"
      ],
    },
  ],

  // ── healthcare-soc-implementation (healthcare) ─────────────────────────────
  // Blocked: Zero breaches claim, 85% faster detection, named audit examples
  'case-study-healthcare-soc-implementation': [
    { path: 'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html', forbidden: ['.results.metrics.'] },
    {
      path: 'src/assets/i18n/en.json',
      forbidden: [
        // meta.title blocked claim
        'Zero Breaches - Roaya IT',
        // hero.title blocked claim
        'Achieves Zero Breaches',
        // hero blocked metric
        '85%',
      ],
    },
    {
      path: 'src/assets/i18n/ar.json',
      forbidden: [
        // meta.title blocked claim
        'صفر اختراقات - رؤية',
        // hero.title blocked claim
        'تحقق صفر اختراقات',
        // hero blocked metric
        '85%',
      ],
    },
  ],

  // ── government-digital-transformation (government) ─────────────────────────
  // Blocked: 60% faster processing, 92% citizen satisfaction, named audit examples
  'case-study-government-digital-transformation': [
    { path: 'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html', forbidden: ['.results.metrics.'] },
    {
      path: 'src/assets/i18n/en.json',
      forbidden: [
        // meta.title blocked claim
        '60% Faster Processing - Roaya IT',
        // hero.title blocked claim
        'Processing Time by 60%',
        // hero blocked metrics
        '92%',
      ],
    },
    {
      path: 'src/assets/i18n/ar.json',
      forbidden: [
        // meta.title blocked claim
        'معالجة أسرع 60%',
        // hero.title blocked claim - use more specific pattern to avoid false positives
        'وقت معالجة خدمات المواطنين بنسبة 60%',
        // hero blocked metrics - use value pattern
        '"value": "92%"',
      ],
    },
  ],

  // ── manufacturing-sap-implementation (manufacturing) ────────────────────────
  // Blocked: 35% inventory optimization, 25% production efficiency, 18% revenue growth claims
  'case-study-manufacturing-sap-implementation': [
    { path: 'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html', forbidden: ['.results.metrics.'] },
    {
      path: 'src/assets/i18n/en.json',
      forbidden: [
        // meta.title blocked claim
        '35% Inventory Optimization - Roaya IT',
        // hero.title blocked claim
        '35% Inventory Optimization',
        // hero blocked metrics
        '25%',
        '18%',
      ],
    },
    {
      path: 'src/assets/i18n/ar.json',
      forbidden: [
        // meta.title blocked claim
        'تحسين المخزون 35%',
        // hero.title blocked claim - use more specific pattern to avoid challenge description false positive
        'تحسين المخزون بنسبة 35%',
        // hero blocked metrics - use value patterns
        '"value": "25%"',
        '"value": "18%"',
      ],
    },
  ],

  // ── ecommerce-auto-scaling (ecommerce) ──────────────────────────────────────
  // Blocked: 300% traffic capacity, 40% cost savings, uptime guarantees (zero downtime)
  // NOTE: "Zero downtime" appears in results.metrics.metric2.description which
  // needs to be qualified. Other occurrences in postaHybrid or banking challenge
  // are service descriptions, not outcome claims.
  // Each key-aware rule has ONE scalar forbidden token for separate authorization.
  'case-study-ecommerce-auto-scaling': [
    { path: 'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html', forbidden: ['.results.metrics.'] },
    // EN meta.title
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.ecommerce.meta.title',
      forbidden: '300% Traffic Capacity - Roaya IT',
    },
    // EN meta.description - split into separate rules
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.ecommerce.meta.description',
      forbidden: '300% traffic surge',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.ecommerce.meta.description',
      forbidden: 'with zero downtime',
    },
    // EN hero.title - split into separate rules
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.ecommerce.hero.title',
      forbidden: '300% Traffic Surge',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.ecommerce.hero.title',
      forbidden: 'Zero Downtime',
    },
    // EN whole-file rules (no sourcePointer = no key-aware authorization)
    {
      path: 'src/assets/i18n/en.json',
      forbidden: [
        // blocked savings claims
        '40% cost savings',
        '"value": "40%"',
        // results.metrics.metric2.description blocked claim - exact match
        'Zero downtime during all sales events',
      ],
    },
    // AR whole-file rules (no sourcePointer = no key-aware authorization)
    {
      path: 'src/assets/i18n/ar.json',
      forbidden: [
        // meta.title blocked claim
        'سعة حركة مرور 300%',
        // hero.title blocked claim
        '300% زيادة',
        // blocked savings claims
        'وتوفير 40%',
        '"value": "40%"',
        // results.metrics.metric2.description blocked claim - exact match
        'صفر توقف خلال جميع',
      ],
    },
  ],
};

function isPublicSurface(sourcePointer) {
  if (!sourcePointer) return false;
  return PUBLIC_SURFACE_PREFIXES.some((prefix) => sourcePointer.startsWith(prefix));
}

function validateEvidenceGates(claim, errors) {
  const id = claim.id;

  if (claim.status === 'verified') {
    if (!isNonEmptyString(claim.sourcePointer)) {
      pushError(errors, id, 'status is "verified" but "sourcePointer" is missing — a verified claim must carry a source pointer.');
    }
    if (!isNonEmptyString(claim.decisionReference)) {
      pushError(errors, id, 'status is "verified" but "decisionReference" is missing — a verified claim must carry a decision reference.');
    }
  }

  if (claim.topic === 'uptime' && claim.status === 'verified') {
    const scope = Array.isArray(claim.scope) ? claim.scope : [];
    const outOfScope = scope.filter((s) => !SCOPE_VALUES.includes(s));
    if (scope.length === 0 || outOfScope.length > 0) {
      pushError(errors, id, `A verified uptime claim's "scope" must be a non-empty subset of ${SCOPE_VALUES.join(', ')}; got ${JSON.stringify(claim.scope)}.`);
    }
  }

  if (claim.category === 'case_study') {
    const hasApproval = isNonEmptyString(claim.clientApprovalReference);
    const hasMetricEvidence = isNonEmptyString(claim.metricEvidencePointer);
    if (claim.status !== 'blocked' && !(hasApproval && hasMetricEvidence)) {
      pushError(
        errors,
        id,
        `Case-study status is ${JSON.stringify(claim.status)} but is missing "clientApprovalReference" and/or "metricEvidencePointer" — case studies must stay "blocked" until both are attached.`,
      );
    }
    if (claim.status === 'blocked' && (hasApproval || hasMetricEvidence) === false) {
      // Expected steady state: blocked with both null. No error — this is
      // the correct "not yet promoted" shape.
    }
  }

  // TIFO-16 blocked-public-surface policy: blocked entries that point to a
  // publicly rendered surface (i18n or component source) MUST have a documented
  // exception with owner, expiry, and approval — OR the blocked copy must be
  // removed/qualified from the public surface.
  if (claim.status === 'blocked' && isPublicSurface(claim.sourcePointer)) {
    const hasExceptionOwner = isNonEmptyString(claim.exceptionOwner);
    const hasExceptionExpiry = isNonEmptyString(claim.exceptionExpiry);
    const hasExceptionApproval = isNonEmptyString(claim.exceptionApproval);

    // Expiry must be a real calendar date strictly after today. Date.UTC
    // normalizes impossible values (such as 2099-99-99), so never trust it
    // without the round-trip validation in isStrictlyFutureCalendarDate().
    if (hasExceptionExpiry && !isStrictlyFutureCalendarDate(claim.exceptionExpiry)) {
      pushError(errors, id, `"exceptionExpiry" must be a real calendar date strictly in the future: ${JSON.stringify(claim.exceptionExpiry)}.`);
    }

    if (!(hasExceptionOwner && hasExceptionExpiry && hasExceptionApproval)) {
      pushError(
        errors,
        id,
        `status is "blocked" with sourcePointer targeting a public surface (${claim.sourcePointer}) but missing required exception fields. ` +
        `Blocked copy on public surfaces requires: exceptionOwner, exceptionExpiry (YYYY-MM-DD), and exceptionApproval. ` +
        `Either add the exception or remove/qualify the blocked copy from the public surface.`,
      );
    }
  }
}

/**
 * A policy exception is narrow by construction: it authorizes one policy rule
 * only when the blocked claim points to that rule's exact public surface.
 * `sourcePointer` remains the normal in-repo `path#fragment` value; it never
 * embeds a token or any additional mapping syntax.
 */
function hasValidException(claim) {
  const hasOwner = typeof claim.exceptionOwner === 'string' && claim.exceptionOwner.trim().length > 0;
  const hasApproval = typeof claim.exceptionApproval === 'string' && claim.exceptionApproval.trim().length > 0;
  return hasOwner && hasApproval && isStrictlyFutureCalendarDate(claim.exceptionExpiry);
}

function isExceptionAuthorized(claim, rule) {
  return claim.status === 'blocked'
    && hasValidException(claim)
    && typeof rule.sourcePointer === 'string'
    && claim.sourcePointer === rule.sourcePointer;
}

/**
 * Escapes special regex characters in a string for literal matching.
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Navigate into a parsed JSON object by dot-separated key path.
 * Returns undefined if path doesn't exist or doesn't resolve to a string/object.
 */
function getValueAtKeyPath(obj, keyPath) {
  if (!keyPath || typeof obj !== 'object' || obj === null) return undefined;
  const parts = keyPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Check if a forbidden string exists at a specific JSON key path.
 * Returns true if the value at keyPath contains the forbidden string.
 */
function containsForbiddenAtKeyPath(parsedJson, keyPath, forbidden) {
  const value = getValueAtKeyPath(parsedJson, keyPath);
  if (typeof value === 'string') {
    return value.includes(forbidden);
  }
  // If value is an object, stringify it to check nested content
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value).includes(forbidden);
  }
  return false;
}

/**
 * Parse the sourcePointer to extract the file path and key fragment.
 * Format: "path/to/file.json#key.path" or "path/to/file.json"
 */
function parseSourcePointer(sourcePointer) {
  if (!sourcePointer) return { path: null, keyPath: null };
  const hashIndex = sourcePointer.indexOf('#');
  if (hashIndex === -1) {
    return { path: sourcePointer, keyPath: null };
  }
  return {
    path: sourcePointer.substring(0, hashIndex),
    keyPath: sourcePointer.substring(hashIndex + 1),
  };
}

/**
 * Determines if the rule is a key-aware exact policy rule:
 * - Has a sourcePointer with a JSON key fragment (path#key.path)
 * - Has a scalar forbidden token (string, not array)
 * - Targets a JSON file
 *
 * Key-aware rules fail closed: if JSON can't parse or key path doesn't resolve,
 * emit a validation error rather than falling back to whole-file scanning.
 */
function isKeyAwareRule(rule) {
  if (!rule.sourcePointer || typeof rule.sourcePointer !== 'string') return false;
  if (typeof rule.forbidden !== 'string') return false; // Must be scalar
  if (!rule.path.endsWith('.json')) return false;
  const { keyPath } = parseSourcePointer(rule.sourcePointer);
  return Boolean(keyPath);
}

/**
 * For exception authorization with exact policy rules:
 * - The claim's sourcePointer must exactly match the rule's sourcePointer
 * - The rule must have a scalar forbidden token (one token per rule)
 * - This ensures that authorizing token A at key X does NOT authorize:
 *   - Token A at key Y (wrong key)
 *   - Token B at key X (sibling token in same key)
 */
function policyApprovalMarker(rule, forbiddenToken) {
  return `policy-token:${rule.sourcePointer}:${forbiddenToken}`;
}

function isExceptionAuthorizedForRule(claim, rule, forbiddenToken) {
  if (claim.status !== 'blocked') return false;
  if (!hasValidException(claim)) return false;
  // Rule must have an exact sourcePointer to match against.
  if (typeof rule.sourcePointer !== 'string') return false;
  if (typeof rule.forbidden !== 'string') return false;
  // Claim pointer is the ordinary locator and must exactly identify this key.
  if (claim.sourcePointer !== rule.sourcePointer) return false;
  // The approval itself must name this one policy token. This binds an approval
  // to a single scalar rule without changing the registry sourcePointer schema.
  return claim.exceptionApproval.includes(policyApprovalMarker(rule, forbiddenToken));
}

function validateBlockedPublicSurfacePolicy(claim, errors, publicSurfaceFiles) {
  if (claim.status !== 'blocked') return;

  // Cache parsed JSON files to avoid re-parsing
  const parsedCache = {};
  function getParsedJson(path) {
    if (path in parsedCache) return parsedCache[path];
    const source = publicSurfaceFiles?.[path];
    if (typeof source !== 'string') {
      parsedCache[path] = { parsed: null, error: 'File not available' };
      return parsedCache[path];
    }
    try {
      parsedCache[path] = { parsed: JSON.parse(source), error: null };
    } catch (e) {
      parsedCache[path] = { parsed: null, error: e.message };
    }
    return parsedCache[path];
  }

  for (const rule of BLOCKED_PUBLIC_SURFACE_POLICY[claim.id] ?? []) {
    const source = publicSurfaceFiles?.[rule.path];
    if (typeof source !== 'string') {
      pushError(errors, claim.id, `Blocked public-surface policy could not inspect ${rule.path}.`);
      continue;
    }

    // Normalize forbidden to array for iteration
    const forbiddenTokens = typeof rule.forbidden === 'string' ? [rule.forbidden] : rule.forbidden;

    // Determine if this is a key-aware rule (scalar forbidden + sourcePointer with keyPath)
    const keyAware = isKeyAwareRule(rule);
    const { keyPath: ruleKeyPath } = rule.sourcePointer ? parseSourcePointer(rule.sourcePointer) : { keyPath: null };

    for (const forbidden of forbiddenTokens) {
      let found = false;

      if (keyAware) {
        // JSON-key-aware matching: ONLY check at the specific key path
        // Fail closed: if JSON can't parse or key doesn't resolve, emit error
        const { parsed, error } = getParsedJson(rule.path);
        if (error) {
          pushError(errors, claim.id, `Key-aware policy rule for ${rule.path}#${ruleKeyPath} cannot parse JSON: ${error}. Fix the JSON or remove the key-aware rule.`);
          continue;
        }
        const valueAtConfiguredKey = getValueAtKeyPath(parsed, ruleKeyPath);
        if (typeof valueAtConfiguredKey === 'undefined') {
          pushError(errors, claim.id, `Key-aware policy rule for ${rule.path}#${ruleKeyPath} could not resolve its configured JSON key. Fix the policy or restore the key.`);
          continue;
        }
        found = containsForbiddenAtKeyPath(parsed, ruleKeyPath, forbidden);
      } else if (ruleKeyPath && rule.path.endsWith('.json')) {
        // Array-based rule with keyPath: check at key path, fall back to whole file if needed
        const { parsed } = getParsedJson(rule.path);
        if (parsed) {
          found = containsForbiddenAtKeyPath(parsed, ruleKeyPath, forbidden);
        } else {
          // Fall back to string matching for array rules
          found = source.includes(forbidden);
        }
      } else {
        // Non-JSON files or rules without keyPath: use simple string matching
        found = source.includes(forbidden);
      }

      if (found) {
        // Check if this specific forbidden token is authorized by exception
        // For scalar rules: exception must match exact sourcePointer
        // For array rules: exceptions never authorize (whole-file policy)
        if (isExceptionAuthorizedForRule(claim, rule, forbidden)) {
          continue;
        }
        pushError(errors, claim.id, `Blocked public claim is rendered or reintroduced in ${rule.path}: ${JSON.stringify(forbidden)}. Remove/qualify it or add a real documented exception.`);
      }
    }
  }
}

export function validateRegistry(registryJson, { caseStudySlugs, publicSurfaceFiles } = {}) {
  const errors = [];
  let registry;
  try {
    registry = JSON.parse(registryJson);
  } catch (error) {
    return { errors: [`registry.json is not valid JSON: ${error.message}`] };
  }

  if (typeof registry !== 'object' || registry === null || Array.isArray(registry)) {
    return { errors: ['registry.json root must be an object.'] };
  }

  if (registry.version !== 1) {
    errors.push(`Unsupported registry "version": ${JSON.stringify(registry.version)}. Expected 1.`);
  }

  if (!Array.isArray(registry.claims)) {
    errors.push('registry.json "claims" must be an array.');
    return { errors };
  }

  const seenIds = new Set();
  const seenSlugs = new Set();

  for (const claim of registry.claims) {
    const id = validateClaimShape(claim, errors);
    if (!id) continue;

    if (seenIds.has(id)) {
      pushError(errors, id, 'Duplicate claim id.');
    }
    seenIds.add(id);

    validateSecrets(claim, errors);
    validateEvidenceGates(claim, errors);
    validateBlockedPublicSurfacePolicy(claim, errors, publicSurfaceFiles);

    if (claim.category === 'case_study' && isNonEmptyString(claim.slug)) {
      if (seenSlugs.has(claim.slug)) {
        pushError(errors, id, `Duplicate case-study slug: ${claim.slug}`);
      }
      seenSlugs.add(claim.slug);

      if (Array.isArray(caseStudySlugs) && !caseStudySlugs.includes(claim.slug)) {
        pushError(errors, id, `slug "${claim.slug}" does not match any canonical case study in case-studies.data.ts.`);
      }
    }
  }

  if (Array.isArray(caseStudySlugs)) {
    for (const slug of caseStudySlugs) {
      if (!seenSlugs.has(slug)) {
        errors.push(`Canonical case study "${slug}" has no registry entry.`);
      }
    }
  }

  return { errors, claimCount: registry.claims.length };
}

export function extractCaseStudySlugs(caseStudiesDataTs) {
  const match = caseStudiesDataTs.match(/export type CaseStudySlug =([\s\S]*?);/);
  if (!match) return [];
  return [...match[1].matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]);
}

function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const registryPath = join(__dirname, 'registry.json');
  const caseStudiesDataPath = join(
    __dirname,
    '..',
    '..',
    'src/app/features/resources/case-studies/case-studies.data.ts',
  );

  const registryJson = readFileSync(registryPath, 'utf8');
  const caseStudiesDataTs = readFileSync(caseStudiesDataPath, 'utf8');
  const caseStudySlugs = extractCaseStudySlugs(caseStudiesDataTs);
  const publicSurfaceFiles = {
    'src/assets/i18n/en.json': readFileSync(join(__dirname, '..', '..', 'src/assets/i18n/en.json'), 'utf8'),
    'src/assets/i18n/ar.json': readFileSync(join(__dirname, '..', '..', 'src/assets/i18n/ar.json'), 'utf8'),
    'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html': readFileSync(join(__dirname, '..', '..', 'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html'), 'utf8'),
  };

  const { errors, claimCount } = validateRegistry(registryJson, { caseStudySlugs, publicSurfaceFiles });

  if (errors.length > 0) {
    console.error(`claim-evidence registry validation FAILED (${errors.length} error(s)):`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `claim-evidence registry validation passed: ${claimCount} claim(s), ${caseStudySlugs.length} canonical case study slug(s) all represented.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
