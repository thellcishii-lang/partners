import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const targets = new Set([4400, 4500, 5001, 8080, 9099, 9150, 9199]);
const prefix = '/__emulator_proxy/';
const adapterPath = `${prefix}client.js`;
const adapter = await readFile(new URL('./emulator-ui-client.cjs', import.meta.url));
const script = `<script src="${adapterPath}"></script>`;

export function upstreamFor(requestUrl, uiPort = 4001) {
  if (!requestUrl.startsWith(prefix)) return { port: uiPort, path: requestUrl };
  const match = /^\/__emulator_proxy\/(\d+)(\/.*)$/.exec(requestUrl);
  if (!match || !targets.has(Number(match[1]))) {
    throw new Error('Unknown emulator proxy target');
  }
  return { port: Number(match[1]), path: match[2] };
}

export function createUiProxy({ uiPort = 4001 } = {}) {
  const server = http.createServer((req, res) => {
    if (req.url === adapterPath) {
      res.writeHead(200, {
        'content-type': 'application/javascript; charset=utf-8',
        'cache-control': 'no-store',
      });
      res.end(adapter);
      return;
    }

    let target;
    try {
      target = upstreamFor(req.url, uiPort);
    } catch (error) {
      console.error(error.message);
      res.writeHead(400, { 'content-type': 'text/plain' });
      res.end(error.message);
      return;
    }

    const headers = { ...req.headers, host: `127.0.0.1:${target.port}` };
    delete headers['accept-encoding'];
    delete headers['if-none-match'];
    delete headers['if-modified-since'];
    const upstream = http.request({
      host: '127.0.0.1',
      port: target.port,
      path: target.path,
      method: req.method,
      headers,
    }, (response) => {
      const responseHeaders = { ...response.headers, 'cache-control': 'no-store' };
      const html = target.port === uiPort &&
        response.headers['content-type']?.includes('text/html') &&
        req.method !== 'HEAD';
      if (html) {
        delete responseHeaders['content-length'];
        delete responseHeaders.etag;
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          res.writeHead(response.statusCode, responseHeaders);
          res.end(Buffer.concat(chunks).toString('utf8').replace('<head>', `<head>${script}`));
        });
      } else {
        res.writeHead(response.statusCode, responseHeaders);
        response.pipe(res);
      }
      response.on('error', (error) => {
        // ブラウザが Firestore の長時間接続を閉じたときの aborted は正常系。
        if (error.message !== 'aborted') {
          console.error(`Emulator response failed (${target.port}):`, error.message);
        }
        res.destroy(error);
      });
    });
    upstream.on('error', (error) => {
      console.error(`Emulator connection failed (${target.port}):`, error.message);
      if (!res.headersSent) {
        res.writeHead(502, { 'content-type': 'text/plain' });
        res.end(`Emulator on port ${target.port} is unavailable. Start the Firebase emulators.`);
      } else {
        res.destroy(error);
      }
    });
    req.on('aborted', () => upstream.destroy());
    res.on('close', () => upstream.destroy());
    req.pipe(upstream);
  });

  server.on('upgrade', (req, socket, head) => {
    let target;
    try {
      target = upstreamFor(req.url, uiPort);
      if (target.port !== 9150) throw new Error('Unsupported WebSocket target');
    } catch (error) {
      console.error(error.message);
      socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
      return;
    }

    const upstream = http.request({
      host: '127.0.0.1',
      port: target.port,
      path: target.path,
      headers: { ...req.headers, host: `127.0.0.1:${target.port}` },
    });
    upstream.on('upgrade', (response, upstreamSocket, upstreamHead) => {
      let handshake = `HTTP/1.1 ${response.statusCode} ${response.statusMessage}\r\n`;
      for (let i = 0; i < response.rawHeaders.length; i += 2) {
        handshake += `${response.rawHeaders[i]}: ${response.rawHeaders[i + 1]}\r\n`;
      }
      socket.write(`${handshake}\r\n`);
      if (upstreamHead.length) socket.write(upstreamHead);
      if (head.length) upstreamSocket.write(head);
      socket.pipe(upstreamSocket).pipe(socket);
      socket.on('error', () => upstreamSocket.destroy());
      upstreamSocket.on('error', (error) => {
        console.error('Emulator WebSocket failed:', error.message);
        socket.destroy();
      });
      socket.on('close', () => upstreamSocket.destroy());
      upstreamSocket.on('close', () => socket.destroy());
    });
    upstream.on('response', (response) => {
      console.error(`Emulator WebSocket rejected upgrade: ${response.statusCode}`);
      response.resume();
      socket.end('HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\n\r\n');
    });
    upstream.on('error', (error) => {
      console.error('Emulator WebSocket connection failed:', error.message);
      socket.end('HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\n\r\n');
    });
    socket.on('error', () => upstream.destroy());
    upstream.end();
  });
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createUiProxy();
  server.on('error', (error) => {
    console.error('Emulator UI proxy failed:', error.message);
    process.exitCode = 1;
  });
  server.listen(4000, '127.0.0.1', () => {
    console.log('Codespaces Emulator UI: open forwarded port 4000 (keep it private).');
  });
}
