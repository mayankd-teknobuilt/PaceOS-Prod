const { loadProdEnv } = require('../utils/loadEnv');

loadProdEnv();

const REQUIRED = ['BASE_URL', 'TEST_EMAIL', 'TEST_PASSWORD'];

const missing = REQUIRED.filter((key) => !process.env[key]?.trim());

if (missing.length) {
  console.error('[ci-env] Missing required environment variables:');
  for (const key of missing) {
    console.error(`  - ${key}`);
  }
  console.error('');
  console.error('Set them in CI/CD secrets/variables or in .env.local for local runs.');
  console.error('See .env.example for the full list of supported variables.');
  process.exit(1);
}

console.log('[ci-env] Required environment variables are present.');
console.log(`[ci-env] BASE_URL=${process.env.BASE_URL}`);
