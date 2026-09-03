# Roaya.co — AI Readiness Action Plan

**Date:** 2 September 2026  
**Audience:** Leadership, Marketing, Content, Engineering, Partnerships, and Analytics  
**Purpose:** Move Roaya from technically crawlable to consistently trustworthy, answerable, and recommendable by AI search systems and AI agents.

## Executive decision

Roaya has a good technical foundation: major AI crawlers can reach the website, core pages are server-rendered, structured data and canonical URLs are broadly present, and branded discovery works.

The immediate priority is **not more AI-specific files or an MCP server**. It is to make the public information system reliable:

1. Fix server-rendered blog articles and sitemap integrity.
2. Govern company facts and high-risk claims from one source of truth.
3. Publish buyer-critical service facts with evidence and scope.
4. Remove contradictory accessible counters and reduce browser execution cost.
5. Build independent external authority and measure non-branded discovery.

## Current-state reconciliation

Two audit views are relevant:

- `REPORT.md` provides valuable findings on performance, forms, animated counters, service answerability, and external authority.
- The latest live recheck confirmed that case-study rendering and blog-listing rendering improved, but uncovered a more urgent production failure in blog-detail server rendering.

Do not merge the two audit scores mechanically. Treat this plan's P0 items as release blockers until live checks pass.

### Findings that require current validation

| Topic | Current planning position |
|---|---|
| Blog URLs | The public sitemap advertises 20 blog-detail URLs. In a slow follow-up probe, all returned HTTP 503 from server rendering even though the public blog API returned HTTP 200. This is P0. |
| Arabic blog URLs | The attached report found 10 Arabic 404s. The more recent failure affects English and Arabic blog-detail rendering; solve the underlying SSR-to-backend path, then include only published language variants in the sitemap. |
| Founding year | Controlled website surfaces were updated to 2012 in the recent remediation, but external profiles that show a different year still require reconciliation or an explicit milestone explanation. |
| Case studies | Raw server-rendered case-study content, correct canonical/Open Graph URLs, and Article/WebPage schema improved. Claim governance must remain active. |
| Whitepapers and documentation | Four coming-soon routes remain indexable but thin. Publish real content or remove them from search discovery. |
| Performance | The attached report's Lighthouse results are the baseline until re-run under an agreed, repeatable mobile test profile. |

## P0 — 0 to 48 hours

### 1. Repair blog-detail SSR and protect the sitemap

**Problem**

AI crawlers can receive an HTTP 503 with an error page for URLs promoted in the sitemap. A browser may later hydrate the article, but it can retain the error heading and homepage Open Graph URL. That produces contradictory machine-readable content.

**Actions**

- Validate `NG_SSR_API_ORIGIN`, loopback connectivity, process health, timeouts, and server logs for the SSR-to-blog-API request.
- Ensure a transient upstream failure produces a clean 503 response without a false “Post Not Found” page, homepage Open Graph URL, or stale schema.
- Generate the dynamic sitemap only from posts whose detail route is successfully available and published.
- Include an Arabic alternate only where a complete Arabic article exists.
- Add a deployment gate that tests every sitemap URL against production-equivalent SSR.

**Acceptance criteria**

- 100% of sitemap URLs return their intended HTTP status; all indexable URLs return 200.
- Every blog-detail page has exactly one descriptive H1, substantive raw article text, correct canonical and `og:url`, and valid `Article`/`WebPage` structured data.
- No promoted article returns an error placeholder, duplicate H1, or homepage metadata.

**Owner:** Engineering  
**Decision owner:** Engineering lead

### 2. Establish the governed company-fact record

**Problem**

Conflicting founding dates and partner/certification claims reduce entity confidence. An AI system cannot reliably recommend a company when first-party and third-party records disagree.

**Actions**

- Choose the legally supportable timeline: legal-entity year, operating-since year, and rebrand year if applicable.
- Publish an explanation when the values represent different milestones rather than silently choosing one.
- Update About, JSON-LD, `llms.txt`, LinkedIn, Wuzzuf, partner directories, and sales collateral together.
- Name a business owner for company facts and define a review cycle.

**Acceptance criteria**

- No unresolved material date discrepancy across controlled channels.
- Every public fact has an owner and last-reviewed date.

**Owner:** Leadership + Marketing + Legal/Commercial

### 3. Govern high-risk claims

**Problem**

Claims about uptime, security standards, named customers, savings, response times, compliance, and partner status must be defensible in both page copy and structured data.

**Actions**

- Maintain a claim registry with: `claim_id`, wording, source, scope, measurement method, time period, customer approval, reviewer, status, and expiry/review date.
- Remove, qualify, or withhold unsupported claims from visible copy, JSON-LD, metadata, and `llms.txt`.
- Add direct official proof links for AWS and WorldPosta where available.
- Replace vague phrases such as “military-grade encryption” with named technical controls and clearly stated scope.

