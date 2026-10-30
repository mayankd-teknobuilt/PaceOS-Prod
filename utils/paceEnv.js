const { ENVIRONMENT_PROFILES } = require('../config/environments');

function getPaceEnvKey() {
  const key = (process.env.PACE_ENV || process.env.PACE_TARGET || 'prod').trim().toLowerCase();
  if (!ENVIRONMENT_PROFILES[key]) {
    const available = Object.keys(ENVIRONMENT_PROFILES).join(', ');
    throw new Error(`Unknown PACE_ENV "${key}". Supported: ${available}`);
  }
  return key;
}

function getEnvironmentProfile(envKey = getPaceEnvKey()) {
  return ENVIRONMENT_PROFILES[envKey];
}

const PROFILE_URL_KEYS = ['BASE_URL', 'CONTROL_TOWER_PORTFOLIO_URL', 'CONTROL_TOWER_URL_PATTERN'];

const PROFILE_CT_NAV_KEYS = ['PROD_CONTROL_TOWER_TAB', 'PROD_CONTROL_TOWER_MODULE'];

const PROD_CONTEXT_KEYS = [
  'PROD_PHASE',
  'PROD_SECTION',
  'PROD_BLOCK',
  'PROD_PROJECT_NAME',
  'PROD_PROJECT_CODE',
  'PROD_PROJECT_CARD_INDEX',
  'PROD_USE_FIRST_PROJECT'
];

function applyEnvironmentProfile() {
  const envKey = getPaceEnvKey();
  const profile = getEnvironmentProfile(envKey);
  const defaults = profile.defaults || {};

  for (const key of PROFILE_URL_KEYS) {
    if (defaults[key] !== undefined) {
      process.env[key] = String(defaults[key]);
    }
  }

  for (const key of PROFILE_CT_NAV_KEYS) {
    if (defaults[key] !== undefined) {
      process.env[key] = String(defaults[key]);
    }
  }

  for (const [key, value] of Object.entries(defaults)) {
    if (PROFILE_URL_KEYS.includes(key) || PROFILE_CT_NAV_KEYS.includes(key)) continue;
    if (!process.env[key]?.trim()) {
      process.env[key] = String(value);
    }
  }

  if (envKey !== 'prod') {
    for (const key of PROD_CONTEXT_KEYS) {
      if (defaults[key] !== undefined) {
        process.env[key] = String(defaults[key]);
      } else {
        delete process.env[key];
      }
    }
  }

  process.env.PACE_TEST_ENV = envKey;

  // Keep legacy alias in sync so normalizeCiEnv cannot point back at prod.
  if (process.env.BASE_URL) {
    process.env.PACE_BASE_URL = process.env.BASE_URL;
  }

  return profile;
}

/**
 * Control Tower category availability per environment.
 * - enabledEnvs on category wins when set
 * - prodEnabled: false → dev3 only
 * - otherwise → prod only
 */
function getEnabledEnvsForCategory(category) {
  if (Array.isArray(category.enabledEnvs)) {
    return category.enabledEnvs;
  }
  if (category.prodEnabled === false) {
    return ['dev3'];
  }
  return ['prod'];
}

function getCategoryEnvScopeTag(category) {
  const envs = getEnabledEnvsForCategory(category);
  const hasProd = envs.includes('prod');
  const hasDev3 = envs.includes('dev3');
  if (hasProd && hasDev3) {
    return '@pace-env-all';
  }
  if (hasDev3) {
    return '@pace-env-dev3';
  }
  return '@pace-env-prod';
}

function isCategoryEnabledForEnv(category, envKey = getPaceEnvKey()) {
  return getEnabledEnvsForCategory(category).includes(envKey);
}

function listEnvironmentKeys() {
  return Object.keys(ENVIRONMENT_PROFILES);
}

module.exports = {
  getPaceEnvKey,
  getEnvironmentProfile,
  applyEnvironmentProfile,
  getEnabledEnvsForCategory,
  getCategoryEnvScopeTag,
  isCategoryEnabledForEnv,
  listEnvironmentKeys,
  ENVIRONMENT_PROFILES
};
