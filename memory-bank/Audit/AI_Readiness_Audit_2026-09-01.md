# Roaya.co AI Readiness Audit

**Audit date:** 1 September 2026  
**Audience:** Roaya leadership, marketing, content, and engineering  
**Scope:** Public website, English and Arabic experiences, all URLs declared in the production sitemap, and the supporting website repository

## Executive conclusion

**Overall AI readiness: 70/100 — Foundation ready, with priority remediation.**

Roaya.co is technically accessible to major search and AI retrieval crawlers. It has a strong foundation: server-side rendering, a sitemap, robots policy, canonical links, structured data, bilingual content, and an `llms.txt` navigation file. All 82 sitemap URLs returned HTTP 200, and live probes for OpenAI, Anthropic, Perplexity, and Google user agents reached the site successfully.

The site is not yet ready to rely on for consistent AI discovery and citation. Fourteen indexable URLs return incomplete raw content, including every case-study detail page and both blog listing pages. Public claims also need tighter evidence governance, and the site has limited non-branded visibility for commercial-intent topics.

**Business interpretation:** AI systems can reach Roaya, but some of the pages most likely to demonstrate expertise are the least dependable for machines to read and cite.

### Immediate decisions

1. Resolve the authoritative founding year and approve, qualify, or remove unsupported metrics.
2. Repair the server-rendered output for all case studies and the blog.
3. Publish substantive whitepaper/documentation pages or keep their placeholders out of search.
4. Add measurement for AI referrals, verified AI crawler activity, and a fixed set of target questions.

## Readiness scorecard

| Dimension | Score | Maximum | Assessment |
|---|---:|---:|---|
| Crawler access and transport | 14 | 15 | Strong |
| Discovery and indexation controls | 13 | 15 | Strong |
| Server-rendered content completeness | 11 | 20 | Needs priority work |
| Metadata and structured data | 10 | 15 | Mixed |
| Content readability and answerability | 10 | 15 | Mixed |
| Entity and evidence trust | 6 | 10 | Needs governance |
| Visibility and measurement | 6 | 10 | Early stage |
| **Total** | **70** | **100** | **Foundation ready** |

This is an internal audit rubric, not an external certification. Scores reflect the public evidence available on the audit date.

## What was examined

The audit combined five evidence types:

- A production build and the repository's automated AI-readiness checks.
- Raw, non-interactive HTML responses for all 82 sitemap URLs.
- Live requests using representative OpenAI, Anthropic, Perplexity, and Google user agents.
- Source inspection of server rendering, SEO metadata, content loading, and claim controls.
- Public branded and non-branded discovery checks, reconciled with current official platform guidance.

Private Google Search Console, Cloudflare analytics, server logs, CRM attribution, and AI-platform ranking telemetry were not available. Visibility findings are therefore directional rather than a complete performance measurement.

## Evidence snapshot

| Test | Result | Interpretation |
|---|---:|---|
| Sitemap URLs tested | 82 | Full declared production inventory |
| HTTP status failures | 0 | All declared URLs were reachable |
| Canonical mismatches | 0 | Canonical URL implementation is strong |
| Major crawler user agents receiving HTTP 200 | 7 of 7 | Crawl access is open in the tested path |
| Open Graph URL mismatches | 14 | Shared/cited URL can point to the homepage instead of the page |
| Pages without an H1 | 10 | Case-study topics are not expressed as a primary heading in raw HTML |
| Pages below 50 visible words | 14 | Thin or placeholder content is exposed to crawlers |
| Pages without expected `WebPage` schema | 14 | Incomplete page-level semantic description |
| Pages missing full hreflang coverage | 4 | Bilingual relationship is incomplete on coming-soon pages |
| Short descriptions under 70 characters | 21 | Several snippets lack useful context |
| Long descriptions over 160 characters | 2 | Some snippets may be truncated |
| Pages marked `noindex` | 0 | Placeholder pages remain eligible for indexing |

The production build completed and prerendered 60 static routes. The repository's automated readiness gate passed 11/11 checks, but the full live-response audit identified defects that the current gate does not test. The gate should therefore be expanded rather than treated as proof that every public page is AI-readable.