**Acceptance criteria**

- 100% of high-risk public claims have active evidence, scope, owner, and review date.
- No schema or metadata contains a claim that is not visible and approved on the corresponding page.

**Owner:** Marketing + Legal/Commercial + Solution owners

### 4. Remove thin indexable placeholders

**Actions**

- Publish substantive whitepaper/documentation hub content; or
- Add `noindex`, remove from sitemap and `llms.txt`, and keep the routes out of primary search discovery until ready.

**Acceptance criteria:** No placeholder page is indexable.

**Owner:** Marketing + Engineering

## P1 — Days 3 to 30

### 1. Introduce a standard Service Facts model

Every commercial service page should answer the questions an enterprise buyer or AI assistant needs before recommending Roaya.

| Required field | Examples |
|---|---|
| Provider role | Operator, managed-service provider, reseller, implementation partner |
| Platforms and regions | AWS/Azure/other platforms, hosting and control-plane regions |
| Data residency | Workload, log, backup, and metadata location; exceptions |
| Resilience | RPO, RTO, backup location, test frequency |
| SLA | Availability target, measurement window, exclusions, maintenance, service credits |
| Support | Hours, severity levels, response and restoration targets, escalation |
| Delivery | Onboarding prerequisites, implementation timeline, responsibilities |
| Commercial terms | Price unit, currency, setup fees, minimum term, overages, POC/trial |
| Trust | Evidence links, scope, owner, and last-reviewed date |

Implement the model first for AWS, Cloud, SOC/Security, Backup/DR, Managed IT, SAP, Email, DevOps, AI/Automation, and Consulting.

**Owner:** Solution owners + Content + Legal/Commercial

### 2. Align structured data with visible facts

- Keep stable Organization and WebSite IDs.
- Add route-specific WebPage, BreadcrumbList, and Service nodes for every actual service page.
- Add Article nodes to approved case studies and articles, including author/editor, dates, methodology, and only verified claims.
- Do not use structured data to add stronger facts than the visible page supports.

**Acceptance criteria:** Every service page maps to an intended Service node; all JSON-LD parses; all facts match visible content.

**Owner:** Engineering + Content

### 3. Make factual counters unambiguous

Animated KPIs currently risk exposing contradictory values such as `150+` and `0+`.

- Render the final value once as accessible initial HTML.
- Make any animated visual duplicate `aria-hidden="true"`.
- Add an automated accessibility check that rejects duplicate or zero-state factual values.

**Owner:** Engineering + Design

### 4. Make forms deterministic for people and agents

- Add stable `name` attributes and appropriate autocomplete tokens.
- Use an explicit method and endpoint model.
- Associate field errors using `aria-invalid` and `aria-describedby`.
- Provide a `role="alert"` error summary and focus the first invalid control.
- Provide deterministic success confirmation and a reference ID.

Do not expose autonomous machine actions until authentication, permissions, rate limits, audit logging, and human approval are designed.

**Owner:** Engineering + Growth/Marketing

### 5. Reduce browser-agent and visitor performance risk

The performance work should preserve information in initial HTML while reducing JavaScript and rendering cost.

- Remove the full-screen preloader.
- Defer nonessential animations, smooth scrolling, and below-fold features.
- Split route bundles and lazy-load below-fold media.
- Reduce unused JavaScript and CSS.
- Avoid hydrating static content that does not require interaction.

| Milestone | LCP target | TBT target |
|---|---:|---:|
| First two weeks | <= 4.0 seconds | <= 800 ms |
| 30 days | <= 3.0 seconds | <= 300 ms |
| 90 days | <= 2.5 seconds | <= 200 ms |

Run each test with an agreed mobile Lighthouse profile and retain the result as a release artifact.

**Owner:** Engineering + Design

### 6. Strengthen internal discovery and bilingual navigation

- Generate a CI link-graph report.
- Make every commercial page reachable through semantic links from a hub within three clicks.
- Ensure language switchers are real links.
- Require English, Arabic, and `x-default` reciprocal hreflang only for published language equivalents.

**Owner:** Engineering + Content

## P2 — Days 31 to 90

### 1. Build recommendation authority outside the site

- Link to the official AWS Partner Finder profile and official WorldPosta evidence.
- Publish approved named case studies, or anonymized studies with verifiable methodology and evidence.
- Earn corroboration from partners, client references where permitted, industry events, technical publications, and relevant associations.
- Add credible expert bios and review ownership to guidance content.

### 2. Publish buyer-led expert content

