import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createUiProxy } from './emulator-ui-proxy.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataDir = '.firebase/emulator-data';

// The web app and the emulators must use the same project ID; otherwise
// writes land in a project that the Emulator UI and Functions triggers ignore.
export function projectIdFrom(envText) {
  const match = /^\s*NEXT_PUBLIC_FIREBASE_PROJECT_ID\s*=\s*["']?([^"'\s#]*)/m.exec(envText ?? '');
  return match?.[1] || 'demo-partners';
}

export function emulatorArgs(projectId, hasData) {
  if (!projectId.startsWith('demo-')) {
    throw new Error(`Emulator project must be a demo- project ID (got "${projectId}").`);
  }
  return [
    'emulators:start',
    '--only', 'auth,firestore,functions,storage',
    '--project', projectId,
    ...(hasData ? ['--import', dataDir] : []),
    '--export-on-exit', dataDir,
  ];
}

function main() {
  const envPath = new URL('../web/.env.local', import.meta.url);
  const projectId = projectIdFrom(existsSync(envPath) ? readFileSync(envPath, 'utf8') : '');
  const args = emulatorArgs(projectId, existsSync(new URL(`../${dataDir}`, import.meta.url)));
  const server = createUiProxy();
  let firebase;
  let stopping = false;

  function stop() {
    if (stopping) return;
    stopping = true;
    server.close();
    server.closeAllConnections();
    // One SIGINT lets Firebase export data before exiting; a second one would skip it.
    firebase?.kill('SIGINT');
  }

  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(signal, stop);
  server.on('error', (error) => {
    console.error('Emulator UI proxy failed:', error.message);
    process.exitCode = 1;
    stop();
  });

  server.listen(4000, '127.0.0.1', () => {
    console.log(`Emulator UI: open port 4000 (project ${projectId}). Port 4001 is internal.`);
    console.log(`Emulator data is restored from and saved to ${dataDir}.`);
    firebase = spawn('firebase', args, {
      cwd: root,
      stdio: 'inherit',
      // Own process group: Ctrl-C reaches only this launcher, which forwards one SIGINT.
      detached: true,
      env: {
        ...process.env,
        FIREBASE_CLI_EXPERIMENTS: [
          process.env.FIREBASE_CLI_EXPERIMENTS,
          'webframeworks',
        ].filter(Boolean).join(','),
      },
    });
    firebase.on('error', (error) => {
      console.error('Firebase emulator startup failed:', error.message);
      process.exitCode = 1;
      stop();
    });
    firebase.on('exit', (code, signal) => {
      if (!stopping) {
        console.error(`Firebase emulators stopped (code: ${code}, signal: ${signal}).`);
      }
      if (!process.exitCode) process.exitCode = code ?? (stopping ? 0 : 1);
      stopping = true;
      server.close();
      server.closeAllConnections();
    });
  });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) main();
