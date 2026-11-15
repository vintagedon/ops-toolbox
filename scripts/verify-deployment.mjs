/**
 * @file Records a build's revision and SHA-256 file hashes, then checks served bytes.
 * @description Build/CI only; adds no application runtime network requests.
 * @license MIT
 */
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const MANIFEST = 'deployment.json';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

// Cloudflare prepends its managed policy to this site's robots.txt. Only the
// provider-owned prefix is outside the build; the remaining bytes must still hash
// exactly. Origin/preview hosts and every application file stay byte-exact.
function originRobotsBytes(path, baseUrl, response, bytes) {
  const base = new URL(baseUrl);
  const served = new URL(response.url);
  if (path !== 'robots.txt' || base.origin !== 'https://opstoolbox.dev' || base.pathname !== '/' ||
      served.origin !== 'https://opstoolbox.dev' || served.pathname !== '/robots.txt' ||
      response.headers.get('server')?.toLowerCase() !== 'cloudflare' ||
      !/^text\/plain(?:;|$)/i.test(response.headers.get('content-type') || '')) return null;
  const text = bytes.toString('utf8');
  // Reject replacement decoding before using a string's byte length as an offset.
  // Unique markers prevent a malformed first block from consuming later rules.
  if (!Buffer.from(text, 'utf8').equals(bytes) ||
      text.split('# BEGIN Cloudflare Managed content').length !== 2 ||
      text.split('# END Cloudflare Managed Content').length !== 2) return null;
  const prefix = text.match(
    /^(?:#[^\r\n]*\r?\n|\r?\n)*# BEGIN Cloudflare Managed content\r?\n[\s\S]*?\r?\n# END Cloudflare Managed Content\r?\n\r?\n/
  )?.[0];
  return prefix ? bytes.subarray(Buffer.byteLength(prefix)) : null;
}

export async function writeManifest(directory, revision, run) {
  if (!/^[a-f0-9]{40}$/.test(revision || '') || !run) {
    throw new Error('A full source commit SHA and deployment run ID are required');
  }
  const files = [];
  async function walk(relative = '') {
    for (const entry of await readdir(join(directory, relative), { withFileTypes: true })) {
      const path = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile() && path !== MANIFEST && path !== 'staticwebapp.config.json') {
        files.push({ path, sha256: digest(await readFile(join(directory, path))) });
      }
    }
  }
  await walk();
  if (!files.some(file => file.path === 'index.html')) throw new Error('Build has no index.html');
  files.sort((a, b) => a.path.localeCompare(b.path));
  const manifest = { revision, run, files };
  await writeFile(join(directory, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export async function verifyDeployment(directory, baseUrl) {
  const manifestBytes = await readFile(join(directory, MANIFEST));
  const manifest = JSON.parse(manifestBytes);
  async function get(path) {
    const url = new URL(path.split('/').map(encodeURIComponent).join('/'), `${baseUrl.replace(/\/$/, '')}/`);
    url.searchParams.set('verify', manifest.run);
    const response = await fetch(url, {
      headers: { 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
    return { response, bytes: Buffer.from(await response.arrayBuffer()) };
  }
  if (digest((await get(MANIFEST)).bytes) !== digest(manifestBytes)) {
    throw new Error('Deployment manifest does not match the expected build');
  }
  // Keep network load bounded while verifying every published file.
  for (let offset = 0; offset < manifest.files.length; offset += 6) {
    await Promise.all(manifest.files.slice(offset, offset + 6).map(async file => {
      const { response, bytes } = await get(file.path);
      if (digest(bytes) === file.sha256) return;
      const originBytes = originRobotsBytes(file.path, baseUrl, response, bytes);
      if (originBytes && digest(originBytes) === file.sha256) {
        console.log(`Verified robots.txt origin bytes at ${baseUrl}; Cloudflare managed prefix retained`);
        return;
      }
      throw new Error(`Content mismatch: ${file.path}`);
    }));
  }
  return manifest.files.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [command, directory, target] = process.argv.slice(2);
  try {
    if (command === 'create') {
      const manifest = await writeManifest(directory, process.env.GITHUB_SHA, process.env.DEPLOYMENT_RUN_ID);
      console.log(`Recorded ${manifest.files.length} files for commit ${manifest.revision}`);
    } else if (command === 'verify' && directory && target) {
      // A completed Azure deployment can take time to reach the serving edge.
      for (let attempt = 1; ; attempt += 1) {
        try {
          const count = await verifyDeployment(directory, target);
          console.log(`Verified ${count} files at ${target} against the local build manifest`);
          break;
        } catch (error) {
          if (attempt === 6) throw error;
          console.log(`Verification attempt ${attempt}: ${error.message}; retrying in 10 seconds`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }
    } else throw new Error('Usage: verify-deployment.mjs create <dist> | verify <dist> <url>');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
