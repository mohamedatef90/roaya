#!/usr/bin/env node
/**
 * Red-capable self-test for validate-registry.mjs: proves each rejection
 * rule actually fires on a deliberately mutated copy of the baseline
 * registry, not just that the baseline passes clean.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateRegistry, extractCaseStudySlugs } from './validate-registry.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const registryPath = join(__dirname, 'registry.json');
const caseStudiesDataPath = join(
  __dirname,
  '..',
  '..',
  'src/app/features/resources/case-studies/case-studies.data.ts',
);

const baselineJson = readFileSync(registryPath, 'utf8');
const caseStudiesDataTs = readFileSync(caseStudiesDataPath, 'utf8');
const caseStudySlugs = extractCaseStudySlugs(caseStudiesDataTs);
const publicSurfaceFiles = {
  'src/assets/i18n/en.json': readFileSync(join(__dirname, '..', '..', 'src/assets/i18n/en.json'), 'utf8'),
  'src/assets/i18n/ar.json': readFileSync(join(__dirname, '..', '..', 'src/assets/i18n/ar.json'), 'utf8'),
  'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html': readFileSync(join(__dirname, '..', '..', 'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html'), 'utf8'),
};
const baseline = JSON.parse(baselineJson);

let failures = 0;

function check(name, condition) {
  if (!condition) {
    console.error(`✗ ${name}`);
    failures += 1;
  } else {
    console.log(`✓ ${name}`);
  }
}

function mutate(mutator) {
  const clone = JSON.parse(JSON.stringify(baseline));
  mutator(clone);
  return JSON.stringify(clone);
}

function findClaim(clone, id) {
  return clone.claims.find((c) => c.id === id);
}

function errorsFor(mutatedJson) {
  return validateRegistry(mutatedJson, { caseStudySlugs, publicSurfaceFiles }).errors;
}

/**
 * Mutate a JSON file by setting a value at a dot-separated key path.
 * Returns a properly stringified JSON object.
 */
function mutateJsonSource(jsonString, keyPath, value) {
  const obj = JSON.parse(jsonString);
  const parts = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current)) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
  return JSON.stringify(obj, null, 2);
}

/**
 * Create publicSurfaceFiles with a mutated JSON source.
 */
function withMutatedJsonSource(path, keyPath, value) {
  const original = publicSurfaceFiles[path];
  if (!original) throw new Error(`Unknown source path: ${path}`);
  return {
    ...publicSurfaceFiles,
    [path]: mutateJsonSource(original, keyPath, value),
  };
}

// Baseline must pass cleanly before mutations prove each rejection rule turns red.
{
  const { errors } = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles });
  check('baseline registry.json passes with zero errors', errors.length === 0);
}

// Rule: a mutation of a real public source back to a blocked price must fail.
// Use withMutatedJsonSource() to inject at exact key path for key-aware rules.
{
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'home.pricingPreview.starter.price', 'From 2,500 EGP/mo');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check('blocked pricing reintroduced into a public source is rejected', errors.some((e) => e.includes('From 2,500 EGP/mo')));
}

// Rule: restoring dynamic metric rendering for blocked case studies must fail.
{
  const templatePath = 'src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.html';
  const sources = {
    ...publicSurfaceFiles,
    [templatePath]: `${publicSurfaceFiles[templatePath]}\n{{ translationPrefix() + '.results.metrics.' + metric + '.value' | translate }}`,
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check('blocked case-study metric rendering reintroduced into a public template is rejected', errors.some((e) => e.includes('.results.metrics.')));
}

// Rule: a verified status without a source pointer must be rejected.
{
  const mutated = mutate((c) => {
    findClaim(c, 'founded-2018').sourcePointer = null;
  });
  check(
    'verified claim without sourcePointer is rejected',
    errorsFor(mutated).some((e) => e.includes('"sourcePointer" is missing')),
  );
}

// Rule: a verified status without a decision reference must be rejected.
{
  const mutated = mutate((c) => {
    findClaim(c, 'founded-2018').decisionReference = null;
  });
  check(
    'verified claim without decisionReference is rejected',
    errorsFor(mutated).some((e) => e.includes('"decisionReference" is missing')),
  );
}

// Rule: deferred/blocked items promoted to verified without evidence must be rejected.
for (const id of ['iso-certification', 'pricing-truth-ranges', 'cloudspace-definition-taxonomy']) {
  const mutated = mutate((c) => {
    findClaim(c, id).status = 'verified';
  });
  check(
    `blocked claim "${id}" promoted to verified without evidence is rejected`,
    errorsFor(mutated).length > 0,
  );
}

// Rule: generic uptime marked verified outside the CloudEdge/Posta scope must be rejected.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'uptime-generic-outside-cloudedge-posta');
    claim.status = 'verified';
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.banking.results.metrics.metric2.value';
    claim.decisionReference = 'fabricated';
  });
  check(
    'generic uptime claim verified with empty/out-of-scope "scope" is rejected',
    errorsFor(mutated).some((e) => e.includes('non-empty subset of cloudedge, posta')),
  );
}
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'uptime-cloudedge-posta-9999');
    claim.scope = ['cloudedge', 'aws'];
  });
  check(
    'uptime claim verified with an out-of-scope product is rejected',
    errorsFor(mutated).some((e) => e.includes('non-empty subset of cloudedge, posta')),
  );
}

// Rule: case-study evidence marked verified without required pointers must be rejected.
{
  const mutated = mutate((c) => {
    findClaim(c, 'case-study-bank-cloud-migration').status = 'verified';
  });
  check(
    'case study promoted to verified without approval/metric pointers is rejected',
    errorsFor(mutated).some((e) => e.includes('must stay "blocked"')),
  );
}
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-bank-cloud-migration');
    claim.status = 'verified';
    claim.clientApprovalReference = 'approved by client on 2026-08-01';
    // metricEvidencePointer intentionally left null.
  });
  check(
    'case study with only an approval reference (no metric evidence) stays rejected',
    errorsFor(mutated).some((e) => e.includes('must stay "blocked"')),
  );
}

// Rule: duplicate claim IDs must be rejected.
{
  const mutated = mutate((c) => {
    const dup = JSON.parse(JSON.stringify(findClaim(c, 'clients-150-plus')));
    dup.id = 'founded-2018';
    c.claims.push(dup);
  });
  check(
    'duplicate claim id is rejected',
    errorsFor(mutated).some((e) => e.includes('Duplicate claim id')),
  );
}

// Rule: duplicate case-study slugs must be rejected.
{
  const mutated = mutate((c) => {
    findClaim(c, 'case-study-healthcare-soc-implementation').slug = 'bank-cloud-migration';
  });
  check(
    'duplicate case-study slug is rejected',
    errorsFor(mutated).some((e) => e.includes('Duplicate case-study slug')),
  );
}

// Rule: invalid statuses must be rejected.
{
  const mutated = mutate((c) => {
    findClaim(c, 'founded-2018').status = 'approved-ish';
  });
  check(
    'invalid status value is rejected',
    errorsFor(mutated).some((e) => e.includes('Invalid "status"')),
  );
}

// Rule: invalid categories must be rejected.
{
  const mutated = mutate((c) => {
    findClaim(c, 'founded-2018').category = 'fact';
  });
  check(
    'invalid category value is rejected',
    errorsFor(mutated).some((e) => e.includes('Invalid "category"')),
  );
}

// Rule: malformed dates must be rejected.
for (const badDate of ['2026/08/23', '23-08-2026', '2026-13-40', 'yesterday']) {
  const mutated = mutate((c) => {
    findClaim(c, 'founded-2018').reviewDate = badDate;
  });
  check(
    `malformed reviewDate "${badDate}" is rejected`,
    errorsFor(mutated).some((e) => e.includes('reviewDate')),
  );
}

