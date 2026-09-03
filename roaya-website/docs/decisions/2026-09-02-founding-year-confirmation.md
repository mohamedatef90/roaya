# Decision record — founding year confirmed as 2012 (2026-09-02)

**Decided by:** Product owner (git user MoAtef, devai@roaya.co), in-session confirmation on
2026-09-02, following `memory-bank/Audit/AI_Readiness_Reconciliation_2026-09-02.md`.

## Decision

**Roaya IT was founded in 2012.** This confirms the 2026-09-01 decision
(`2026-09-01-claim-approvals.md`) rather than changing it, and closes the ambiguity an
external reviewer reported on 2026-09-02 when they read the About page and concluded the
company was founded in 2018.

## Why the ambiguity survived the first decision

The 2026-09-01 change set applied 2012 to the story paragraph, the JSON-LD constant,
`llms.txt` and the About years figure — but not to the About page's own timeline, whose
first milestone still read "2018 — Company Founded", nor to the homepage, which still
published "10+ Years Experience". A reader of the About page saw both years on one screen.
Nothing in the build compared the surfaces to each other, so nothing failed.

## Surfaces that now state or derive the year

| Surface | Value |
|---|---|
| `src/app/core/seo/entity-taxonomy.ts` → `ORGANIZATION_FOUNDING_DATE` (JSON-LD `foundingDate`) | `2012` |
| `src/assets/i18n/en.json` → `about.story.p1` | "Founded in 2012, …" |
| `src/assets/i18n/ar.json` → `about.story.p1` | "تأسست … في 2012" |
| `src/app/features/about/about.component.ts` → first milestone | `2012` |
| `public/llms.txt` | "founded in 2012" |
| `about.component.ts` stats → years | `14+` |
| `home.component.ts` stats → years | `14` |

Verified as served: `foundingDate` is `2012` on `/`, `/about` and `/ar/about`; both locales
render `14+`; the string `2018` no longer appears on any of them.

## Enforcement

The `company-facts-consistency` AI-readiness check reads the founding year from
`ORGANIZATION_FOUNDING_DATE` and fails the build when any surface disagrees with it, when
the story paragraph names a second year, or when a years-experience figure is not the number
of years actually elapsed. Five self-tests cover those cases, including a replay of the
2018-vs-2012 bug. When the year rolls over, the check fails and names both files to bump.

## Not covered by this decision

- The remaining About timeline years (2019 WorldPosta partnership, 2021 service expansion,
  2023 industry standards, 2024 the 150-client milestone) are still unverified. See
  `2026-09-02-pending-decisions.md` item 3.
- `services.aws.hero.*` publishes "10+ years of cloud experience". That is a claim about
  cloud practice, not company age, so it is deliberately left alone — but it invites the
  question of why the two numbers differ. Confirm or align it.
- External profiles (LinkedIn, Google Business Profile, Wuzzuf, partner directories) are
  owned by marketing and are not checked by any gate.
