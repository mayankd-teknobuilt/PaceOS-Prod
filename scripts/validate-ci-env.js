const { loadProdEnv } = require('../utils/loadEnv');
const { getMissingRequired, printCiConfigStatus } = require('../utils/ciEnv');

loadProdEnv();
printCiConfigStatus();

const missing = getMissingRequired();

if (missing.length) {
  console.error('');
  console.error('[ci-env] Missing required environment variables:');
  for (const key of missing) {
    console.error(`  - ${key}`);
  }
  console.error('');

  if (process.env.GITHUB_ACTIONS === 'true') {
    console.error('Add these in GitHub -> Settings -> Secrets and variables -> Actions');
    console.error('');
    console.error('Secrets OR Variables (either works):');
    console.error('  TEST_EMAIL');
    console.error('  TEST_PASSWORD');
    console.error('');
    console.error('Variable (optional, has default):');
    console.error('  BASE_URL');
    console.error('');
    console.error('Accepted aliases: EMAIL, PASSWORD, PACE_TEST_EMAIL, PACE_TEST_PASSWORD');
    console.error(`Repository: ${process.env.GITHUB_REPOSITORY || 'unknown'}`);
    console.error(`Event: ${process.env.GITHUB_EVENT_NAME || 'unknown'}`);
  } else {
    console.error('Set them in CI/CD secrets/variables or in .env.local for local runs.');
    console.error('See .env.example for the full list of supported variables.');
  }

  process.exit(1);
}

console.log('[ci-env] Required environment variables are present.');
console.log(`[ci-env] BASE_URL=${process.env.BASE_URL}`);