// Rule: malformed source pointers (absolute path, traversal, bare URL) must be rejected.
for (const badPointer of [
  '/etc/passwd',
  '../../etc/passwd',
  'https://roaya.co/about',
  'no-extension-no-slash',
]) {
  const mutated = mutate((c) => {
    findClaim(c, 'founded-2018').sourcePointer = badPointer;
  });
  check(
    `malformed sourcePointer "${badPointer}" is rejected`,
    errorsFor(mutated).some((e) => e.includes('Malformed "sourcePointer"')),
  );
}

// Rule: secrets-like values must be rejected.
const secretMutations = [
  ['AWS key in notes', 'notes', 'rotate key AKIAABCDEFGHIJKLMNOP now'],
  ['generic API key literal', 'notes', 'api_key: "sk_live_1234567890abcdef1234"'],
  ['PEM private key block', 'notes', '-----BEGIN RSA PRIVATE KEY-----'],
  ['bearer token', 'notes', 'Authorization: Bearer abcdefghijklmnopqrstuvwxyz012345'],
  ['password assignment', 'notes', 'password: SuperSecret123!'],
];
for (const [label, field, value] of secretMutations) {
  const mutated = mutate((c) => {
    findClaim(c, 'founded-2018')[field] = value;
  });
  check(
    `secrets-like value is rejected (${label})`,
    errorsFor(mutated).some((e) => e.includes('secrets-like pattern')),
  );
}

// Rule: an unknown field must be rejected (schema is closed, not open-ended).
{
  const mutated = mutate((c) => {
    findClaim(c, 'founded-2018').invented = 'not a real field';
  });
  check(
    'unknown field is rejected',
    errorsFor(mutated).some((e) => e.includes('Unknown field')),
  );
}

// Rule: a missing required field must be rejected.
{
  const mutated = mutate((c) => {
    delete findClaim(c, 'founded-2018').sourceType;
  });
  check(
    'missing required field is rejected',
    errorsFor(mutated).some((e) => e.includes('Missing required field "sourceType"')),
  );
}

// Rule: a case-study slug that isn't in case-studies.data.ts must be rejected.
{
  const mutated = mutate((c) => {
    findClaim(c, 'case-study-bank-cloud-migration').slug = 'not-a-real-slug';
  });
  check(
    'case-study slug not present in case-studies.data.ts is rejected',
    errorsFor(mutated).some((e) => e.includes('does not match any canonical case study')),
  );
}

// Rule: a canonical case study missing from the registry must be rejected.
{
  const mutated = mutate((c) => {
    c.claims = c.claims.filter((claim) => claim.id !== 'case-study-bank-cloud-migration');
  });
  check(
    'a canonical case study with no registry entry is rejected',
    errorsFor(mutated).some((e) => e.includes('has no registry entry')),
  );
}

// Rule: blocked entries with public-surface sourcePointer but no exception must be rejected.
{
  const mutated = mutate((c) => {
    // Re-add a public surface pointer to a blocked claim (simulating reversion)
    const claim = findClaim(c, 'iso-certification');
    claim.sourcePointer = 'src/assets/i18n/en.json#about.milestones.certification.title';
    // No exceptionOwner/exceptionExpiry/exceptionApproval
  });
  check(
    'blocked claim with public-surface sourcePointer but no exception is rejected',
    errorsFor(mutated).some((e) => e.includes('missing required exception fields')),
  );
}

// Rule: blocked entries with public-surface sourcePointer and incomplete exception must be rejected.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'pricing-truth-ranges');
    claim.sourcePointer = 'src/assets/i18n/en.json#services.worldposta.fullDescription';
    claim.exceptionOwner = 'Marketing Lead';
    // Missing exceptionExpiry and exceptionApproval
  });
  check(
    'blocked claim with public-surface sourcePointer and incomplete exception is rejected',
    errorsFor(mutated).some((e) => e.includes('missing required exception fields')),
  );
}

// Rule: blocked entries with public-surface sourcePointer and expired exception must be rejected.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'cloudspace-definition-taxonomy');
    claim.sourcePointer = 'src/app/features/services/worldposta/worldposta.component.ts#products.cloudspace';
    claim.exceptionOwner = 'Product Manager';
    claim.exceptionExpiry = '2025-01-01'; // Past date
    claim.exceptionApproval = 'TIFO-99 temporary exception';
  });
  check(
    'blocked claim with public-surface sourcePointer and expired exception is rejected',
    errorsFor(mutated).some((e) => e.includes('exceptionExpiry') && (e.includes('strictly in the future') || e.includes('real calendar date'))),
  );
}

// Rule: blocked entries with public-surface sourcePointer and valid exception must pass
// (no NEW exception-related errors, though baseline i18n errors may still exist).
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'iso-certification');
    claim.sourcePointer = 'src/assets/i18n/en.json#about.milestones.certification.title';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31'; // Future date
    claim.exceptionApproval = 'TIFO-100 approved temporary exception';
  });
  const errors = errorsFor(mutated);
  // Should not have "missing required exception fields" error for this claim
  check(
    'blocked claim with public-surface sourcePointer and valid exception passes exception validation',
    !errors.some((e) => e.includes('iso-certification') && e.includes('missing required exception fields')),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EXACT EXCEPTION AUTHORIZATION TESTS
// A valid exception with sourcePointer mapping `path#key.path:exact forbidden string`
// must authorize ONLY that exact forbidden string at that exact path. Wrong path,
// wrong key, wrong string, or any mismatch must reject.
// ══════════════════════════════════════════════════════════════════════════════

// Rule: exact valid ISO exception - inject "ISO Certified" at the exact i18n key yields ZERO errors.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'iso-certification');
    // Exception mapping format: path#keyFragment
    claim.sourcePointer = 'src/assets/i18n/en.json#footer.certified';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-300 exact ISO exception authorized; policy-token:src/assets/i18n/en.json#footer.certified:ISO Certified';
  });
  // Inject the exact forbidden string at the exact key location using proper JSON mutation
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'footer.certified', 'ISO Certified');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'exact valid ISO exception with sourcePointer mapping yields ZERO errors for that claim',
    errors.length === 0,
  );
}

// Rule: wrong-map - inject equivalent blocked string in another key/path and fail.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'iso-certification');
    // Exception maps to footer.certified but we inject at about.milestones
    claim.sourcePointer = 'src/assets/i18n/en.json#footer.certified';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-301 exact ISO exception';
  });
  // Inject blocked string at a DIFFERENT key location (about.milestones, not footer.certified)
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'about.milestones.certification.title', 'ISO Certification');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'ISO exception for footer.certified does NOT authorize a different policy rule (wrong-map)',
    errors.some((e) => e.includes('iso-certification') && e.includes('ISO Certification')),
  );
}

// Rule: missing exception fields must fail (no exceptionOwner).
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'iso-certification');
    claim.sourcePointer = 'src/assets/i18n/en.json#footer.certified';
    // Missing exceptionOwner
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-302 exception';
  });
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'footer.certified', 'ISO Certified');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'missing exceptionOwner fails even with valid mapping',
    errors.some((e) => e.includes('iso-certification') && (e.includes('missing required exception fields') || e.includes('ISO Certified'))),
  );
}

// Rule: incomplete exception (missing exceptionApproval) must fail.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'iso-certification');
    claim.sourcePointer = 'src/assets/i18n/en.json#footer.certified';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    // Missing exceptionApproval
  });
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'footer.certified', 'ISO Certified');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'missing exceptionApproval fails even with valid mapping',
    errors.some((e) => e.includes('iso-certification') && (e.includes('missing required exception fields') || e.includes('ISO Certified'))),
  );
}

