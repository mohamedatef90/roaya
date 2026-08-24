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

    // Expiry must be a valid future date if provided
    if (hasExceptionExpiry) {
      if (!DATE_PATTERN.test(claim.exceptionExpiry)) {
        pushError(errors, id, `"exceptionExpiry" must be in YYYY-MM-DD format: ${JSON.stringify(claim.exceptionExpiry)}`);
      } else {
        const [y, m, d] = claim.exceptionExpiry.split('-').map(Number);
        const expiryDate = new Date(Date.UTC(y, m - 1, d));
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        if (expiryDate < today) {
          pushError(errors, id, `"exceptionExpiry" has passed (${claim.exceptionExpiry}) — blocked public copy must be removed or exception renewed.`);
        }
      }
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

export function validateRegistry(registryJson, { caseStudySlugs } = {}) {
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

  const { errors, claimCount } = validateRegistry(registryJson, { caseStudySlugs });

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
