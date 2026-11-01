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

  for (const [key, value] of Object.entries(CI_MODULES_ENV)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }

  return { ...CI_MODULES_ENV };
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
