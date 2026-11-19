import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), 'dist');
const skip = !fs.existsSync(dist);
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

// Interactive: a[href], button, select, textarea, summary, visible input, anything with tabindex >= 0.
const interactive = (tag, attrs) => tag === 'a' ? /\shref=/.test(attrs) : ['button', 'select', 'textarea', 'summary'].includes(tag)
  || (tag === 'input' && !/type="hidden"/.test(attrs)) || /\stabindex="(0|[1-9]\d*)"/.test(attrs);

// Returns the offending tags: an interactive element opened inside a link or button.
export function nested(html) {
  const body = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const stack = [], bad = [];
  for (const m of body.matchAll(/<(\/?)([a-z][a-z0-9-]*)\b([^>]*)>/gi)) {
    const [, close, name, attrs] = m, tag = name.toLowerCase();
    if (close) {
      const i = stack.findLastIndex((s) => s.tag === tag);
      if (i >= 0) stack.length = i;
      continue;
    }
    const hit = interactive(tag, attrs), host = stack.findLast((s) => s.hit && (s.tag === 'a' || s.tag === 'button'));
    if (hit && host) bad.push(`<${tag}> inside <${host.tag}>: ${m[0].slice(0, 80)}`);
    if (!VOID.has(tag) && !attrs.endsWith('/')) stack.push({ tag, hit });
  }
  return bad;
}

test('nested check catches a chip inside a link, and a button inside a link', () => {
  assert.equal(nested('<a href="/x"><span>ok</span></a><button>b</button>').length, 0);
  assert.equal(nested('<a href="/x"><a href="/y">chip</a></a>').length, 1);
  assert.equal(nested('<a href="/x"><button>b</button></a>').length, 1);
  assert.equal(nested('<button><input type="text"></button>').length, 1);
  assert.equal(nested('<a href="/x"><input type="hidden"></a>').length, 0);
});

test('no page nests interactive elements (link in link, button in link, field in button)', { skip }, () => {
  const files = fs.readdirSync(dist, { recursive: true }).filter((f) => String(f).endsWith('.html'));
  assert.ok(files.length >= 7);
  for (const f of files) assert.deepEqual(nested(fs.readFileSync(path.join(dist, String(f)), 'utf8')), [], f);
});
