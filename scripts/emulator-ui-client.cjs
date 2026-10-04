/* Browser transport adapter for the Codespaces Emulator UI proxy. */
(function (root) {
  const ports = new Set(['4400', '4500', '5001', '8080', '9099', '9150', '9199']);
  const hosts = new Set(['127.0.0.1', 'localhost', '[::1]']);
  const prefix = '/__emulator_proxy/';

  function proxyUrl(value, origin) {
    const url = new URL(value, origin);
    if (!hosts.has(url.hostname) || !ports.has(url.port)) return url.href;
    if (!['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol)) return url.href;

    const proxy = new URL(`${prefix}${url.port}${url.pathname}${url.search}`, origin);
    if (url.protocol === 'ws:' || url.protocol === 'wss:') {
      proxy.protocol = proxy.protocol === 'https:' ? 'wss:' : 'ws:';
    }
    return proxy.href;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { proxyUrl };
    return;
  }

  const origin = root.location.origin;
  const originalFetch = root.fetch.bind(root);
  root.fetch = function (input, init) {
    if (input instanceof Request) {
      const url = proxyUrl(input.url, origin);
      if (url === input.url) return originalFetch(input, init);
      // new Request(url, request) turns the body into a stream, which Chrome
      // only uploads over HTTP/2 (ERR_ALPN_NEGOTIATION_FAILED on HTTP/1.1).
      const hasBody = !['GET', 'HEAD'].includes(input.method);
      return (hasBody ? input.arrayBuffer() : Promise.resolve(undefined)).then((body) =>
        originalFetch(url, {
          method: input.method,
          headers: input.headers,
          body,
          mode: input.mode === 'navigate' ? 'same-origin' : input.mode,
          credentials: input.credentials,
          cache: input.cache,
          redirect: input.redirect,
          referrer: input.referrer,
          referrerPolicy: input.referrerPolicy,
          integrity: input.integrity,
          keepalive: input.keepalive,
          signal: input.signal,
          ...init,
        }));
    }
    return originalFetch(proxyUrl(String(input), origin), init);
  };

  const originalOpen = root.XMLHttpRequest.prototype.open;
  root.XMLHttpRequest.prototype.open = function (method, url, ...args) {
    return originalOpen.call(this, method, proxyUrl(String(url), origin), ...args);
  };

  const OriginalWebSocket = root.WebSocket;
  root.WebSocket = class extends OriginalWebSocket {
    constructor(url, protocols) {
      const target = proxyUrl(String(url), origin);
      if (protocols === undefined) super(target);
      else super(target, protocols);
    }
  };
})(globalThis);
