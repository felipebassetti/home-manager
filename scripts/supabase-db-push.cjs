const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const envFilePath = path.join(rootDir, 'apps', 'api', '.dev.vars');
const projectRef = 'howeplqipzeavmvhyfba';
const binaryName = process.platform === 'win32' ? 'supabase.exe' : 'supabase';
const binaryPath = path.join(rootDir, 'node_modules', 'supabase', 'bin', binaryName);

const envLines = fs.readFileSync(envFilePath, 'utf8').split(/\r?\n/);
const passwordLine = envLines.find((line) => line.trim().startsWith('DB_PASSWORD'));

if (!passwordLine) {
  console.error(`DB_PASSWORD was not found in ${envFilePath}`);
  process.exit(1);
}

const password = passwordLine.split('=').slice(1).join('=').trim();
const encodedPassword = encodeURIComponent(password);
const dbUrl = `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`;

const args = ['db', 'push', '--db-url', dbUrl, ...process.argv.slice(2)];
const result = spawnSync(binaryPath, args, {
  cwd: rootDir,
  stdio: 'inherit'
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