// Rule: expired exception must fail.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'iso-certification');
    claim.sourcePointer = 'src/assets/i18n/en.json#footer.certified';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2024-01-01'; // Expired
    claim.exceptionApproval = 'TIFO-303 expired exception';
  });
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'footer.certified', 'ISO Certified');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'expired exception fails even with valid mapping',
    errors.some((e) => e.includes('iso-certification') && (e.includes('passed') || e.includes('ISO Certified'))),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CASE STUDY EXACT EXCEPTION AUTHORIZATION TESTS
// A valid case-study exception with meta.title mapping must authorize ONLY that
// exact string. Injection at hero.title or any other path must still reject.
// ══════════════════════════════════════════════════════════════════════════════

// Rule: valid blocked case-study exception success test - one exact meta.title mapping,
// injection at hero remains rejected.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-bank-cloud-migration');
    // Exception mapping: authorize ONLY "42% Cost Reduction - Roaya IT" at meta.title key
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.banking.meta.title';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-400 meta.title exception only; policy-token:src/assets/i18n/en.json#caseStudies.banking.meta.title:42% Cost Reduction - Roaya IT';
  });
  // Inject the exact authorized string at meta.title location using proper JSON mutation
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.banking.meta.title', '42% Cost Reduction - Roaya IT');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  // The exact mapped forbidden string should be authorized, so no error for that specific string
  check(
    'case study exact meta.title exception authorizes that exact string - zero errors for authorized string',
    !errors.some((e) => e.includes('case-study-bank-cloud-migration') && e.includes('42% Cost Reduction - Roaya IT')),
  );
}

// Rule: same case-study exception, but hero.title injection must still be rejected.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-bank-cloud-migration');
    // Exception ONLY for meta.title
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.banking.meta.title';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-400 meta.title exception only; policy-token:src/assets/i18n/en.json#caseStudies.banking.meta.title:42% Cost Reduction - Roaya IT';
  });
  // Inject a DIFFERENT blocked string at hero.title (not covered by exception)
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.banking.hero.title', 'Achieves 42% Cost Reduction');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'case study meta.title exception does NOT authorize hero.title blocked string',
    errors.some((e) => e.includes('case-study-bank-cloud-migration') && e.includes('Achieves 42% Cost Reduction')),
  );
}

// Rule: full clean pass for valid ISO exception case.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'iso-certification');
    claim.sourcePointer = 'src/assets/i18n/en.json#footer.certified';
    claim.exceptionOwner = 'CEO';
    claim.exceptionExpiry = '2028-06-30';
    claim.exceptionApproval = 'TIFO-500 full authorization for ISO badge; policy-token:src/assets/i18n/en.json#footer.certified:ISO Certified';
  });
  // Inject at the exact mapped location using proper JSON mutation
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'footer.certified', 'ISO Certified');
  const { errors } = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources });
  check(
    'full clean pass: valid ISO exception with exact mapping produces zero errors',
    errors.length === 0,
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EXCEPTION BEHAVIOR TESTS FOR CASE STUDY CLAIMS
// An exact valid exception with owner, future expiry, and approval must permit
// only the mapped retained blocked public surface. Missing/incomplete/expired/
// wrong-map exceptions must fail.
// ══════════════════════════════════════════════════════════════════════════════

// Rule: case study exception must cover the exact mapped public surface, not a different one.
// A valid exception for banking case study's meta.title does NOT permit hero.title reintroduction.
// Use withMutatedJsonSource() to create valid JSON for key-aware rules.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-bank-cloud-migration');
    // Add a valid exception that maps to meta.title path - NOW WITH EXACT MAPPING FORMAT
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-200 exception for meta.title only';
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.banking.meta.title';
  });
  // Now inject a blocked claim into hero.title - should still be rejected
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.banking.hero.title', 'Achieves 42% Cost Reduction');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'case study exception for one path does not permit blocked claim in different path (wrong-map)',
    errors.some((e) => e.includes('case-study-bank-cloud-migration') && e.includes('Achieves 42% Cost Reduction')),
  );
}

// Rule: case study claim with valid exception but missing client approval must still be rejected.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-healthcare-soc-implementation');
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-201 temporary exception';
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.healthcare.hero.title';
    // clientApprovalReference still null - claim cannot be verified
    claim.status = 'verified';
  });
  check(
    'case study with exception but no clientApprovalReference cannot become verified',
    errorsFor(mutated).some((e) => e.includes('must stay "blocked"')),
  );
}

// Rule: case study claim with valid exception but missing metric evidence must still be rejected.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-government-digital-transformation');
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-202 temporary exception';
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.government.hero.title';
    claim.clientApprovalReference = 'Client approved on 2026-08-01';
    // metricEvidencePointer still null - claim cannot be verified
    claim.status = 'verified';
  });
  check(
    'case study with exception and approval but no metricEvidencePointer cannot become verified',
    errorsFor(mutated).some((e) => e.includes('must stay "blocked"')),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RED-CAPABLE SELF-TESTS FOR EACH BLOCKED CLAIM FAMILY
// These tests mutate real EN and AR public source strings and assert that the
// validator correctly rejects reintroduction of blocked copy.
// ══════════════════════════════════════════════════════════════════════════════

// ── pricing-truth-ranges: blocked EGP price claims ────────────────────────────
// Use withMutatedJsonSource() to inject at exact key paths for key-aware rules.
{
  // EN: From 8,500 EGP/mo at home.pricingPreview.business.price
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'home.pricingPreview.business.price', 'From 8,500 EGP/mo');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked pricing-truth-ranges EN "From 8,500 EGP/mo" reintroduction is rejected',
    errors.some((e) => e.includes('From 8,500 EGP/mo')),
  );
}
{
  // EN: $1.50/user/month at services.worldposta.fullDescription
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'services.worldposta.fullDescription', 'Get email storage for just $1.50/user/month');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked pricing-truth-ranges EN "$1.50/user/month" reintroduction is rejected',
    errors.some((e) => e.includes('$1.50/user/month')),
  );
}
{
  // AR: From 2,500 EGP/mo at home.pricingPreview.starter.price
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'home.pricingPreview.starter.price', 'From 2,500 EGP/mo');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked pricing-truth-ranges AR "From 2,500 EGP/mo" reintroduction is rejected',
    errors.some((e) => e.includes('From 2,500 EGP/mo')),
  );
}
{
  // AR: 2,500 جنيه (Arabic EGP) at home.pricingPreview.starter.price
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'home.pricingPreview.starter.price', '2,500 جنيه');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked pricing-truth-ranges AR "2,500 جنيه" reintroduction is rejected',
    errors.some((e) => e.includes('2,500 جنيه')),
  );
}

// ── iso-certification: both public locales must turn red on reintroduction. ────
// Use withMutatedJsonSource() to create valid JSON for key-aware rules.
{
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'footer.certified', 'ISO Certified');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked iso-certification EN footer "ISO Certified" is detected',
    errors.some((e) => e.includes('iso-certification') && e.includes('ISO Certified')),
  );
}
{
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'footer.certified', 'معتمد ISO');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked iso-certification AR footer "معتمد ISO" is detected',
    errors.some((e) => e.includes('iso-certification') && e.includes('معتمد ISO')),
  );
}

// ── cloudspace-definition-taxonomy: CloudSpace plan .50 claim ─────────────────
// Use withMutatedJsonSource() to inject at exact key paths for key-aware rules.
{
  // EN: "CloudSpace" product name at services.worldposta.fullDescription
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'services.worldposta.fullDescription', 'CloudSpace plans start at $1.50 per user/month');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked CloudSpace $1.50 plan copy reintroduction is rejected',
    errors.some((e) => e.includes('CloudSpace')),
  );
}
{
  // EN: $0.50/user at services.worldposta.fullDescription
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'services.worldposta.fullDescription', 'Storage at $0.50/user/month');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked pricing-truth-ranges EN "$0.50/user/month" reintroduction is rejected',
    errors.some((e) => e.includes('pricing-truth-ranges') && e.includes('$0.50/user/month')),
  );
}
{
  // The normalized exact price policy retains the full monthly scalar, owned by
  // pricing-truth-ranges; CloudSpace is independently gated by its own token.
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'services.worldposta.fullDescription', 'CloudSpace storage offering');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked cloudspace-definition-taxonomy EN CloudSpace reintroduction is rejected',
    errors.some((e) => e.includes('cloudspace-definition-taxonomy') && e.includes('CloudSpace')),
  );
}