Prioritize useful decision pages rather than keyword variations:

- Data residency and regulated workloads in Egypt/MENA.
- RPO/RTO and backup/DR procurement.
- SOC selection and managed-security service boundaries.
- AWS migration, managed operations, and shared-responsibility models.
- Cloud pricing, governance, and FinOps decisions.

Each guide should have an author/reviewer, publication and update date, supporting evidence, internal links to Service Facts, and a clear next action.

### 3. Establish the ongoing AI visibility measurement program

- Connect Google Search Console, Bing Webmaster Tools, web analytics, Cloudflare AI crawler monitoring, and verified crawler logs.
- Track ChatGPT referrals using `utm_source=chatgpt.com`.
- Review a fixed prompt benchmark monthly in English and Arabic.
- Record inclusion, official-domain citation, factual accuracy, recommendation confidence, Arabic quality, and competitor citations.

## KPI framework

### Primary KPI 1 — Indexable-page integrity

**Definition:** Percentage of sitemap URLs that return their intended status, self-canonical, correct language/alternate links, exactly one descriptive H1, and substantive raw HTML.

**Target:** 100% on every release.

**Guardrail:** Zero indexable URLs may return a loading state, error placeholder, 4xx, or 5xx response.

### Primary KPI 2 — Evidence-backed claim coverage

**Definition:** Percentage of high-risk public claims with a live evidence reference, scope, owner, approval status, and review date.

**Target:** 100% before publication or modification.

**Guardrail:** No public page, schema, metadata, or `llms.txt` entry may repeat a blocked or expired claim.

### Primary KPI 3 — Non-branded recommendation visibility

**Definition:** Share of a fixed English/Arabic buyer-question benchmark in which Roaya is mentioned and cited from its official domain.

**Target:** Establish a baseline for the first 60 days; set a growth target only after enough consistent observations exist.

**Guardrail:** Track factual accuracy and unsupported-claim repetition alongside inclusion. Mentions without trustworthy supporting content are not success.

### Supporting operational metrics

- Lighthouse LCP and TBT against the agreed profile.
- Percentage of service pages with complete Service Facts and Service JSON-LD.
- Verified AI crawler requests allowed/blocked by policy.
- Search impressions, clicks, conversions, and ChatGPT referral quality.

## Release gates

No release should promote new indexable content unless all applicable checks pass:

- Sitemap URLs return intended status and self-canonical.
- Raw HTML contains correct title, description, one H1, useful text, Open Graph URL, and schema.
- Published language variants have reciprocal hreflang; unpublished translations do not appear as alternates.
- High-risk claims resolve to approved evidence.
- No duplicate accessible KPI value exists.
- Lighthouse budget is not regressing beyond the accepted milestone.
- Forms expose semantic validation and deterministic error/success states.

## Ownership cadence

| Cadence | Review |
|---|---|
| Every deployment | Sitemap, raw SSR, metadata/schema, language links, claims, performance budget |
| Weekly | Blog SSR health, crawler/WAF access, broken-link graph, claim changes |
| Monthly | Search Console, referral quality, AI-crawler activity, prompt benchmark, external citations |
| Quarterly | Company facts, partner status, certifications, service facts, case-study approvals |

## What not to do yet

- Do not build an MCP server or public machine-action API for marketing purposes.
- Do not add schema types or AI files simply to appear “AI optimized.”
- Do not publish unverified metrics merely because they make a page more persuasive.
- Do not keep unpublished language variants in the sitemap or hreflang graph.

## Definition of done

Roaya is ready to be considered strongly AI-ready when:

1. Every indexable page is reliable in raw HTML without client-side execution.
2. All company, partner, certification, and performance facts are governed and evidence-backed.
3. Every commercial service offers a complete, visible, buyer-answerable facts model.
4. The site meets its agreed performance budget without hiding essential content behind loaders or animation.
5. Independent sources corroborate Roaya's identity and core capabilities.
6. A monthly measurement loop shows how Roaya is discovered, cited, and evaluated in non-branded buyer questions.

## Evidence references

- [Attached AI visibility report](/Users/roaya/Downloads/REPORT.md) — source findings on performance, agent interaction, animated counters, forms, and authority.
- [AI Readiness Audit](AI_Readiness_Audit_2026-09-01.md) — original 82-URL assessment.
- [AI Readiness Remediation](AI_Readiness_Remediation_2026-09-01.md) — deployed remediation record and known follow-ups.
- [Google AI features guidance](https://developers.google.com/search/docs/appearance/ai-features) — foundational indexability, textual content, and visible-content-matched structured data.
- [OpenAI publisher guidance](https://help.openai.com/en/articles/12627856) — OAI-SearchBot access and ChatGPT referral tracking.
