/**
 * A minimal renderer for the subset of Angular template syntax this page uses:
 * @for / @if / @else blocks, {{ }} interpolation with the translate pipe,
 * [prop] and [attr.x] bindings, (click) handlers, and <ng-icon>.
 */

/* ---------- expression evaluation ---------- */
function evaluate(expr, scope, helpers) {
  const keys = Object.keys(scope);
  const body = 'return (' + expr + ');';
  try {
    return new Function(...keys, body).apply(null, keys.map((k) => scope[k]));
  } catch (err) {
    throw new Error('failed to evaluate `' + expr + '`: ' + err.message);
  }
}

/** Splits on `|` only at paren/quote depth 0, so nested pipes survive. */
function splitPipes(expr) {
  const parts = [];
  let depth = 0, quote = null, buf = '';
  for (let i = 0; i < expr.length; i++) {
    const c = expr[i];
    if (quote) { buf += c; if (c === quote && expr[i - 1] !== String.fromCharCode(92)) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; buf += c; continue; }
    if (c === '(' || c === '[') depth++;
    if (c === ')' || c === ']') depth--;
    if (c === '|' && depth === 0 && expr[i + 1] !== '|' && expr[i - 1] !== '|') { parts.push(buf); buf = ''; continue; }
    buf += c;
  }
  parts.push(buf);
  return parts;
}

/** `'a.' + x + '.b' | translate` -> resolved string. Handles nested pipes. */
function resolve(expr, scope, t) {
  const piped = splitPipes(expr);
  if (piped.length === 1) {
    // pipes may still sit inside a ternary: resolve each parenthesised arm
    // pipes may still sit inside a ternary: resolve each parenthesised arm
    let inner = '';
    for (let k = 0; k < expr.length; k++) {
      if (expr[k] !== '(') { inner += expr[k]; continue; }
      let d = 0, end = k;
      for (; end < expr.length; end++) {
        if (expr[end] === '(') d++;
        else if (expr[end] === ')') { d--; if (d === 0) break; }
      }
      const sub = expr.slice(k + 1, end);
      inner += splitPipes(sub).length > 1 ? JSON.stringify(resolve(sub, scope, t)) : '(' + sub + ')';
      k = end;
    }
    return evaluate(inner, scope);
  }
  const value = evaluate(piped[0].trim(), scope);
  return piped.slice(1).some((x) => x.trim() === 'translate') ? t(value) : value;
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- block matching ---------- */
/** Returns the index just past the `}` that closes the brace opened at `open`. */
function matchBrace(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error('unbalanced block starting at ' + open);
}

/** Reads `@kw ( ... )` with balanced parens. Returns null when `at` is not that keyword. */
function matchHeader(src, at, kw) {
  if (!src.startsWith(kw, at)) return null;
  const open = src.indexOf('(', at);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '(') depth++;
    else if (src[i] === ')') {
      depth--;
      if (depth === 0) return { header: src.slice(open + 1, i), end: i };
    }
  }
  return null;
}