// ── uptime-generic-outside-cloudedge-posta: blocked ROI/promo copy. ───────────
// Use withMutatedJsonSource() to inject at exact key paths for key-aware rules.
{
  // EN: "Guaranteed ROI" at pricing.trust.roi
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'pricing.trust.roi', 'Guaranteed ROI');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked uptime-generic EN "Guaranteed ROI" is detected',
    errors.some((e) => e.includes('uptime-generic-outside-cloudedge-posta') && e.includes('Guaranteed ROI')),
  );
}
{
  // EN: "guaranteed ROI" lowercase variant at pricing.trust.roiDesc
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'pricing.trust.roiDesc', 'We offer guaranteed ROI.');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked uptime-generic EN "guaranteed ROI" lowercase reintroduction is rejected',
    errors.some((e) => e.includes('guaranteed ROI')),
  );
}
{
  // EN: exact blocked promotional savings / guaranteed-ROI claim at home.newsBar.promo1
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'home.newsBar.promo1', '40% promotional savings with guaranteed ROI');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked uptime-generic EN 40% promotional savings with guaranteed ROI is rejected',
    errors.some((e) => e.includes('40% promotional savings with guaranteed ROI')),
  );
}
{
  // EN: exact blocked 40% savings claim at home.hero.badge
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'home.hero.badge', 'Save up to 40%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked uptime-generic EN "Save up to 40%" reintroduction is rejected',
    errors.some((e) => e.includes('Save up to 40%')),
  );
}
{
  // AR: "عائد استثمار مضمون" at pricing.trust.roi
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'pricing.trust.roi', 'عائد استثمار مضمون');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked uptime-generic AR "عائد استثمار مضمون" is detected',
    errors.some((e) => e.includes('uptime-generic-outside-cloudedge-posta') && e.includes('عائد استثمار مضمون')),
  );
}
{
  // AR: "خصم 40%" (40% discount promo) at home.hero.badge
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'home.hero.badge', 'خصم 40%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked uptime-generic AR "خصم 40%" reintroduction is rejected',
    errors.some((e) => e.includes('خصم 40%')),
  );
}
{
  // AR: "توفير 40%" (40% savings) at home.hero.badge
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'home.hero.badge', 'توفير 40%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked uptime-generic AR "توفير 40%" reintroduction is rejected',
    errors.some((e) => e.includes('توفير 40%')),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RED-CAPABLE SELF-TESTS FOR EACH BLOCKED CASE STUDY CLAIM FAMILY
// Each blocked case study must be tested in both EN and AR for:
//   - meta.title blocked claims (SEO)
//   - hero.title blocked claims (visible headline)
//   - hero.subtitle blocked claims (visible subheadline)
//   - results.metrics blocked values (outcome figures)
// ══════════════════════════════════════════════════════════════════════════════

// ── case-study-bank-cloud-migration (banking) ─────────────────────────────────
// Use withMutatedJsonSource() for key-aware rules to create valid JSON.
{
  // EN: meta.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.banking.meta.title', '42% Cost Reduction - Roaya IT');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-bank-cloud-migration EN meta.title "42% Cost Reduction" is rejected',
    errors.some((e) => e.includes('case-study-bank-cloud-migration') && e.includes('42% Cost Reduction')),
  );
}
{
  // EN: hero.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.banking.hero.title', 'Achieves 42% Cost Reduction');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-bank-cloud-migration EN hero.title "Achieves 42% Cost Reduction" is rejected',
    errors.some((e) => e.includes('case-study-bank-cloud-migration') && e.includes('Achieves 42% Cost Reduction')),
  );
}
{
  // EN: results.metrics blocked 99.94% uptime metric - mutate nested metrics object
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.banking.results.metrics.metric2.value', '99.94%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-bank-cloud-migration EN "99.94%" uptime metric is rejected',
    errors.some((e) => e.includes('case-study-bank-cloud-migration') && e.includes('99.94%')),
  );
}
{
  // AR: meta.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.banking.meta.title', 'خفض التكاليف 42%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-bank-cloud-migration AR meta.title "خفض التكاليف 42%" is rejected',
    errors.some((e) => e.includes('case-study-bank-cloud-migration') && e.includes('خفض التكاليف 42%')),
  );
}
{
  // AR: hero.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.banking.hero.title', 'يحقق خفض 42%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-bank-cloud-migration AR hero.title "يحقق خفض 42%" is rejected',
    errors.some((e) => e.includes('case-study-bank-cloud-migration') && e.includes('يحقق خفض 42%')),
  );
}

// ── case-study-healthcare-soc-implementation (healthcare) ─────────────────────
// Use withMutatedJsonSource() to inject at exact key paths for key-aware rules.
{
  // EN: meta.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.healthcare.meta.title', 'Zero Breaches - Roaya IT');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-healthcare EN meta.title "Zero Breaches" is rejected',
    errors.some((e) => e.includes('case-study-healthcare-soc-implementation') && e.includes('Zero Breaches')),
  );
}
{
  // EN: hero.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.healthcare.hero.title', 'Achieves Zero Breaches with SOC');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-healthcare EN hero.title "Achieves Zero Breaches" is rejected',
    errors.some((e) => e.includes('case-study-healthcare-soc-implementation') && e.includes('Achieves Zero Breaches')),
  );
}
{
  // EN: hero blocked 85% metric - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.healthcare.results.metrics.metric2.value', '85%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-healthcare EN "85%" metric is rejected',
    errors.some((e) => e.includes('case-study-healthcare-soc-implementation') && e.includes('85%')),
  );
}
{
  // AR: meta.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.healthcare.meta.title', 'صفر اختراقات - رؤية');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-healthcare AR meta.title "صفر اختراقات" is rejected',
    errors.some((e) => e.includes('case-study-healthcare-soc-implementation') && e.includes('صفر اختراقات')),
  );
}
{
  // AR: hero.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.healthcare.hero.title', 'تحقق صفر اختراقات');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-healthcare AR hero.title "تحقق صفر اختراقات" is rejected',
    errors.some((e) => e.includes('case-study-healthcare-soc-implementation') && e.includes('تحقق صفر اختراقات')),
  );
}

// ── case-study-government-digital-transformation (government) ─────────────────
// Use withMutatedJsonSource() to inject at exact key paths for key-aware rules.
{
  // EN: meta.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.government.meta.title', '60% Faster Processing - Roaya IT');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-government EN meta.title "60% Faster Processing" is rejected',
    errors.some((e) => e.includes('case-study-government-digital-transformation') && e.includes('60% Faster Processing')),
  );
}
{
  // EN: hero.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.government.hero.title', 'Processing Time by 60%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-government EN hero.title "Processing Time by 60%" is rejected',
    errors.some((e) => e.includes('case-study-government-digital-transformation') && e.includes('Processing Time by 60%')),
  );
}
{
  // EN: hero blocked 92% metric - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.government.results.metrics.metric4.value', '92%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-government EN "92%" metric is rejected',
    errors.some((e) => e.includes('case-study-government-digital-transformation') && e.includes('92%')),
  );
}
{
  // AR: meta.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.government.meta.title', 'معالجة أسرع 60%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-government AR meta.title "معالجة أسرع 60%" is rejected',
    errors.some((e) => e.includes('case-study-government-digital-transformation') && e.includes('معالجة أسرع 60%')),
  );
}
{
  // AR: hero.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.government.hero.title', 'وقت معالجة خدمات المواطنين بنسبة 60%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-government AR hero.title "وقت معالجة خدمات المواطنين بنسبة 60%" is rejected',
    errors.some((e) => e.includes('case-study-government-digital-transformation') && e.includes('وقت معالجة خدمات المواطنين بنسبة 60%')),
  );
}

