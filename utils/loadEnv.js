const path = require('path');
const fs = require('fs');

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
}

module.exports = { loadProdEnv };
