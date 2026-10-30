const fs = require('fs');
const path = require('path');
const { loadProdEnv } = require('../utils/loadEnv');
const { normalizeCiEnv } = require('../utils/ciEnv');

const paceEnv = (process.env.PACE_ENV || process.env.PACE_TEST_ENV || 'prod').trim().toLowerCase();
process.env.PACE_ENV = paceEnv;

loadProdEnv();
normalizeCiEnv();

const KEYS = [
  'PACE_ENV',
  'BASE_URL',
  'TEST_EMAIL',
  'TEST_PASSWORD',
  'PROD_USE_FIRST_PROJECT',
  'PROD_PROJECT_NAME',
  'PROD_PROJECT_CODE',
  'PROD_PHASE',
  'PROD_SECTION',
  'PROD_BLOCK',
  'CONTROL_TOWER_PORTFOLIO_URL',
  'CONTROL_TOWER_URL_PATTERN',
  'PROD_CONTROL_TOWER_TAB',
  'PROD_CONTROL_TOWER_MODULE',
  'PLAYWRIGHT_WORKERS',
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

const lines = KEYS.filter(key => process.env[key]?.trim()).map(
  key => `${key}=${process.env[key].trim()}`
);

const envFileName = paceEnv === 'prod' ? '.env.local' : `.env.${paceEnv}.local`;
const envPath = path.resolve(process.cwd(), envFileName);
fs.writeFileSync(envPath, `${lines.join('\n')}\n`, 'utf8');
console.log(`[ci-env] PACE_ENV=${paceEnv} — wrote ${lines.length} variables to ${envFileName}`);
