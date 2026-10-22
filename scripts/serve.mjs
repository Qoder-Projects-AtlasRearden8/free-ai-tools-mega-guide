import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DEFAULT_ROOT = fileURLToPath(new URL('../site/', import.meta.url));
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.woff2': 'font/woff2',
};

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

function sendText(response, status, message, method = 'GET') {
  const body = `${message}\n`;
  response.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-cache',
  });
  response.end(method === 'HEAD' ? undefined : body);
}

function sendNotFound(response, method) {
  const body = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | Free AI Tools Mega Guide</title><link rel="stylesheet" href="/assets/styles.css"></head>
<body><main class="wrap not-found"><p class="eyebrow">404</p><h1>That page is not in the toolbox.</h1><p>The guide's directory is on the home page.</p><p><a class="button button--primary" href="/">Back to the guide</a></p></main></body>
</html>`;
  response.writeHead(404, {
    ...SECURITY_HEADERS,
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-cache',
  });
  response.end(method === 'HEAD' ? undefined : body);
}

export function createStaticServer({ root = DEFAULT_ROOT } = {}) {
  const resolvedRoot = path.resolve(root);

  return createServer(async (request, response) => {
    const method = request.method ?? 'GET';
    if (method !== 'GET' && method !== 'HEAD') {
      response.setHeader('Allow', 'GET, HEAD');
      sendText(response, 405, 'Method not allowed', method);
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    } catch {
      sendText(response, 400, 'Bad request', method);
      return;
    }

    if (pathname.includes('\0')) {
      sendText(response, 400, 'Bad request', method);
      return;
    }

    if (pathname.endsWith('/')) pathname += 'index.html';
    const relativePath = pathname.replace(/^\/+/, '');
    const filePath = path.resolve(resolvedRoot, relativePath);

    if (filePath !== resolvedRoot && !filePath.startsWith(`${resolvedRoot}${path.sep}`)) {
      sendText(response, 403, 'Forbidden', method);
      return;
    }

    try {
      const info = await stat(filePath);
      if (!info.isFile()) {
        sendNotFound(response, method);
        return;
      }

      const body = await readFile(filePath);
      const extension = path.extname(filePath).toLowerCase();
      response.writeHead(200, {
        ...SECURITY_HEADERS,
        'Content-Type': MIME_TYPES[extension] ?? 'application/octet-stream',
        'Content-Length': body.length,
        'Cache-Control': 'no-cache',
      });
      response.end(method === 'HEAD' ? undefined : body);
    } catch (error) {
      if (error && (error.code === 'ENOENT' || error.code === 'EISDIR' || error.code === 'ENOTDIR')) {
        sendNotFound(response, method);
        return;
      }
      console.error(error);
      sendText(response, 500, 'The server could not read that file', method);
    }
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const host = process.env.HOST || '127.0.0.1';
  const requestedPort = Number(process.env.PORT ?? 4173);
  if (!Number.isInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) {
    console.error('PORT must be a whole number between 0 and 65535.');
    process.exit(1);
  }

  const server = createStaticServer();
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${requestedPort} is already in use. Try PORT=4174 npm start.`);
    } else {
      console.error(error);
    }
    process.exit(1);
  });

  server.listen(requestedPort, host, () => {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : requestedPort;
    console.log(`Free AI Tools Mega Guide is running at http://${host}:${port}`);
    console.log('Press Ctrl+C to stop.');
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
