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

// Baseline must pass cleanly before mutations prove each rejection rule turns red.
{
  const { errors } = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles });
  check('baseline registry.json passes with zero errors', errors.length === 0);
}

// Rule: a mutation of a real public source back to a blocked price must fail.
{
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/en.json': `${publicSurfaceFiles['src/assets/i18n/en.json']}\nFrom 2,500 EGP/mo`,
  };
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
    errorsFor(mutated).some((e) => e.includes('exceptionExpiry') && e.includes('passed')),
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
// RED-CAPABLE SELF-TESTS FOR EACH BLOCKED CLAIM FAMILY
// These tests mutate real EN and AR public source strings and assert that the
// validator correctly rejects reintroduction of blocked copy.
// ══════════════════════════════════════════════════════════════════════════════

// ── pricing-truth-ranges: blocked EGP price claims ────────────────────────────
{
  // EN: From 8,500 EGP/mo
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/en.json': publicSurfaceFiles['src/assets/i18n/en.json'] + '\n"price": "From 8,500 EGP/mo"',
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked pricing-truth-ranges EN "From 8,500 EGP/mo" reintroduction is rejected',
    errors.some((e) => e.includes('From 8,500 EGP/mo')),
  );
}
{
  // EN: $1.50/user/month (CloudSpace .50 claim variant)
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/en.json': publicSurfaceFiles['src/assets/i18n/en.json'] + '\n"cloudspace": "$1.50/user/month"',
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked pricing-truth-ranges EN "$1.50/user/month" reintroduction is rejected',
    errors.some((e) => e.includes('$1.50/user/month')),
  );
}
{
  // AR: From 2,500 EGP/mo
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/ar.json': publicSurfaceFiles['src/assets/i18n/ar.json'] + '\n"price": "From 2,500 EGP/mo"',
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked pricing-truth-ranges AR "From 2,500 EGP/mo" reintroduction is rejected',
    errors.some((e) => e.includes('From 2,500 EGP/mo')),
  );
}
{
  // AR: 2,500 جنيه (Arabic EGP)
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/ar.json': publicSurfaceFiles['src/assets/i18n/ar.json'] + '\n"price": "2,500 جنيه"',
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked pricing-truth-ranges AR "2,500 جنيه" reintroduction is rejected',
    errors.some((e) => e.includes('2,500 جنيه')),
  );
}

// ── iso-certification: both public locales must turn red on reintroduction. ────
{
  const sources = { ...publicSurfaceFiles, 'src/assets/i18n/en.json': `${publicSurfaceFiles['src/assets/i18n/en.json']}\n"certified": "ISO Certified"` };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked iso-certification EN footer "ISO Certified" is detected',
    errors.some((e) => e.includes('iso-certification') && e.includes('ISO Certified')),
  );
}
{
  const sources = { ...publicSurfaceFiles, 'src/assets/i18n/ar.json': `${publicSurfaceFiles['src/assets/i18n/ar.json']}\n"certified": "معتمد ISO"` };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked iso-certification AR footer "معتمد ISO" is detected',
    errors.some((e) => e.includes('iso-certification') && e.includes('معتمد ISO')),
  );
}

// ── cloudspace-definition-taxonomy: CloudSpace plan .50 claim ─────────────────
{
  // EN: "CloudSpace" product name - this should NOT be in current baseline
  // (CloudSpace was remediated), so we test by adding it to verify detection
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/en.json': publicSurfaceFiles['src/assets/i18n/en.json'] + '\n"copy": "CloudSpace plans start at $1.50 per user/month"',
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked CloudSpace $1.50 plan copy reintroduction is rejected',
    errors.some((e) => e.includes('CloudSpace plans start at $1.50 per user/month')),
  );
}
{
  // EN: $0.50/user (another .50 claim variant)
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/en.json': publicSurfaceFiles['src/assets/i18n/en.json'] + '\n"price": "$0.50/user"',
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked cloudspace-definition-taxonomy EN "$0.50/user" reintroduction is rejected',
    errors.some((e) => e.includes('$0.50/user')),
  );
}
{
  // AR: كلاود سبيس (CloudSpace in Arabic)
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/ar.json': publicSurfaceFiles['src/assets/i18n/ar.json'] + '\n"product": "كلاود سبيس"',
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked cloudspace-definition-taxonomy AR "كلاود سبيس" reintroduction is rejected',
    errors.some((e) => e.includes('كلاود سبيس')),
  );
}