// ── case-study-manufacturing-sap-implementation (manufacturing) ───────────────
// Use withMutatedJsonSource() to inject at exact key paths for key-aware rules.
{
  // EN: meta.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.manufacturing.meta.title', '35% Inventory Optimization - Roaya IT');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-manufacturing EN meta.title "35% Inventory Optimization" is rejected',
    errors.some((e) => e.includes('case-study-manufacturing-sap-implementation') && e.includes('35% Inventory Optimization')),
  );
}
{
  // EN: hero.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.manufacturing.hero.title', '35% Inventory Optimization Through SAP');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-manufacturing EN hero.title "35% Inventory Optimization" is rejected',
    errors.some((e) => e.includes('case-study-manufacturing-sap-implementation') && e.includes('35% Inventory Optimization')),
  );
}
{
  // EN: hero blocked 25% metric - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.manufacturing.results.metrics.metric2.value', '25%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-manufacturing EN "25%" metric is rejected',
    errors.some((e) => e.includes('case-study-manufacturing-sap-implementation') && e.includes('25%')),
  );
}
{
  // EN: hero blocked 18% metric - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.manufacturing.results.metrics.metric4.value', '18%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-manufacturing EN "18%" metric is rejected',
    errors.some((e) => e.includes('case-study-manufacturing-sap-implementation') && e.includes('18%')),
  );
}
{
  // AR: meta.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.manufacturing.meta.title', 'تحسين المخزون 35%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-manufacturing AR meta.title "تحسين المخزون 35%" is rejected',
    errors.some((e) => e.includes('case-study-manufacturing-sap-implementation') && e.includes('تحسين المخزون 35%')),
  );
}
{
  // AR: hero.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.manufacturing.hero.title', 'تحسين المخزون بنسبة 35%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-manufacturing AR hero.title "تحسين المخزون بنسبة 35%" is rejected',
    errors.some((e) => e.includes('case-study-manufacturing-sap-implementation') && e.includes('تحسين المخزون بنسبة 35%')),
  );
}

// ── case-study-ecommerce-auto-scaling (ecommerce) ─────────────────────────────
// Use withMutatedJsonSource() for key-aware rules to create valid JSON.
{
  // EN: meta.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.ecommerce.meta.title', '300% Traffic Capacity - Roaya IT');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce EN meta.title "300% Traffic Capacity" is rejected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('300% Traffic Capacity')),
  );
}
{
  // EN: hero.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.ecommerce.hero.title', '300% Traffic Surge');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce EN hero.title "300% Traffic Surge" is rejected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('300% Traffic Surge')),
  );
}
{
  // EN: blocked savings claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.ecommerce.hero.subtitle', '40% cost savings');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce EN "40% cost savings" is rejected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('40% cost savings')),
  );
}
{
  // EN: metric "value": "40%" - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.ecommerce.results.metrics.metric3.value', '40%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce EN metric "value": "40%" reintroduction is rejected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('40%')),
  );
}
{
  // AR: meta.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.ecommerce.meta.title', 'سعة حركة مرور 300%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce AR meta.title "سعة حركة مرور 300%" is rejected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('سعة حركة مرور 300%')),
  );
}
{
  // AR: hero.title blocked claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.ecommerce.hero.title', '300% زيادة');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce AR hero.title "300% زيادة" is rejected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('300% زيادة')),
  );
}
{
  // AR: blocked savings claim - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.ecommerce.hero.subtitle', 'وتوفير 40%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce AR "وتوفير 40%" is rejected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('وتوفير 40%')),
  );
}
{
  // AR: metric "value": "40%" - mutate at exact key path
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.ecommerce.results.metrics.metric3.value', '40%');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce AR metric "value": "40%" is rejected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('40%')),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// P0 ROUND-4 FIX: EXACT CURRENT PUBLIC SURFACE RED MUTATIONS
// These tests verify that the exact strings observed by the reviewer in the
// current i18n files are properly caught by the policy.
// ══════════════════════════════════════════════════════════════════════════════

// ── EN ecommerce meta.description: "300% traffic surge" + "zero downtime" ──────
// Use withMutatedJsonSource() to create valid JSON for key-aware rules.
{
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.ecommerce.meta.description', 'Scaled to handle 300% traffic surge during Black Friday');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce EN meta.description "300% traffic surge" is rejected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('300% traffic surge')),
  );
}
{
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.ecommerce.meta.description', 'During Black Friday with zero downtime');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce EN meta.description "with zero downtime" is rejected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('with zero downtime')),
  );
}

// ── EN ecommerce hero.title: "Zero Downtime" ───────────────────────────────────
// Use withMutatedJsonSource() to create valid JSON for key-aware rules.
{
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.ecommerce.hero.title', 'Handles Traffic Surge with Zero Downtime');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce EN hero.title "Zero Downtime" is rejected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('Zero Downtime')),
  );
}

// ── AR banking meta.description: "42%" + "without downtime" (دون أي توقف) ───────
// Use withMutatedJsonSource() to create valid JSON for key-aware rules.
{
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.banking.meta.description', 'لخفض 42% في تكاليف البنية التحتية');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-bank AR meta.description "لخفض 42%" is rejected',
    errors.some((e) => e.includes('case-study-bank-cloud-migration') && e.includes('لخفض 42%')),
  );
}
{
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.banking.meta.description', 'الترحيل السحابي دون أي توقف');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-bank AR meta.description "دون أي توقف" is rejected',
    errors.some((e) => e.includes('case-study-bank-cloud-migration') && e.includes('دون أي توقف')),
  );
}

// ── AR banking hero.title: "without downtime" (دون أي توقف) ─────────────────────
// Use withMutatedJsonSource() to create valid JSON for key-aware rules.
{
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.banking.hero.title', 'ترحيل سحابي دون أي توقف');
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-bank AR hero.title "دون أي توقف" is rejected',
    errors.some((e) => e.includes('case-study-bank-cloud-migration') && e.includes('دون أي توقف')),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WRONG-KEY TOKEN MUTATION TESTS
// A token appearing at a different JSON key path must fail even if it matches
// the forbidden string, because the exception only authorizes the exact mapped key.
// ══════════════════════════════════════════════════════════════════════════════

// Rule: token at wrong key fails - 42% in results.metrics (wrong key) with exception for meta.description
// Use withMutatedJsonSource() to create valid JSON for key-aware rules.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-bank-cloud-migration');
    // Exception maps ONLY to meta.description with exact policy-token marker
    claim.sourcePointer = 'src/assets/i18n/ar.json#caseStudies.banking.meta.description';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-600 exception for meta.description only; policy-token:src/assets/i18n/ar.json#caseStudies.banking.meta.description:لخفض 42%';
  });
  // Inject "لخفض 42%" at results.metrics.metric1.value (different key) - wrong key
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.banking.results.metrics.metric1.value', 'لخفض 42%');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'wrong-key mutation: 42% at results.metrics fails even with meta.description exception',
    errors.some((e) => e.includes('case-study-bank-cloud-migration') && e.includes('لخفض 42%')),
  );
}

// ── pricing-truth-ranges: wrong-key test ─────────────────────────────────────
// Exception for starter.price does NOT authorize the same token at business.price.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'pricing-truth-ranges');
    claim.sourcePointer = 'src/assets/i18n/en.json#home.pricingPreview.starter.price';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-610 starter.price only; policy-token:src/assets/i18n/en.json#home.pricingPreview.starter.price:From 2,500 EGP/mo';
  });
  // Inject at business.price (wrong key)
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'home.pricingPreview.business.price', 'From 8,500 EGP/mo');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'pricing-truth-ranges wrong-key: starter exception does NOT authorize business.price',
    errors.some((e) => e.includes('pricing-truth-ranges') && e.includes('From 8,500 EGP/mo')),
  );
}