function render(tpl, scope, ctx) {
  let out = '';
  let i = 0;

  while (i < tpl.length) {
    const at = tpl.indexOf('@', i);
    if (at === -1) {
      out += renderInline(tpl.slice(i), scope, ctx);
      break;
    }

    const forM = matchHeader(tpl, at, '@for');
    const ifM = /^@if\s*\(/.exec(tpl.slice(at));

    if (!forM && !ifM) {
      out += renderInline(tpl.slice(i, at + 1), scope, ctx);
      i = at + 1;
      continue;
    }

    out += renderInline(tpl.slice(i, at), scope, ctx);

    if (forM) {
      const header = forM.header;
      const open = tpl.indexOf('{', forM.end);
      const close = matchBrace(tpl, open);
      const body = tpl.slice(open + 1, close);

      const parts = header.split(';').map((p) => p.trim());
      const [, varName, listExpr] = /^(\w+)\s+of\s+(.+)$/.exec(parts[0]);
      const idxAlias = (parts.find((p) => /^let\s+\w+\s*=\s*\$index$/.test(p)) || '').match(/^let\s+(\w+)/);

      const list = evaluate(listExpr, scope) || [];
      list.forEach((item, index) => {
        // openFaq() is only consulted inside the FAQ loop; making it report the
        // current index emits every answer so the accordion has content to reveal.
        const inner = {
          ...scope,
          [varName]: item,
          $index: index,
          $first: index === 0,
          $last: index === list.length - 1,
          openFaq: () => index
        };
        if (idxAlias) inner[idxAlias[1]] = index;
        out += render(body, inner, ctx);
      });

      i = close + 1;
      continue;
    }

    // @if (cond) { ... } @else { ... }
    const condStart = tpl.indexOf('(', at);
    let depth = 0;
    let condEnd = condStart;
    for (; condEnd < tpl.length; condEnd++) {
      if (tpl[condEnd] === '(') depth++;
      else if (tpl[condEnd] === ')') {
        depth--;
        if (depth === 0) break;
      }
    }
    const cond = tpl.slice(condStart + 1, condEnd);
    const open = tpl.indexOf('{', condEnd);
    const close = matchBrace(tpl, open);
    const thenBody = tpl.slice(open + 1, close);

    let elseBody = null;
    let cursor = close + 1;
    const elseM = /^\s*@else\s*\{/.exec(tpl.slice(cursor));
    if (elseM) {
      const eOpen = cursor + elseM[0].length - 1;
      const eClose = matchBrace(tpl, eOpen);
      elseBody = tpl.slice(eOpen + 1, eClose);
      cursor = eClose + 1;
    }

    const branch = evaluate(cond, scope) ? thenBody : elseBody;
    if (branch !== null) out += render(branch, scope, ctx);
    i = cursor;
  }

  return out;
}

/* ---------- element-level transforms (no control flow left) ---------- */
function renderInline(chunk, scope, ctx) {
  let s = chunk;

  // <ng-icon [name]="expr" size="18" ...> / name="lucideX"  ->  inline SVG
  s = s.replace(/<ng-icon\b([^>]*?)>\s*<\/ng-icon>|<ng-icon\b([^>]*?)\/>/g, (m, a1, a2) => {
    const attrs = a1 || a2 || '';
    const bound = /\[name\]="([^"]*)"/.exec(attrs);
    const literal = /\bname="([^"]*)"/.exec(attrs);
    const size = /\bsize="([^"]*)"/.exec(attrs);
    const cls = /\bclass="([^"]*)"/.exec(attrs);
    const name = bound ? evaluate(bound[1], scope) : literal && literal[1];
    if (!name) return '';
    let svg = ctx.icon(name, size && size[1]);
    if (cls) svg = svg.replace('class="ng-icon ', 'class="ng-icon ' + cls[1] + ' ');
    return svg;
  });

  // {{ expr }}
  s = s.replace(/\{\{([\s\S]*?)\}\}/g, (m, expr) => esc(resolve(expr.trim(), scope, ctx.t)));

  // [attr.x]="expr"  ->  x="value" (dropped when null/false)
  s = s.replace(/\[attr\.([\w-]+)\]="([^"]*)"/g, (m, name, expr) => {
    const v = resolve(expr, scope, ctx.t);
    return v === null || v === undefined || v === false ? '' : `${name}="${esc(v)}"`;
  });

  // [class.x]="expr"  ->  folded into a data attribute the merge step picks up
  s = s.replace(/\[class\.([\w-]+)\]="([^"]*)"/g, (m, name, expr) =>
    evaluate(expr, scope) ? `data-addclass="${name}"` : ''
  );

  // [prop]="expr" for the handful of real DOM props used here
  s = s.replace(/\[(src|href|id|value|placeholder|disabled)\]="([^"]*)"/g, (m, name, expr) => {
    let v = resolve(expr, scope, ctx.t);
    if (name === 'src') v = ctx.dataUri(v);
    if (name === 'disabled') return v ? 'disabled' : '';
    return v === null || v === undefined ? '' : `${name}="${esc(v)}"`;
  });

  // (click)="fn(arg)"  ->  data-act / data-val hooks for the vanilla runtime
  s = s.replace(/\((click|keydown|pointermove|pointerleave|ngSubmit)\)="([^"]*)"/g, (m, evt, handler) => {
    if (evt !== 'click') return '';
    const call = /^(\w+)\((.*)\)$/.exec(handler.trim());
    if (!call) return '';
    const [, fn, argExpr] = call;
    if (!argExpr) return `data-act="${fn}"`;
    let arg;
    try { arg = evaluate(argExpr, scope); } catch { arg = argExpr; }
    return `data-act="${fn}" data-val="${esc(arg)}"`;
  });

  // Angular-only attributes that mean nothing outside the framework
  s = s.replace(/\s\[formGroup\]="[^"]*"/g, '')
       .replace(/\sformControlName="[^"]*"/g, (m) => ' data-field="' + /"([^"]*)"/.exec(m)[1] + '"')
       .replace(/\sngProjectAs="[^"]*"/g, '')
       .replace(/\snovalidate\b/g, ' novalidate');

  // merge data-addclass into the element's class attribute
  s = s.replace(/<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g, (m, tag, attrs) => {
    if (!attrs.includes('data-addclass=')) return m;
    const added = [];
    const cleaned = attrs.replace(/\s*data-addclass="([^"]*)"/g, (mm, c) => { added.push(c); return ''; });
    if (/\bclass="/.test(cleaned)) {
      return `<${tag}${cleaned.replace(/\bclass="([^"]*)"/, (mm, c) => `class="${c} ${added.join(' ')}"`)}>`;
    }
    return `<${tag}${cleaned} class="${added.join(' ')}">`;
  });

  return s;
}

module.exports = { render, evaluate, resolve, esc };
