const DEFAULT_BASE_URL = 'https://goldenpasslng.pace-os.com/';
const DEFAULT_CONTROL_TOWER_URL = 'https://us-controltower.pace-os.com/#/portfolio?page=1';

const ALIASES = {
  BASE_URL: ['BASE_URL', 'PACE_BASE_URL'],
  TEST_EMAIL: ['TEST_EMAIL', 'EMAIL', 'PACE_TEST_EMAIL', 'PROD_TEST_EMAIL'],
  TEST_PASSWORD: ['TEST_PASSWORD', 'PASSWORD', 'PACE_TEST_PASSWORD', 'PROD_TEST_PASSWORD']
};

function pickEnv(keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return '';
}

function normalizeCiEnv() {
  for (const [canonical, keys] of Object.entries(ALIASES)) {
    const value = pickEnv(keys);
    if (value) {
      process.env[canonical] = value;
    }
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
