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

## 3. Pre-merge verification against a local production build

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

- [ ] **Build gates passed** — `verify:evidence` reported 9/9 and the script
      did not abort on the prerendered-route count.
- [ ] **30 prerendered routes emitted** —
      `find dist/roaya-website/browser -name index.html | wc -l` returns 30.
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
