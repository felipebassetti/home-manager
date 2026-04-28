const { spawnSync } = require('node:child_process');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const binaryName = process.platform === 'win32' ? 'supabase.exe' : 'supabase';
const binaryPath = path.join(rootDir, 'node_modules', 'supabase', 'bin', binaryName);

const result = spawnSync(binaryPath, process.argv.slice(2), {
  cwd: rootDir,
  stdio: 'inherit'
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
