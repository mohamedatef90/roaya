# Pending product-owner decisions — AI readiness (2 September 2026)

Source: external second review (71/100) reconciled against production in
`memory-bank/Audit/AI_Readiness_Reconciliation_2026-09-02.md`. Everything below is a
fact, policy, or permission that engineering cannot decide. Each item says what is
published today, what the reviewer or the internal plan requires, and the options.

Decisions taken here should be recorded the same way as
`2026-09-01-claim-approvals.md` and mirrored into `scripts/claim-evidence/registry.json`.

## 1. Support coverage and response-time policy (review P0 — "support conflict")

Published today: "24/7 Support" (homepage, About, Services), "Egyptian support team
available 24/7 in your time zone and language" and `<1hr` response (Services). No
support page exists (`/support` → 404). A dead translation key promised a "15-Minute
Response" and has been deleted.

Needed: one published matrix, then every page links to it.

| Service | Coverage (hours, time zone) | Channels | Target response | Languages |
|---|---|---|---|---|
| Sales and onboarding | ☐ | ☐ | ☐ | Arabic / English |
| Standard managed support | ☐ | ☐ | ☐ | ☐ |
| Critical cloud incidents (Sev-1) | ☐ 24/7 only if true | ☐ | ☐ | ☐ |
| SOC monitoring | ☐ 24/7 only if true | ☐ | detection / triage target ☐ | ☐ |
| Incident response | ☐ 24/7 if contracted | ☐ | initial response target ☐ | ☐ |

Decision: fill the matrix; approve publishing it at `/support` (EN + AR). Until then the
`<1hr` figure on Services should be qualified ("for eligible plans, Sev-1") or removed.

## 2. Authoritative availability SLA figures

Published today:

| Figure | Where | Registry status |
|---|---|---|
| 99.9% | homepage hero and stats, About stats, Services stats, pricing Professional plan, email features | **Not registered** (de facto site figure) |
| 99.99% | WorldPosta CloudEdge/Posta pages | Verified, scope closed to CloudEdge/Posta |
| 99.99% | pricing Enterprise plan "99.99% uptime SLA" | Conflicts with the closed scope unless the plan runs on CloudEdge/Posta |
| 99.95% | homepage (hard-coded) | Removed in this change set (→ 99.9%) |
| 99.99% | homepage healthcare card, manufacturing industry description | Removed in this change set (generalised per-engagement figures) |

Decisions:
- Confirm 99.9% monthly availability as the site-wide contractual figure and register it
  (`uptime-site-999`, scope, measurement window, exclusions, credits).
- Decide what the Enterprise pricing plan may promise.
- Approve an `/sla` page covering: services covered, monthly calculation, planned
  maintenance, exclusions, measurement source, credit process, plan limitations.

## 3. About-page timeline years

**Resolved:** the founding year is 2012, reconfirmed by the product owner on 2026-09-02 and
now enforced by the `company-facts-consistency` gate. See
`2026-09-02-founding-year-confirmation.md`.

**Still open** — the remaining milestone years are unverified: 2019 WorldPosta partnership,
2021 service expansion, 2023 "Industry Standards", 2024 "150+ clients". Confirm each year or
remove the entry. The external reviewer quoted "partner since 2019" from this timeline.

Also open: `services.aws.hero.*` publishes "10+ years of cloud experience" while the company
is 14 years old. The two are different claims and neither is wrong, but confirm the 10+
figure or align it so the difference is not read as an inconsistency.

## 4. Claims qualified in code — confirm the new wording

These were unsupported or out of scope against the claim registry and were reworded rather
than deleted, so nothing disappeared from the page. Confirm or replace the wording.

