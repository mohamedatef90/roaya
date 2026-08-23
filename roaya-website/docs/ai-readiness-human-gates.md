# AI-readiness human gates (TIFO-16)

This is a **checklist**, not proof. Checking a box here means a human
performed that step for a specific change; it is not verified or enforced by
`npm run ai-readiness` or any other script in this repo. Nothing in this
document should be read as evidence that any of these actions have already
happened for the current change — it exists so the required human review
points are explicit and cannot be silently skipped.

The automated layer (`scripts/claim-evidence/` + `scripts/ai-readiness/`,
see `npm run verify:evidence`) only covers what is deterministically
checkable from local source/build state: the claim/evidence registry,
robots/sitemap/llms.txt, route-metadata/JSON-LD coverage, case-study routing,
and a real 404 against a locally built server. It cannot and does not
substitute for the gates below.

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

## 2. Push / PR / CI review

- [ ] Changes are pushed to a branch and opened as a PR (this issue's Agent
      Identity forbids the agent from doing this itself).
- [ ] At least one human reviewer approves the PR.
- [ ] CI (typecheck, unit tests, `npm run verify:evidence`, production build)
      is green on the PR's head commit — not just on a local machine.

## 3. Vercel Preview verification

Before merging, a human opens the PR's Vercel Preview URL and confirms:

- [ ] **Root directory** — the Preview built from `roaya-website/` (not the
      repo root or `backend/`).
- [ ] **SSR runtime** — the Preview is serving the Angular SSR bundle
      (`dist/roaya-website/server`), not a static-only fallback.
- [ ] **www redirect** — `https://www.<preview-domain>` redirects to the
      apex/preview host exactly as `vercel.json`'s redirect rule intends for
      production (`www.roaya.co` → `roaya.co`), adapted for the preview URL.
- [ ] **Headers/content types** — `/robots.txt`, `/sitemap.xml`, and
      `/llms.txt` are served with the `Content-Type` values in `vercel.json`,
      and the security headers (`Strict-Transport-Security`,
      `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) are
      present on a normal page response.
- [ ] **Raw HTML / status / canonical / JSON-LD / llms** — `curl` (or "view
      source") on a sample of canonical routes confirms: HTTP 200 with real
      content in the first response (not just a client-rendered shell), a
      correct self-referencing `<link rel="canonical">`, the expected
      JSON-LD `<script type="application/ld+json">` graph for routes that
      should carry one, and that `/llms.txt` is reachable and matches
      `public/llms.txt`.
- [ ] An unregistered path returns a real HTTP 404 on the Preview, not a 200
      with a client-side "not found" component.

## 4. Production deployment / rollback approval

- [ ] A named human approves the production deployment after the Preview
      checks above pass.
- [ ] The rollback path (previous production deployment/alias) is identified
      and confirmed reachable *before* promoting, not after an incident.
- [ ] DNS/CDN/WAF configuration is unchanged, or any intended change is
      separately reviewed and approved (out of scope for any agent run under
      this issue's Agent Identity).

---

None of the four sections above are satisfied by running
`npm run verify:evidence` or by an agent posting a comment. They require a
named human to perform the action and record that they did.
