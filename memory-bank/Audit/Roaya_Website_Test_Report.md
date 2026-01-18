# Roaya.co Website Test Report

## Summary

| Metric | Count |
|--------|-------|
| Total Language Issues | 93 |
| Total UI Bugs | 68 |
| Pages with Language Issues | 24 |
| Pages with UI Bugs | 21 |

---

## Language Issues

### /

**URL:** https://roaya.co/

**Issue 1:** "1 common.of 3" → Localization/i18n keys or placeholders are displayed to users instead of a localized string (shows 'common.of' key).

> **Suggestion:** Ensure the internationalization resource is loaded and the key is resolved before rendering. Replace the key with the intended formatted string (e.g., "1 of 3").

---

### /about

**URL:** https://roaya.co/about

**Issue 1:** "Loading ." → Punctuation spacing / incorrect formatting — a stray space appears before the period and the message looks like an incomplete or broken loading indicator.

> **Suggestion:** Replace with properly formatted text ("Loading..." or "Loading.") or hide this text on completed page load. Remove the unnecessary space before the period.

**Issue 2:** "6+ Years Experience" → Grammar/capitalization inconsistency and readability — 'Years Experience' is not the clearest form.

> **Suggestion:** Use "6+ years' experience" or "6+ Years of Experience" for grammatical correctness and consistency.

**Issue 3:** ""Founded in 2018, Roaya IT emerged from a simple observation: Egyptian businesses deserve IT solutions that match global standards without the complexity and hidden costs often associated with enterprise technology."" → Inconsistent use of quotation marks around a paragraph that other paragraphs do not have quoted styling.

> **Suggestion:** Remove the quotation marks if this is not a direct quote or apply a consistent quote style across similar content blocks. Maintain a single style for block text.

**Issue 4:** "Loading application, please wait…" → Use of ellipsis character (… ) is acceptable, but ensure consistency (three dots '...' vs single ellipsis char).

> **Suggestion:** Standardize to either 'Loading application, please wait...' or keep '…' consistently across the site. Also ensure loading messages are hidden when the application is ready.

---

### /industries/education

**URL:** https://roaya.co/industries/education

**Issue 1:** "Our solutions are designed to meet the strictest industry standards and regulatory requirements" → Missing terminal punctuation (period).

> **Suggestion:** Add a period at the end: "Our solutions are designed to meet the strictest industry standards and regulatory requirements."

**Issue 2:** "Tailored technology solutions designed specifically for your industry's unique needs and challenges" → Missing terminal punctuation (period).

> **Suggestion:** Add a period at the end: "Tailored technology solutions designed specifically for your industry's unique needs and challenges."

**Issue 3:** "Egyptian support team available 24/7 in your timezone and language." → Missing article at sentence start; sentence reads like a fragment. It is grammatically awkward.

> **Suggestion:** Change to "Our Egyptian support team is available 24/7 in your timezone and language." or "An Egyptian support team is available 24/7 in your timezone and language."

---

### /industries/government

**URL:** https://roaya.co/industries/government

**Issue 1:** "Loading .." → Incorrect ellipsis and spacing — uses two dots and an extra space; inconsistent with common 'Loading...' convention.

> **Suggestion:** Replace with 'Loading...' or 'Loading…' (single ellipsis character) and remove extra space: 'Loading...'.

**Issue 2:** "Our solutions are designed to meet the strictest industry standards and regulatory requirements" → Missing terminal punctuation (period).

> **Suggestion:** Add a period at the end: '...regulatory requirements.'

**Issue 3:** "Tailored technology solutions designed specifically for your industry's unique needs and challenges" → Missing terminal punctuation (period).

> **Suggestion:** Add a period at the end: '...needs and challenges.'

**Issue 4:** "Egyptian support team available 24/7 in your timezone and language." → Missing determiner and 'timezone' should be two words ('time zone'). The sentence sounds slightly clipped (missing 'Our').

> **Suggestion:** Rewrite for clarity: 'Our Egyptian support team is available 24/7 in your time zone and language.'

**Issue 5:** "99.9% Uptime" → Inconsistent capitalization; 'Uptime' is capitalized in a short label which may be stylistic but can look inconsistent with other stat labels.