// ── cloudspace-definition-taxonomy: wrong-key test ───────────────────────────
// Exception for EN fullDescription does NOT authorize AR fullDescription.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'cloudspace-definition-taxonomy');
    claim.sourcePointer = 'src/assets/i18n/en.json#services.worldposta.fullDescription';
    claim.exceptionOwner = 'Product Manager';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-620 EN only; policy-token:src/assets/i18n/en.json#services.worldposta.fullDescription:CloudSpace';
  });
  // Inject at AR fullDescription (wrong key/file)
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'services.worldposta.fullDescription', 'كلاود سبيس خدمة البريد');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'cloudspace-definition-taxonomy wrong-key: EN exception does NOT authorize AR',
    errors.some((e) => e.includes('cloudspace-definition-taxonomy') && e.includes('كلاود سبيس')),
  );
}

// ── uptime-generic-outside-cloudedge-posta: wrong-key test ───────────────────
// Exception for pricing.trust.roi does NOT authorize home.hero.badge.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'uptime-generic-outside-cloudedge-posta');
    claim.sourcePointer = 'src/assets/i18n/en.json#pricing.trust.roi';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-630 roi only; policy-token:src/assets/i18n/en.json#pricing.trust.roi:Guaranteed ROI';
  });
  // Inject at home.hero.badge (wrong key)
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'home.hero.badge', 'Save up to 40%');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'uptime-generic wrong-key: roi exception does NOT authorize hero.badge 40%',
    errors.some((e) => e.includes('uptime-generic-outside-cloudedge-posta') && e.includes('Save up to 40%')),
  );
}

// ── case-study-healthcare-soc-implementation: wrong-key test ─────────────────
// Exception for meta.title does NOT authorize hero.title.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-healthcare-soc-implementation');
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.healthcare.meta.title';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-640 meta.title only; policy-token:src/assets/i18n/en.json#caseStudies.healthcare.meta.title:Zero Breaches - Roaya IT';
  });
  // Inject at hero.title (wrong key)
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.healthcare.hero.title', 'Achieves Zero Breaches');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'healthcare wrong-key: meta.title exception does NOT authorize hero.title',
    errors.some((e) => e.includes('case-study-healthcare-soc-implementation') && e.includes('Achieves Zero Breaches')),
  );
}

// ── case-study-government-digital-transformation: wrong-key test ─────────────
// Exception for EN meta.title does NOT authorize AR meta.title.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-government-digital-transformation');
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.government.meta.title';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-650 EN meta.title only; policy-token:src/assets/i18n/en.json#caseStudies.government.meta.title:60% Faster Processing - Roaya IT';
  });
  // Inject at AR meta.title (wrong key/file)
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.government.meta.title', 'معالجة أسرع 60%');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'government wrong-key: EN exception does NOT authorize AR meta.title',
    errors.some((e) => e.includes('case-study-government-digital-transformation') && e.includes('معالجة أسرع 60%')),
  );
}

// ── case-study-manufacturing-sap-implementation: wrong-key test ──────────────
// Exception for meta.title does NOT authorize results.metrics.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-manufacturing-sap-implementation');
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.manufacturing.meta.title';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-660 meta.title only; policy-token:src/assets/i18n/en.json#caseStudies.manufacturing.meta.title:35% Inventory Optimization - Roaya IT';
  });
  // Inject at results.metrics (wrong key)
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.manufacturing.results.metrics.metric1.value', '35%');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'manufacturing wrong-key: meta.title exception does NOT authorize metrics',
    errors.some((e) => e.includes('case-study-manufacturing-sap-implementation') && e.includes('35%')),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SIBLING RULE STAYS RED TESTS
// An exception for one policy rule must not authorize a sibling forbidden string
// in the same claim. E.g., authorizing "300% traffic surge" should NOT authorize
// "Zero Downtime" in the same ecommerce case study.
// ══════════════════════════════════════════════════════════════════════════════

// Rule: sibling token stays red - exception for meta.description does not authorize hero.title
// Use withMutatedJsonSource() to create valid JSON for key-aware rules.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-ecommerce-auto-scaling');
    // Exception maps ONLY to meta.description (300% traffic surge)
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.ecommerce.meta.description';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-700 exception for meta.description only';
  });
  // Inject "Zero Downtime" at hero.title (sibling rule not covered by exception)
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.ecommerce.hero.title', 'Platform with Zero Downtime');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'sibling token stays red: meta.description exception does NOT authorize hero.title "Zero Downtime"',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('Zero Downtime')),
  );
}

// Rule: exception authorizes ONLY exact mapped token (green test)
// Use withMutatedJsonSource() to create valid JSON for key-aware rules.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-ecommerce-auto-scaling');
    // Exception maps to meta.description with 300% traffic surge
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.ecommerce.meta.description';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-800 exact meta.description exception; policy-token:src/assets/i18n/en.json#caseStudies.ecommerce.meta.description:300% traffic surge';
  });
  // Inject the exact mapped forbidden string at meta.description
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.ecommerce.meta.description', 'Handle 300% traffic surge during sales');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  // Should NOT have error for the authorized string at the mapped location
  check(
    'exact exception green: meta.description exception authorizes 300% traffic surge at that key',
    !errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('300% traffic surge')),
  );
}

// Rule: approval of one token at the same JSON key must not authorize a sibling token.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-ecommerce-auto-scaling');
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.ecommerce.meta.description';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-801 single-token approval; policy-token:src/assets/i18n/en.json#caseStudies.ecommerce.meta.description:300% traffic surge';
  });
  const sources = withMutatedJsonSource(
    'src/assets/i18n/en.json',
    'caseStudies.ecommerce.meta.description',
    'Scaled for a 300% traffic surge with zero downtime',
  );
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'same-key sibling token stays red: 300% approval does NOT authorize "with zero downtime"',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('with zero downtime')),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SIBLING TOKEN TESTS FOR ALL FAMILIES
// Authorization of one forbidden token must NOT authorize sibling tokens in the
// same claim family, even if they appear at the same JSON key.
// ══════════════════════════════════════════════════════════════════════════════

// ── pricing-truth-ranges: sibling token test ─────────────────────────────────
// Authorization for $1.50/user/month does NOT authorize $0.50/user/month at same key.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'pricing-truth-ranges');
    claim.sourcePointer = 'src/assets/i18n/en.json#services.worldposta.fullDescription';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-810 only $1.50; policy-token:src/assets/i18n/en.json#services.worldposta.fullDescription:$1.50/user/month';
  });
  // Inject $0.50/user/month (sibling token)
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'services.worldposta.fullDescription', 'Storage at $0.50/user/month');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'pricing-truth-ranges sibling: $1.50 approval does NOT authorize $0.50/user/month',
    errors.some((e) => e.includes('pricing-truth-ranges') && e.includes('$0.50/user/month')),
  );
}

// ── iso-certification: sibling token test (EN vs AR at different paths) ──────
// Authorization for EN footer.certified does NOT authorize EN about.milestones.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'iso-certification');
    claim.sourcePointer = 'src/assets/i18n/en.json#footer.certified';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-811 footer only; policy-token:src/assets/i18n/en.json#footer.certified:ISO Certified';
  });
  // Inject at about.milestones (sibling rule)
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'about.milestones.certification.title', 'ISO Certification');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'iso-certification sibling: footer exception does NOT authorize milestones',
    errors.some((e) => e.includes('iso-certification') && e.includes('ISO Certification')),
  );
}

