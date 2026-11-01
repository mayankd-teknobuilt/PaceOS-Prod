/**
 * Control Tower CI timeouts and default worker count (parallel report specs).
 */
const CI_CONTROL_TOWER_ENV = {
  PLAYWRIGHT_WORKERS: '4',
  CASE_TIMEOUT_MS: '180000',
  CASE_ATTEMPT_MS: '90000',
  SLOW_CASE_TIMEOUT_MS: '300000',
  SLOW_CASE_ATTEMPT_MS: '150000',
  DOWNLOAD_TIMEOUT_MS: '90000',
  CT_VIEW_LOAD_MS: '40000'
};

function applyControlTowerCiDefaults() {
  if (process.env.CI !== 'true') {
    return { ...CI_CONTROL_TOWER_ENV };
  }

  const paceEnv = (process.env.PACE_ENV || process.env.PACE_TEST_ENV || 'prod').trim().toLowerCase();
  const workerDefault =
    paceEnv === 'dev3'
      ? process.env.CI_DEV3_CT_WORKERS || '2'
      : process.env.CI_PROD_CT_WORKERS || '2';
  if (!process.env.PLAYWRIGHT_WORKERS?.trim()) {
    process.env.PLAYWRIGHT_WORKERS = workerDefault;
  }

  for (const [key, value] of Object.entries(CI_CONTROL_TOWER_ENV)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
  return { ...CI_CONTROL_TOWER_ENV };
}

/** cross-env prefix for npm scripts mirroring CI Control Tower job */
function crossEnvControlTowerFlags() {
  return Object.entries(CI_CONTROL_TOWER_ENV)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ');
}

module.exports = {
  CI_CONTROL_TOWER_ENV,
  applyControlTowerCiDefaults,
  crossEnvControlTowerFlags
};
