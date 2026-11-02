const path = require('path');
const { loadProdEnv } = require('../utils/loadEnv');

const REPO_ROOT = path.resolve(__dirname, '..');

/** Load .env.local + .env.<PACE_ENV>.local + profile defaults (same as Playwright). */
function loadScriptEnv() {
  loadProdEnv(REPO_ROOT);
}

module.exports = { loadScriptEnv, REPO_ROOT };
