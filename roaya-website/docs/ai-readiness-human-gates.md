# AI-readiness human gates (TIFO-16)

This is a **checklist**, not proof. Checking a box here means a human
performed that step for a specific change; it is not verified or enforced by
`npm run ai-readiness` or any other script in this repo. Nothing in this
document should be read as evidence that any of these actions have already
happened for the current change — it exists so the required human review
points are explicit and cannot be silently skipped.

The automated layer (`scripts/claim-evidence/` + `scripts/ai-readiness/`,
see `npm run verify:evidence`) covers 11 evidence checks deterministically
verifiable from local source/build state:

1. **robots-policy** — robots.txt policy, bot allow/deny decisions
2. **sitemap-validity** — sitemap.xml validity, canonical URLs, duplicates
3. **llms-txt** — llms.txt validator, MIME config, prohibited assertions
4. **canonical-metadata-coverage** — route registry vs sitemap reconciliation
5. **json-ld-exclusion-gates** — JSON-LD validity, hard-exclusion tokens
6. **pentest-v2-canonicalization** — Express 301 legacy redirects
7. **industry-route-integrity** — closed industry registry enforcement
8. **case-study-route-integrity** — case-study routing/404 integrity
9. **approved-factual-consistency** — claim-evidence registry + source pointers
10. **machine-files-in-build** — machine files in production build
11. **real-unknown-route-404** — real HTTP 404 via local SSR server

The checks verify:
- **58 prerendered routes** emitted in the production build
- **JSON-LD coverage** on `/`, `/about`, `/services/worldposta` (ROUTE_ENTITY_MAP)
- **Express 301 redirects** for pentest-v2 canonicalization (both locales)
- **Closed industry registry** with RESPONSE_INIT 404 for unknown IDs
- **Deferred repository cleanup** — 11,683 tracked root `node_modules/**` files
  remain intentionally deferred. Removing tracked dependency artifacts is a broad,
  destructive VCS cleanup and must be planned separately so the deployment/build
  workflow can be verified from a clean checkout.
- **Residual production security gate** — `npm audit --omit=dev` reports one
  low-severity direct `quill@2.0.3` HTML-export XSS (`GHSA-v3m3-f69x-jf25`).
  `npm` marks the available remediation as a semver-major change; the **Roaya CMS
  owner** must validate editor/export compatibility and a named human security
  reviewer must approve the migration before the finding may be considered closed.

The automated layer cannot and does not substitute for the gates below.

## 1. Per-case-study approval and metric evidence

Before any case study in `scripts/claim-evidence/registry.json` moves out of
`status: "blocked"`:

- [ ] A written, dated client-approval reference exists for the specific
      published copy (name usage, quotes, and figures) and is recorded in
      `clientApprovalReference`.
- [ ] A metric-evidence pointer (internal report, signed-off dataset, or
      equivalent) backs every number rendered on that case study's page and
      is recorded in `metricEvidencePointer`.
- [ ] Both fields are reviewed by whoever owns client relationships before
      the entry's `status` changes from `"blocked"`.
- [ ] `npm run validate:claims` is re-run after the edit and passes.

## 2. Blocked public surface exception policy

Blocked registry entries (`status: "blocked"`) that point to publicly rendered
surfaces (i18n keys, component templates) must now carry documented exception
fields or have their `sourcePointer` set to `null` after remediation.

**Validator enforcement:** `scripts/claim-evidence/validate-registry.mjs`
rejects any blocked claim with a `sourcePointer` matching public surface
prefixes unless all three exception fields are present and valid:

- `exceptionOwner` — named human approving the temporary exception
- `exceptionExpiry` — future YYYY-MM-DD date when the exception expires
- `exceptionApproval` — reference (ticket, email, decision record)

**When to use exceptions vs. remediation:**

- **Remediate** (set `sourcePointer: null`): When blocked copy has been
  removed or qualified (e.g., "ISO Certification" → "Industry Standards")
- **Exception**: When blocked copy must remain temporarily visible with
  explicit human approval and an expiry date for follow-up

**Self-test coverage:** `npm run test:claims:selftest` includes red-capable
tests proving the validator correctly rejects:
- Blocked public-surface claims without exception fields
- Blocked public-surface claims with incomplete exceptions
- Blocked public-surface claims with expired exceptions