| Was | Now | Why |
|---|---|---|
| Badges "ISO 27001", "ISO 9001", "SOC 2", "GDPR" with descriptions like "Information Security" | "ISO 27001 aligned" etc. with "…controls / practices" | Registry claim `iso-certification` is blocked: no certificate on file. Alignment is what the Services page already states |
| "Military-Grade Encryption" (homepage), "military-grade encryption" (backup page) | "Encryption in Transit and at Rest" / "encryption in transit and at rest" | The action plan names this phrase specifically as one to replace with a stated control |
| "Your data stays in Egypt, protected by international security standards and local compliance." | "Your data can stay in Egypt, protected by controls aligned to international security standards." | Absolute, and contradicted by the AWS and global offerings |
| SAP page "99.95%" and "99.95% uptime guarantee with defined response times" | "99.9%" and "Defined SLAs … as set out in the service agreement" | 99.95% appears in no approved claim |
| Hero "Guaranteed." and "99.9% Uptime Guarantee" | Positioning line and "99.9% uptime SLA" | No published guarantee document exists |
| Backup page "military-grade encryption" | "encryption in transit and at rest" | Same reason as above; found by the build-wide claim sweep |
| "99.99% uptime guarantee" under "Know about WorldPosta" | "99.99% uptime on CloudEdge and Posta" | The registry scope is those two products, not WorldPosta overall |
| Manufacturing headline "Zero-Downtime Infrastructure for Production Systems" | "High-Availability Infrastructure for Production Systems" | A zero-downtime headline asserts 100% availability |
| Homepage case-study preview "achieving full compliance and zero security incidents" | "meeting the engagement's compliance objectives with zero security incidents" | The compliance half was unscoped; the incident figure is covered by the case-study approval |
| "99.9% uptime SLA with lightning-fast response times" | "…with defined response times" | Unquantified speed claim |
| Homepage `<title>` (77 characters with the brand suffix) | A shorter `home.hero.metaTitle`; the `<h1>` keeps the full phrasing | Result pages truncated both the geo qualifier and the brand |

If any of these is in fact certified, contracted or otherwise evidenced, restore the stronger
wording **and** register the claim with its evidence in the same change.

## 5. Unregistered quantitative and credential claims (leave, register, or remove)

Still published as-is, deliberately untouched because each needs an owner:

| Claim | Location (i18n key or file) |
|---|---|
| "50+ team members" | About stats |
| "500+" assessments | pentest brief, Services pentest statistics |
| "OSCP and CEH-certified testers" | `home.serviceBriefs.pentesting.highlights.assessment.description` |
| "certified cybersecurity professionals", "Certified Experts" | `services.security.page.whyRoaya.*` |
| "certified SAP specialists" | `services.sap.fullDescription` |
| "AWS-certified experts", "Advanced Tier Services Partner" | `services.aws.*` — add the official AWS Partner Finder link |
| "30-day money-back guarantee" | `home.pricingPreview.moneyBack` |
| Per-industry client counts (30+, 25+, 20+, 18+, 15+, 12+) | `home.industries.*.clients` |
| "10+ years of cloud experience" | `services.aws.hero.*` — distinct from the company's 14 years; confirm it is meant to differ |
| "Bank-grade security" | `services.detail.benefits.security.description` |
| "guaranteed performance", "Guaranteed dedicated performance" | `services.worldposta.vdc.*` |
| "99.99% uptime SLA" on the Enterprise plan | `pricing.plans.enterprise.features.sla` — conflicts with the CloudEdge/Posta-only scope |
| "99.99% uptime guarantee" under "Know about WorldPosta" | `services.worldposta.knowAboutFeature4` — scope to CloudEdge and Posta |
| "100% uptime during transition", "99.99% uptime achieved", "100% HIPAA compliance achieved" | `industries.caseStudies.*` — confirm these derivative summaries are covered by the 2026-09-01 case-study approval |
| "achieving full compliance and zero security incidents in 12 months" | `home.caseStudies.case2.summary` |
| "contractual guarantees" for Egyptian hosting | `home.faq.q4.answer` — confirm the contract exists; it now reads more strongly than the softened sovereignty card |

### 5.1 Response-time figures contradict each other

Three different promises are published today. One canonical figure is needed, then the
support page in item 1 becomes the single source.

| Figure | Location |
|---|---|
| "< 15 minutes" critical escalation | `services.security.page.solutions.soc.sla2` |
| "Under 15 min" response SLA | `services.security.page.statistics.responseSLA.value` |
| "contain threats in under 15 minutes" | `home.serviceBriefs.security.highlights.response.description` |
| "Initial response within 1 hour of engagement" | incident-response copy |
| "<1hr" | Services page support statistic |

## 6. Testimonials

