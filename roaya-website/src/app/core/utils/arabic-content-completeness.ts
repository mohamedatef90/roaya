/**
 * Arabic content completeness rule.
 *
 * 2026-09-02 AI-readiness reconciliation: the sitemap and the hreflang
 * alternates may only advertise an Arabic article that actually exists as a
 * complete article. Every published post currently carries a full-length
 * `contentEn` and a `contentAr` stub of a few hundred characters (verified
 * against the live blog API on 2026-09-02). Listing
 * `/ar/resources/blog/<slug>` for such a post tells crawlers the two URLs are
 * one article in two languages when the Arabic one is a summary at best.
 *
 * The SSR sitemap (src/server.ts) and the blog-detail page (its hreflang set)
 * both call `hasCompleteArabicVersion`, so they make the same decision from
 * the same fields. The module is pure and dependency-free for that reason: it
 * is shared by the Express server bundle and the Angular app.
 *
 * Rule — a post has a complete Arabic version when ALL of:
 *   1. `titleAr` is non-empty;
 *   2. `contentEn` is present — `undefined` or `null` means the caller could
 *      not see the English body (a trimmed API payload, a partial record),
 *      which is unknown, not complete, so the rule fails closed. An English
 *      body that is present but empty is an Arabic-only article: there is
 *      nothing to compare against and the ratio test is skipped;
 *   3. the word count of `contentAr` (HTML tags stripped) is at least
 *      AR_MIN_COMPLETENESS_RATIO of the word count of `contentEn` (tags
 *      stripped);
 *   4. `contentAr` carries at least AR_MIN_ARTICLE_WORDS words on its own.
 *      This is the same floor the rule needs when `contentEn` is empty; it is
 *      applied unconditionally because a ratio alone lets a three-sentence
 *      Arabic stub pass whenever the English article is itself short (live
 *      data 2026-09-02: 54 Arabic words vs 99 English words = 0.55).
 */
export const AR_MIN_COMPLETENESS_RATIO = 0.5;
export const AR_MIN_ARTICLE_WORDS = 100;

export interface ArabicCompletenessInput {
  titleAr?: string | null;
  contentAr?: string | null;
  contentEn?: string | null;
}

/**
 * Words in `text` after HTML tags are stripped. A whitespace-separated token
 * counts as a word only if it contains a letter or a digit (any script), so
 * markdown markers (`##`, `**`, `-`) and stray punctuation do not inflate the
 * count.
 */
export function countContentWords(text: string | null | undefined): number {
  if (!text) {
    return 0;
  }
  return text
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(token => /[\p{L}\p{N}]/u.test(token)).length;
}

export function hasCompleteArabicVersion(input: ArabicCompletenessInput): boolean {
  if ((input.titleAr ?? '').trim().length === 0) {
    return false;
  }

  const arabicWords = countContentWords(input.contentAr);
  if (arabicWords < AR_MIN_ARTICLE_WORDS) {
    return false;
  }

  // Absent (not merely empty) English body: the comparison cannot be made, so
  // the Arabic version's completeness is unknown. Unknown must never advertise
  // an /ar article URL, so fail closed rather than trusting the word floor
  // alone (a trimmed list payload would otherwise re-advertise every post).
  if (input.contentEn === undefined || input.contentEn === null) {
    return false;
  }

  const englishWords = countContentWords(input.contentEn);
  if (englishWords === 0) {
    return true;
  }
  return arabicWords >= AR_MIN_COMPLETENESS_RATIO * englishWords;
}
