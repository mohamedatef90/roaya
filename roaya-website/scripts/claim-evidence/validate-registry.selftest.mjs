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
  return validateRegistry(mutatedJson, { caseStudySlugs }).errors;
}

// Baseline must pass clean.
{
  const { errors } = validateRegistry(baselineJson, { caseStudySlugs });
  check('baseline registry.json passes with zero errors', errors.length === 0);
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

if (failures > 0) {
  console.error(`\n${failures} self-test check(s) FAILED — validator is not red-capable.`);
  process.exitCode = 1;
} else {
  console.log('\nAll self-test checks passed — validator correctly rejects every mutated input.');
}
