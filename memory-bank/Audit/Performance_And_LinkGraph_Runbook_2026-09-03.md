# Lighthouse baseline and link-graph report — how to run them, and what the first runs found

Both were the last two engineering items in P1. Both are now runnable commands with retained
artifacts, and both found real problems on the first run.

## 1. Lighthouse baseline

```bash
npm run perf:baseline:prod     # measures https://roaya.co
npm run perf:baseline          # measures a local build on 127.0.0.1:4500
```

Chrome must be installed; the script finds it at the default macOS path or via `CHROME_PATH`.
Lighthouse itself is fetched by `npx` at a pinned major version, so nothing is added to
`package.json`. For CI, pin it as a devDependency so a Lighthouse release cannot move the
numbers underneath you.

### The agreed profile

Mobile form factor, mobile screen emulation, **simulated** throttling, categories
performance / accessibility / SEO / best-practices, Lighthouse 12. Changing any of this
invalidates comparison with every earlier run, so change it deliberately and say so in the
artifact. Each run writes `memory-bank/Audit/performance/YYYY-MM-DD-<host>.{json,md}`.

**Measure production, not the local build.** The local SSR server does not gzip — nginx does
that in production — so a local run reports roughly 1.8 MB of "enable text compression"
savings that do not exist for real users, and its LCP is wrong by a wide margin.

### First baseline: 3 September 2026, https://roaya.co

| Category | Score |
|---|---:|
| Performance | 34–37 |
| Accessibility | 95 |
| SEO | 92 |
| Best practices | 75–79 |

| Metric | Measured | First milestone | Verdict |
|---|---:|---:|---|
| LCP | 13.3–17.5 s | ≤ 4.0 s | **missed by a wide margin** |
| TBT | 1,320–1,720 ms | ≤ 800 ms | **missed** |
| CLS | 0.001 | — | excellent |
| FCP | 3.3 s | — | poor |

Two runs minutes apart gave LCP 13.3 s and 17.5 s. That spread is exactly why the plan says
"agreed hardware": treat a single run as indicative, compare medians of three, and always run
from the same machine and network.

### What the baseline actually blames

Not the JavaScript bundle. The two dominant opportunities are images:

| Opportunity | Estimated saving |
|---|---|
| Properly size images | **4,700 KiB** |
| Serve images in next-gen formats | **4,189 KiB** |
| Reduce unused JavaScript | 313 KiB |
| Reduce unused CSS | 36 KiB |

The offenders are the "Sectors We Serve" logos, uploaded through the admin panel and served
at full resolution while displayed a few dozen pixels wide:

| File | Size | Wasted |
|---|---:|---:|
| `logos/factors/جامعة الـ…png` | 1,157 KiB | 1,156 KiB |
| `logos/factors/البنك الـ…png` | 645 KiB | 644 KiB |
| `logos/factors/جامعة حل…png` | 628 KiB | 627 KiB |
| `logos/factors/ministry-of-agriculture.png` | 450 KiB | 434 KiB |
| `logos/factors/بنك مصر.png` | 427 KiB | 426 KiB |
| `assets/images/roaya-logo.png` | 217 KiB | 210 KiB |

**One 1.1 MB PNG of a university logo is a larger download than the entire JavaScript
bundle.** Roughly 4.7 MB of the homepage is avoidable image weight.

This is not a code problem and it will come straight back if only these files are fixed:
logos are uploaded by admins and carried forward on every deploy. The durable fix is a
server-side image pipeline on upload — resize to the largest rendered size, emit WebP or AVIF
with a PNG fallback, cap the stored dimensions — plus a one-off pass over what is already
uploaded. Until that exists, `critical-path-budget` cannot catch a regression here, because
the images are user content and never pass through the build.

### Other findings from the same run

- **Accessibility 95** — two real failures: insufficient colour contrast somewhere on the
  homepage, and heading elements not in sequentially-descending order.
- **SEO 92** — "links do not have descriptive text" (likely "Learn more" style anchors).
- **Best practices** — third-party cookies, and browser console errors on load.

None of these are gated yet. They are small, and worth a pass of their own.

## 2. Internal link-graph report

```bash
npm run report:link-graph      # writes memory-bank/Audit/link-graph/YYYY-MM-DD.md
```

Enforced on every build by the `internal-link-graph` gate.

### How it works, and why it is built this way

It reads the **anchors in the served HTML** of every prerendered route — the graph a crawler
actually walks. Not the route table, not the sitemap, not the mega-menu configuration. Those
describe what the site intends; the anchors are what a crawler can follow.

The sitemap supplies the set of indexable pages, so a link to a server-rendered listing or
detail page is not miscounted as broken, and routes deliberately kept out of the sitemap (the
noindex placeholders) are excluded from the reachability rules rather than reported as faults.

It then reports orphans (nothing links to them), unreachable pages, anything deeper than
three clicks from a locale home page, and links pointing at no page.

### What the first run found

**Two commercial pages were unreachable by any link on the site:**

- `/services/worldposta` and `/ar/services/worldposta` — **orphans**. In the sitemap, in
  `llms.txt`, a full service page for the partnership the company leads with, and **nothing
  linked to it**.
- `/resources` and `/ar/resources` — the resources hub, **unreachable**.

The cause is the same for both, and it is the same class of bug as the 2026-09-01 blog cards:
the desktop mega-menu renders **no anchors at all** in the server HTML, and the mobile drawer
is conditionally rendered, so it renders none either. Every route whose only path ran through
the navigation was invisible to a crawler.

**Fixed:** the Resources hub is now a footer link, and WorldPosta is now a card on the
services index. Both are always-rendered anchors. The report now shows 58 built routes, 78
indexable, **0 orphans, 0 unreachable, 0 deeper than three clicks, 0 broken links**.

**Worth a separate look:** the primary navigation contributes nothing to the crawlable link
graph. The site currently gets away with it because the footer and in-page content cover most
routes, but any new page added to the mega-menu alone will be born orphaned. The gate will
now catch that on the build that introduces it.

## Verification

18 of 18 AI-readiness gates pass, all self-tests pass, 91 of 91 frontend specs pass, both
deploy-gate simulations pass.
