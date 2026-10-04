import assert from 'node:assert/strict';
import { test } from 'node:test';
import { emulatorArgs, projectIdFrom } from './start-emulators.mjs';

test('emulator project follows the web app project ID', () => {
  assert.equal(projectIdFrom('A=1\nNEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-x\n'), 'demo-x');
  assert.equal(projectIdFrom('NEXT_PUBLIC_FIREBASE_PROJECT_ID="demo-y" # c'), 'demo-y');
  assert.equal(projectIdFrom(''), 'demo-partners');
  assert.throws(() => emulatorArgs('real-project', false), /demo-/);
});

test('emulator data is restored when present and always saved on exit', () => {
  const fresh = emulatorArgs('demo-x', false);
  assert.ok(!fresh.includes('--import'));
  assert.deepEqual(fresh.slice(-2), ['--export-on-exit', '.firebase/emulator-data']);
  const restored = emulatorArgs('demo-x', true);
  assert.deepEqual(restored.slice(restored.indexOf('--import'), restored.indexOf('--import') + 2),
    ['--import', '.firebase/emulator-data']);
  assert.deepEqual(restored.slice(restored.indexOf('--project'), restored.indexOf('--project') + 2),
    ['--project', 'demo-x']);
});
