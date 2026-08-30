/**
 * Second half of the standalone build: stylesheet, strings payload, HTML shell.
 * Required by build-aws-standalone.js, which passes the rendered body in.
 */
const fs = require('fs');
const path = require('path');
const sass = require('sass');

/**
 * Emulated encapsulation is gone in a standalone file, so the host selectors
 * have to become real ones. Note Dart Sass normalises [data-theme='light'] to
 * the unquoted [data-theme=light], so this rewrites by structure, not by
 * matching the source text.
 */
function unhost(css) {
  const NEEDLE = ":host-context(";
  let out = "";
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf(NEEDLE, i);
    if (at === -1) { out += css.slice(i); break; }
    out += css.slice(i, at);
    let depth = 0;
    let j = at + NEEDLE.length - 1;
    for (; j < css.length; j++) {
      if (css[j] === "(") depth++;
      else if (css[j] === ")") { depth--; if (depth === 0) break; }
    }
    // :host-context(X) matches when X is an ancestor of the host
    out += css.slice(at + NEEDLE.length, j) + " .aws-page";
    i = j + 1;
  }
  // any bare :host left is the root itself
  return out.split(":host").join(".aws-page");
}

function buildCss({ SRC, AWS }) {
  // the Dart Sass JS API, so the build needs no child process
  const component = unhost(sass.compile(path.join(AWS, "aws.component.scss"), { style: "expanded" }).css);

  const tokens = ["styles/tokens.css", "styles/themes/light.css", "styles/themes/dark.css"]
    .map((f) => fs.readFileSync(path.join(SRC, f), "utf8"))
    .join(String.fromCharCode(10));

  const helpers = sass.compile(path.join(SRC, "styles/utilities/_helpers.scss"), { style: "expanded" }).css;

  return { tokens, helpers, component };
}

/** Everything the runtime needs to swap when a tab changes. */
function buildStrings({ t, icon, journey, pillars, regions, faqs }) {
  const stages = {};
  journey.forEach((s) => {
    const k = 'services.aws.hero.journey.' + s.id + '.';
    stages[s.id] = {
      n: s.n,
      name: t(k + 'name'),
      title: t(k + 'title'),
      body: t(k + 'body'),
      readout: t(k + 'readout'),
      vizAlt: t(k + 'vizAlt')
    };
  });

  const pillarMap = {};
  pillars.forEach((p) => {
    const k = 'services.aws.why.pillars.' + p.id + '.';
    pillarMap[p.id] = {
      n: p.n,
      title: t(k + 'title'),
      headline1: t(k + 'headline1'),
      headline2: t(k + 'headline2'),
      body: t(k + 'body'),
      vizAlt: t(k + 'vizAlt'),
      signals: [1, 2, 3].map((i) => t(k + 'signal' + i)),
      signalNotes: [1, 2, 3].map((i) => t(k + 'signalNote' + i))
    };
  });

  const regionMap = {};
  regions.forEach((r) => {
    const k = 'services.aws.regions.' + r.id + '.';
    regionMap[r.id] = {
      title: t(k + 'title'),
      body: t(k + 'body'),
      points: [1, 2, 3, 4].map((i) => t(k + 'p' + i))
    };
  });

  return {
    stageOrder: journey.map((s) => s.id),
    pillarOrder: pillars.map((p) => p.id),
    stages,
    pillars: pillarMap,
    regions: regionMap,
    faqs,
    icons: { plus: icon('lucidePlus', 18), minus: icon('lucideMinus', 18) }
  };
}

/** Reveal styling: GSAP does this in the app, a class does it here. */
const REVEAL_CSS = `
/* ---- standalone shell ---- */
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  background: var(--color-background);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
}
img, svg { max-width: 100%; }
.ng-icon { display: inline-block; vertical-align: middle; flex: none; }

/* scroll reveal, standing in for the GSAP timeline */
.sa-pending { opacity: 0; transform: translateY(18px); }
.sa-in {
  opacity: 1;
  transform: none;
  transition: opacity 620ms cubic-bezier(0.2, 0.6, 0.2, 1), transform 620ms cubic-bezier(0.2, 0.6, 0.2, 1);
}
@media (prefers-reduced-motion: reduce) {
  .sa-pending { opacity: 1; transform: none; }
  html { scroll-behavior: auto; }
}

/* theme switch, since there is no header on a standalone page */
.sa-theme {
  position: fixed;
  inset-block-start: 1rem;
  inset-inline-end: 1rem;
  z-index: 40;
  padding: 0.5rem 0.9rem;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  cursor: pointer;
}
.sa-theme:hover { border-color: var(--color-secondary); }

/* the form cannot post anywhere from a file:// page */
.sa-note {
  margin-top: 0.85rem;
  padding: 0.75rem 0.9rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: 12px;
}
`;

function shell({ title, description, css, body, strings, runtime }) {
  return `<!doctype html>
<html lang="en" dir="ltr" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body>
<button type="button" class="sa-theme" data-theme-toggle>Light</button>
<div class="aws-page">
${body}
</div>
<script>
var STRINGS = ${JSON.stringify(strings)};
</script>
<script>
${runtime}
</script>
</body>
</html>
`;
}

module.exports = { buildCss, buildStrings, shell, REVEAL_CSS };
