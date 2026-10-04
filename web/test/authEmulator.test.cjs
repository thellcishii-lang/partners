const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const { initializeApp, deleteApp } = require('firebase/app');
const { getAuth, connectAuthEmulator } = require('firebase/auth');

function loadConfig(env) {
  const source = fs.readFileSync(path.join(__dirname, '../next.config.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, process: { env } });
  return exports.default;
}

test('Auth SDK discards path prefixes in emulator URLs', async () => {
  const app = initializeApp({
    apiKey: 'test-api-key',
    projectId: 'demo-partners',
  }, 'auth-proxy-regression');
  try {
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'https://test-3000.app.github.dev/__firebase/auth', {
      disableWarnings: true,
    });
    assert.equal(auth.config.emulator.url, 'https://test-3000.app.github.dev/');
  } finally {
    await deleteApp(app);
  }
});

test('Codespaces rewrites preserve every Auth SDK endpoint path', async () => {
  const config = loadConfig({
    CODESPACES: 'true',
    NEXT_PUBLIC_USE_EMULATOR: 'true',
  });
  const rewrites = await config.rewrites();
  for (const prefix of [
    'identitytoolkit.googleapis.com',
    'securetoken.googleapis.com',
    'emulator/auth',
  ]) {
    const rule = rewrites.find(({ source }) => source === `/${prefix}/:path*`);
    assert.ok(rule, `Missing Auth rewrite for ${prefix}`);
    assert.equal(rule.destination, `http://127.0.0.1:9099/${prefix}/:path*`);
  }
});

test('emulator rewrites are disabled outside Codespaces emulator mode', async () => {
  for (const env of [
    {},
    { CODESPACES: 'true', NEXT_PUBLIC_USE_EMULATOR: 'false' },
    { NEXT_PUBLIC_USE_EMULATOR: 'true' },
  ]) {
    assert.equal((await loadConfig(env).rewrites()).length, 0);
  }
});