// ── cloudspace-definition-taxonomy: sibling token test ───────────────────────
// Authorization for EN CloudSpace does NOT authorize the AR CloudSpace token.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'cloudspace-definition-taxonomy');
    claim.sourcePointer = 'src/assets/i18n/en.json#services.worldposta.fullDescription';
    claim.exceptionOwner = 'Product Manager';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-812 CloudSpace only; policy-token:src/assets/i18n/en.json#services.worldposta.fullDescription:CloudSpace';
  });
  // Inject the Arabic CloudSpace token at the sibling EN/AR policy location.
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'services.worldposta.fullDescription', 'كلاود سبيس خدمة البريد');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'cloudspace-definition-taxonomy sibling: EN CloudSpace approval does NOT authorize AR CloudSpace',
    errors.some((e) => e.includes('cloudspace-definition-taxonomy') && e.includes('كلاود سبيس')),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FAMILY-WIDE FULL-VALIDATOR EXACT-EXCEPTION GREENS
// Each exceptable blocked family must prove an exact path#key + token approval
// produces zero total validator errors against valid JSON input.
// ══════════════════════════════════════════════════════════════════════════════
for (const { id, path, keyPath, token, owner } of [
  { id: 'pricing-truth-ranges', path: 'src/assets/i18n/en.json', keyPath: 'services.worldposta.fullDescription', token: '$1.50/user/month', owner: 'Marketing Lead' },
  { id: 'cloudspace-definition-taxonomy', path: 'src/assets/i18n/en.json', keyPath: 'services.worldposta.fullDescription', token: 'CloudSpace', owner: 'Product Manager' },
  { id: 'uptime-generic-outside-cloudedge-posta', path: 'src/assets/i18n/en.json', keyPath: 'pricing.trust.roi', token: 'Guaranteed ROI', owner: 'Marketing Lead' },
  { id: 'case-study-bank-cloud-migration', path: 'src/assets/i18n/en.json', keyPath: 'caseStudies.banking.meta.title', token: '42% Cost Reduction - Roaya IT', owner: 'Marketing Lead' },
  { id: 'case-study-healthcare-soc-implementation', path: 'src/assets/i18n/en.json', keyPath: 'caseStudies.healthcare.meta.title', token: 'Zero Breaches - Roaya IT', owner: 'Marketing Lead' },
  { id: 'case-study-government-digital-transformation', path: 'src/assets/i18n/en.json', keyPath: 'caseStudies.government.meta.title', token: '60% Faster Processing - Roaya IT', owner: 'Marketing Lead' },
  { id: 'case-study-manufacturing-sap-implementation', path: 'src/assets/i18n/en.json', keyPath: 'caseStudies.manufacturing.meta.title', token: '35% Inventory Optimization - Roaya IT', owner: 'Marketing Lead' },
  { id: 'case-study-ecommerce-auto-scaling', path: 'src/assets/i18n/en.json', keyPath: 'caseStudies.ecommerce.meta.title', token: '300% Traffic Capacity - Roaya IT', owner: 'Marketing Lead' },
]) {
  const sourcePointer = `${path}#${keyPath}`;
  const mutated = mutate((c) => {
    const claim = findClaim(c, id);
    claim.sourcePointer = sourcePointer;
    claim.exceptionOwner = owner;
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = `TIFO-family-green exact authorization; policy-token:${sourcePointer}:${token}`;
  });
  const sources = withMutatedJsonSource(path, keyPath, token);
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(`${id} exact exception green produces zero total errors`, errors.length === 0);
}

// ── uptime-generic: sibling token test ───────────────────────────────────────
// Authorization for Guaranteed ROI does NOT authorize guaranteed ROI (lowercase).
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'uptime-generic-outside-cloudedge-posta');
    claim.sourcePointer = 'src/assets/i18n/en.json#pricing.trust.roi';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-813 uppercase only; policy-token:src/assets/i18n/en.json#pricing.trust.roi:Guaranteed ROI';
  });
  // Inject guaranteed ROI (lowercase) at pricing.trust.roiDesc (sibling rule)
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'pricing.trust.roiDesc', 'We offer guaranteed ROI for all clients');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'uptime-generic sibling: Guaranteed ROI approval does NOT authorize roiDesc lowercase',
    errors.some((e) => e.includes('uptime-generic-outside-cloudedge-posta') && e.includes('guaranteed ROI')),
  );
}

// ── case-study-bank-cloud-migration: sibling token test ──────────────────────
// Authorization for لخفض 42% does NOT authorize دون أي توقف at same key.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-bank-cloud-migration');
    claim.sourcePointer = 'src/assets/i18n/ar.json#caseStudies.banking.meta.description';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-814 42% only; policy-token:src/assets/i18n/ar.json#caseStudies.banking.meta.description:لخفض 42%';
  });
  // Inject with both tokens - only 42% is authorized
  const sources = withMutatedJsonSource('src/assets/i18n/ar.json', 'caseStudies.banking.meta.description', 'تم تحقيق لخفض 42% في التكاليف دون أي توقف');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'banking sibling: لخفض 42% approval does NOT authorize دون أي توقف at same key',
    errors.some((e) => e.includes('case-study-bank-cloud-migration') && e.includes('دون أي توقف')),
  );
}

// ── case-study-healthcare-soc-implementation: sibling token test ─────────────
// Authorization for Zero Breaches - Roaya IT does NOT authorize Achieves Zero Breaches.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-healthcare-soc-implementation');
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.healthcare.meta.title';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-815 meta.title only; policy-token:src/assets/i18n/en.json#caseStudies.healthcare.meta.title:Zero Breaches - Roaya IT';
  });
  // Inject sibling token at hero.title
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.healthcare.hero.title', 'Achieves Zero Breaches');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'healthcare sibling: meta.title approval does NOT authorize hero.title',
    errors.some((e) => e.includes('case-study-healthcare-soc-implementation') && e.includes('Achieves Zero Breaches')),
  );
}

// ── case-study-government: sibling token test ────────────────────────────────
// Authorization for 60% Faster Processing does NOT authorize Processing Time by 60%.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-government-digital-transformation');
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.government.meta.title';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-816 meta.title only; policy-token:src/assets/i18n/en.json#caseStudies.government.meta.title:60% Faster Processing - Roaya IT';
  });
  // Inject sibling at hero.title
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.government.hero.title', 'Processing Time by 60%');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'government sibling: meta.title approval does NOT authorize hero.title',
    errors.some((e) => e.includes('case-study-government-digital-transformation') && e.includes('Processing Time by 60%')),
  );
}

// ── case-study-manufacturing: sibling token test ─────────────────────────────
// Authorization for 35% does NOT authorize 25% at same results.metrics parent.
{
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-manufacturing-sap-implementation');
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.manufacturing.results.metrics.metric1.value';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = '2027-12-31';
    claim.exceptionApproval = 'TIFO-817 metric1 only; policy-token:src/assets/i18n/en.json#caseStudies.manufacturing.results.metrics.metric1.value:35%';
  });
  // Inject 25% at metric2 (sibling)
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.manufacturing.results.metrics.metric2.value', '25%');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'manufacturing sibling: 35% approval does NOT authorize 25% at sibling metric',
    errors.some((e) => e.includes('case-study-manufacturing-sap-implementation') && e.includes('25%')),
  );
}

// Rule: malformed JSON for a key-aware policy must fail closed rather than fall back to whole-file matching.
{
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/en.json': '{ malformed JSON',
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'key-aware JSON policy fails closed when its source is invalid JSON',
    errors.some((e) => e.includes('iso-certification') && e.includes('cannot parse JSON')),
  );
}

