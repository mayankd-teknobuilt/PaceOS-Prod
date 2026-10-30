/**
 * Dev3 module specs share one SSO account; parallel workers cause logout redirect races
 * on same-tab PACE Administration routes (/portfolio, /project-list, etc.).
 */
const CI_DEV3_MODULES_ENV = {
  PLAYWRIGHT_WORKERS: '1'
};

function applyModulesCiDefaults() {
  if (process.env.CI !== 'true') {
    return { ...CI_DEV3_MODULES_ENV };
  }

  if (getPaceEnvKey() !== 'dev3') {
    return {};
  }

  for (const [key, value] of Object.entries(CI_DEV3_MODULES_ENV)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }

  return { ...CI_DEV3_MODULES_ENV };
}

function getPaceEnvKey() {
  return (process.env.PACE_ENV || 'prod').trim().toLowerCase();
}

function isDev3ModulesSerialCi() {
  return process.env.CI === 'true' && getPaceEnvKey() === 'dev3';
}

module.exports = {
  CI_DEV3_MODULES_ENV,
  applyModulesCiDefaults,
  isDev3ModulesSerialCi
};