## 3. Push / PR / CI review

- [ ] Changes are pushed to a branch and opened as a PR (this issue's Agent
      Identity forbids the agent from doing this itself).
- [ ] At least one human reviewer approves the PR.
- [ ] CI (typecheck, unit tests, `npm run verify:evidence`, production build)
      is green on the PR's head commit — not just on a local machine.

## 4. Pre-merge verification against a local production build

There is no preview environment — the self-hosted nginx origin is the only
deployment target. So this gate runs against a real production build on the
reviewer's machine, which is a closer match to production than a preview host
would have been anyway (same artifact, same Node entry point).

```bash
cd roaya-website
DRY_RUN=1 ./deploy/scripts/deploy-ssr.sh   # build + full evidence suite, ships nothing
PORT=4200 node dist/roaya-website/server/server.mjs
```

Then confirm:

- [ ] **Build gates passed** — `verify:evidence` reported 11/11 and the script
      did not abort on the prerendered-route count.
- [ ] **58 prerendered routes emitted** —
      `find dist/roaya-website/browser -name index.html | wc -l` returns 58.
      A lower number means prerendering failed silently; `ng build` exits 0
      when it does, so this count is the only cheap signal.
- [ ] **SSR runtime, not a static shell** — a sample of canonical routes
      returns HTTP 200 with real content in the first response, each with its
      own route-specific `<title>` (not a shared shell title).
- [ ] **JSON-LD where it is registered** — the routes in `ROUTE_ENTITY_MAP`
      (`/`, `/about`, `/services/worldposta`) carry a
      `<script type="application/ld+json">` graph. Other routes are not
      supposed to have one — absence there is not a defect.
- [ ] **Canonical links** — each route has a correct self-referencing
      `<link rel="canonical">`.
- [ ] **Real 404** — an unregistered path returns HTTP 404, not a 200 with a
      client-side "not found" component.
- [ ] **Machine files** — `/robots.txt`, `/sitemap.xml`, and `/llms.txt` are
      reachable and byte-identical to `public/`. Their **content types** and
      the security headers are nginx's responsibility, not the Node server's,
      so they are verified post-deploy against the host — see
      `docs/deploy/verification-checklist.md`. The config side of that
      guarantee is enforced automatically by the `llms-txt` check, which
      parses `deploy/nginx/roaya-website.conf`.

## 5. Production deployment / rollback approval

- [ ] A named human approves the production deployment after the Preview
      checks above pass.
- [ ] The rollback path (previous production deployment/alias) is identified
      and confirmed reachable *before* promoting, not after an incident.
- [ ] DNS/CDN/WAF configuration is unchanged, or any intended change is
      separately reviewed and approved (out of scope for any agent run under
      this issue's Agent Identity).

## 6. Ambiguous factual claims requiring human decision

The following facts have conflicting or ambiguous source evidence. Do **NOT**
change these values without explicit human verification of the correct answer.
The agent is instructed not to invent, remove, or modify these without explicit
human approval.

### Organization founding year

**Current value:** `2018` (in `src/app/core/seo/entity-taxonomy.ts` and
`src/assets/i18n/en.json` "about.story.p1")

**Ambiguity:** Some LinkedIn references or early external sources may show
2012 as Roaya's founding year. The approved English content ("Founded in 2018,
Roaya IT emerged from...") uses 2018. If 2012 is actually correct, the
translation files and `ORGANIZATION_FOUNDING_DATE` in entity-taxonomy.ts must
both be updated by a human after verification.

**Status:** Awaiting human verification.

### pentest-v2 redirect implementation

**Current implementation:** Express server-level 301 redirects in `src/server.ts`
for both `/services/security/pentest-v2` and `/ar/services/security/pentest-v2`,
with Angular client-side fallback (`redirectTo: 'services/security/penetration-testing'`).

**Verification:** The `pentest-v2-canonicalization` evidence check validates:
- Express 301 redirects exist for both locales
- pentest-v2 is removed from sitemap.xml
- pentest-v2 is not in route-metadata.ts or breadcrumbs
- Canonical penetration-testing route is prerendered

**Status:** ✓ Express 301 redirects implemented and verified by automated check.

---

None of the sections above are satisfied by running
`npm run verify:evidence` or by an agent posting a comment. They require a
named human to perform the action and record that they did.
