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
// Each entry maps a blocked claim ID to an array of { path, sourcePointer, forbidden } rules.
// IMPORTANT: All business rules must use exact scalar key mappings:
// - `sourcePointer` must be in format `path#key.path` pointing to a REAL, EXISTING JSON key
// - `forbidden` must be a scalar string (not array) for key-aware authorization
// - Keys that don't exist in the current i18n files are not included (key-aware rules fail closed)
// Using exact values avoids false-positive regex matches and enables per-token exception authorization.
const BLOCKED_PUBLIC_SURFACE_POLICY = {
  // ── pricing-truth-ranges ────────────────────────────────────────────────────
  // Blocked EGP price claims removed per Stage 0 decision 9.
  // Each scalar rule targets the specific JSON key where the blocked value would reappear.
  // NOTE: CloudSpace keys were completely removed and are not included here.
  'pricing-truth-ranges': [
    // EN: starter tier pricing at home.pricingPreview
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#home.pricingPreview.starter.price',
      forbidden: 'From 2,500 EGP/mo',
    },
    // EN: business tier pricing at home.pricingPreview
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#home.pricingPreview.business.price',
      forbidden: 'From 8,500 EGP/mo',
    },
    // EN: WorldPosta fullDescription - could contain price claims
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#services.worldposta.fullDescription',
      forbidden: '$1.50/user/month',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#services.worldposta.fullDescription',
      forbidden: '$0.50/user/month',
    },

    // AR: starter tier pricing at home.pricingPreview
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#home.pricingPreview.starter.price',
      forbidden: 'From 2,500 EGP/mo',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#home.pricingPreview.starter.price',
      forbidden: '2,500 جنيه',
    },
    // AR: business tier pricing at home.pricingPreview
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#home.pricingPreview.business.price',
      forbidden: 'From 8,500 EGP/mo',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#home.pricingPreview.business.price',
      forbidden: '8,500 جنيه',
    },
    // AR: WorldPosta fullDescription - could contain price claims
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#services.worldposta.fullDescription',
      forbidden: '$1.50/user/month',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#services.worldposta.fullDescription',
      forbidden: '$0.50/user/month',
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
  // The CloudSpace product keys were completely removed, so we target the WorldPosta
  // fullDescription which is the most likely location for reintroduction.
  'cloudspace-definition-taxonomy': [
    // EN: WorldPosta fullDescription - could contain CloudSpace claims
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#services.worldposta.fullDescription',
      forbidden: 'CloudSpace',
    },

    // AR: WorldPosta fullDescription - could contain CloudSpace claims
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#services.worldposta.fullDescription',
      forbidden: 'CloudSpace',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#services.worldposta.fullDescription',
      forbidden: 'كلاود سبيس',
    },
  ],

  // ── blocked social proof / guaranteed ROI variants ──────────────────────────
  // "Guaranteed ROI" is an unverified marketing claim. The pricing page trust
  // section must not promise guaranteed ROI until evidence is provided.
  // "40% promo" / promotional savings guarantees are also blocked.
  // Each scalar rule targets the specific JSON key where the blocked value would reappear.
  'uptime-generic-outside-cloudedge-posta': [
    // EN: pricing.trust.roi key is the primary location
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#pricing.trust.roi',
      forbidden: 'Guaranteed ROI',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#pricing.trust.roiDesc',
      forbidden: 'guaranteed ROI',
    },
    // EN: promotional savings at home.hero.badge
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#home.hero.badge',
      forbidden: '40% promo',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#home.hero.badge',
      forbidden: 'save 40%',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#home.hero.badge',
      forbidden: 'Save 40%',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#home.hero.badge',
      forbidden: 'Save up to 40%',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#home.newsBar.promo1',
      forbidden: '40% promotional savings with guaranteed ROI',
    },
    // AR: pricing.trust.roi key is the primary location
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#pricing.trust.roi',
      forbidden: 'عائد استثمار مضمون',
    },
    // AR: promotional savings at home.hero.badge
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#home.hero.badge',
      forbidden: 'خصم 40%',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#home.hero.badge',
      forbidden: 'توفير 40%',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#home.hero.badge',
      forbidden: 'وفر حتى 40%',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#home.newsBar.promo1',
      forbidden: 'توفير ترويجي 40% مع عائد استثمار مضمون',
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
  //
  // IMPORTANT: All rules must use exact scalar key mappings for key-aware authorization.
  // ══════════════════════════════════════════════════════════════════════════════

  // ── bank-cloud-migration (banking) ─────────────────────────────────────────
  // Blocked: 42% cost reduction, 99.94% uptime, 60% faster deployment claims
  // Each key-aware rule has ONE scalar forbidden token for separate authorization.
  'case-study-bank-cloud-migration': [
    // Template structural hard-block: prevents dynamic .results.metrics. rendering
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
    // EN results.metrics - split into separate rules for each metric
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.banking.results.metrics.metric2.value',
      forbidden: '99.94%',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.banking.results.metrics.metric3.value',
      forbidden: '60% Faster Deployment',
    },
    // AR meta.title
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.banking.meta.title',
      forbidden: 'خفض التكاليف 42%',
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
    // AR hero.title - separate rules for each blocked token
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.banking.hero.title',
      forbidden: 'يحقق خفض 42%',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.banking.hero.title',
      forbidden: 'دون أي توقف',
    },
    // AR results.metrics - prevents meta.description exception from authorizing same token here
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.banking.results.metrics.metric1.value',
      forbidden: 'لخفض 42%',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.banking.results.metrics.metric2.value',
      forbidden: '99.94%',
    },
  ],

  // ── healthcare-soc-implementation (healthcare) ─────────────────────────────
  // Blocked: Zero breaches claim, 85% faster detection, named audit examples
  // Each key-aware rule has ONE scalar forbidden token for separate authorization.
  'case-study-healthcare-soc-implementation': [
    // Template structural hard-block: prevents dynamic .results.metrics. rendering
    { path: 'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html', forbidden: ['.results.metrics.'] },
    // EN meta.title
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.healthcare.meta.title',
      forbidden: 'Zero Breaches - Roaya IT',
    },
    // EN hero.title
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.healthcare.hero.title',
      forbidden: 'Achieves Zero Breaches',
    },
    // EN results.metrics - blocked 85% metric
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.healthcare.results.metrics.metric2.value',
      forbidden: '85%',
    },
    // AR meta.title
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.healthcare.meta.title',
      forbidden: 'صفر اختراقات - رؤية',
    },
    // AR hero.title
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.healthcare.hero.title',
      forbidden: 'تحقق صفر اختراقات',
    },
    // AR results.metrics - blocked 85% metric
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.healthcare.results.metrics.metric2.value',
      forbidden: '85%',
    },
  ],

  // ── government-digital-transformation (government) ─────────────────────────
  // Blocked: 60% faster processing, 92% citizen satisfaction, named audit examples
  // Each key-aware rule has ONE scalar forbidden token for separate authorization.
  'case-study-government-digital-transformation': [
    // Template structural hard-block: prevents dynamic .results.metrics. rendering
    { path: 'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html', forbidden: ['.results.metrics.'] },
    // EN meta.title
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.government.meta.title',
      forbidden: '60% Faster Processing - Roaya IT',
    },
    // EN hero.title
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.government.hero.title',
      forbidden: 'Processing Time by 60%',
    },
    // EN results.metrics - blocked 92% metric
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.government.results.metrics.metric4.value',
      forbidden: '92%',
    },
    // AR meta.title
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.government.meta.title',
      forbidden: 'معالجة أسرع 60%',
    },
    // AR hero.title
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.government.hero.title',
      forbidden: 'وقت معالجة خدمات المواطنين بنسبة 60%',
    },
    // AR results.metrics - blocked 92% metric
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.government.results.metrics.metric4.value',
      forbidden: '92%',
    },
  ],

  // ── manufacturing-sap-implementation (manufacturing) ────────────────────────
  // Blocked: 35% inventory optimization, 25% production efficiency, 18% revenue growth claims
  // Each key-aware rule has ONE scalar forbidden token for separate authorization.
  'case-study-manufacturing-sap-implementation': [
    // Template structural hard-block: prevents dynamic .results.metrics. rendering
    { path: 'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html', forbidden: ['.results.metrics.'] },
    // EN meta.title
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.manufacturing.meta.title',
      forbidden: '35% Inventory Optimization - Roaya IT',
    },
    // EN hero.title
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.manufacturing.hero.title',
      forbidden: '35% Inventory Optimization',
    },
    // EN results.metrics - blocked metrics
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.manufacturing.results.metrics.metric1.value',
      forbidden: '35%',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.manufacturing.results.metrics.metric2.value',
      forbidden: '25%',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.manufacturing.results.metrics.metric4.value',
      forbidden: '18%',
    },
    // AR meta.title
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.manufacturing.meta.title',
      forbidden: 'تحسين المخزون 35%',
    },
    // AR hero.title
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.manufacturing.hero.title',
      forbidden: 'تحسين المخزون بنسبة 35%',
    },
    // AR results.metrics - blocked metrics
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.manufacturing.results.metrics.metric1.value',
      forbidden: '35%',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.manufacturing.results.metrics.metric2.value',
      forbidden: '25%',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.manufacturing.results.metrics.metric4.value',
      forbidden: '18%',
    },
  ],

  // ── ecommerce-auto-scaling (ecommerce) ──────────────────────────────────────
  // Blocked: 300% traffic capacity, 40% cost savings, uptime guarantees (zero downtime)
  // Each key-aware rule has ONE scalar forbidden token for separate authorization.
  'case-study-ecommerce-auto-scaling': [
    // Template structural hard-block: prevents dynamic .results.metrics. rendering
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
    // EN hero.subtitle - blocked savings claims
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.ecommerce.hero.subtitle',
      forbidden: '40% cost savings',
    },
    // EN results.metrics - blocked metrics
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.ecommerce.results.metrics.metric1.value',
      forbidden: '300%',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.ecommerce.results.metrics.metric2.value',
      forbidden: 'Zero downtime',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.ecommerce.results.metrics.metric2.description',
      forbidden: 'Zero downtime during all sales events',
    },
    {
      path: 'src/assets/i18n/en.json',
      sourcePointer: 'src/assets/i18n/en.json#caseStudies.ecommerce.results.metrics.metric3.value',
      forbidden: '40%',
    },
    // AR meta.title
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.ecommerce.meta.title',
      forbidden: 'سعة حركة مرور 300%',
    },
    // AR hero.title
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.ecommerce.hero.title',
      forbidden: '300% زيادة',
    },
    // AR hero.subtitle - blocked savings claims
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.ecommerce.hero.subtitle',
      forbidden: 'وتوفير 40%',
    },
    // AR results.metrics - blocked metrics
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.ecommerce.results.metrics.metric1.value',
      forbidden: '300%',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.ecommerce.results.metrics.metric2.value',
      forbidden: 'صفر توقف',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.ecommerce.results.metrics.metric2.description',
      forbidden: 'صفر توقف خلال جميع',
    },
    {
      path: 'src/assets/i18n/ar.json',
      sourcePointer: 'src/assets/i18n/ar.json#caseStudies.ecommerce.results.metrics.metric3.value',
      forbidden: '40%',
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
