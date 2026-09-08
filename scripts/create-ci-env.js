const fs = require('fs');
const path = require('path');

const KEYS = [
  'BASE_URL',
  'TEST_EMAIL',
  'TEST_PASSWORD',
  'PROD_USE_FIRST_PROJECT',
  'PROD_PROJECT_NAME',
  'PROD_PHASE',
  'PROD_SECTION',
  'PROD_BLOCK',
  'CONTROL_TOWER_PORTFOLIO_URL',
  'PLAYWRIGHT_WORKERS',
  'CT_WORKERS',
  'INCLUDE_BADGE_AUTH',
  'BADGE_NUMBER',
  'BADGE_PASSWORD'
];

const lines = KEYS.filter((key) => process.env[key]?.trim()).map(
  (key) => `${key}=${process.env[key].trim()}`
);

if (!lines.length) {
  console.warn('[ci-env] No environment variables found to write.');
  process.exit(0);
}

const envPath = path.resolve(process.cwd(), '.env.local');
fs.writeFileSync(envPath, `${lines.join('\n')}\n`, 'utf8');
console.log(`[ci-env] Wrote ${lines.length} variables to .env.local`);
