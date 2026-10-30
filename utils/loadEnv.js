const path = require('path');
const fs = require('fs');
const { normalizeCiEnv } = require('./ciEnv');
const { applyEnvironmentProfile, getPaceEnvKey } = require('./paceEnv');
const { loadEnvFileRaw } = require('./envSecrets');

/**
 * Load .env files without overriding variables already set by the shell/CI.
 * Applies built-in defaults for the active PACE_ENV profile.
 */
function loadProdEnv(baseDir = path.resolve(__dirname, '..')) {
  const dotenv = require('dotenv');
  /** Set by cross-env / CI before Node starts — must win over .env.local PACE_ENV=dev3 */
  const lockedPaceEnv = process.env.PACE_ENV?.trim();

  for (const file of ['.env', '.env.local']) {
    const envPath = path.resolve(baseDir, file);
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: false });
    }
  }

  if (lockedPaceEnv) {
    process.env.PACE_ENV = lockedPaceEnv;
  }

  const paceEnv = getPaceEnvKey();
  const profileEnvPath = path.resolve(baseDir, `.env.${paceEnv}.local`);
  if (fs.existsSync(profileEnvPath)) {
    loadEnvFileRaw(profileEnvPath, fs, dotenv);
  }

  if (lockedPaceEnv) {
    process.env.PACE_ENV = lockedPaceEnv;
  }

  normalizeCiEnv();
  applyEnvironmentProfile();
}

module.exports = { loadProdEnv };
