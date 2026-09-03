# AI Readiness — P3 complete, P2 as far as the repository can take it (3 September 2026)

Follows `AI_Readiness_P1_2026-09-02.md`. Still nothing committed or deployed.

## P3 — machine interpretation: complete

### What was already done, verified rather than assumed

A sweep of 15 routes across both locales found: **exactly one `<h1>` on every page, zero
duplicate `<title>`s, a canonical on every page**, and Organization, WebSite, WebPage,
BreadcrumbList, Service, FAQPage and Article schema all emitting. robots.txt blocks only
admin paths. No canonical conflicts, no stray noindex.

### Correction to yesterday's report

I reported "70 of 131 images have no alt". **That was wrong** — my detector looked for
`alt=`, and Angular serialises an empty alt as a bare `alt` attribute. Those images are
correctly marked decorative, most also carrying `aria-hidden`. A multi-line-aware audit of
every template found **zero** `<img>` without an alt binding.

Two real items remained, and both were mine:

| Item | Fix |
|---|---|
| A "bare `<img>`" appearing on every page | Not an element — literal tag text inside an HTML comment written on 2026-09-02. Correct parsers ignore comments; text extractors and regex scanners do not. The comment now spells tag names out instead. |
| The Meta pixel had no alt | Given `alt=""`. It is a tracking pixel, so empty is the right value. |

Served pages now contain zero escaped tag text, zero bare `<img>`, and zero images without an
alt attribute.

### Contact schema (the last open P3 item)

`/contact` and `/ar/contact` now emit `PostalAddress` and `ContactPoint`, referenced from the
Organization node. Every value is one the page already displays: the Maadi address (in
Arabic on the Arabic page), `info@roaya.co`, `+201096274996`, `areaServed: EG`, and both
published languages.

Deliberately **not** emitted:

- **No geo coordinates** — the page shows none, so inventing them would assert an unverified
  location.
- **No `openingHours`** — the Contact page states "Sunday–Thursday, 9:00–18:00" while the rest
  of the site advertises 24/7 support. Publishing either as structured fact would take a side
  in an open question (pending decision 1). **This contradiction is live on the site today**
  and is the sharpest single argument for settling the support matrix.
- **Not on other pages** — an Organization-wide ContactPoint would attach a phone number to
  every page, including ones that never mention it. The gate fails if `/` or `/about` emits
  contact details.

## P2 — external authority: the repository half is done, the rest is not ours

### Partner claims registered on your confirmation

| Claim | Before | Now |
|---|---|---|
| Exclusive MENA partner of WorldPosta | `verified` since 2026-08-23 | Reconfirmed 2026-09-03, with the evidence gap recorded |
| AWS Advanced Tier Services Partner | **Published but unregistered** | Registered `verified`, so wording changes are now gated |

Record: `roaya-website/docs/decisions/2026-09-03-partner-claims-confirmation.md`.

### What your confirmation does not do

It is first-party approval — exactly what the claim registry needs, and it is now recorded.
It is **not** the third-party corroboration P2 asks for. Checked on 2026-09-03:

| Source | Result |
|---|---|
| `worldposta.com` | Does not name Roaya anywhere. **No partners page exists at all.** |
| AWS Partner Finder | No public Roaya profile found. |
| Public web | Roaya's own LinkedIn and Facebook state the WorldPosta partnership — both first-party. |

**A buyer, or an assistant, currently has no way to verify either claim from a source that is
not Roaya.** No amount of on-site work changes that. Three actions, all belonging to partner
relations:

1. Ask WorldPosta to publish a partner listing naming Roaya and linking to `roaya.co`. Their
   site has no partners page, so this may mean asking them to create one.
2. Publish the AWS Partner Finder profile and link it from `/services/aws`.
3. When either URL exists, add it as a visible evidence link and cite it in the claim.

### An external inconsistency found while checking

A public third-party company profile describes Roaya as serving **"over 300 clients"** and
lists **CloudSpace** among its products. The site publishes **150+ clients** (registry claim
`clients-150-plus`), and `cloudspace-definition-taxonomy` is **blocked**. Whoever owns
external listings should correct or retire it — an assistant reading both sources sees Roaya
contradicting itself.

### Measurement programme: written and ready to run