## What is already working

### 1. Major crawlers can access the site

Live probes for `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`, and `Googlebot` all received HTTP 200 through Cloudflare on the tested page. The live `robots.txt`, `sitemap.xml`, and `llms.txt` files were also reachable with appropriate content types.

This supports discovery. OpenAI recommends allowing OAI-SearchBot for inclusion in ChatGPT search summaries and links. Anthropic and Perplexity similarly distinguish search or user-fetch agents from their other crawler purposes. See [OpenAI's publisher guidance](https://help.openai.com/en/articles/12627856), [Anthropic's crawler guidance](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), and [Perplexity's crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers).

### 2. Core discovery infrastructure is present

Roaya has:

- A crawl policy in [robots.txt](../../roaya-website/public/robots.txt).
- An 82-URL bilingual [sitemap.xml](../../roaya-website/public/sitemap.xml).
- Canonical links that matched the requested URL on all 82 tested pages.
- A concise AI navigation aid in [llms.txt](../../roaya-website/public/llms.txt).
- Server-side rendering and static prerendering for much of the site.
- Organization, service, breadcrumb, FAQ, and page-level structured-data patterns.

Google's current guidance says AI search features require the same sound foundation as ordinary search: accessible crawling, indexable pages, textual content, internal links, and structured data that matches visible content. It does not require a special AI schema or an AI-specific text file. The existing `llms.txt` is useful as a navigation aid, but it cannot compensate for incomplete page HTML. See [Google's AI features guidance](https://developers.google.com/search/docs/appearance/ai-features).

### 3. The organization has begun evidence governance

The repository includes a structured claim registry and a human-approval checklist. This is a meaningful advantage because AI visibility depends not only on discoverability, but also on whether a system can confidently repeat and cite a claim.

The control system is not yet consistently reflected in public content, but the underlying governance mechanism exists and can be strengthened rather than built from scratch.

## Priority findings

### P0 — Resolve factual and claim ambiguity

**Risk:** High citation and reputation risk  
**Owners:** Leadership, marketing, legal/commercial, and content

The site's controlled content uses 2018 as Roaya's founding year, while the repository itself records that LinkedIn or earlier external references may show 2012. The issue is explicitly documented in [ai-readiness-human-gates.md](../../roaya-website/docs/ai-readiness-human-gates.md), but remains unresolved.

The claim registry also marks all five case studies as blocked pending client approval and metric evidence. Public website content nevertheless contains quantitative results and performance claims. Even if some evidence exists offline, AI systems cannot distinguish a verified claim from an unsupported one when the public entity record is inconsistent.

**Required action:**

- Name one authoritative internal owner for company facts.
- Resolve the founding year and update the website, LinkedIn, directories, structured data, and `llms.txt` consistently.
- Give every quantitative claim an evidence link, scope, approval status, owner, and review date.
- Remove or clearly qualify any claim that lacks approval.
- Keep blocked case-study claims out of metadata and structured data as well as visible copy.

**Completion test:** No material organization or performance claim conflicts with another controlled source, and every published metric maps to approved evidence.

### P1 — Case-study pages are not server-readable

**Risk:** High impact on expertise, trust, and citation  
**Owners:** Engineering and content

All ten case-study detail URLs—five English and five Arabic—returned only a loading-state message in raw HTML. They also accounted for all ten missing H1s and most of the missing page schema.

The source cause is clear. [seo.service.ts](../../roaya-website/src/app/core/services/seo.service.ts) uses `window.location.href` when an SEO update does not provide a URL. `window` does not exist during server rendering. [case-study-detail.component.ts](../../roaya-website/src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.ts) calls that method without a URL, and the resulting exception occurs before the loading state is cleared.

This is especially costly because case studies are the pages most likely to provide concrete proof, industry context, and quotable outcomes.

**Required action:**

- Make URL resolution server-safe and independent of browser-only globals.
- Pass the canonical route explicitly when updating case-study metadata.
- Render the title, summary, challenge, approach, outcomes, industry, and evidence status in the initial HTML.
- Add a raw-response test for every case-study slug in both languages.
- Publish a case study only after its claims pass the approval registry.

**Completion test:** Every case-study URL returns a descriptive H1, substantive visible text, the correct Open Graph URL, reciprocal language links, and matching structured data without client-side execution.

### P1 — Blog pages render an empty state to machines

**Risk:** High impact on topical authority and non-branded discovery  
**Owners:** Engineering and content

The English and Arabic blog listing pages returned “No posts found” or its equivalent in raw HTML. The [SSR API interceptor](../../roaya-website/src/app/core/interceptors/ssr-api.interceptor.ts) intentionally rejects backend API requests during server rendering, while [blog.component.ts](../../roaya-website/src/app/features/resources/blog/blog.component.ts) converts that failure into an empty collection.

This prevents the content hub from demonstrating subject-matter depth to crawlers. Blog detail URLs were also absent from the audited sitemap inventory.

**Required action:**

- Make published post data available during server rendering through a server-safe content source, build-time snapshot, or transfer-state flow.
- Render post titles, summaries, dates, authors, categories, and internal links in raw HTML.
- Add canonical blog-detail URLs to the sitemap and `llms.txt` only after those pages are publicly available and complete.
- Add Article or BlogPosting structured data that matches visible content.
- Provide an RSS or Atom feed if editorial publishing will be ongoing.

**Completion test:** Both blog listings expose real posts in raw HTML, and every published post has a crawlable detail URL with complete metadata and schema.

### P2 — Coming-soon pages are indexable but not useful

**Risk:** Medium quality and crawl-efficiency risk  
**Owners:** Marketing and engineering

Four English/Arabic whitepaper and documentation routes contained only 42–44 visible words, lacked full hreflang declarations, used the homepage Open Graph URL, and had no expected `WebPage` node. None was marked `noindex`.

**Required action:** Choose one of two deliberate states:

- Publish substantive content with a clear purpose, author or owner, useful summary, and next action; or
- Add `noindex`, remove the URL from the sitemap and `llms.txt`, and keep it out of primary navigation until ready.

**Completion test:** No placeholder page remains eligible for search indexing.

### P2 — Metadata quality is inconsistent

**Risk:** Medium discovery and citation clarity risk  
**Owners:** Content and engineering

The audit found 14 Open Graph URL mismatches, 21 descriptions shorter than 70 characters, and two longer than 160 characters. Canonical URLs were correct, which makes the Open Graph mismatch a repairable consistency defect rather than a broad canonicalization problem.

**Required action:**

- Generate canonical, Open Graph, and structured-data URLs from the same server-safe source.
- Give each indexable page a unique, specific description that explains audience, service or topic, and differentiator.
- Expand the automated gate to validate raw H1, visible-word count, Open Graph URL, hreflang, and page schema across every sitemap URL.

**Completion test:** Metadata and schema are complete, unique, and consistent on every indexable URL.

### P2 — Non-branded authority is not yet strong enough

**Risk:** Medium growth limitation  
**Owners:** Marketing, partnerships, and subject-matter experts

Branded searches surfaced Roaya pages, indicating a recognizable base entity. A representative generic query for managed IT services and 24/7 SOC capabilities in Egypt did not surface Roaya among the early results reviewed. Competitors and directories appeared instead.

This is not a crawler-access problem. It indicates limited public evidence for broader commercial questions: few complete case studies, an empty raw blog, modest independent citations, and unresolved partner or company facts.

**Required action:**

- Build evidence-backed pages around buyer questions, not keyword variants.
- Cover service comparisons, migration decisions, security operations, cloud cost and governance, Microsoft 365, industry requirements, and Egypt/MENA delivery considerations.
- Add named authors or reviewers with role and expertise.
- Earn authoritative third-party references from partners, clients where permitted, industry publications, associations, and event pages.
- Link official partner directory profiles back to the matching Roaya service pages.

**Completion test:** Roaya earns impressions and citations for a defined set of non-branded, high-intent topics—not only its company name.

## AI readability assessment

AI readability is stronger on core service and company pages than on proof and resource pages.

### Strong patterns

- Clear bilingual routing and reciprocal page relationships on most pages.
- Descriptive service taxonomy and industry coverage.
- FAQ and breadcrumb patterns that break content into answerable units.
- Text-based core content on many server-rendered pages.
- Canonical URLs and organization-level entity markup.

### Weak patterns

- Loading and empty states are the primary raw content on 12 URLs.
- Four additional routes contain only placeholder-level information.
- Important quantitative claims are not consistently connected to public evidence.
- Some descriptions are too generic or too short to frame the page clearly.
- The `llms.txt` statement that all linked pages are server-rendered with reciprocal hreflang is currently inaccurate for the affected pages.

The best improvement is not to add more AI-specific files. It is to make every indexable page complete, factual, well-structured, and consistent before JavaScript runs.

## Remediation roadmap

### Phase 0 — Human truth decisions

**Target:** Before publishing or promoting case-study claims

- Resolve the founding year.
- Confirm the exact wording and scope of partner statuses.
- Approve, qualify, or remove all quantitative claims.
- Assign content and evidence owners.

### Phase 1 — Restore machine-readable proof pages

**Target:** First engineering release

- Remove the server-side `window` dependency from SEO URL handling.
- Render every case study completely in raw HTML.
- Extend the automated gate to check the live-equivalent HTML of every sitemap URL.
- Correct page-level Open Graph URLs and structured data.

### Phase 2 — Make the content hub indexable

**Target:** Following content release

- Provide blog data during server rendering.
- Publish complete blog-detail routes in both languages.
- Add article schema, internal links, sitemap entries, and a feed.

### Phase 3 — Improve index quality

**Target:** Same quarter

- Publish or de-index the four coming-soon pages.
- Improve short and overlong descriptions.
- Ensure every bilingual page has reciprocal hreflang and `x-default`.
- Reconcile `llms.txt` with the actual public inventory.

### Phase 4 — Grow answer authority and measurement

**Target:** Ongoing monthly program

- Publish evidence-led expert content for target buyer questions.
- Build relevant external citations and verified partner links.
- Measure AI crawler traffic, ChatGPT referrals, organic visibility, and conversions.
- Review a stable benchmark set of AI questions monthly.

## Measurement plan

| Measurement | Source | Cadence | Purpose |
|---|---|---|---|
| Indexed pages, impressions, clicks, queries | Google Search Console | Monthly | Track discoverability, including Google's AI search features within Web reporting |
| `utm_source=chatgpt.com` sessions and conversions | Web analytics | Monthly | Measure ChatGPT referrals and business quality |
| Verified AI crawler requests and blocked events | Cloudflare AI Crawl Control and logs | Weekly/monthly | Confirm access and detect WAF or robots drift |
| Raw-response readiness across sitemap URLs | Automated deployment check | Every release | Prevent loading, empty, thin, or inconsistent pages from shipping |
| Fixed buyer-question benchmark | ChatGPT, Claude, Perplexity, and Google | Monthly | Observe whether Roaya is cited for target non-branded topics |
| Claim approval freshness | Claim registry | Monthly and before release | Prevent stale or unsupported claims |

OpenAI documents the `utm_source=chatgpt.com` referral parameter in its [publisher FAQ](https://help.openai.com/en/articles/12627856). Google reports AI feature traffic within Search Console's Web search type in its [AI features guidance](https://developers.google.com/search/docs/appearance/ai-features). Cloudflare's [AI Crawl Control](https://developers.cloudflare.com/ai-crawl-control/) can monitor AI crawler activity and robots-policy compliance.

### Suggested benchmark questions

Track a stable group of questions rather than changing prompts each month. Examples:

- Which companies provide managed IT services for mid-sized businesses in Egypt?
- Who offers 24/7 SOC and cybersecurity monitoring in Egypt or the MENA region?
- What should an Egyptian business consider before migrating to Microsoft 365?
- Which IT providers support cloud migration and managed infrastructure in Cairo?
- How can a regulated business in Egypt compare private cloud, public cloud, and hybrid cloud options?

Record whether Roaya is mentioned, whether a Roaya URL is cited, the cited page, the factual accuracy of the answer, and whether competitors are cited instead. Treat results as observations, not guaranteed rankings.

## Release acceptance criteria

The website can be considered strongly AI-ready when all of the following are true:

- Every sitemap URL returns its intended status, canonical URL, and useful raw HTML—or is deliberately removed from the sitemap.
- Every indexable page contains one descriptive H1 and substantive visible text before client-side JavaScript.
- Zero indexable pages expose loading or empty-result placeholders as their primary content.
- Open Graph URL matches the canonical URL on every indexable page.
- Every bilingual indexable page declares English, Arabic, and `x-default` alternates.
- Page-level structured data matches the visible page and contains no unsupported claims.
- All quantitative claims have evidence, scope, approval, owner, and review date.
- Company facts are consistent across the website, LinkedIn, directories, partner profiles, schema, and `llms.txt`.
- Search Console, AI referral analytics, verified crawler monitoring, conversion attribution, and the monthly prompt benchmark are operating.

## Claim-to-source ledger

| Audit conclusion | Supporting evidence | Confidence | Limitation or contradiction |
|---|---|---|---|
| Major AI search/user agents can reach the site | Seven live user-agent probes; production robots policy | High | Verified crawler IPs and long-term WAF logs were not available |
| All declared URLs are reachable | 82 of 82 sitemap URLs returned HTTP 200 | High | HTTP success alone does not prove content completeness |
| Ten case-study pages are incomplete for raw crawlers | Raw HTML plus the server-side `window` exception path in source | High | A browser may display content after hydration |
| Blog raw output is empty | English/Arabic raw HTML plus SSR API rejection and empty error path | High | A browser may load posts after hydration |
| Four coming-soon pages are not index-ready | Word count, hreflang, Open Graph, schema, and indexability checks | High | The pages may intentionally be temporary |
| Founding year is not consistently established | Repository human-gate record and public profile discrepancy | Medium-high | A named human source of truth is required |
| Some public metrics are not audit-ready | Claim registry approval states compared with public quantitative copy | High | Offline evidence may exist but was not available |
| Non-branded visibility is limited | Representative public search probes | Medium | Results vary by time, location, and personalization |
| No special AI schema is required | Official Google Search guidance | High | Good structured data remains useful when it matches visible content |

## Sources

### First-party website and repository evidence

- [robots.txt](../../roaya-website/public/robots.txt)
- [sitemap.xml](../../roaya-website/public/sitemap.xml)
- [llms.txt](../../roaya-website/public/llms.txt)
- [AI readiness human gates](../../roaya-website/docs/ai-readiness-human-gates.md)
- [Claim evidence registry](../../roaya-website/scripts/claim-evidence/registry.json)
- [SEO service](../../roaya-website/src/app/core/services/seo.service.ts)
- [Case-study detail component](../../roaya-website/src/app/features/resources/case-studies/case-study-detail/case-study-detail.component.ts)
- [SSR API interceptor](../../roaya-website/src/app/core/interceptors/ssr-api.interceptor.ts)
- [Blog component](../../roaya-website/src/app/features/resources/blog/blog.component.ts)

### Official external guidance

- [OpenAI: Publishers and Developers FAQ](https://help.openai.com/en/articles/12627856)
- [Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Anthropic: Web crawler controls](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity: Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- [Cloudflare: AI Crawl Control](https://developers.cloudflare.com/ai-crawl-control/)

## Limitations

- No private analytics, Search Console, Cloudflare dashboard, production logs, CRM data, client approvals, contracts, or partner portals were reviewed.
- Public performance claims were assessed for governance and visible support, not independently certified.
- Search-result checks are snapshots and cannot establish stable rank or inclusion.
- This audit evaluates readiness for discovery, comprehension, and citation. No technical or content change can guarantee that an AI system will index, rank, mention, or cite a page.

## Final recommendation

Treat Roaya's next AI-readiness milestone as **“complete proof pages plus consistent evidence,” not “more AI files.”** The crawl foundation is already good. The highest return will come from repairing the case studies and blog, resolving company and metric claims, removing thin placeholders from the index, and then building measurable non-branded authority.
