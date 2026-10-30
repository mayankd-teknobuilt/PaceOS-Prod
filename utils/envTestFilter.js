const { getPaceEnvKey } = require('./paceEnv');

/**
 * Playwright grep for the active PACE_ENV.
 * Tests must include @pace-env-prod, @pace-env-dev3, or @pace-env-all in the describe title.
 * Set PACE_ENV_FILTER=false to run every spec (runtime test.skip still applies).
 */
function getPlaywrightEnvGrep(envKey = getPaceEnvKey()) {
  if (process.env.PACE_ENV_FILTER === 'false') {
    return undefined;
  }

  if (envKey === 'dev3') {
    return /@pace-env-dev3|@pace-env-all/;
  }

  return /@pace-env-prod|@pace-env-all/;
}

function combineGrepPatterns(basePattern, envPattern) {
  if (!envPattern) {
    return basePattern;
  }
  const base = basePattern instanceof RegExp ? basePattern.source : basePattern;
  const env = envPattern instanceof RegExp ? envPattern.source : envPattern;
  return new RegExp(`(?=.*${base})(?=.*(?:${env}))`);
}

module.exports = {
  getPlaywrightEnvGrep,
  combineGrepPatterns
};
