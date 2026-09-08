const fs = require('fs');
const path = require('path');
const { loadProdEnv } = require('../utils/loadEnv');
const { normalizeCiEnv } = require('../utils/ciEnv');

loadProdEnv();
normalizeCiEnv();

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
  'BADGE_PASSWORD',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'EMAIL_FROM',
  'EMAIL_TO',
  'EMAIL_SUBJECT_PREFIX'
];

const lines = KEYS.filter((key) => process.env[key]?.trim()).map(
  (key) => `${key}=${process.env[key].trim()}`
);

const envPath = path.resolve(process.cwd(), '.env.local');
fs.writeFileSync(envPath, `${lines.join('\n')}\n`, 'utf8');
console.log(`[ci-env] Wrote ${lines.length} variables to .env.local`);