// Rule: missing configured key for a key-aware policy must also fail closed.
{
  const obj = JSON.parse(publicSurfaceFiles['src/assets/i18n/en.json']);
  delete obj.footer.certified;
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/en.json': JSON.stringify(obj),
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'key-aware JSON policy fails closed when its configured key is missing',
    errors.some((e) => e.includes('iso-certification') && e.includes('could not resolve its configured JSON key')),
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CALENDAR EXPIRY VALIDATION TESTS
// Exceptions require real calendar dates strictly after today. Tests cover:
// - Impossible calendar date (2099-99-99) - should fail round-trip validation
// - Today boundary - should fail (must be strictly future)
// - Past date - should fail
// All claim families must enforce these rules.
// ══════════════════════════════════════════════════════════════════════════════

// ── iso-certification: calendar expiry tests ─────────────────────────────────
for (const [label, expiry] of [
  ['impossible calendar date', '2099-99-99'],
  ['today boundary', new Date().toISOString().slice(0, 10)],
  ['past date', '2025-01-01'],
]) {
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'iso-certification');
    claim.sourcePointer = 'src/assets/i18n/en.json#footer.certified';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = expiry;
    claim.exceptionApproval = 'policy-token:src/assets/i18n/en.json#footer.certified:ISO Certified';
  });
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'footer.certified', 'ISO Certified');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(`iso-certification exception with ${label} is rejected`, errors.some((e) => e.includes('exceptionExpiry')));
}

// ── pricing-truth-ranges: calendar expiry tests ──────────────────────────────
for (const [label, expiry] of [
  ['impossible calendar date', '2099-99-99'],
  ['today boundary', new Date().toISOString().slice(0, 10)],
  ['past date', '2024-06-15'],
]) {
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'pricing-truth-ranges');
    claim.sourcePointer = 'src/assets/i18n/en.json#home.pricingPreview.starter.price';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = expiry;
    claim.exceptionApproval = 'policy-token:src/assets/i18n/en.json#home.pricingPreview.starter.price:From 2,500 EGP/mo';
  });
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'home.pricingPreview.starter.price', 'From 2,500 EGP/mo');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(`pricing-truth-ranges exception with ${label} is rejected`, errors.some((e) => e.includes('exceptionExpiry')));
}

// ── cloudspace-definition-taxonomy: calendar expiry tests ────────────────────
for (const [label, expiry] of [
  ['impossible calendar date', '2099-99-99'],
  ['today boundary', new Date().toISOString().slice(0, 10)],
  ['past date', '2023-12-31'],
]) {
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'cloudspace-definition-taxonomy');
    claim.sourcePointer = 'src/assets/i18n/en.json#services.worldposta.fullDescription';
    claim.exceptionOwner = 'Product Manager';
    claim.exceptionExpiry = expiry;
    claim.exceptionApproval = 'policy-token:src/assets/i18n/en.json#services.worldposta.fullDescription:CloudSpace';
  });
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'services.worldposta.fullDescription', 'CloudSpace plan');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(`cloudspace-definition-taxonomy exception with ${label} is rejected`, errors.some((e) => e.includes('exceptionExpiry')));
}

// ── uptime-generic: calendar expiry tests ────────────────────────────────────
for (const [label, expiry] of [
  ['impossible calendar date', '2099-99-99'],
  ['today boundary', new Date().toISOString().slice(0, 10)],
  ['past date', '2025-01-01'],
]) {
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'uptime-generic-outside-cloudedge-posta');
    claim.sourcePointer = 'src/assets/i18n/en.json#pricing.trust.roi';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = expiry;
    claim.exceptionApproval = 'policy-token:src/assets/i18n/en.json#pricing.trust.roi:Guaranteed ROI';
  });
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'pricing.trust.roi', 'Guaranteed ROI');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(`uptime-generic exception with ${label} is rejected`, errors.some((e) => e.includes('exceptionExpiry')));
}

// ── case-study-bank-cloud-migration: calendar expiry tests ───────────────────
for (const [label, expiry] of [
  ['impossible calendar date', '2099-99-99'],
  ['today boundary', new Date().toISOString().slice(0, 10)],
  ['past date', '2024-01-15'],
]) {
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-bank-cloud-migration');
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.banking.meta.title';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = expiry;
    claim.exceptionApproval = 'policy-token:src/assets/i18n/en.json#caseStudies.banking.meta.title:42% Cost Reduction - Roaya IT';
  });
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.banking.meta.title', '42% Cost Reduction - Roaya IT');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(`banking exception with ${label} is rejected`, errors.some((e) => e.includes('exceptionExpiry')));
}

// ── case-study-healthcare: calendar expiry tests ─────────────────────────────
for (const [label, expiry] of [
  ['impossible calendar date', '2099-99-99'],
  ['today boundary', new Date().toISOString().slice(0, 10)],
  ['past date', '2025-02-28'],
]) {
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-healthcare-soc-implementation');
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.healthcare.meta.title';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = expiry;
    claim.exceptionApproval = 'policy-token:src/assets/i18n/en.json#caseStudies.healthcare.meta.title:Zero Breaches - Roaya IT';
  });
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.healthcare.meta.title', 'Zero Breaches - Roaya IT');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(`healthcare exception with ${label} is rejected`, errors.some((e) => e.includes('exceptionExpiry')));
}

// ── case-study-government: calendar expiry tests ─────────────────────────────
for (const [label, expiry] of [
  ['impossible calendar date', '2099-99-99'],
  ['today boundary', new Date().toISOString().slice(0, 10)],
  ['past date', '2024-07-04'],
]) {
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-government-digital-transformation');
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.government.meta.title';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = expiry;
    claim.exceptionApproval = 'policy-token:src/assets/i18n/en.json#caseStudies.government.meta.title:60% Faster Processing - Roaya IT';
  });
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.government.meta.title', '60% Faster Processing - Roaya IT');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(`government exception with ${label} is rejected`, errors.some((e) => e.includes('exceptionExpiry')));
}

// ── case-study-manufacturing: calendar expiry tests ──────────────────────────
for (const [label, expiry] of [
  ['impossible calendar date', '2099-99-99'],
  ['today boundary', new Date().toISOString().slice(0, 10)],
  ['past date', '2024-03-01'],
]) {
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-manufacturing-sap-implementation');
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.manufacturing.meta.title';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = expiry;
    claim.exceptionApproval = 'policy-token:src/assets/i18n/en.json#caseStudies.manufacturing.meta.title:35% Inventory Optimization - Roaya IT';
  });
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.manufacturing.meta.title', '35% Inventory Optimization - Roaya IT');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(`manufacturing exception with ${label} is rejected`, errors.some((e) => e.includes('exceptionExpiry')));
}

// ── case-study-ecommerce: calendar expiry tests ──────────────────────────────
for (const [label, expiry] of [
  ['impossible calendar date', '2099-99-99'],
  ['today boundary', new Date().toISOString().slice(0, 10)],
  ['past date', '2024-11-29'],
]) {
  const mutated = mutate((c) => {
    const claim = findClaim(c, 'case-study-ecommerce-auto-scaling');
    claim.sourcePointer = 'src/assets/i18n/en.json#caseStudies.ecommerce.meta.title';
    claim.exceptionOwner = 'Marketing Lead';
    claim.exceptionExpiry = expiry;
    claim.exceptionApproval = 'policy-token:src/assets/i18n/en.json#caseStudies.ecommerce.meta.title:300% Traffic Capacity - Roaya IT';
  });
  const sources = withMutatedJsonSource('src/assets/i18n/en.json', 'caseStudies.ecommerce.meta.title', '300% Traffic Capacity - Roaya IT');
  const errors = validateRegistry(mutated, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(`ecommerce exception with ${label} is rejected`, errors.some((e) => e.includes('exceptionExpiry')));
}

if (failures > 0) {
  console.error(`\n${failures} self-test check(s) FAILED — validator is not red-capable.`);
  process.exitCode = 1;
} else {
  console.log('\nAll self-test checks passed — validator correctly rejects every mutated input.');
}
