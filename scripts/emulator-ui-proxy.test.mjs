import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import http from 'node:http';
import { once } from 'node:events';
import { createUiProxy, upstreamFor } from './emulator-ui-proxy.mjs';

const require = createRequire(import.meta.url);
const { proxyUrl } = require('./emulator-ui-client.cjs');
const origin = 'https://example-4000.app.github.dev';

test('Firestore, Auth, and WebSocket URLs stay on the private UI origin', () => {
  assert.equal(proxyUrl('http://127.0.0.1:8080/v1/documents?q=1', origin),
    `${origin}/__emulator_proxy/8080/v1/documents?q=1`);
  assert.equal(proxyUrl('//localhost:9099/emulator/v1/projects', origin),
    `${origin}/__emulator_proxy/9099/emulator/v1/projects`);
  assert.equal(proxyUrl('wss://127.0.0.1:9150/requests', origin),
    'wss://example-4000.app.github.dev/__emulator_proxy/9150/requests');
  assert.equal(proxyUrl('http://[::1]:8080/v1/documents', origin),
    `${origin}/__emulator_proxy/8080/v1/documents`);
});

test('external services and UI assets are not sent to emulators', () => {
  assert.equal(proxyUrl('https://example.com/path', origin), 'https://example.com/path');
  assert.equal(proxyUrl('/assets/ui.js', origin), `${origin}/assets/ui.js`);
  assert.equal(proxyUrl('http://127.0.0.1:22/path', origin), 'http://127.0.0.1:22/path');
});

test('proxy destinations are allowlisted localhost ports', () => {
  assert.deepEqual(upstreamFor('/firestore/data'), { port: 4001, path: '/firestore/data' });
  assert.deepEqual(upstreamFor('/__emulator_proxy/8080/v1/documents?q=1'),
    { port: 8080, path: '/v1/documents?q=1' });
  assert.throws(() => upstreamFor('/__emulator_proxy/22/'), /Unknown/);
  assert.throws(() => upstreamFor('/__emulator_proxy/https://example.com/'), /Unknown/);
});

test('browser adapter routes fetch, XHR and WebSocket without changing their options', async () => {
  const calls = [];
  class XHR {
    open(...args) { calls.push(['xhr', ...args]); }
  }
  class Socket {
    static OPEN = 1;
    constructor(...args) { calls.push(['socket', ...args]); }
  }
  const context = {
    URL, Request, XMLHttpRequest: XHR, WebSocket: Socket,
    location: { origin },
    fetch: async (...args) => { calls.push(['fetch', ...args]); },
  };
  vm.runInNewContext(await readFile(new URL('./emulator-ui-client.cjs', import.meta.url), 'utf8'), context);
  await context.fetch('http://127.0.0.1:8080/v1/documents', { method: 'POST' });
  await context.fetch(new Request('http://127.0.0.1:9099/accounts', {
    method: 'POST', body: 'payload', headers: { 'content-type': 'text/plain' },
  }));
  new context.XMLHttpRequest().open('POST', 'http://127.0.0.1:8080/channel', true);
  new context.WebSocket('wss://127.0.0.1:9150/requests', ['test']);
  assert.equal(calls[0][1], `${origin}/__emulator_proxy/8080/v1/documents`);
  assert.equal(calls[0][2].method, 'POST');
  assert.equal(calls[1][1], `${origin}/__emulator_proxy/9099/accounts`);
  assert.equal(calls[1][2].method, 'POST');
  // A buffered body, not a stream: streamed uploads fail on HTTP/1.1 in Chrome.
  assert.equal(new TextDecoder().decode(calls[1][2].body), 'payload');
  assert.equal(new Headers(calls[1][2].headers).get('content-type'), 'text/plain');
  assert.deepEqual(calls[2], ['xhr', 'POST', `${origin}/__emulator_proxy/8080/channel`, true]);
  assert.deepEqual(calls[3], ['socket',
    'wss://example-4000.app.github.dev/__emulator_proxy/9150/requests', ['test']]);
  assert.equal(context.WebSocket.OPEN, 1);
});

test('UI proxy injects the adapter before UI scripts and preserves API requests', async (t) => {
  const upstream = http.createServer((req, res) => {
    if (req.url === '/api/config') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ projectId: 'demo-partners' }));
      return;
    }
    const html = '<html><head><script type="module" src="/assets/ui.js"></script></head><body>UI</body></html>';
    res.writeHead(200, {
      'content-type': 'text/html',
      'content-length': Buffer.byteLength(html),
      etag: '"original"',
    });
    res.end(req.method === 'HEAD' ? undefined : html);
  });
  t.after(() => {
    upstream.closeAllConnections();
    upstream.close();
  });
  upstream.listen(0, '127.0.0.1');
  await once(upstream, 'listening');

  const proxy = createUiProxy({ uiPort: upstream.address().port });
  t.after(() => {
    proxy.closeAllConnections();
    proxy.close();
  });
  proxy.listen(0, '127.0.0.1');
  await once(proxy, 'listening');
  const base = `http://127.0.0.1:${proxy.address().port}`;

  const page = await fetch(`${base}/firestore/default/data`);
  assert.equal(page.status, 200);
  assert.equal(page.headers.get('content-length'), null);
  assert.equal(page.headers.get('etag'), null);
  assert.match(await page.text(),
    /<head><script src="\/__emulator_proxy\/client.js"><\/script><script type="module"/);

  const client = await fetch(`${base}/__emulator_proxy/client.js`);
  assert.equal(client.status, 200);
  assert.match(client.headers.get('content-type'), /application\/javascript/);
  assert.match(await client.text(), /XMLHttpRequest/);

  const config = await fetch(`${base}/api/config`);
  assert.deepEqual(await config.json(), { projectId: 'demo-partners' });
  const head = await fetch(`${base}/firestore/default/data`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});
