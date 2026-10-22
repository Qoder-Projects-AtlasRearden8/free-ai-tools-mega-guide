import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['.git', 'node_modules', 'tests']);
const TEXT_EXTENSIONS = new Set(['.md', '.json', '.mjs', '.js', '.html', '.css', '.svg', '.txt', '.yml', '.yaml']);
const TEXT_NAMES = new Set(['README.md', 'package.json']);
const FORBIDDEN_NAMES = [/^\.env(\.|$)/i, /^id_rsa/i, /^id_ed25519/i, /\.pem$/i, /\.key$/i, /\.p12$/i, /\.pfx$/i];

const secretPatterns = [
  { label: 'AWS access key', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: 'GitHub token', pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/ },
  { label: 'GitHub fine-grained token', pattern: /\bgithub_pat_[A-Za-z0-9_]{30,}\b/ },
  { label: 'OpenAI-style secret key', pattern: /\bsk-[A-Za-z0-9]{24,}\b/ },
  { label: 'Anthropic-style secret key', pattern: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/ },
  { label: 'Slack token', pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { label: 'Google API key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { label: 'private key', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { label: 'JSON web token', pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  {
    label: 'hard-coded credential assignment',
    pattern: /\b(?:password|passwd|secret|api[_-]?key|access[_-]?token)\s*[:=]\s*['"][^'"\s]{8,}['"]/i,
  },
];

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

const allFiles = await walk(ROOT);

test('no likely secrets or key files are present', async () => {
  for (const file of allFiles) {
    const name = path.basename(file);
    for (const pattern of FORBIDDEN_NAMES) {
      assert.ok(!pattern.test(name), `Forbidden credential filename: ${path.relative(ROOT, file)}`);
    }
    if (!TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()) && !TEXT_NAMES.has(name)) continue;
    if ((await stat(file)).size > 2_000_000) continue;
    const content = await readFile(file, 'utf8');
    for (const { label, pattern } of secretPatterns) {
      assert.ok(!pattern.test(content), `Possible ${label} in ${path.relative(ROOT, file)}`);
    }
  }
});

test('the project has no email addresses or phone numbers in shipped files', async () => {
  const shipped = allFiles.filter((file) => {
    const relative = path.relative(ROOT, file);
    return !relative.startsWith('tests/') && (TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()) || TEXT_NAMES.has(path.basename(file)));
  });
  for (const file of shipped) {
    const content = await readFile(file, 'utf8');
    assert.doesNotMatch(content, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, `Email address in ${path.relative(ROOT, file)}`);
    assert.doesNotMatch(content, /(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}\b/, `Phone-like number in ${path.relative(ROOT, file)}`);
  }
});

test('the package is private and dependency-free', async () => {
  const pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.private, true);
  assert.equal(pkg.type, 'module');
  assert.deepEqual(pkg.dependencies ?? {}, {});
  assert.deepEqual(pkg.devDependencies ?? {}, {});
  assert.ok(pkg.scripts?.build);
  assert.ok(pkg.scripts?.test);
  assert.ok(pkg.scripts?.start);
});

test('the website loads no analytics, ads, tracking, or remote assets', async () => {
  const forbiddenHosts = /google-analytics|googletagmanager|doubleclick|facebook\.net|hotjar|plausible\.io|matomo|segment\.(?:com|io)|mixpanel|fullstory|clarity\.ms|sentry\.io|adservice|taboola|outbrain/i;
  const htmlFiles = allFiles.filter((file) => file.startsWith(path.join(ROOT, 'site')) && file.endsWith('.html'));
  for (const file of htmlFiles) {
    const content = await readFile(file, 'utf8');
    assert.doesNotMatch(content, forbiddenHosts, `Tracking language found in ${path.relative(ROOT, file)}`);
    assert.doesNotMatch(content, /<iframe\b/i, `Unexpected iframe in ${path.relative(ROOT, file)}`);
    assert.doesNotMatch(content, /<(?:script|img)[^>]+src="https?:/i, `Remote executable or image asset in ${path.relative(ROOT, file)}`);
    assert.doesNotMatch(content, /<link[^>]+href="https?:/i, `Remote stylesheet or asset in ${path.relative(ROOT, file)}`);
  }

  const jsFiles = allFiles.filter((file) => file.startsWith(path.join(ROOT, 'site')) && /\.(?:js|mjs)$/.test(file));
  for (const file of jsFiles) {
    const content = await readFile(file, 'utf8');
    assert.doesNotMatch(content, forbiddenHosts, `Tracking host found in ${path.relative(ROOT, file)}`);
    assert.doesNotMatch(content, /https?:\/\//, `Remote URL found in client code: ${path.relative(ROOT, file)}`);
  }
});

test('site pages do not permit inline execution through their CSP', async () => {
  for (const file of allFiles.filter((file) => file.startsWith(path.join(ROOT, 'site')) && file.endsWith('.html'))) {
    const content = await readFile(file, 'utf8');
    assert.ok(content.includes("script-src 'self'"), `${path.relative(ROOT, file)} is missing script-src 'self'`);
    assert.ok(content.includes("object-src 'none'"), `${path.relative(ROOT, file)} is missing object-src 'none'`);
    assert.ok(!content.includes('unsafe-inline'), `${path.relative(ROOT, file)} allows unsafe inline content`);
  }
});

test('the source data uses only public HTTPS official links', async () => {
  const dataFiles = allFiles.filter((file) => file.startsWith(path.join(ROOT, 'data')) && file.endsWith('.json'));
  for (const file of dataFiles) {
    const parsed = JSON.parse(await readFile(file, 'utf8'));
    const tools = Array.isArray(parsed.tools) ? parsed.tools : [];
    for (const tool of tools) {
      const url = new URL(tool.url);
      assert.equal(url.protocol, 'https:');
      assert.ok(!url.username && !url.password);
      assert.ok(!['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname));
    }
  }
});
