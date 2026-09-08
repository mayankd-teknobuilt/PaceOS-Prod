const path = require('path');
const fs = require('fs');
const { normalizeCiEnv } = require('./ciEnv');

/**
 * Load .env files without overriding variables already set by the shell/CI.
 */
function loadProdEnv(baseDir = path.resolve(__dirname, '..')) {
  const dotenv = require('dotenv');

  for (const file of ['.env', '.env.local']) {
    const envPath = path.resolve(baseDir, file);
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }
  }

  normalizeCiEnv();
}

module.exports = { loadProdEnv };