Homepage testimonials are attributed as role + sector only ("IT Director, Finance Sector").
The review requires full name, title, company, date and written permission, or removal.
Decide per testimonial.

## 7. Arabic blog articles

All ten posts have Arabic bodies of 214–1,088 characters against full English articles. The
sitemap and hreflang now advertise an Arabic article only when its word count is at least
50% of the English article (`src/app/core/utils/arabic-content-completeness.ts`). Options:
complete the translations in the CMS (they re-enter the sitemap automatically), or accept
English-only discovery for the blog. Also decide whether Arabic slugs (`slugAr`) should ever
be public URLs; today the public URL is `/ar/resources/blog/<english-slug>`.

## 8. Whitepapers and documentation pages

Now `noindex, follow` and out of `sitemap.xml` / `llms.txt` (reversible: remove the path
from `NOINDEX_ROUTES` in `src/app/core/seo/route-metadata.ts`). Decide: publish real
content, or keep hidden from discovery.

## 9. Roaya / WorldPosta / CloudEdge / CloudSpace / Posta relationship

The review asks for one published definition. Today: "Exclusive MENA partner of WorldPosta"
(verified), CloudEdge defined and approved, Posta covered by the 99.99% scope, CloudSpace
blocked (no approved definition). Provide the approved taxonomy or keep CloudSpace absent.

## 10. Data residency and privacy statement

Replace remaining "full compliance" phrasing (now scoped in copy) with a published Data
Residency and Privacy page. Suggested wording from the review:

> Roaya supports customers' data-protection and data-residency requirements through
> service-specific hosting options, security controls, contractual terms, and operational
> processes. Customers remain responsible for determining the legal suitability of a
> service for their own use case.

## 11. External profiles

Align LinkedIn, Google Business Profile, Wuzzuf and partner directories with: founded 2012,
Cairo address (Block 3/67, Maadi Zahraa, 10th Sector), phone, and the approved service list.
Ask WorldPosta and AWS for public partner confirmations that link to `roaya.co`.

## 11a. Service Facts — 18 fields waiting on you

`src/app/core/seo/service-facts.ts` now holds all eight buyer-facing fields for all 14
service routes. Six are published; **18 are pending on the decisions in this document**, and
nothing pending is shown on the page. Filling a field means editing one entry and, for an
availability figure, registering the claim.

| Service | Published today | Waiting on |
|---|---|---|
| WorldPosta | Our role, availability SLA (99.99%, registry-scoped), data residency | Platforms/regions, resilience, support, delivery, commercial terms |
| AWS | Our role, platforms and regions, data residency | Resilience, SLA, support, delivery, commercial terms |
| The other 12 services | *nothing* | All eight fields |

The fastest way to move this: settle items 1 (support) and 2 (SLA) and 12 fields become
publishable at once, across every service.

## 12. Operational items for whoever owns the servers

1. **`api.roaya.co` nginx block is not in this repository.** If it proxies to port 3001
   without setting `X-Forwarded-For`, requests arriving that way now look like loopback and
   skip the API rate limit. Confirm that block sets the header, or retire the hostname.
   Browser traffic is unaffected: it uses the relative `/api/v1` path through the verified
   `roaya.co` block.
2. **Port 3001 binds all interfaces.** The new peer-address check stops header spoofing over
   a direct connection, but confirm the port is firewalled to the host.
3. **`backend/README.md` states "100 requests/minute"** where the code and environment say
   100 per 15 minutes, and it does not yet mention the loopback exemption.
4. **The same double-counting pattern remains** on the admin analytics routes
   (`website-analytics.routes.ts`), giving admin dashboards half the intended allowance.
   Not changed here.
5. **Homepage statistic values are now gate-enforced** in `scripts/ai-readiness/checks.mjs`.
   Changing an approved figure means updating that constant in the same change.
6. **The sitemap integrity gate is a separate command**, `npm run gate:sitemap-integrity`.
   Wire it into `deploy-ssr.sh` after the release step if it should run automatically. Run it
   only after the backend fix is live, or the gate's own crawl can exhaust the old limiter.
7. **Three tracked backup files remain** outside the public asset path:
   `about.component.html.bak`, `auth.service.ts.bak`, and the pre-SSR nginx configuration.
   They are not served, but they are dead weight.
