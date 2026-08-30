/**
 * Builds a self-contained single-file copy of the AWS partnership page.
 *
 *   node tools/build-aws-standalone.js   ->  dist-standalone/aws-partnership.html
 *
 * The Angular template stays the source of truth: it is rendered once with the
 * component's default state, every translate key resolved against en.json, the
 * SCSS compiled and its :host selectors rewritten, the token/theme layer and
 * every image inlined, and the signal-driven tabs replaced by vanilla JS that
 * swaps the same strings. No Angular, no network requests.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { render } = require('./aws-standalone-render');
const { DEFAULTS, journey, pillars, regions, faqs, data } = require('./aws-standalone-data');
const { buildCss, buildStrings, shell, REVEAL_CSS } = require('./aws-standalone-assemble');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const AWS = path.join(SRC, 'app/features/services/aws');
const OUT_DIR = path.join(ROOT, 'dist-standalone');
const OUT = path.join(OUT_DIR, 'aws-partnership.html');

const read = (p) => fs.readFileSync(p, 'utf8');
const i18n = JSON.parse(read(path.join(SRC, 'assets/i18n/en.json')));
const missing = [];

function t(key) {
  const hit = String(key).split('.').reduce((o, k) => (o == null ? o : o[k]), i18n);
  if (typeof hit !== 'string') { missing.push(key); return ''; }
  return hit;
}

/* ---------- lucide icons, read from the installed package ---------- */
const lucideSrc = read(path.join(ROOT, 'node_modules/@ng-icons/lucide/types/ng-icons-lucide.d.ts'));
const iconCache = new Map();
function icon(name, size) {
  if (!iconCache.has(name)) {
    const marker = "declare const " + name + " = \"";
    const start = lucideSrc.indexOf(marker);
    if (start < 0) throw new Error("icon not found: " + name);
    let i = start + marker.length;
    let raw = "";
    for (; i < lucideSrc.length; i++) {
      const ch = lucideSrc[i];
      if (ch === "\\") { raw += ch + lucideSrc[++i]; continue; }
      if (ch === "\"") break;
      raw += ch;
    }
    iconCache.set(name, JSON.parse("\"" + raw + "\""));
  }
  const px = size ? Number(size) : 24;
  return iconCache.get(name).replace("<svg ", "<svg width=\"" + px + "\" height=\"" + px + "\" class=\"ng-icon\" ");
}

/* ---------- images as data URIs ---------- */
const mimes = { '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
const assetCache = new Map();
function dataUri(webPath) {
  if (typeof webPath !== 'string' || !webPath.startsWith('/assets')) return webPath;
  if (assetCache.has(webPath)) return assetCache.get(webPath);
  const file = path.join(SRC, webPath.replace(/^\//, ''));
  if (!fs.existsSync(file)) { missing.push('asset ' + webPath); return webPath; }
  const type = mimes[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const uri = `data:${type};base64,${fs.readFileSync(file).toString('base64')}`;
  assetCache.set(webPath, uri);
  return uri;
}

/* ---------- render the template ---------- */
const scope = {
  ...data,
  activeStage: () => DEFAULTS.stage,
  activeStageIndex: () => journey.findIndex((s) => s.id === DEFAULTS.stage),
  activeStageNumber: () => journey.find((s) => s.id === DEFAULTS.stage).n,
  activePillar: () => DEFAULTS.pillar,
  activePillarNumber: () => pillars.find((p) => p.id === DEFAULTS.pillar).n,
  activeRegion: () => DEFAULTS.region,
  // every answer is emitted so the accordion has content to reveal; the
  // closed ones are marked hidden below
  openFaq: function () { return this && this.$index !== undefined ? this.$index : -1; },
  isSubmitted: () => false,
  hasError: () => false,
  hasFieldError: () => false,
  isSubmitting: () => false
};
// openFaq() is called inside the faq loop, where $index is in scope
scope.openFaq = new Proxy(function () { return -1; }, {});

let html = render(read(path.join(AWS, 'aws.component.html')), { ...scope, openFaq: () => -1 }, { t, icon, dataUri });

console.log('rendered template: ' + html.length.toLocaleString() + ' chars');
if (missing.length) console.warn('MISSING (' + missing.length + '):\n  ' + [...new Set(missing)].join('\n  '));


/* ---------- a note where the form would post ---------- */
var formEnd = html.lastIndexOf("</form>");
if (formEnd > -1) {
  var note = "<p class=\"sa-note\" data-standalone-note hidden>This is a standalone copy of the page, so the form has no server to post to. On roaya.co the same form reaches the team directly.</p>";
  html = html.slice(0, formEnd) + note + html.slice(formEnd);
}

/* ---------- assemble ---------- */
const css = buildCss({ SRC, AWS, OUT_DIR });
const strings = buildStrings({ t, icon, journey, pillars, regions, faqs });
const runtime = read(path.join(__dirname, "aws-standalone-runtime.js"));

const page = shell({
  title: t("services.aws.title") + " — Roaya",
  description: t("services.aws.description"),
  css: [css.tokens, css.helpers, REVEAL_CSS, css.component].join(String.fromCharCode(10, 10)),
  body: html,
  strings,
  runtime
});

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, page);
console.log("wrote " + path.relative(ROOT, OUT) + "  (" + (page.length / 1048576).toFixed(2) + " MB)");
if (missing.length) { console.error("build had missing keys"); process.exit(1); }
