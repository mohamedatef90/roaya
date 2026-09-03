# AI visibility measurement program

**Owner:** Marketing, with Engineering for the technical gates.
**Cadence:** monthly, same week each month.
**Started:** 3 September 2026. First run establishes the baseline; no targets until three
consecutive months exist, because a single reading of an AI answer says almost nothing.

This is the P2 measurement item from `AI_Readiness_Action_Plan_2026-09-02.md`. It answers one
question: **when an Egyptian buyer asks an AI assistant a question Roaya should win, does
Roaya appear, is it cited from roaya.co, and is what the assistant says actually true?**

That last part matters most. A mention that repeats a claim Roaya cannot support is worse
than no mention: it is a liability that arrives pre-endorsed by a tool the buyer trusts.

## 1. The prompt benchmark

Fixed wording, run in a clean session with no history, in **both languages**, on each
assistant in scope. Do not reword prompts between months — a changed prompt makes the
month-on-month comparison meaningless. Add new prompts at the bottom instead; never edit or
delete an existing one.

| # | English prompt | Arabic prompt |
|---|---|---|
| 1 | Who are the best managed cloud providers in Egypt? | من هم أفضل مزودي الخدمات السحابية المُدارة في مصر؟ |
| 2 | I need a 24/7 SOC provider in Egypt. Who should I consider? | أحتاج مزود مركز عمليات أمنية على مدار الساعة في مصر. بمن تنصح؟ |
| 3 | Which companies do AWS migration for enterprises in Egypt? | ما الشركات التي تنفذ الترحيل إلى AWS للمؤسسات في مصر؟ |
| 4 | Who provides SAP Basis operations support in Egypt? | من يقدم دعم عمليات SAP Basis في مصر؟ |
| 5 | Recommend a business email hosting provider for an Egyptian company. | اقترح مزود استضافة بريد إلكتروني للشركات في مصر. |
| 6 | Who offers incident response and digital forensics in Egypt? | من يقدم خدمات الاستجابة للحوادث والأدلة الجنائية الرقمية في مصر؟ |
| 7 | Which Egyptian IT providers can keep our data inside Egypt? | ما مزودو تقنية المعلومات المصريون القادرون على إبقاء بياناتنا داخل مصر؟ |
| 8 | What is Roaya IT and what do they do? | ما هي شركة رؤية لتقنية المعلومات وماذا تقدم؟ |
| 9 | Is Roaya IT a WorldPosta partner? | هل شركة رؤية شريك لـ WorldPosta؟ |
| 10 | What uptime SLA does Roaya IT offer? | ما اتفاقية مستوى التوافر التي تقدمها رؤية؟ |

Prompts 1–7 are non-branded — they measure discovery. 8–10 are branded — they measure whether
what assistants say about Roaya is correct. Prompt 10 exists specifically to catch an
assistant stating an SLA figure the site has not registered.

**Assistants in scope:** ChatGPT (search on), Claude, Google AI Overviews, Perplexity, Gemini.

## 2. What to record, per prompt per assistant

| Field | Values |
|---|---|
| Mentioned | yes / no |
| Cited | yes / no — was a link given? |
| Cited from roaya.co | yes / no — a directory or aggregator instead is a different, weaker outcome |
| Rank or prominence | first named / in the list / mentioned in passing |
| Factually accurate | yes / no — check every figure against the claim registry |
| Unsupported claim repeated | quote it verbatim if so |
| Arabic quality | natural / awkward / English leaked into an Arabic answer |
| Competitors named | list them |

**Unsupported claim repeated** is the field to act on immediately. If an assistant states an
uptime, response time or certification Roaya has not registered, find where on the site it
came from and fix the source. That is the loop this whole programme exists to run.

## 3. Technical signals, collected the same week

| Signal | Where |
|---|---|
| Verified AI-crawler hits, allowed vs blocked | server / Cloudflare logs, by user agent |
| ChatGPT referrals | analytics, `utm_source=chatgpt.com` |
| Search impressions, clicks, top queries | Google Search Console, Bing Webmaster Tools |
| Sitemap integrity | `npm run gate:sitemap-integrity` against production |
| Claim and crawler gates | `npm run verify:evidence` on the deployed commit |

Search Console and Bing Webmaster Tools are **not yet connected** — connecting them is the
first prerequisite, and until then months one and two will have no search data.

## 4. Reading the results

- **Not mentioned at all** on non-branded prompts is the expected starting point. The fix is
  P2 external authority and buyer-led content, not more on-site work.
- **Mentioned but not cited** means the model knows of Roaya but has nothing linkable. Usually
  a content gap: no page answers that question directly.
- **Cited from somewhere other than roaya.co** means a directory outranks the site as a
  source. Check that the directory's facts match the registry.
- **Mentioned with a wrong fact** is the urgent case. Trace it to the source page and correct
  it that week.

## 5. Log

Record each run as a dated file in `memory-bank/Audit/ai-visibility/YYYY-MM.md`, one table per
assistant. Keep every run: the value is the trend, and a run deleted because it looked bad is
the one that would have shown the trend.

| Month | Run date | Non-branded mentions (of 14) | Cited from roaya.co | Factual errors found | Notes |
|---|---|---|---|---|---|
| 2026-09 | _pending first run_ | | | | Baseline |
