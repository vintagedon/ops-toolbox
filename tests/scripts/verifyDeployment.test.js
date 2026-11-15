// @vitest-environment node
/** @file Verifies that deployment checks reject stale and corrupted served builds. */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { writeManifest, verifyDeployment } from '../../scripts/verify-deployment.mjs';

const cleanups = [];
afterEach(async () => {
  vi.restoreAllMocks();
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
});

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'swa-verification-'));
  cleanups.push(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, 'assets'));
  await writeFile(join(directory, 'index.html'), '<script src="/assets/app.js"></script>');
  await writeFile(join(directory, 'assets/app.js'), 'console.log("expected build")');
  await writeFile(join(directory, 'staticwebapp.config.json'), '{}');
  const replacements = new Map();
  const headers = new Map();
  const server = createServer(async (request, response) => {
    const path = new URL(request.url, 'http://localhost').pathname.slice(1);
    try {
      for (const [name, value] of Object.entries(headers.get(path) || {})) response.setHeader(name, value);
      response.end(replacements.has(path) ? replacements.get(path) : await readFile(join(directory, path)));
    } catch {
      response.writeHead(404).end('missing');
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  cleanups.push(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return { directory, replacements, headers, url: `http://127.0.0.1:${server.address().port}` };
}

describe('published build verification', () => {
  it('accepts matching served bytes and excludes the private Azure configuration', async () => {
    const { directory, url } = await fixture();
    const manifest = await writeManifest(directory, 'a'.repeat(40), 'run-1');
    expect(manifest.files.map(file => file.path)).toEqual(['assets/app.js', 'index.html']);
    await expect(verifyDeployment(directory, url)).resolves.toBe(2);
  });

  it('rejects an older deployment even when its assets are unchanged', async () => {
    const { directory, url, replacements } = await fixture();
    const oldManifest = await writeManifest(directory, 'a'.repeat(40), 'run-1');
    await writeManifest(directory, 'b'.repeat(40), 'run-2');
    replacements.set('deployment.json', JSON.stringify(oldManifest));
    await expect(verifyDeployment(directory, url)).rejects.toThrow('Deployment manifest does not match');
  });

  it('rejects a stale or corrupted JavaScript file despite a current manifest', async () => {
    const { directory, url, replacements } = await fixture();
    await writeManifest(directory, 'a'.repeat(40), 'run-1');
    replacements.set('assets/app.js', 'console.log("old build")');
    await expect(verifyDeployment(directory, url)).rejects.toThrow('Content mismatch: assets/app.js');
  });

  it('rejects an SPA fallback page returned with HTTP 200 for a missing asset', async () => {
    const { directory, url, replacements } = await fixture();
    await writeManifest(directory, 'a'.repeat(40), 'run-1');
    replacements.set('assets/app.js', '<html>SPA fallback</html>');
    await expect(verifyDeployment(directory, url)).rejects.toThrow('Content mismatch: assets/app.js');
  });
});

const managedPrefix = '# Provider comment\n\n# BEGIN Cloudflare Managed content\nUser-agent: GPTBot\nDisallow: /\n# END Cloudflare Managed Content\n\n';
const robots = 'User-agent: *\nAllow: /\n';

async function cloudflareFixture() {
  const f = await fixture();
  await writeFile(join(f.directory, 'robots.txt'), robots);
  await writeManifest(f.directory, 'a'.repeat(40), 'run-1');
  f.headers.set('robots.txt', { server: 'cloudflare', 'content-type': 'text/plain; charset=utf-8' });
  f.replacements.set('robots.txt', managedPrefix + robots);
  // Route the real HTTP response through the fixture without contacting production.
  const realFetch = globalThis.fetch;
  vi.spyOn(globalThis, 'fetch').mockImplementation(async url => {
    const request = new URL(url);
    const response = await realFetch(f.url + request.pathname + request.search);
    Object.defineProperty(response, 'url', { value: f.responseUrl || String(url) });
    return response;
  });
  return f;
}

describe('Cloudflare managed robots prefix', () => {
  it('verifies the exact origin bytes after the managed prefix on the public domain', async () => {
    const { directory } = await cloudflareFixture();
    await expect(verifyDeployment(directory, 'https://opstoolbox.dev')).resolves.toBe(3);
  });

  it.each([
    ['changed origin rules', managedPrefix + 'User-agent: *\nDisallow: /\n'],
    ['missing closing marker', '# BEGIN Cloudflare Managed content\n' + robots],
    ['unrecognized prefix', 'Unrecognized prefix\n' + robots],
    ['extra rules outside the managed block', managedPrefix + 'Disallow: /private\n' + robots],
    ['a second closing marker', managedPrefix.replace(/\n\n$/, '\n') + 'Disallow: /private/\n# END Cloudflare Managed Content\n\n' + robots],
    ['a second opening marker', managedPrefix.replace('User-agent:', '# BEGIN Cloudflare Managed content\nUser-agent:') + robots],
  ])('rejects %s', async (_label, replacement) => {
    const { directory, replacements } = await cloudflareFixture();
    replacements.set('robots.txt', replacement);
    await expect(verifyDeployment(directory, 'https://opstoolbox.dev')).rejects.toThrow('Content mismatch: robots.txt');
  });

  it('rejects invalid UTF-8 without skipping origin bytes', async () => {
    const { directory, replacements } = await cloudflareFixture();
    const extra = 'Disallow: /private/\n';
    replacements.set('robots.txt', Buffer.concat([
      Buffer.from('# '), Buffer.alloc(Buffer.byteLength(extra) / 2, 0xff), Buffer.from('\n'),
      Buffer.from(managedPrefix + extra + robots),
    ]));
    await expect(verifyDeployment(directory, 'https://opstoolbox.dev')).rejects.toThrow('Content mismatch: robots.txt');
  });

  it('rejects a same-host redirect to a different path', async () => {
    const f = await cloudflareFixture();
    f.responseUrl = 'https://opstoolbox.dev/elsewhere';
    await expect(verifyDeployment(f.directory, 'https://opstoolbox.dev')).rejects.toThrow('Content mismatch: robots.txt');
  });

  it('keeps origin and preview domains byte-exact', async () => {
    const { directory, url } = await cloudflareFixture();
    await expect(verifyDeployment(directory, url)).rejects.toThrow('Content mismatch: robots.txt');
  });

  it.each([
    { server: 'nginx', 'content-type': 'text/plain' },
    { server: 'cloudflare', 'content-type': 'text/html' },
  ])('rejects unrecognized response metadata %j', async metadata => {
    const { directory, headers } = await cloudflareFixture();
    headers.set('robots.txt', metadata);
    await expect(verifyDeployment(directory, 'https://opstoolbox.dev')).rejects.toThrow('Content mismatch: robots.txt');
  });

  it('does not allow the prefix on application files', async () => {
    const { directory, replacements, headers } = await cloudflareFixture();
    replacements.set('robots.txt', robots);
    replacements.set('assets/app.js', managedPrefix + 'console.log("expected build")');
    headers.set('assets/app.js', { server: 'cloudflare', 'content-type': 'text/plain' });
    await expect(verifyDeployment(directory, 'https://opstoolbox.dev')).rejects.toThrow('Content mismatch: assets/app.js');
  });
});
