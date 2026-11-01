/**
 * Default Playwright worker count for module suites in CI.
 * Override with PLAYWRIGHT_WORKERS or CI_MODULES_PARALLEL=false (legacy no-op).
 */
const CI_MODULES_ENV = {
  PLAYWRIGHT_WORKERS: '4'
};

function applyModulesCiDefaults() {
  if (process.env.CI !== 'true') {
    return {};
  }

  const paceEnv = (process.env.PACE_ENV || process.env.PACE_TEST_ENV || 'prod').trim().toLowerCase();
  const workerDefault =
    paceEnv === 'dev3'
      ? process.env.CI_DEV3_MODULE_WORKERS || '2'
      : process.env.CI_PROD_MODULE_WORKERS || '2';
  const defaults = { ...CI_MODULES_ENV, PLAYWRIGHT_WORKERS: process.env.PLAYWRIGHT_WORKERS || workerDefault };

  // One SSO account per job — cap workers so parallel specs do not invalidate each other's sessions.
  if (!process.env.PLAYWRIGHT_WORKERS?.trim()) {
    process.env.PLAYWRIGHT_WORKERS = workerDefault;
  }

  for (const [key, value] of Object.entries(defaults)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }

  return { ...defaults };
}

function isModulesSerialCi() {
  return false;
}

/** @deprecated use isModulesSerialCi */
function isDev3ModulesSerialCi() {
  return false;
}

module.exports = {
  CI_MODULES_ENV,
  CI_MODULES_SERIAL_ENV: CI_MODULES_ENV,
  CI_DEV3_MODULES_ENV: CI_MODULES_ENV,
  applyModulesCiDefaults,
  isModulesSerialCi,
  isDev3ModulesSerialCi
};