// ── uptime-generic-outside-cloudedge-posta: blocked ROI/promo copy. ───────────
{
  const sources = { ...publicSurfaceFiles, 'src/assets/i18n/en.json': `${publicSurfaceFiles['src/assets/i18n/en.json']}\n"roi": "Guaranteed ROI"` };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked uptime-generic EN "Guaranteed ROI" is detected',
    errors.some((e) => e.includes('uptime-generic-outside-cloudedge-posta') && e.includes('Guaranteed ROI')),
  );
}
{
  // EN: "guaranteed ROI" lowercase variant
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/en.json': publicSurfaceFiles['src/assets/i18n/en.json'] + '\n"description": "We offer guaranteed ROI."',
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked uptime-generic EN "guaranteed ROI" lowercase reintroduction is rejected',
    errors.some((e) => e.includes('guaranteed ROI')),
  );
}
{
  // EN: exact blocked promotional savings / guaranteed-ROI claim.
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/en.json': publicSurfaceFiles['src/assets/i18n/en.json'] + '\n"promo": "40% promotional savings with guaranteed ROI"',
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked uptime-generic EN 40% promotional savings with guaranteed ROI is rejected',
    errors.some((e) => e.includes('40% promotional savings with guaranteed ROI')),
  );
}
{
  // EN: exact blocked 40% savings claim.
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/en.json': publicSurfaceFiles['src/assets/i18n/en.json'] + '\n"badge": "Save up to 40%"',
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked uptime-generic EN "Save up to 40%" reintroduction is rejected',
    errors.some((e) => e.includes('Save up to 40%')),
  );
}
{
  const sources = { ...publicSurfaceFiles, 'src/assets/i18n/ar.json': `${publicSurfaceFiles['src/assets/i18n/ar.json']}\n"roi": "عائد استثمار مضمون"` };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked uptime-generic AR "عائد استثمار مضمون" is detected',
    errors.some((e) => e.includes('uptime-generic-outside-cloudedge-posta') && e.includes('عائد استثمار مضمون')),
  );
}
{
  // AR: "خصم 40%" (40% discount promo)
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/ar.json': publicSurfaceFiles['src/assets/i18n/ar.json'] + '\n"promo": "خصم 40%"',
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked uptime-generic AR "خصم 40%" reintroduction is rejected',
    errors.some((e) => e.includes('خصم 40%')),
  );
}
{
  // AR: "توفير 40%" (40% savings)
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/ar.json': publicSurfaceFiles['src/assets/i18n/ar.json'] + '\n"savings": "توفير 40%"',
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked uptime-generic AR "توفير 40%" reintroduction is rejected',
    errors.some((e) => e.includes('توفير 40%')),
  );
}

// ── case-study-ecommerce-auto-scaling: blocked metric and savings copy. ───────
{
  const sources = { ...publicSurfaceFiles, 'src/assets/i18n/en.json': `${publicSurfaceFiles['src/assets/i18n/en.json']}\n"subtitle": "40% cost savings"` };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce EN "40% cost savings" is detected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('40% cost savings')),
  );
}
{
  // EN: metric "value": "40%" - not in EN baseline, test by adding
  const sources = {
    ...publicSurfaceFiles,
    'src/assets/i18n/en.json': publicSurfaceFiles['src/assets/i18n/en.json'] + '\n"value": "40%"',
  };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce EN metric "value": "40%" reintroduction is rejected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('40%')),
  );
}
{
  const sources = { ...publicSurfaceFiles, 'src/assets/i18n/ar.json': `${publicSurfaceFiles['src/assets/i18n/ar.json']}\n"subtitle": "وتوفير 40%"` };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce AR "وتوفير 40%" is detected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('وتوفير 40%')),
  );
}
{
  const sources = { ...publicSurfaceFiles, 'src/assets/i18n/ar.json': `${publicSurfaceFiles['src/assets/i18n/ar.json']}\n"value": "40%"` };
  const errors = validateRegistry(baselineJson, { caseStudySlugs, publicSurfaceFiles: sources }).errors;
  check(
    'blocked case-study-ecommerce AR metric "value": "40%" is detected',
    errors.some((e) => e.includes('case-study-ecommerce-auto-scaling') && e.includes('40%')),
  );
}

if (failures > 0) {
  console.error(`\n${failures} self-test check(s) FAILED — validator is not red-capable.`);
  process.exitCode = 1;
} else {
  console.log('\nAll self-test checks passed — validator correctly rejects every mutated input.');
}
