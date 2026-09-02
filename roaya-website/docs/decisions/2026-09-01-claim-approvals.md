# Decision record — claim approvals (2026-09-01)

**Decided by:** Product owner (git user MoAtef, devai@roaya.co), in-session
decision on 2026-09-01, following the findings of
`memory-bank/Audit/AI_Readiness_Audit_2026-09-01.md` (P0 — resolve factual and
claim ambiguity).

## 1. Founding year: 2012

The 2018-vs-2012 ambiguity (recorded in `docs/ai-readiness-human-gates.md`) is
resolved in favor of **2012**, matching the LinkedIn company record
(https://www.linkedin.com/company/roayait). Applied to:

- `src/app/core/seo/entity-taxonomy.ts` → `ORGANIZATION_FOUNDING_DATE = '2012'`
- `src/assets/i18n/en.json` → `about.story.p1` ("Founded in 2012, …")
- `src/assets/i18n/ar.json` → `about.story.p1` ("تأسست … في 2012")
- `public/llms.txt` → "founded in 2012"
- `src/app/features/about/about.component.ts` → years-experience stat `14+`
  (2026 − 2012), replacing `6+` which followed from the 2018 year.

Follow-up owned by marketing: keep LinkedIn, Google Business Profile,
directories, and partner profiles consistent with 2012.

## 2. Quantitative claims: approved

The product owner approved the quantitative claims currently published on the
site (client count, team size, per-case-study outcome metrics as scoped in the
claim registry). Scope notes that remain **unchanged and binding**:

- The 99.99% uptime figure stays scoped to CloudEdge/Posta only
  (`uptime-cloudedge-posta-9999`); per-case-study uptime figures remain
  per-engagement and must not be generalized
  (`uptime-generic-outside-cloudedge-posta` stays blocked).
- `iso-certification`, `pricing-truth-ranges`, and
  `cloudspace-definition-taxonomy` remain blocked — this approval does not
  cover them.

## 3. Case studies: approved for publication

All five current case studies are approved by the product owner for
publication with their stated outcome figures:

- bank-cloud-migration
- healthcare-soc-implementation
- government-digital-transformation
- manufacturing-sap-implementation
- ecommerce-auto-scaling

This record serves as the `clientApprovalReference` and
`metricEvidencePointer` target in `scripts/claim-evidence/registry.json`.
If written per-client approval documents or metric evidence files are added
later, update the registry pointers to cite them directly.
