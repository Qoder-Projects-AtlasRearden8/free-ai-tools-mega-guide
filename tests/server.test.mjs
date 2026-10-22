import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStaticServer } from '../scripts/serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = createStaticServer({ root: path.join(ROOT, 'site') });

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

const address = server.address();
const port = typeof address === 'object' && address ? address.port : 0;

function rawRequest(rawPath, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: '127.0.0.1',
        port,
        path: rawPath,
        method,
      },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          resolve({
            status: response.statusCode,
            headers: response.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

test('serves the home page with security headers', async () => {
  const { status, headers, body } = await rawRequest('/');
  assert.equal(status, 200);
  assert.match(headers['content-type'], /^text\/html; charset=utf-8$/);
  assert.match(headers['content-security-policy'], /default-src 'self'/);
  assert.match(headers['content-security-policy'], /script-src 'self'/);
  assert.equal(headers['x-content-type-options'], 'nosniff');
  assert.equal(headers['x-frame-options'], 'DENY');
  assert.equal(headers['referrer-policy'], 'strict-origin-when-cross-origin');
  assert.equal(headers['cross-origin-resource-policy'], 'same-origin');
  assert.equal(headers['cache-control'], 'no-cache');
  assert.ok(Number(headers['content-length']) > 1000);
  assert.ok(body.includes('id="tool-grid"'));
  assert.ok(body.includes('assets/app.js'));
});

test('serves the about page and local static assets with correct MIME types', async () => {
  const about = await rawRequest('/about.html');
  assert.equal(about.status, 200);
  assert.ok(about.body.includes('How tools are chosen'));

  const css = await rawRequest('/assets/styles.css');
  assert.equal(css.status, 200);
  assert.match(css.headers['content-type'], /^text\/css; charset=utf-8$/);
  assert.ok(css.body.includes('--paper'));

  const app = await rawRequest('/assets/app.js');
  assert.equal(app.status, 200);
  assert.match(app.headers['content-type'], /^text\/javascript; charset=utf-8$/);

  const favicon = await rawRequest('/assets/favicon.svg');
  assert.equal(favicon.status, 200);
  assert.equal(favicon.headers['content-type'], 'image/svg+xml');

  const data = await rawRequest('/data/tools.json');
  assert.equal(data.status, 200);
  assert.match(data.headers['content-type'], /^application\/json; charset=utf-8$/);
  const payload = JSON.parse(data.body);
  assert.ok(payload.tools.length >= 150);
  assert.equal(payload.meta.tool_count, payload.tools.length);
});

test('supports HEAD without sending a response body', async () => {
  const head = await rawRequest('/', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.body, '');
  assert.match(head.headers['content-type'], /^text\/html/);
  const get = await rawRequest('/');
  assert.equal(head.headers['content-length'], get.headers['content-length']);
});

test('returns a friendly 404 without inline styles', async () => {
  const missing = await rawRequest('/not-a-real-page');
  assert.equal(missing.status, 404);
  assert.match(missing.headers['content-type'], /^text\/html/);
  assert.ok(missing.body.includes('not in the toolbox'));
  assert.ok(missing.body.includes('class="wrap not-found"'));
  assert.doesNotMatch(missing.body, /\sstyle="/i);
  assert.match(missing.headers['content-security-policy'], /style-src 'self'/);

  const missingHead = await rawRequest('/not-a-real-page', 'HEAD');
  assert.equal(missingHead.status, 404);
  assert.equal(missingHead.body, '');
});

test('rejects unsupported methods with an Allow header', async () => {
  for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS']) {
    const response = await rawRequest('/', method);
    assert.equal(response.status, 405, `${method} should be rejected`);
    assert.equal(response.headers.allow, 'GET, HEAD');
    assert.match(response.headers['content-type'], /^text\/plain/);
  }
});

test('blocks path traversal attempts and bad encodings', async () => {
  for (const attempt of [
    '/..%2fpackage.json',
    '/%2e%2e%2fpackage.json',
    '/..%2f..%2fpackage.json',
  ]) {
    const response = await rawRequest(attempt);
    assert.ok([403, 404].includes(response.status), `${attempt} returned ${response.status}`);
    assert.ok(!response.body.includes('free-ai-tools-mega-guide'), `${attempt} exposed project files`);
  }

  const nullByte = await rawRequest('/%00');
  assert.equal(nullByte.status, 400);
});

test('returns 404 for directories and trailing-slash non-index paths', async () => {
  const directory = await rawRequest('/assets');
  assert.equal(directory.status, 404);

  const slash = await rawRequest('/about.html/');
  assert.equal(slash.status, 404);
});
