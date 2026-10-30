/**
 * Control Tower runs share one browser tab per worker. In CI we use one worker,
 * serial specs, and longer timeouts. Local runs may use more workers (see npm scripts).
 */
const CI_CONTROL_TOWER_ENV = {
  PLAYWRIGHT_WORKERS: '1',
  CASE_TIMEOUT_MS: '180000',
  CASE_ATTEMPT_MS: '90000',
  SLOW_CASE_TIMEOUT_MS: '300000',
  SLOW_CASE_ATTEMPT_MS: '150000',
  DOWNLOAD_TIMEOUT_MS: '45000',
  CT_VIEW_LOAD_MS: '40000'
};

function applyControlTowerCiDefaults() {
  if (process.env.CI !== 'true') {
    return { ...CI_CONTROL_TOWER_ENV };
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
