const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const COMMITTED = [
  {
    file: '.env.example',
    role: 'Prod template — copy to .env.local and fill secrets'
  },
  {
    file: '.env.dev3.example',
    role: 'Dev3 template — copy to .env.dev3.local and fill secrets'
  }
];

const LOCAL_ONLY = [
  {
    file: '.env.local',
    role: 'Prod credentials and Power Automate report webhook (never commit)'
  },
  {
    file: '.env.dev3.local',
    role: 'Dev3 credentials; usually includes PACE_ENV=dev3 (never commit)'
  }
];

function status(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    return 'missing';
  }
  const stat = fs.statSync(full);
  return stat.size > 0 ? 'present' : 'empty';
}

console.log('[env] Files to preserve in Git (templates only):');
for (const { file, role } of COMMITTED) {
  console.log(`  ${file.padEnd(22)} ${status(file).padEnd(8)} — ${role}`);
}

console.log('\n[env] Files to preserve on your machine only (gitignored):');
for (const { file, role } of LOCAL_ONLY) {
  console.log(`  ${file.padEnd(22)} ${status(file).padEnd(8)} — ${role}`);
}

console.log('\n[env] Load order: .env → .env.local → .env.<PACE_ENV>.local → config/environments.js');
console.log('[env] CI writes .env.local or .env.dev3.local from GitHub secrets via scripts/create-ci-env.js');

const missingLocal = LOCAL_ONLY.filter(({ file }) => status(file) === 'missing');
if (missingLocal.length) {
  console.log('\n[env] Hint: copy templates for missing local files:');
  for (const { file } of missingLocal) {
    const template = file === '.env.local' ? '.env.example' : '.env.dev3.example';
    console.log(`  copy ${template} → ${file}`);
  }
}
