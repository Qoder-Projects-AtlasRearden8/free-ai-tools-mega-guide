import { get } from 'node:https';
import { loadGuideData, validateGuideData } from './validate.mjs';

const TIMEOUT_MS = 20_000;
const CONCURRENCY = 10;
const RETRY_DELAY_MS = 1_500;
const REQUEST_HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
};

const guide = validateGuideData(await loadGuideData(process.cwd()));
const urls = [...new Set(guide.tools.map((tool) => tool.url))];
const results = [];
let cursor = 0;

async function fetchOnce(url) {
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    headers: REQUEST_HEADERS,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  await response.body?.cancel();
  return { url, status: response.status, ok: response.status >= 200 && response.status < 400 };
}

// Google's sign-in pages send responses larger than Node's default 16 KB header limit.
function httpsStatus(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const request = get(url, {
      headers: REQUEST_HEADERS,
      maxHeaderSize: 128 * 1024,
      timeout: TIMEOUT_MS,
    }, async (response) => {
      const status = response.statusCode ?? 0;
      const location = response.headers.location;
      response.resume();
      if ([301, 302, 303, 307, 308].includes(status) && location && redirects < 5) {
        try {
          resolve(await httpsStatus(new URL(location, url).href, redirects + 1));
        } catch (error) {
          reject(error);
        }
        return;
      }
      resolve({ url, status, ok: status >= 200 && status < 400 });
    });
    request.on('timeout', () => request.destroy(new Error('Request timed out')));
    request.on('error', reject);
    request.end();
  });
}

async function checkUrl(url) {
  let lastResult;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      lastResult = await fetchOnce(url);
      if (lastResult.ok || lastResult.status < 500) return lastResult;
    } catch (error) {
      const code = error?.cause?.code || error?.code || error?.name || String(error);
      if (code === 'UND_ERR_HEADERS_OVERFLOW') {
        try {
          return await httpsStatus(url);
        } catch (fallbackError) {
          lastResult = { url, status: null, ok: false, error: fallbackError?.code || fallbackError?.message || String(fallbackError) };
          break;
        }
      }
      lastResult = { url, status: null, ok: false, error: code };
    }
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
  return lastResult;
}

async function worker() {
  while (cursor < urls.length) {
    const index = cursor++;
    results[index] = await checkUrl(urls[index]);
  }
}

console.log(`Checking ${urls.length} unique official links with ${CONCURRENCY} workers (one retry for 5xx/network errors)...`);
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

const blocked = new Set([401, 403, 405, 429]);
const hardFailures = results.filter((result) => !result.ok && !blocked.has(result.status));
const softBlocks = results.filter((result) => !result.ok && blocked.has(result.status));

for (const result of softBlocks) {
  console.log(`SOFT BLOCK  ${String(result.status).padEnd(3)} ${result.url}`);
}
for (const result of hardFailures) {
  console.log(`FAIL        ${String(result.status ?? result.error).padEnd(3)} ${result.url}`);
}

const reachable = results.length - hardFailures.length;
console.log(`\nReachable or bot-protected: ${reachable}/${results.length}`);
console.log(`Hard failures: ${hardFailures.length}`);
console.log(`Soft blocks (site reachable, automated request refused): ${softBlocks.length}`);

if (hardFailures.length > 0) {
  process.exitCode = 1;
}
