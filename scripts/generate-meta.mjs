/**
 * @file generate-meta.mjs
 * @description Build-time discoverability generator — emits dist/sitemap.xml and dist/llms.txt from the canonical toolRegistry, all keyed to opstoolbox.dev. Runs after `vite build` and `scripts/prerender.mjs`. Adds no server and no runtime network call; the 100% client-side claim stays literally true. The per-tool bullets are derived from the registry (name/path/description) so they never drift.
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 * @see https://llmstxt.org/
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toolRegistry } from '../src/lib/toolRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const ORIGIN = 'https://opstoolbox.dev';

// Hand-written constants (not registry-derived).
const TITLE = 'Ops Toolbox';
const SUMMARY = '25 client-side IT operations and developer utilities. 100% in-browser processing — no servers, no tracking, no data leaves the browser.';
const GITHUB_URL = 'https://github.com/radioastronomyio/ops-toolbox';
const ABOUT_PATH = 'about';

/**
 * Escape a string for safe inclusion in XML element text.
 */
function xmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Build dist/sitemap.xml — one <url> per route (home, every tool, /about).
 * No lastmod/changefreq/priority: the latter two are ignored by modern crawlers
 * and an honest lastmod is not worth the complexity here.
 */
function writeSitemap() {
  const routes = ['/', ...toolRegistry.map((t) => `/${t.path}`), `/${ABOUT_PATH}`];
  const urls = routes
    .map((path) => `  <url>\n    <loc>${ORIGIN}${path === '/' ? '/' : path}</loc>\n  </url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  writeFileSync(join(DIST, 'sitemap.xml'), xml);
  return routes.length;
}

/**
 * Build dist/llms.txt per the llmstxt.org format:
 * an H1 title, a `>` blockquote summary, a `## Tools` section (per-tool bullets
 * derived from the registry plus an About link), and a `## Links` section.
 */
function writeLlmsTxt() {
  const toolLines = toolRegistry
    .map((t) => `- [${t.name}](${ORIGIN}/${t.path}): ${t.description}`)
    .join('\n');
  const text = `# ${TITLE}

> ${SUMMARY}

## Tools

${toolLines}
- [About Ops Toolbox](${ORIGIN}/${ABOUT_PATH}): What ops-toolbox is, why it is fully client-side, and how it stays that way.

## Links

- [GitHub Repository](${GITHUB_URL})
`;
  writeFileSync(join(DIST, 'llms.txt'), text);
}

const sitemapCount = writeSitemap();
writeLlmsTxt();

console.log(`generate-meta: wrote sitemap.xml (${sitemapCount} <loc> entries) and llms.txt to dist/`);
