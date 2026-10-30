const DEFAULT_BASE_URL = 'https://goldenpasslng.pace-os.com/';
const DEFAULT_CONTROL_TOWER_URL = 'https://us-controltower.pace-os.com/#/portfolio?page=1';

const ALIASES = {
  BASE_URL: ['BASE_URL', 'PACE_BASE_URL'],
  TEST_EMAIL: ['TEST_EMAIL', 'EMAIL', 'PACE_TEST_EMAIL', 'PROD_TEST_EMAIL'],
  TEST_PASSWORD: ['TEST_PASSWORD', 'PASSWORD', 'PACE_TEST_PASSWORD', 'PROD_TEST_PASSWORD']
};

const DEV3_ALIASES = {
  TEST_EMAIL: ['DEV3_TEST_EMAIL', 'TEST_EMAIL', 'EMAIL', 'PACE_TEST_EMAIL'],
  TEST_PASSWORD: ['DEV3_TEST_PASSWORD', 'TEST_PASSWORD', 'PASSWORD', 'PACE_TEST_PASSWORD']
};

function getActivePaceEnvKey() {
  return (process.env.PACE_ENV || process.env.PACE_TEST_ENV || 'prod').trim().toLowerCase();
}

function pickEnv(keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return '';
}

function normalizeCiEnv() {
  const paceEnv = getActivePaceEnvKey();
  const emailKeys =
    paceEnv === 'dev3' ? DEV3_ALIASES.TEST_EMAIL : ALIASES.TEST_EMAIL;
  const passwordKeys =
    paceEnv === 'dev3' ? DEV3_ALIASES.TEST_PASSWORD : ALIASES.TEST_PASSWORD;

  const baseUrl = pickEnv(ALIASES.BASE_URL);
  if (baseUrl) {
    process.env.BASE_URL = baseUrl;
  }

  const email = pickEnv(emailKeys);
  if (email) {
    process.env.TEST_EMAIL = email;
  }

  const password = pickEnv(passwordKeys);
  if (password) {
    process.env.TEST_PASSWORD = password;
  }

  if (!process.env.BASE_URL?.trim()) {
    process.env.BASE_URL = DEFAULT_BASE_URL;
  }

  if (!process.env.CONTROL_TOWER_PORTFOLIO_URL?.trim()) {
    process.env.CONTROL_TOWER_PORTFOLIO_URL = DEFAULT_CONTROL_TOWER_URL;
  }

  return {
    BASE_URL: process.env.BASE_URL,
    TEST_EMAIL: process.env.TEST_EMAIL || '',
    TEST_PASSWORD: process.env.TEST_PASSWORD || ''
  };
}

function getMissingRequired() {
  normalizeCiEnv();
  return ['BASE_URL', 'TEST_EMAIL', 'TEST_PASSWORD'].filter((key) => !process.env[key]?.trim());
}

function printCiConfigStatus() {
  normalizeCiEnv();
  const flags = {
    BASE_URL: !!process.env.BASE_URL?.trim(),
    TEST_EMAIL: !!process.env.TEST_EMAIL?.trim(),
    TEST_PASSWORD: !!process.env.TEST_PASSWORD?.trim()
  };

  console.log('[ci-env] Configuration status:');
  console.log(`  PACE_ENV: ${process.env.PACE_ENV || process.env.PACE_TARGET || 'prod (default)'}`);
  for (const [key, set] of Object.entries(flags)) {
    console.log(`  ${key}: ${set ? 'set' : 'MISSING'}`);
  }

  return flags;
}

module.exports = {
  DEFAULT_BASE_URL,
  DEFAULT_CONTROL_TOWER_URL,
  normalizeCiEnv,
  getMissingRequired,
  printCiConfigStatus
};
