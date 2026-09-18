import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const vitestRoot = path.dirname(require.resolve('vitest/package.json'));
const cli = path.join(vitestRoot, 'vitest.mjs');
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: projectRoot,
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