`memory-bank/Audit/AI_Visibility_Measurement_Program.md` — a fixed 10-prompt benchmark in
English and Arabic (7 non-branded for discovery, 3 branded for accuracy), the per-answer
fields to record, the technical signals to collect the same week, and how to read the
results. Prompt 10 exists specifically to catch an assistant stating an SLA figure the site
has not registered.

Two prerequisites are **not** in place and block the first run's technical half:

- **Google Search Console and Bing Webmaster Tools are not connected.**
- **GA4 has no measurement ID** (`environment.prod.ts` → `googleAnalyticsId: ''`), so the
  `utm_source=chatgpt.com` referral tracking the plan asks for records nothing today.

### Not delivered: buyer-led expert content

P2's second strand asks for decision guides — data residency for regulated workloads, RPO/RTO
procurement, SOC selection, AWS shared responsibility, cloud pricing and FinOps. Each needs
the facts that are still pending: SLA, residency, resilience and commercial terms. Writing
them now would mean inventing the specifics that make them worth reading, which is the exact
failure mode this whole engagement has been correcting. They are unblocked by decisions 1, 2
and 5, not by more engineering.

## Verification

| Check | Result |
|---|---|
| Production build | Pass |
| `npm run verify:evidence` | **17 of 17 gates pass** |
| `validate:claims` | Pass, now 15 claims |
| Served pages | Contact schema correct in both locales; zero escaped tag text; zero images without alt |


## Addendum — per-page metadata audit (same day)

**Question asked:** does every page have its own metadata?

**Answer: yes for coverage, no for quality.** A sweep of all 78 indexable URLs plus the
dynamic detail pages found every page rendering its own title, description, canonical,
`og:title`, `og:description`, `og:url`, `og:image` and `twitter:card`. **No page fell back to
the site-wide default**, and there were no duplicate titles or descriptions.

The existing `canonical-metadata-coverage` gate proves an entry *exists* in the route
registry. It cannot see what the entry is worth, and that is where the problems were.

### What the sweep found

| Problem | Detail |
|---|---|
| **Descriptions that were sliced body copy** | 10 pages — privacy, terms, cookies and two security pages in both locales — took their description from a body-content key. Search results and assistants were quoting the first ~155 characters of a legal paragraph, cut off mid-sentence. |
| **A title that never named the service** | `/services/security/soc-solutions` used its hero tagline, "Stop Chasing Alerts. Focus on Real Risks." Someone searching for a SOC provider, or an assistant asked what the page is, got a slogan. |
| **An internal note in a public description** | The Arabic banking case-study description ended "النسب المئوية الدقيقة بانتظار الموافقة" — *exact percentages pending approval*. A governance note had been appended to a public meta description. The English one carried no such note. |
| **Seven over-long titles** | Up to 90 characters, mostly Arabic case studies. Their length came from a `\| benefit` clause plus a translated brand name. |
| **A brand-name inconsistency** | Arabic case-study titles ended "رؤية لتقنية المعلومات" while `seo.service.ts` applies " - Roaya IT" in both locales, with a comment saying the company name stays in English. These strings were the only place doing otherwise. |

A note on measurement: the first pass over-reported lengths because it counted HTML entities
— `&amp;` is five characters of markup and one character of title. Decoding first changed
which pages were genuinely over.

### Fixed

Dedicated `metaDescription` keys for privacy, terms, cookies and the two security pages in
both locales; a `metaTitle` for the SOC page that names the service while the `<h1>` keeps
the tagline; the internal note removed; seven titles shortened and aligned on the
" - Roaya IT" suffix.

### Gated

`page-metadata-quality` fetches **every** sitemap URL from the production build and fails on:
a default or missing title or description, a description ending mid-sentence (the signature of
sliced body copy), a canonical that is not self-referencing, `og:url` disagreeing with it, any
missing Open Graph or Twitter tag, over-length values with entities decoded, and any duplicate
title or description.

**19 of 19 gates pass**, 78 URLs swept clean.

### Left alone deliberately

Several case-study metrics render the literal value "Pending approval" (`Inventory
Optimization: Pending approval`). That is the claim-governance system working — an unapproved
figure is not published — but it is odd copy to show a buyer. Either approve the figures or
drop those metric rows; it is a content decision, not a defect.
