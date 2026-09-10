import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(projectRoot, 'src');
const outputDir = path.join(projectRoot, 'rag');
const outputPath = path.join(outputDir, 'corpus.json');

const routeFor = (key) => {
  const clean = key.replace(/^services\.security\.page\./, 'services/security/');
  const [section, page] = clean.split(/[./]/);
  if (section === 'home' || ['common', 'cta', 'header', 'nav', 'footer', 'megaMenu', 'accessibility'].includes(section)) return '/';
  const servicePages = new Set(['ai', 'automation', 'aws', 'backup', 'cloud', 'consulting', 'devops', 'email', 'managed', 'sap', 'security', 'worldposta']);
  if (section === 'services') return page && servicePages.has(page) ? `/services/${camelToKebab(page)}` : '/services';
  if (section === 'industries') return page && !['page', 'title', 'description', 'badge'].includes(page) ? `/industries/${camelToKebab(page)}` : '/industries';
  if (section === 'blog') return '/resources/blog';
  if (section === 'caseStudies') return '/resources/case-studies';
  if (section === 'resources') return '/resources';
  if (section === 'roiCalculator') return '/roi-calculator';
  if (section === 'legal') return page ? `/${camelToKebab(page)}` : '/privacy';
  if (['pricing', 'about', 'contact'].includes(section)) return `/${section}`;
  return '/';
};

const camelToKebab = (value = '') => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

function flatten(value, prefix = '', lines = []) {
  if (typeof value === 'string') {
    const text = value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 1) lines.push(`${prefix}: ${text}`);
    return lines;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${prefix}.${index}`, lines));
    return lines;
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key, lines));
  }
  return lines;
}

function chunkLines(lines, maxLength = 1700) {
  const chunks = [];
  let current = '';
  for (const line of lines) {
    if (current && current.length + line.length + 1 > maxLength) {
      chunks.push(current.trim());
      current = '';
    }
    current += `${line}\n`;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function groupTranslationTree(tree) {
  const groups = [];
  for (const [topKey, topValue] of Object.entries(tree)) {
    const shouldSplit = ['services', 'industries', 'legal'].includes(topKey) && topValue && typeof topValue === 'object';
    if (shouldSplit) {
      for (const [childKey, childValue] of Object.entries(topValue)) {
        groups.push({ key: `${topKey}.${childKey}`, value: childValue });
      }
    } else {
      groups.push({ key: topKey, value: topValue });
    }
  }
  return groups;
}

function titleFor(key, language) {
  const readable = key.split('.').map(camelToKebab).join(' / ').replaceAll('-', ' ');
  return language === 'ar' ? `رؤية — ${readable}` : `Roaya — ${readable}`;
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function inferFeatureRoute(filePath) {
  const normalized = filePath.replaceAll('\\', '/');
  const match = normalized.match(/features\/(about|contact|home|industries|pricing|resources|roi-calculator|services)(?:\/([^/]+))?/);
  if (!match) return '/';
  const section = match[1];
  const child = match[2];
  if (section === 'home') return '/';
  if (!child || child.endsWith('.component.ts')) return `/${section}`;
  if (section === 'services' && child === 'security') {
    const nested = normalized.match(/services\/security\/([^/]+)\//)?.[1];
    return nested ? `/services/security/${nested}` : '/services/security';
  }
  if (section === 'resources' && ['blog', 'case-studies'].includes(child)) return `/resources/${child}`;
  return `/${section}/${child}`;
}

function extractReadableLiterals(source) {
  const values = [];
  const patterns = [/'([^'\\]*(?:\\.[^'\\]*)*)'/g, /"([^"\\]*(?:\\.[^"\\]*)*)"/g, /`([^`]{20,1200})`/g];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const value = match[1]
        .replace(/\\n/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const words = value.match(/[\p{L}]{2,}/gu) ?? [];
      const looksLikeCode = /^(\.|\/|#|[\w-]+\.[\w.-]+$)/.test(value) || /\b(import|return|const|class|function)\b/.test(value);
      if (value.length >= 28 && words.length >= 5 && !looksLikeCode) values.push(value);
    }
  }
  return [...new Set(values)];
}

const chunks = [];
for (const language of ['en', 'ar']) {
  const translationPath = path.join(srcRoot, 'assets', 'i18n', `${language}.json`);
  const tree = JSON.parse(await fs.readFile(translationPath, 'utf8'));
  for (const group of groupTranslationTree(tree)) {
    const lines = flatten(group.value, group.key);
    chunkLines(lines).forEach((text, index) => chunks.push({
      id: `i18n-${language}-${group.key}-${index}`,
      title: titleFor(group.key, language),
      url: routeFor(group.key),
      language,
      text,
    }));
  }
}

const featureRoot = path.join(srcRoot, 'app', 'features');
for (const filePath of await walk(featureRoot)) {
  if (!filePath.endsWith('.component.ts') || filePath.includes(`${path.sep}admin${path.sep}`)) continue;
  const literals = extractReadableLiterals(await fs.readFile(filePath, 'utf8'));
  if (literals.length === 0) continue;
  const route = inferFeatureRoute(filePath);
  const name = path.basename(filePath, '.component.ts').replace('.component', '');
  chunkLines(literals).forEach((text, index) => chunks.push({
    id: `component-en-${name}-${index}`,
    title: `Roaya — ${name.replaceAll('-', ' ')}`,
    url: route,
    language: 'en',
    text,
  }));
}

const dedicatedTranslations = (await walk(featureRoot)).filter((filePath) => /translations-(en|ar)\.json$/.test(filePath));
for (const filePath of dedicatedTranslations) {
  const language = filePath.endsWith('-ar.json') ? 'ar' : 'en';
  const lines = flatten(JSON.parse(await fs.readFile(filePath, 'utf8')));
  const route = inferFeatureRoute(filePath);
  const name = path.basename(filePath).replace(/-translations-(en|ar)\.json$/, '');
  chunkLines(lines).forEach((text, index) => chunks.push({
    id: `dedicated-${language}-${name}-${index}`,
    title: language === 'ar' ? `رؤية — ${name}` : `Roaya — ${name}`,
    url: route,
    language,
    text,
  }));
}

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), chunks }, null, 2)}\n`);
console.log(`Built ${chunks.length} public Roaya chunks at ${outputPath}`);