> **Suggestion:** Use sentence case for consistency: '99.9% uptime' (or keep as-is if it's a deliberate design choice).

**Issue 6:** "150+ Happy Clients" → Inconsistent capitalization — 'Happy Clients' uses title case while other small stat labels use sentence case.

> **Suggestion:** Use sentence case for consistency: '150+ happy clients' or unify the styling across all stats.

---

### /industries/healthcare

**URL:** https://roaya.co/industries/healthcare

**Issue 1:** "Our solutions are designed to meet the strictest industry standards and regulatory requirements" → Missing terminal punctuation (period).

> **Suggestion:** Add a period at the end of the sentence.

**Issue 2:** "Tailored technology solutions designed specifically for your industry's unique needs and challenges" → Missing terminal punctuation (period).

> **Suggestion:** Add a period at the end of the sentence.

**Issue 3:** "Egyptian support team available 24/7 in your timezone and language." → Clarity/tone: missing article and could be phrased more professionally.

> **Suggestion:** Rephrase to: "Our Egyptian support team is available 24/7 in your time zone and preferred language."

---

### /industries/manufacturing

**URL:** https://roaya.co/industries/manufacturing

**Issue 1:** "99.99% uptime guarantees for ERP systems, supply chain management, and production monitoring platforms." → Semantic inconsistency with other metric elsewhere on the page ('99.9% Uptime'). Two different uptime percentages are shown.

> **Suggestion:** Standardize the uptime percentage across the page (choose either 99.99% or 99.9%) and update all occurrences to match.

**Issue 2:** "Our solutions are designed to meet the strictest industry standards and regulatory requirements" → Missing sentence terminal punctuation (period).

> **Suggestion:** Add a period at the end: '...regulatory requirements.'

**Issue 3:** "Tailored technology solutions designed specifically for your industry's unique needs and challenges" → Missing sentence terminal punctuation (period).

> **Suggestion:** Add a period at the end: '...unique needs and challenges.'

**Issue 4:** "Egyptian support team available 24/7 in your timezone and language." → Potential clarity/consistency issue: 'Egyptian support team' and 'in your timezone and language' could be contradictory (Egypt time vs user's timezone).

> **Suggestion:** Clarify whether support operates from Egypt but covers customer timezones and languages (e.g., 'Egypt-based support team available 24/7, covering your timezone and language').

---

### /industries/retail

**URL:** https://roaya.co/industries/retail

**Issue 1:** "Loading ." → Punctuation/formatting: stray space before period and very short ambiguous message.

> **Suggestion:** Replace with 'Loading...' or 'Loading.' and remove the extra space; ideally use a clear loading label such as 'Loading application...' or hide this text when not needed.

**Issue 2:** "Our solutions are designed to meet the strictest industry standards and regulatory requirements" → Missing terminal punctuation (period).

> **Suggestion:** Add a period at the end: '...regulatory requirements.'

**Issue 3:** "Tailored technology solutions designed specifically for your industry's unique needs and challenges" → Missing terminal punctuation (period).

> **Suggestion:** Add a period at the end: '...unique needs and challenges.'

**Issue 4:** "Egyptian support team available 24/7 in your timezone and language." → Awkward phrasing and missing article/case: 'in your timezone' (time zone is usually two words) and sentence would be clearer with a subject.

> **Suggestion:** Rephrase to: 'Our Egyptian support team is available 24/7 in your time zone and preferred language.'

**Issue 5:** "99.9% Uptime" → Inconsistent casing: 'Uptime' uses title case while other stats use sentence case.

> **Suggestion:** For consistency, use sentence-style casing: '99.9% uptime' (or format all stat labels consistently).

**Issue 6:** "150+ Happy Clients" → Inconsistent casing: 'Happy Clients' uses title case.

> **Suggestion:** Use '150+ happy clients' for consistent sentence-style casing.

---

### /resources/blog

**URL:** https://roaya.co/resources/blog

**Issue 1:** "Zero trust security architecture" → Inconsistent capitalization compared to the corresponding heading 'Zero Trust Security: A Practical Implementation Guide'.

> **Suggestion:** Use consistent capitalization: 'Zero Trust security architecture' or 'Zero Trust Security Architecture'.

**Issue 2:** "Load More 4" → If displayed as a combined label, the '4' appended to 'Load More' is unclear and looks like a UI concatenation problem.

> **Suggestion:** Clarify the intent in the text (e.g., 'Load More (4)') or show the count in a separate, clearly styled badge.

---

### /resources/case-studies

**URL:** https://roaya.co/resources/case-studies

**Issue 1:** "Major Egyptian Bank Achieves 42% Cost Reduction with Zero-Downtime Cloud Migration" → Hyphenation and capitalization consistency in headline. 'Zero-Downtime' is oddly capitalized and hyphenated in a title-case headline.

> **Suggestion:** Use either 'Zero Downtime' (no hyphen) or 'zero-downtime' in sentence case. Recommended: 'Major Egyptian Bank Achieves 42% Cost Reduction with Zero Downtime Cloud Migration' or 'Major Egyptian Bank Achieves 42% Cost Reduction with zero-downtime cloud migration' depending on style.

**Issue 2:** "One of Egypt's leading retail banks reduced infrastructure costs by 42% while achieving 99.94% uptime through phased cloud migration on Egypt-hosted infrastructure, fully compliant with CBE regulations." → Unexpanded abbreviation (CBE) may confuse readers who don't know the acronym. Also tense could be modernized for relevance.

> **Suggestion:** Expand the abbreviation on first use: '...fully compliant with the Central Bank of Egypt (CBE) regulations.' Consider using present perfect for results relevant now: 'has reduced infrastructure costs by 42%...'.

**Issue 3:** "Leading Hospital Network Achieves Zero Breaches with 24/7 SOC Implementation" → Body paragraph uses 'comprehensive Security Operations Center solution' without an article and uses unexplained abbreviation 'SOC'.

> **Suggestion:** Add an article and expand the abbreviation at first mention: '...eliminated security threats with a comprehensive Security Operations Center (SOC) solution, achieving...'.

**Issue 4:** "Egypt's fastest-growing private hospital network eliminated security threats with comprehensive Security Operations Center solution, achieving 85% faster threat detection and HIPAA-aligned security controls." → HIPAA is a US-specific standard — referencing it for an Egyptian hospital may be confusing/technically misleading. Also missing article before 'comprehensive Security Operations Center solution'.

> **Suggestion:** Either justify HIPAA relevance (e.g., 'aligned with international standards such as HIPAA') or replace with 'aligned with international healthcare data protection standards'. Add an article: 'with a comprehensive Security Operations Center (SOC) solution...'.

**Issue 5:** "See how banks, hospitals, and manufacturers reduced IT costs by 40% while achieving 99.9%+ uptime with Roaya IT's transparent cloud and security solutions." → Inconsistent precision for uptime claims (this says '99.9%+' while other specifics use 99.94% and 99.99%).

> **Suggestion:** Standardize the uptime wording—either show an approximate value consistently (e.g., '99.9%+') or show exact figures consistently and indicate that exact values refer to specific clients.

**Issue 6:** "Loading application, please wait…" → Inconsistent ellipsis character and slight wording inconsistency compared to other loading text ('Loading ...').

> **Suggestion:** Unify loading messages and ellipsis usage. Consider 'Loading the application, please wait…' or simply 'Loading…' for brevity, using the single-character ellipsis for consistency.

**Issue 7:** "© 2026 All rights reserved." → Footer copy is generic and omits the company name; slightly atypical phrasing.

> **Suggestion:** Use '© 2026 Roaya IT. All rights reserved.' to make ownership explicit.

**Issue 8:** "Read Case Study" → Consistent phrasing is fine, but verify these are actual links and have accessible link semantics/aria-labels that explain destination (e.g., which case study).

> **Suggestion:** If multiple 'Read Case Study' links appear, add contextual link text or aria-labels like 'Read case study: Major Egyptian Bank' to help screen reader users differentiate them.

**Issue 9:** "Email & Collaboration / Backup & Recovery / Cloud Solutions" → Use of ampersand (&) in navigation and lists is acceptable, but consider consistency and readability.

> **Suggestion:** Decide site-wide whether to use '&' or 'and' and apply consistently. For formal contexts, 'and' is often preferred: 'Email and Collaboration', 'Backup and Recovery'.

**Issue 10:** "Filter by Industry / Filter by Service" → No grammatical issue, but ensure filter buttons' labels match their accessible names (e.g., include state: 'All, selected').

> **Suggestion:** Ensure filter buttons include ARIA attributes (aria-pressed/aria-current) when selected so assistive tech users understand the state.

---

### /resources/documentation

**URL:** https://roaya.co/resources/documentation

**Issue 1:** "resources.documentation.comingSoon.meta.title" → Localization key remains visible as page title in snapshot metadata; page title is not user-friendly.

> **Suggestion:** Ensure the final rendered page uses a human-readable title such as "Documentation — Coming Soon" and that i18n keys are not exposed in production.

**Issue 2:** "Back to Resources" → No grammar/spelling issue detected, but consider link clarity when used alone (context is required).

> **Suggestion:** If this link appears outside clear context, change to "Back to Resources page" or ensure surrounding context makes destination obvious.

**Issue 3:** "+20 2 7469708" → Phone number formatting inconsistent with tel href (usability/clarity issue).

> **Suggestion:** Display the phone number in a clear and consistent international format matching the tel: link (e.g., "+20227469708" or "+20 2 27469708").

---

### /resources/whitepapers

**URL:** https://roaya.co/resources/whitepapers

**Issue 1:** "resources.whitepapers.comingSoon.meta.title" → Localization / i18n key exposed instead of human-readable page title; not user-friendly.

> **Suggestion:** Render the localized page title string (e.g., "Whitepapers — Coming Soon") instead of the i18n resource key. Ensure the i18n resources are loaded and the title binding falls back to a default language string when a key is missing.

**Issue 2:** "Loading ." → Odd punctuation / incomplete text — stray period with leading space; looks like a placeholder or formatting bug.

> **Suggestion:** Replace with clear loading text such as "Loading…" or "Loading" or remove the stray element. If intended to show a dynamic state, ensure the dynamic text populates correctly (e.g., "Loading Roaya IT experience…").

**Issue 3:** "+20 2 7469708" → Phone number formatting is inconsistent/unclear for international users.

> **Suggestion:** Use a consistent, internationally-recognizable format (e.g., E.164 or a spaced local format). Examples: "+20227469708" (E.164) or "+20 2 746 9708" for readability.

---

### /services/ai

**URL:** https://roaya.co/services/ai

**Issue 1:** "We design and deliver AI as an operational capability. This enables organizations to automate work, deploy intelligent agents, and generate measurable outcomes safely and repeatably." → Awkward adverb use and sentence flow — 'repeatably' is uncommon and the phrase 'generate measurable outcomes safely and repeatably' is slightly awkward.

> **Suggestion:** Rephrase for clarity: 'We design and deliver AI as an operational capability. This enables organizations to automate work, deploy intelligent agents, and to generate measurable outcomes in a safe, repeatable way.' or replace 'repeatably' with 'reliably'.

**Issue 2:** "analytics that improves decisions, not just reporting" → Subject-verb agreement: 'analytics' (treated as plural or uncountable) followed by 'improves' (singular verb) creates a grammar mismatch.

> **Suggestion:** Change to 'analytics that improve decisions, not just reporting' or rephrase 'analytics that lead to improved decisions, not just reporting.' Standardize whether 'analytics' is treated as singular or plural across the site and apply consistent verb agreement.

---

### /services/automation

**URL:** https://roaya.co/services/automation

**Issue 1:** "30 days post-launch support" → Awkward/ambiguous time phrasing in final content.

> **Suggestion:** Replace with '30 days of post-launch support' or '30-day post-launch support'.

**Issue 2:** "90 days support and optimization" → Incorrect/dangling time phrasing in final content.

> **Suggestion:** Replace with '90 days of support and optimization' or '90-day support and optimization'.

**Issue 3:** "Always improving" → Inconsistent heading capitalization remains in final content.

> **Suggestion:** Standardize to 'Always Improving' or adopt a consistent site-wide capitalization policy.

**Issue 4:** "Human handoff for complex inquiries" → Wording could be clearer in final copy.

> **Suggestion:** Consider 'Handover to a human agent for complex inquiries' or 'Human hand-off for complex inquiries'.

---

### /services/backup

**URL:** https://roaya.co/services/backup

**Issue 1:** "<4 Hour" → Grammar / unit agreement: singular 'Hour' used with '<4' (less-than-four) is awkward and likely incorrect.

> **Suggestion:** Use '<4 Hours' or 'Under 4 hours' to correctly express the intended timeframe.

**Issue 2:** "15 min" → Inconsistent / informal time unit formatting.

> **Suggestion:** Use '15 minutes' (preferred for user-facing copy) or '15 min.' for a compact form with consistent punctuation.

**Issue 3:** "Get DR Assessment" → Missing article / slightly awkward phrasing — reads as incomplete sentence (should include 'a' or be rephrased).

> **Suggestion:** Use 'Get a DR Assessment' or better 'Request a DR assessment' for clarity and grammatical correctness.

**Issue 4:** "Schedule Free DR Assessment" → Slightly terse phrasing; lacks article and sentence-case consistency for normal body copy.

> **Suggestion:** Consider 'Schedule a free DR assessment' (sentence case) or 'Schedule Free DR Assessment' as a consistent CTA style — ensure it matches other CTAs in tone and capitalization.

---

### /services/cloud

**URL:** https://roaya.co/services/cloud

**Issue 1:** "Scale your business with multi-cloud infrastructure, expert management, and 40% cost reduction" → Missing terminal punctuation (period) in a paragraph sentence; inconsistent sentence punctuation across the page.

> **Suggestion:** Add a period at the end: "...and 40% cost reduction."

**Issue 2:** "Business hours support (8x5)" → Use of '8x5' is non-standard typography; multiplication sign or clearer phrasing preferred.

> **Suggestion:** Replace with 'Business hours support (8×5)' or 'Business hours support (Mon–Fri, 8:00–17:00)'.

---

### /services/consulting

**URL:** https://roaya.co/services/consulting

**Issue 1:** "View Detailed Pricing & Custom Packages" → No direct grammar error, but ensure consistent use of ampersand vs 'and' across CTAs for brand consistency.

> **Suggestion:** Decide on consistent styling for '&' vs 'and' across the site (e.g., use 'and' in longer headings, '&' in compact labels) and apply consistently.

**Issue 2:** "Complementary Services" → Potential misuse of 'Complementary' vs 'Complimentary' if the intention is 'related' or 'supplementary' rather than 'free'.

> **Suggestion:** If meant 'related/supplementary', 'Complementary Services' is correct. If meant 'free', use 'Complimentary Services'. Confirm intended meaning and use the correct spelling.

**Issue 3:** "Get Your Custom Quote / Tailored to your needs" → No grammar errors, but ensure consistent capitalization for microcopy (title case vs sentence case) across similar CTA areas.

> **Suggestion:** Standardize CTA capitalization across the site (e.g., Title Case for CTAs: "Get Your Custom Quote" and sentence case for descriptions: "Tailored to your needs").

---

### /services/devops

**URL:** https://roaya.co/services/devops

**Issue 1:** "<15min" → Formatting / readability — missing space between number and unit; compact notation may be unclear to some readers.

> **Suggestion:** Use a more readable format like "< 15 min" or "Under 15 minutes".

**Issue 2:** "Not experimentation. Production-ready delivery from day one." → Awkward sentence fragment and unclear phrasing — "Not experimentation." is a fragment and reads oddly.

> **Suggestion:** Rephrase to a complete sentence such as "Not an experiment — production-ready delivery from day one." or "This is not experimentation; it is production-ready delivery from day one."

**Issue 3:** "Clear roadmap delivery" → Awkward/unclear phrase — missing preposition or connector.

> **Suggestion:** Change to "Clear roadmap for delivery" or "Clear delivery roadmap."

**Issue 4:** "DevOps Fails Not Because Teams Lack Tools" → Heading is understandable but slightly awkward in tone/grammar. The negative phrasing feels abrupt.

> **Suggestion:** Consider rephrasing to a more natural construction like "DevOps doesn't fail because teams lack tools" or "DevOps fails for reasons other than missing tools."

---

### /services/email

**URL:** https://roaya.co/services/email

**Issue 1:** "Loading .." → Ellipsis and spacing punctuation inconsistent with other loader text on page.

> **Suggestion:** Replace with a consistent ellipsis style: 'Loading…' or 'Loading...'.

**Issue 2:** "e-discovery vs E-discovery" → Inconsistent capitalization of 'e-discovery' across headings and content.

> **Suggestion:** Standardize capitalization per editorial guidelines.

**Issue 3:** "Bilingual ready" → Minor style/clarity issue; a compound adjective may need hyphenation.

> **Suggestion:** Use 'Bilingual-ready' or 'Bilingual support' for clarity.

**Issue 4:** "Images with missing alt text" → Multiple images in snapshot appear without alt attributes, reducing accessibility.

> **Suggestion:** Add descriptive alt attributes for content images and use alt="" or role="presentation" for decorative images.

**Issue 5:** "Start Free Trial vs Get Free Trial" → CTA inconsistency across page.

> **Suggestion:** Choose one CTA phrasing and use it consistently (e.g., 'Start Free Trial').

---

### /services/managed

**URL:** https://roaya.co/services/managed

**Issue 1:** "<30 min" → Use of symbol may be ambiguous and not screen-reader friendly.

> **Suggestion:** Replace with "Under 30 minutes" or "Less than 30 minutes".

**Issue 2:** "Prevent not react" → Ungrammatical and unclear phrase.

> **Suggestion:** Change to "Prevent, not react" or "Prevention, not reaction".

**Issue 3:** "We don't just react to problems - we prevent them with continuous monitoring and predictive analytics" → Punctuation uses hyphen instead of em dash or semicolon; inconsistent style.

> **Suggestion:** Use an em dash: "We don't just react to problems — we prevent them with continuous monitoring and predictive analytics."

**Issue 4:** "Round-the-clock expert assistance available anytime" → Missing sentence-ending punctuation.

> **Suggestion:** Add period: "Round-the-clock expert assistance available anytime."

---

### /services/sap

**URL:** https://roaya.co/services/sap

**Issue 1:** "GRC Ready" → Inconsistent hyphenation/formatting; 'GRC-ready' might be clearer and consistent with style guidelines.

> **Suggestion:** Adopt and apply a consistent hyphenation/case style across feature labels (e.g., 'GRC-ready').

**Issue 2:** "Hybrid ready" → Inconsistent hyphenation/formatting; 'Hybrid-ready' or 'Hybrid Ready' would be clearer depending on chosen style.

> **Suggestion:** Standardize to 'Hybrid-ready' or 'Hybrid Ready' site-wide.

**Issue 3:** "Full lifecycle" → Inconsistent capitalization with neighboring headings (e.g., 'End-to-End SAP Lifecycle').

> **Suggestion:** Follow a site-wide heading style (sentence case or title case) and update 'Full lifecycle' to match (e.g., 'Full lifecycle' or 'Full Lifecycle').

---

### /services/security

**URL:** https://roaya.co/services/security

**Issue 1:** "Protect,Detect,Respond" → Missing spaces after commas (punctuation spacing).

> **Suggestion:** Add spaces after commas: 'Protect, Detect, Respond'.

**Issue 2:** "Loading ." → Incorrect punctuation and spacing (single dot with preceding space).

> **Suggestion:** Use a proper ellipsis or period without extra space: 'Loading...' or 'Loading.'

**Issue 3:** "70% Faster" → Inconsistent capitalization when compared with the paragraph '70% faster than industry average' (capitalized 'Faster' vs lowercase in sentence).

> **Suggestion:** Use consistent capitalization: either '70% faster' or '70% Faster' consistently; sentence text should use lowercase 'faster'.

---

### /services/security/incident-response

**URL:** https://roaya.co/services/security/incident-response

**Issue 1:** "Roaya runs its AI models on our secure cloud infrastructure, so incident evidence and artifacts remain protected and under our control." → Inconsistent possessive pronouns: uses third-person 'its' and first-person plural 'our' in the same sentence.

> **Suggestion:** Use consistent pronouns. Either: "Roaya runs its AI models on its secure cloud infrastructure..." or "We run our AI models on our secure cloud infrastructure..."

**Issue 2:** "Pre-agree terms, contacts, access methods, and runbooks so you're not negotiating during an outage." → Awkward phrasing and missing preposition. 'Pre-agree' is terse and may read awkwardly.

> **Suggestion:** Use a clearer phrasing: "Pre-agree on terms, contacts, access methods, and runbooks so you're not negotiating during an outage."

**Issue 3:** "Triage, confirm what's real vs. noise, scope affected users/systems/data/timeline; map behaviors using MITRE ATT&CK." → Informal use of 'vs.' and slash-separated list reduces clarity and readability.

> **Suggestion:** Prefer full words and commas: "Triage, confirm what's real versus noise, scope affected users, systems, data, and timeline; map behaviors using MITRE ATT&CK."

**Issue 4:** "1hr" → Inconsistent time formatting compared with elsewhere on the page (where '1 hour' / 'within 1 hour' is used).

> **Suggestion:** Use consistent formatting across the page. Prefer '1 hour' or '1 hr' consistently (recommend '1 hour').

**Issue 5:** "NIST SP 800-61 Aligned" → Inconsistent hyphenation: elsewhere the page uses 'NIST-aligned' while here it uses 'NIST SP 800-61 Aligned' (title-style spacing).

> **Suggestion:** Use a consistent form for compound adjective: either 'NIST SP 800-61–aligned' or 'NIST-aligned (SP 800-61)'. Prefer 'NIST-aligned' for inline text and 'NIST SP 800-61 aligned' for full references. Ensure consistent hyphenation/capitalization across headings and body copy.

**Issue 6:** "Roaya's IR and forensics work is designed to fit into your broader governance and audit posture." → Minor style: 'IR' abbreviation is used; ensure it's previously introduced or expand on first use for clarity to non-technical readers.

> **Suggestion:** Either expand on first use ('incident response (IR)') or avoid abbreviation here: 'Roaya's incident response and forensics work...'.

**Issue 7:** "Tools listed are representative — we use a broader set of proven IR and forensic tools as needed to ensure complete coverage." → Use of an em dash is acceptable, but the abbreviation 'IR' appears again without expansion on the same page.

> **Suggestion:** As above, expand 'IR' at first instance or replace with 'incident response' for clarity: '...we use a broader set of proven incident response and forensic tools...'.

---

### /services/security/penetration-testing

**URL:** https://roaya.co/services/security/penetration-testing

**Issue 1:** "routinely exploit poor security configurations, weak controls, and poor cyber hygiene to gain initial access" → Sentence fragment begins with a lowercase letter. It looks like an incomplete sentence or a caption that lacks proper capitalization.

> **Suggestion:** Capitalize the first word and make the fragment a full sentence: 'Routinely, attackers exploit poor security configurations, weak controls, and poor cyber hygiene to gain initial access.' Or integrate it into the preceding sentence with correct punctuation.

**Issue 2:** "human element was a component of 68% of breaches" → Sentence fragment begins with a lowercase letter and lacks an article or subject. This reduces clarity and reads as inconsistent/casual formatting for a statistic.

> **Suggestion:** Rewrite as a complete sentence and capitalize: 'The human element was a component of 68% of breaches.' Add citation formatting if used as a quote or statistic.

**Issue 3:** "A proven 4-step methodology that combines expert-led validation with AI-accelerated analysis." → Style inconsistency: numbers under ten are typically spelled out in formal copy (e.g., 'four-step'). This is a minor style/consistency issue rather than a grammar error.

> **Suggestion:** Consider writing 'A proven four-step methodology...' for consistency with formal copy guidelines.

**Issue 4:** "Whether you choose an assessment, a penetration test, or both, the output is designed for action — not noise." → The em dash is used correctly, but spacing consistency around the dash should be verified against site style. This is a minor style suggestion.

> **Suggestion:** Confirm whether the site prefers '—' with spaces or '—' without surrounding spaces and standardize across pages. Optionally use an en dash or em dash consistently.

---

### /services/security/soc-solutions

**URL:** https://roaya.co/services/security/soc-solutions

**Issue 1:** "Roaya's 24/7 Security Operations Center services take continuous monitoring off your team, so you can focus on the business." → Non-idiomatic phrasing: "take continuous monitoring off your team" is awkward.

> **Suggestion:** Rephrase for clarity, e.g., "Roaya's 24/7 Security Operations Center services remove the burden of continuous monitoring from your team, letting you focus on the business."

**Issue 2:** "We use AI-assisted detection and triage to reduce false alarms, correlate signals, and speed response — while keeping telemetry and incident data protected using our own AI models on our cloud infrastructure." → Redundant wording and slightly clunky structure (repetition of 'using/our').

> **Suggestion:** Simplify: "We use AI-assisted detection and triage to reduce false alarms, correlate signals, and speed response — while protecting telemetry and incident data with our AI models hosted on our cloud infrastructure."

**Issue 3:** "© 2026 All rights reserved." → Possible future year or outdated/incorrect copyright year relative to deployment date (may or may not be intentional).

> **Suggestion:** Confirm copyright year; consider dynamically setting to current year to avoid manual updates.

---

## UI Bugs

### /about

**URL:** https://roaya.co/about

**Bug 1** (UIBug): Loading text 'Loading .' remains visible in the snapshot and appears incorrectly formatted; likely leftover loading state or incorrect text formatting.

> **Suggestion:** Hide or remove this loading message after the page finishes initializing. Replace with a spinner if appropriate and correct the punctuation to 'Loading...' or 'Loading.'

**Bug 2** (UIBug): Multiple 'img' elements in the page snapshot lack descriptive alt attributes (impacting accessibility) or are presented as empty placeholders.

> **Suggestion:** Add meaningful alt text for informative images and alt="" for decorative ones. Verify image resources load correctly and provide fallback images or attributes for cases where images fail to load.

**Bug 3** (UIBug): Several images appear represented as nested empty 'img' nodes in the snapshot — may indicate images failed to load or placeholders are shown instead of the expected artwork.

> **Suggestion:** Ensure image assets are accessible (valid src) and implement an onerror fallback (e.g., CSS background or SVG placeholder). Consider lazy-loading carefully so primary content images display reliably.

---

### /industries/education

**URL:** https://roaya.co/industries/education

**Bug 1** (UIBug): Service cards combine title, description and CTA into a single linked/interactive text element. This creates long concatenated link text like "Cloud Solutions Scalable cloud infrastructure for modern businesses Learn More", hurting readability and accessibility.

> **Suggestion:** Refactor card markup so title (heading), description (paragraph), and CTA (link/button) are separate elements. Alternatively, if the entire card must be clickable, set a clear aria-label describing the card content (short title + short description) and keep a visible separate CTA for keyboard/screen-reader clarity.

**Bug 2** (UIBug): The "Pricing" link navigates to /contact (same URL as contact CTA). The label suggests it should go to a pricing page but it points to the contact page, which may confuse users.

> **Suggestion:** Confirm the intended destination. If a pricing page exists, update the href to that URL (e.g., /pricing). If the link should open a contact-based pricing flow, relabel the link to make intent clear (e.g., "Contact us for Pricing").

---

### /industries/government

**URL:** https://roaya.co/industries/government

**Bug 1** (UIBug): A status/loading element is visible with the text 'Loading ..' while main content is already displayed. The 'Loading ..' string uses an incorrect ellipsis (two dots) and suggests the loader may not have been hidden after content load or there are duplicate loader messages.

> **Suggestion:** Ensure the loading/status element is removed or hidden once the page has fully loaded. Replace 'Loading ..' with a properly formatted ellipsis 'Loading...' and ensure only one loader/status message exists. If the loader is meant to be temporary, add a state check to hide/remove the element after content render.

**Bug 2** (UIBug): Service cards/links appear to concatenate title, description, and CTA into a single link text (e.g., 'Cybersecurity 24/7 security monitoring and threat protection Learn More'), which harms readability and accessibility.

> **Suggestion:** Structure service cards so the accessible name is concise (e.g., heading for the title, a separate paragraph for the description, and a distinct button or link for the CTA). Ensure link accessible names do not include both description and CTA text. Update markup so screen readers and visual users see clear separation.

---

### /industries/healthcare

**URL:** https://roaya.co/industries/healthcare

**Bug 1** (UIBug): Solution/service card links are rendered as a single concatenated text node combining title, description, and CTA. This reduces readability and may break screen-reader semantics.

> **Suggestion:** Refactor the card markup so the title (<h3>), description (<p>), and CTA (<a> or <button>) are separate elements. Ensure proper spacing and use aria-labels or visually-hidden text if needed.

**Bug 2** (UIBug): The 'Pricing' link points to /contact instead of a pricing resource — mismatch between label and href can confuse users.

> **Suggestion:** Point the 'Pricing' link to the correct pricing endpoint (e.g., /pricing) or change the label to 'Contact for Pricing' if contact is intended.

**Bug 3** (UIBug): Several img elements appear to lack alt attributes (non-descriptive images in DOM). This is an accessibility issue for screen-reader users.

> **Suggestion:** Provide meaningful alt attributes for content images, or use alt="" and aria-hidden="true" for decorative images. Ensure logos and actionable images have descriptive alt text.

---

### /industries/manufacturing

**URL:** https://roaya.co/industries/manufacturing

**Bug 1** (UIBug): Service card anchor elements appear to include multiple text blocks (title, description, CTA) inside a single clickable region. This creates long concatenated link text and may create confusing keyboard/assistive behavior.

> **Suggestion:** Refactor service card markup so that the primary title and the 'Learn More' CTA are separate interactive elements, or set a clear aria-label for the anchor. Ensure only the intended text becomes the accessible name for the link.

**Bug 2** (UIBug): The 'Pricing' link navigates to /contact (contact page) which might not be the intended destination for a 'Pricing' label; users expect a pricing-specific page.

> **Suggestion:** Confirm the intended destination for the 'Pricing' control. If the site has a pricing page, update the link to that path (for example /pricing). If pricing is handled via contact forms, clarify the label (e.g., 'Pricing (contact us)').

**Bug 3** (UIBug): Multiple paragraphs/lead sentences are missing terminal punctuation (period). This is a minor presentation/consistency issue.

> **Suggestion:** Add terminal punctuation to the affected sentences to improve consistency and readability.

---

### /industries/retail

**URL:** https://roaya.co/industries/retail

**Bug 1** (UIBug): Service cards' clickable region appears to combine heading, description and the 'Learn More' CTA into one link text; this causes readability and accessibility issues (screen readers may read the entire concatenated string and users may be unclear where to click).

> **Suggestion:** Make only the CTA (Learn More) the clickable element or clearly separate the link from the card content. Ensure ARIA labels and semantic markup separate heading, description, and link. Example: wrap only the CTA in <a href='/services/...'>Learn More</a> and use <h3> for the service title and <p> for the description.

**Bug 2** (UIBug): A loading text 'Loading .' is rendered with a stray space and looks like an unfinished/incomplete loading indicator visible on the page.

> **Suggestion:** Remove or hide this message after the app fully loads. Replace with a clear indicator if needed (e.g., 'Loading...' or a spinner with accessible label). Ensure spaces/punctuation are correct.

**Bug 3** (UIBug): The 'Pricing' link targets /contact instead of a pricing page (href='/contact'), which is unexpected for a 'Pricing' label.

> **Suggestion:** Update the 'Pricing' link href to the correct pricing page (e.g., /pricing) or change the label to reflect that it goes to contact. If a pricing page is not available, link to a pricing modal or clearly indicate why it leads to contact.

**Bug 4** (UIBug): Some text elements in the page (e.g., stats and feature labels) use inconsistent casing (e.g., '99.9% Uptime', '150+ Happy Clients') which hurts visual consistency.

> **Suggestion:** Standardize casing across UI components: choose title case for headings and sentence case for descriptions/stats. Update elements accordingly.

---

### /resources/blog

**URL:** https://roaya.co/resources/blog

**Bug 1** (UIBug): Multiple images are present without descriptive alt text or accessible labels, repeated across the page snapshot.

> **Suggestion:** Add descriptive alt attributes for all content images; use empty alt for purely decorative images. Audit the img elements for missing alt and update markup accordingly.

**Bug 2** (UIBug): Inconsistent heading levels for the same article titles in different page sections (featured vs list), harming document structure and accessibility.

> **Suggestion:** Standardize heading levels for identical content; ensure featured area uses headings that preserve semantic hierarchy under the page H1.

**Bug 3** (UIBug): The 'Subscribe' button is disabled with no visible inline guidance; can be confusing for users who cannot interact.

> **Suggestion:** Provide inline guidance or visible validation rules (e.g., show 'Enter a valid email to enable' and use aria-describedby for screen readers).

**Bug 4** (UIBug): Load More' control displays an additional separate '4' element which appears concatenated in the UI (label looks like 'Load More 4').

> **Suggestion:** Combine label and count intentionally (e.g., 'Load More (4)') or present count as a distinct badge with spacing and an accessible label.

---

### /resources/case-studies

**URL:** https://roaya.co/resources/case-studies

**Bug 1** (UIBug): A numeric statistic is rendered with extraneous quotation marks: the page shows "0" instead of 0 or Zero (appears near the 'Breaches' stat in the hospital case study).

> **Suggestion:** Remove the quotes before rendering numeric stats. Ensure the data binding/template doesn't stringify numeric values with quotes. If the value must be text, format as '0' without surrounding quotation marks or use 'Zero'.

**Bug 2** (UIBug): Multiple img elements appear to lack descriptive alt text or have empty/unspecified alt attributes (decorative or missing), which hurts accessibility and may be a presentation issue if images are key content.

> **Suggestion:** Add descriptive alt attributes to informative images (e.g., company logos, case study thumbnails). For purely decorative images, add alt="". Audit images used as links/thumbnails and supply meaningful alt text like 'Major Bank case study thumbnail' or 'Leading Hospital Network case study thumbnail'.

**Bug 3** (UIBug): Inconsistent ellipsis presentation in loading UI: both 'Loading ...' and 'Loading application, please wait…' appear across the page states, producing a visual and typographic inconsistency.

> **Suggestion:** Standardize loading copy and punctuation. Use a single-character ellipsis '…' everywhere and consistent phrasing (e.g., 'Loading…' or 'Loading the application…').

**Bug 4** (UIBug): Abbreviations (CBE, SOC) are used without expansion on first use, which may confuse some readers.

> **Suggestion:** Expand abbreviations on first mention (e.g., 'Central Bank of Egypt (CBE)', 'Security Operations Center (SOC)') and then use the acronym subsequently. This is both a language and small UI/content clarity fix.

---

### /resources/documentation

**URL:** https://roaya.co/resources/documentation

**Bug 1** (UIBug): Page <title> shows an i18n key instead of a user-facing title.

> **Suggestion:** Render localized title values or fallback to a default readable title string. Ensure i18n substitution occurs before title is set.

**Bug 2** (UIBug): Multiple images in page (header, main, footer) lack descriptive alt text or aria labels, reducing accessibility.

> **Suggestion:** Provide descriptive alt text for informative images and empty alt (alt="") for purely decorative images. Use aria-labels where appropriate.

---

### /resources/whitepapers

**URL:** https://roaya.co/resources/whitepapers

**Bug 1** (UIBug): Document title shows an i18n key instead of a human-readable title (resources.whitepapers.comingSoon.meta.title). This appears in the browser/tab title.

> **Suggestion:** Bind the page title to a resolved localized string and provide a fallback when the localization resource is missing. Verify i18n resource loading and title assignment (e.g., set document.title to the resolved string).

**Bug 2** (UIBug): A stray loading label reads "Loading ." which looks like an incomplete or malformed loading message.

> **Suggestion:** Fix the loading text generation so it uses ellipsis or a completed phrase ("Loading…" or "Loading Roaya IT experience…") and remove stray punctuation. Ensure the component that renders this text receives the correct value.

**Bug 3** (UIBug): Multiple <img> elements appear without descriptive alt text (images in header/hero/footer lack alt attributes). This is an accessibility and content problem.

> **Suggestion:** Add meaningful alt attributes to informative images and empty alt attributes (alt="") to purely decorative images. Use descriptive text for logos and functional images (e.g., alt="Roaya IT logo").

**Bug 4** (UIBug): "Skip to main content" links to "#main-content" but the main content element does not appear to have a matching id, making the skip link ineffective for keyboard/screen reader users.

> **Suggestion:** Add id="main-content" to the primary <main> element or update the skip link href to match the actual main element id. Ensure the target element is focusable if necessary.

---

### /services/automation

**URL:** https://roaya.co/services/automation

**Bug 1** (UIBug): Duplicate/concatenated complementary service link labels are present in the final DOM (confuses users and screen readers).

> **Suggestion:** Update the template or component generating these links so the title is not concatenated twice with the description. Ensure accessible markup: title element and description element separated.

**Bug 2** (UIBug): Breadcrumb separators exist as separate list items ('/'), which is not ideal for accessibility and semantics.

> **Suggestion:** Implement separators with CSS pseudo-elements or use ARIA/semantic markup for breadcrumb separators rather than separate list items containing '/', and verify screen reader behavior.

**Bug 3** (UIBug): Numerous <img> elements contain no alt text in final snapshot (accessibility issue).

> **Suggestion:** Provide appropriate alt attributes for content images; for decorative images add alt="". Audit images and add descriptive alt text where image conveys content or function.

---

### /services/backup

**URL:** https://roaya.co/services/backup

**Bug 1** (UIBug): Breadcrumb includes raw '/' characters as separate list items (visual separators are present as list items). These literal '/' items may be rendered as visible list nodes and will be announced by screen readers, causing poor UX and accessibility.

> **Suggestion:** Use CSS to render separators (e.g., ::before or ::after) or include separators as aria-hidden elements, not as separate list items. Ensure breadcrumb markup uses an ordered list of links without separator list items and relies on CSS for visual separators. Also include proper aria-label on the breadcrumb nav (e.g., aria-label='Breadcrumb').

**Bug 2** (UIBug): Complementary services links contain duplicated title text plus appended description in the link label (e.g., Cloud Solutions Cloud Solutions ...). This makes the link label overly verbose and confusing, and harms accessibility (screen readers will read the concatenated text).

> **Suggestion:** Separate the link title from descriptive copy. Ensure the anchor text is concise (e.g., 'Cloud Solutions') and the description is either outside the anchor or referenced via aria-describedby. Remove duplicated words from the accessible name.

**Bug 3** (UIBug): Multiple images are rendered without alt attributes (empty or missing alt). Missing alt text can cause accessibility issues for screen reader users and may indicate decorative images are not explicitly marked.

> **Suggestion:** Add descriptive alt text for informative images. For purely decorative images, add alt="" and role="presentation" or aria-hidden="true". Consider running an image accessibility audit and setting alt attributes appropriately.

---

### /services/consulting

**URL:** https://roaya.co/services/consulting

**Bug 1** (UIBug): Complementary services link blocks show duplicated and concatenated text (title repeated and description/CTA merged into the link label). This makes the link text long, unreadable, and likely inaccessible.

> **Suggestion:** Fix the rendering/template code that composes the link content for these blocks. Ensure each block has separate elements for title, description, and CTA (anchor only around the CTA or the entire card with accessible labeling). Remove duplicated title string and ensure proper spacing/line breaks.

**Bug 2** (UIBug): Several images appear to be rendered without accessible alt text (many <img> entries in the snapshot are generic with no visible alt). Missing alt attributes reduce accessibility for screen reader users.

> **Suggestion:** Add meaningful alt attributes for informative images and empty alt (alt="") for purely decorative images. Audit image rendering logic to ensure alt text is passed through from CMS or data layer.

**Bug 3** (UIBug): Metric/heading phrasing is awkward in the 'Years Combined Experience' block which may confuse readers and looks like a copy/template issue.

> **Suggestion:** Use a clearer phrase/format for the metric heading (e.g., "20+ Years of Combined Experience"). Review the template that concatenates the metric number and its label to ensure natural phrasing.

---

### /services/devops

**URL:** https://roaya.co/services/devops

**Bug 1** (UIBug): Several related-services links include concatenated tokens + titles + descriptions in the anchor text (e.g., the Cloud/Security/Automation links show category tokens and full description inside the link). This creates duplicated/awkward anchor text and harms accessibility.

> **Suggestion:** Separate link text from descriptive copy. Make anchor text concise (e.g., "Cloud Solutions", "Cybersecurity", "IT Automation") and place descriptions in adjacent paragraphs or use aria-describedby attributes. Verify server-side template or CMS fields assembling link text are not concatenating category and description.

**Bug 2** (UIBug): Many <img> elements in the snapshot do not have visible alt text or meaningful accessible names (numerous 'img' nodes without alt/aria-label). This reduces accessibility for screen reader users.

> **Suggestion:** Add descriptive alt attributes for informative images. For purely decorative images, add alt="" (empty) and role="presentation" to hide them from assistive technologies. Audit images site-wide and ensure all non-decorative images have appropriate alt text.

**Bug 3** (UIBug): Some copy is displayed with extraneous surrounding quotation marks or escaped quotes visible in the UI (escaped quotes seen in snapshot output). This looks like an escaping/encoding issue.

> **Suggestion:** Ensure text content is unescaped before rendering in the DOM. Check templating/escaping logic that outputs copy so quotes are not double-escaped. Remove unnecessary literal quotes in content where not needed.

**Bug 4** (UIBug): Web font resource(s) failed to load (fonts.googleapis.com request warning seen in console). This can cause fallback fonts and visual inconsistency.

> **Suggestion:** Ensure third-party font resources are accessible (CORS, network). Consider self-hosting critical fonts or provide font-display CSS to control fallback behavior (e.g., font-display: swap). Add preconnect/prefetch for fonts.googleapis.com and fonts.gstatic.com to speed loading.

---

### /services/email

**URL:** https://roaya.co/services/email

**Bug 1** (UIBug): Complementary services links appear to contain duplicated title and description within the link text, likely due to a templating bug that concatenates multiple text fields.

> **Suggestion:** Update the template to render title, subtitle, and CTA in separate DOM elements. Ensure anchor text is meaningful and concise for accessibility.

**Bug 2** (UIBug): Breadcrumb displays '/' as separate list items rather than separators styled via CSS, which may confuse users and screen readers.

> **Suggestion:** Render separators using CSS pseudo-elements or mark them aria-hidden; keep the breadcrumb list items limited to page labels.

**Bug 3** (UIBug): Multiple images rendered without alt text (observed as generic <img> entries in the snapshot).

> **Suggestion:** Audit and add alt attributes to images where appropriate; mark decorative images correctly so screen readers ignore them.

---

### /services/managed

**URL:** https://roaya.co/services/managed

**Bug 1** (UIBug): Complementary services cards/links contain concatenated strings with duplicated titles and CTA text, producing confusing long link labels and poor accessibility.

> **Suggestion:** Refactor the markup so the clickable link/CTA text is short and descriptive (e.g., 'Learn More'). Place title and description in separate elements and ensure ARIA accessible names are concise.

**Bug 2** (UIBug): Multiple images lack clear alt text (snapshot shows many img nodes without alt), which is a11y and UX issue if images fail to load.

> **Suggestion:** Add descriptive alt attributes for important images and alt="" for purely decorative images; verify linked images have appropriate accessible names.

**Bug 3** (UIBug): Some paragraphs and short copy lines lack terminal punctuation (missing periods). This is a consistency/grammar issue and can appear unpolished.

> **Suggestion:** Review paragraph copy across the page and ensure sentences end with appropriate punctuation. Maintain consistent style throughout (either sentence-case sentences with periods or headline-style fragments).

---

### /services/sap

**URL:** https://roaya.co/services/sap

**Bug 1** (UIBug): Multiple img elements appear without descriptive alt text (many images are represented as generic 'img' in the snapshot), reducing accessibility for screen reader users.

> **Suggestion:** Add meaningful alt attributes for content images (or role="presentation"/aria-hidden for purely decorative images). Review every <img> and supply concise descriptive alt text for informational images.

---

### /services/security

**URL:** https://roaya.co/services/security

**Bug 1** (UIBug): Complementary Services links contain concatenated text (repeated keywords, description, and CTA all in the link), making labels verbose and confusing.

> **Suggestion:** Split the link into separate elements: a concise anchor text (e.g., 'Cloud Solutions — Learn more'), a separate heading, and a separate description paragraph. Ensure ARIA labels and accessible names are concise and meaningful.

**Bug 2** (UIBug): Multiple <img> elements appear to have no alt text (images reported without alt attributes), which is an accessibility issue and can affect screen readers.

> **Suggestion:** Add meaningful alt text for informative images; mark decorative images with alt="" or aria-hidden="true". Run an audit to enumerate all imgs missing alt attributes and update content.

**Bug 3** (UIBug): Buttons in the 'Solutions at a Glance' list: second and third service buttons appear to lack clear visible labels in the snapshot (possible missing text or hidden labels).

> **Suggestion:** Ensure each button contains visible text or an aria-label. Confirm CSS doesn't hide text and that DOM content is present before rendering. If icons are used, provide accessible names.

**Bug 4** (UIBug): Console warnings show GSAP target not found (animations/parallax targets missing) and WebGL/font fallback messages which may indicate degraded visual experience (missing parallax/glow animations).

> **Suggestion:** Verify animation scripts target elements that exist. Add guards to only initialize GSAP animations when targets are present. Ensure fonts are hosted or loaded properly to avoid layout shifts.

---

### /services/security/incident-response

**URL:** https://roaya.co/services/security/incident-response

**Bug 1** (UIBug): Google Fonts resource failed to load (fonts.googleapis.com). Fallback fonts will be used which may change layout and brand typography.

> **Suggestion:** Host critical fonts locally or ensure the fonts.googleapis.com request is allowed by server/network and CSP. Add preconnect <link rel="preconnect" href="https://fonts.googleapis.com"> and consider serving fonts from the same origin or an approved CDN to avoid blocking.

**Bug 2** (UIBug): Three.js reported: THREE.Material: parameter 'color' has value of undefined. This may cause visual artifacts in any WebGL-based hero/graphic.

> **Suggestion:** Ensure any Three.js materials have a defined color property or apply a default material color when value is undefined. Add defensive checks before passing color to material constructors.

**Bug 3** (UIBug): Automatic fallback to software WebGL was triggered (console warning). This can degrade rendering performance and cause inconsistent visual behavior on some browsers/devices.

> **Suggestion:** Detect WebGL availability and provide a non-WebGL fallback UI for critical information (e.g., static SVG/PNG hero) or handle WebGL context gracefully. Add user messaging or telemetry to detect affected clients.

---

### /services/security/penetration-testing

**URL:** https://roaya.co/services/security/penetration-testing

**Bug 1** (UIBug): Multiple images appear with no alt text or only generic <img> entries in the snapshot (many img nodes without descriptive alt). This can affect accessibility and possibly indicate images not loaded or missing alt attributes.

> **Suggestion:** Add meaningful alt attributes to decorative images (alt="") and descriptive alt text for informative images. For purely decorative images, mark them with alt="" and role/presentation where appropriate. Run an accessibility audit to ensure images have alt text.

**Bug 2** (UIBug): Several metric tiles show placeholder or zero values (e.g., '0+', '0%', '0hr') which appear as broken or placeholder content in the UI.

> **Suggestion:** Ensure metrics are populated from a reliable data source. If real values are not available, hide the metrics or show '—' / 'N/A' with a tooltip explaining 'Data unavailable'. Fix the data binding that inserts these values.

**Bug 3** (UIBug): Many repeated 'img' placeholders in the snapshot suggest images may not have loaded or alt text is missing; some interactive images/buttons lack descriptive accessible text.

> **Suggestion:** Verify image URLs and that images load correctly. Ensure interactive images (links/buttons) have aria-label or text alternatives. Use meaningful link text rather than relying purely on images for navigation.

**Bug 4** (UIBug): Breadcrumb contains list items that render literal '/' separators as separate list items in the accessibility snapshot. This may cause redundant or awkward screen reader output.

> **Suggestion:** Render breadcrumb separators using CSS (pseudo-elements) or aria-hidden characters instead of separate list items, or mark separator items as aria-hidden so screen readers read only the breadcrumb labels.

**Bug 5** (UIBug): Console warnings reported (Three.Material color undefined and WebGL fallback). These may lead to incorrect visuals where 3D or canvas elements are used.

> **Suggestion:** Fix Three.js material color initialization where undefined values are passed. Add defensive checks before creating materials and provide fallback styling for non-WebGL environments.

**Bug 6** (UIBug): Some short paragraphs and list items begin with lowercase letters (e.g., 'routinely exploit...', 'human element was...'), creating inconsistent capitalization/presentation.

> **Suggestion:** Standardize sentence capitalization across the site. Update content authoring rules to require sentence-case for paragraph starts or use Title Case consistently for headings.

---

### /services/security/soc-solutions

**URL:** https://roaya.co/services/security/soc-solutions

**Bug 1** (UIBug): Breadcrumb contains standalone '/' elements as list items (separators are represented as separate list items). This may create accessibility and styling issues and looks like literal '/' items in the DOM.

> **Suggestion:** Render separators with CSS (e.g., using ::before or ::after) or as non-list separator elements rather than separate list items. Keep the breadcrumb list purely for navigational items and mark separators as aria-hidden if they must be present.

**Bug 2** (UIBug): Multiple paragraph/intro texts are wrapped in visible double quotes (e.g., lead-in sentences like 'Business outcomes first...' and 'We commonly integrate with:'). This looks like extraneous punctuation added by content markup or template.

> **Suggestion:** Remove extraneous double-quote characters from template/content fields. If quotes are intended for design, style them via CSS (typographic quotes) and ensure they don't appear as literal characters in text nodes.

**Bug 3** (UIBug): Several <img> elements appear with no descriptive alt text visible in the snapshot (images shown as generic img refs). Missing alt attributes cause accessibility issues for screen readers.

> **Suggestion:** Add meaningful alt attributes for informative images, and add alt="" and role="presentation" or aria-hidden="true" for purely decorative images. Ensure partner/vendor logos have appropriate alt text.

**Bug 4** (UIBug): Large number of images and external fonts (console warnings seen) — possible render delays or layout shifts due to fonts/images loading.

> **Suggestion:** Use font-display: swap for web fonts, optimize images, and lazy-load non-critical images to reduce cumulative layout shift and speed initial render.

---

## Issues by Page Summary

| Page | Language Issues | UI Bugs | Total |
|------|-----------------|---------|-------|
| / | 1 | 0 | 1 |
| /about | 4 | 3 | 7 |
| /industries/education | 3 | 2 | 5 |
| /industries/government | 6 | 2 | 8 |
| /industries/healthcare | 3 | 3 | 6 |
| /industries/manufacturing | 4 | 3 | 7 |
| /industries/retail | 6 | 4 | 10 |
| /resources/blog | 2 | 4 | 6 |
| /resources/case-studies | 10 | 4 | 14 |
| /resources/documentation | 3 | 2 | 5 |
| /resources/whitepapers | 3 | 4 | 7 |
| /services/ai | 2 | 0 | 2 |
| /services/automation | 4 | 3 | 7 |
| /services/backup | 4 | 3 | 7 |
| /services/cloud | 2 | 0 | 2 |
| /services/consulting | 3 | 3 | 6 |
| /services/devops | 4 | 4 | 8 |
| /services/email | 5 | 3 | 8 |
| /services/managed | 4 | 3 | 7 |
| /services/sap | 3 | 1 | 4 |
| /services/security | 3 | 4 | 7 |
| /services/security/incident-response | 7 | 3 | 10 |
| /services/security/penetration-testing | 4 | 6 | 10 |
| /services/security/soc-solutions | 3 | 4 | 7 |
| **TOTAL** | **93** | **68** | **161** |
