import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStaticServer } from './serve.mjs';
import { filterTools } from '../site/assets/search.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const payload = JSON.parse(await readFile(path.join(SITE, 'data/tools.json'), 'utf8'));

const candidates = [
  process.env.CHROME_PATH,
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser',
  'chrome',
].filter(Boolean);

function findChrome() {
  for (const candidate of candidates) {
    if (candidate.includes(path.sep) || candidate.includes('/')) {
      if (existsSync(candidate)) return candidate;
      continue;
    }
    try {
      const found = execFileSync('which', [candidate], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      if (found) return found;
    } catch {
      // Try the next browser name.
    }
  }
  return null;
}

const chrome = findChrome();
if (!chrome) {
  console.log('SKIP: Chrome or Chromium was not found. Set CHROME_PATH to run the browser check.');
  process.exit(0);
}

const server = createStaticServer({ root: SITE });
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const address = server.address();
const base = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;

function dumpDom(route) {
  return new Promise((resolve, reject) => {
    const args = [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--no-first-run',
      '--disable-background-networking',
      '--virtual-time-budget=5000',
      '--dump-dom',
      `${base}${route}`,
    ];
    const child = spawn(chrome, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`Chrome timed out while loading ${route}`));
    }, 30_000);

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`Chrome exited with ${code} for ${route}\n${stderr.slice(-1200)}`));
        return;
      }
      if (!stdout.includes('<!doctype html>') && !stdout.includes('<!DOCTYPE html>')) {
        reject(new Error(`Chrome returned no page for ${route}\n${stderr.slice(-1200)}`));
        return;
      }
      resolve(stdout);
    });
  });
}

function count(html, pattern) {
  return [...html.matchAll(pattern)].length;
}

function tagForId(html, id) {
  const match = html.match(new RegExp(`<[^>]*\\bid="${id}"[^>]*>`));
  return match?.[0] ?? '';
}

function textForId(html, id) {
  const match = html.match(new RegExp(`<[^>]*\\bid="${id}"[^>]*>([\\s\\S]*?)<\\/[^>]+>`));
  return match ? match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
}

function expectedCount(filters) {
  return filterTools(payload.tools, filters, payload.categories).length;
}

const checks = [];
async function check(name, run) {
  try {
    await run();
    checks.push({ name, ok: true });
    console.log(`PASS: ${name}`);
  } catch (error) {
    checks.push({ name, ok: false });
    console.error(`FAIL: ${name}`);
    console.error(error.message);
  }
}

try {
  await check('home page renders every tool, category, and filter', async () => {
    const html = await dumpDom('/');
    assert.equal(count(html, /<article[^>]*class="tool-card"/g), payload.tools.length);
    assert.equal(count(html, /<a[^>]*class="category-card"/g), payload.categories.length);
    assert.equal(count(html, /<button[^>]*class="category-chip"/g), payload.categories.length + 1);
    assert.equal(textForId(html, 'results-status'), `Showing all ${payload.tools.length} tools.`);
    assert.ok(tagForId(html, 'error-state').includes('hidden'));
    assert.ok(tagForId(html, 'loading-state').includes('hidden'));
    assert.equal(count(html, /class="access-badge"/g), payload.tools.length);
    assert.ok(html.includes('October 22, 2026'));
    assert.ok(html.includes('Official site'));
  });

  await check('category URL state filters the directory and explains the category', async () => {
    const html = await dumpDom('/?category=audio');
    const audio = payload.categories.find((category) => category.id === 'audio');
    assert.ok(audio);
    assert.equal(count(html, /<article[^>]*class="tool-card"/g), audio.count);
    assert.match(tagForId(html, 'active-note'), /^<div[^>]*>/);
    assert.ok(!/\bhidden\b/.test(tagForId(html, 'active-note')));
    assert.ok(html.includes(audio.description));
    assert.ok(/<button[^>]*data-chip-category="audio"[^>]*aria-pressed="true"/.test(html));
    assert.match(textForId(html, 'results-status'), new RegExp(`^${audio.count} of ${payload.tools.length} tools`));
  });

  await check('search text filters across the directory', async () => {
    const expected = expectedCount({ query: 'transcribe' });
    assert.ok(expected > 0 && expected < payload.tools.length, 'Search fixture should hit a subset');
    const html = await dumpDom('/?q=transcribe');
    assert.equal(count(html, /<article[^>]*class="tool-card"/g), expected);
    const status = textForId(html, 'results-status');
    assert.ok(status.includes(`of ${payload.tools.length} tools`), status);
    assert.ok(tagForId(html, 'empty-state').includes('hidden'));
    assert.ok(!tagForId(html, 'clear-filters').includes('disabled'), 'Clear filters should be enabled while searching');
  });

  await check('access filter returns only matching access labels', async () => {
    const expected = expectedCount({ access: 'open-source' });
    assert.ok(expected > 0);
    const html = await dumpDom('/?access=open-source');
    assert.equal(count(html, /<article[^>]*class="tool-card"/g), expected);
    const badges = [...html.matchAll(/<span[^>]*class="access-badge"[^>]*>/g)].map((match) => match[0]);
    assert.equal(badges.length, expected);
    assert.ok(badges.every((badge) => badge.includes('data-access="open-source"')), 'Unexpected access badge');
  });

  await check('combined category and query filters stay in sync', async () => {
    const expected = expectedCount({ category: 'coding', query: 'local' });
    assert.ok(expected > 0, 'Expected a local coding result');
    const html = await dumpDom('/?category=coding&q=local');
    assert.equal(count(html, /<article[^>]*class="tool-card"/g), expected);
    assert.match(tagForId(html, 'active-note'), /^<div[^>]*>/);
    assert.ok(!/\bhidden\b/.test(tagForId(html, 'active-note')));
    assert.ok(/<button[^>]*data-chip-category="coding"[^>]*aria-pressed="true"/.test(html));
    assert.match(textForId(html, 'results-status'), new RegExp(`^${expected} of ${payload.tools.length} tools in Coding`));
    assert.ok(!tagForId(html, 'clear-filters').includes('disabled'), 'Clear filters should be enabled');
  });

  await check('an empty result shows the empty state instead of a blank grid', async () => {
    const html = await dumpDom('/?q=zzzznotfound');
    assert.equal(count(html, /<article[^>]*class="tool-card"/g), 0);
    assert.ok(!/\bhidden\b/.test(tagForId(html, 'empty-state')));
    assert.match(textForId(html, 'results-status'), new RegExp(`^0 of ${payload.tools.length} tools`));
  });

  await check('an invalid category parameter falls back to all tools', async () => {
    const html = await dumpDom('/?category=not-real');
    assert.equal(count(html, /<article[^>]*class="tool-card"/g), payload.tools.length);
    assert.ok(tagForId(html, 'active-note').includes('hidden'));
  });

  await check('the about page loads with its method content', async () => {
    const html = await dumpDom('/about.html');
    assert.ok(html.includes('How tools are chosen'));
    assert.ok(html.includes('What “last verified” means'));
    assert.ok(html.includes('ASDALE DYNAMICS, LLC'));
    assert.ok(html.includes(`${payload.tools.length} tools`));
  });
} finally {
  await new Promise((resolve) => server.close(resolve));
}

const failures = checks.filter((entry) => !entry.ok);
console.log(`\nBrowser checks: ${checks.length - failures.length}/${checks.length} passed.`);
if (failures.length > 0) process.exitCode = 1;
