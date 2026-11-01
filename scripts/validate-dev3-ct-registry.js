/**
 * Offline check: dev3 Control Tower registry matches last discovery snapshot.
 * Run after: npm run discover:dev3-control-tower-reports
 */
const path = require('path');
const fs = require('fs');
const { loadProdEnv } = require('../utils/loadEnv');
const { getPaceEnvKey } = require('../utils/paceEnv');
const { categories } = require('../testdata/control-tower');
const { buildReportTestCases } = require('../utils/controlTowerParallel');
const { isCategoryEnabledForEnv } = require('../utils/paceEnv');

loadProdEnv(path.resolve(__dirname, '..'));

const TAB_TO_SLUG = {
  'Project Libraries': 'project-libraries',
  'Standard Libraries': 'standard-libraries',
  PMS: 'pms',
  'Leading Indicators': 'leading-indicators',
  'Lagging Indicators': 'lagging-indicators'
};

function loadDiscovery(envKey) {
  const filePath = path.resolve(__dirname, '..', 'testdata', `discovered-${envKey}-ct-reports.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing ${filePath}. Run npm run discover:${envKey === 'dev3' ? 'dev3-' : ''}control-tower-reports`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getRegistryReportsByTab(envKey) {
  const byTab = {};
  for (const category of categories) {
    if (!isCategoryEnabledForEnv(category, envKey)) continue;
    const tabLabel = category.entry?.[0]?.label || category.name;
    byTab[tabLabel] = buildReportTestCases(category).map(c => c.reportName);
  }
  return byTab;
}

function main() {
  const envKey = getPaceEnvKey();
  if (envKey !== 'dev3') {
    console.log(`[validate-dev3-ct] PACE_ENV=${envKey} — skipping (dev3 only).`);
    return;
  }

  const snapshot = loadDiscovery('dev3');
  const discovered = snapshot.discovered || {};
  const registryByTab = getRegistryReportsByTab('dev3');

  let failed = false;

  for (const [tabName, slug] of Object.entries(TAB_TO_SLUG)) {
    const onUi = discovered[tabName] || [];
    const inRegistry = registryByTab[tabName] || [];

    if (slug === 'lagging-indicators' && onUi.length === 0) {
      console.log(`[validate-dev3-ct] ${tabName}: no reports on tenant (skipped).`);
      continue;
    }

    const missingInRegistry = onUi.filter(name => !inRegistry.includes(name));
    const missingOnTenant = inRegistry.filter(name => !onUi.includes(name));

    if (missingInRegistry.length || missingOnTenant.length) {
      failed = true;
      console.error(`[validate-dev3-ct] Mismatch on tab "${tabName}":`);
      if (missingInRegistry.length) {
        console.error('  On UI but not in testdata/control-tower:', missingInRegistry);
      }
      if (missingOnTenant.length) {
        console.error('  In registry but not on UI:', missingOnTenant);
      }
    } else {
      console.log(`[validate-dev3-ct] ${tabName}: ${inRegistry.length} reports OK`);
    }
  }

  const expectedCount = snapshot.expectedCount;
  const actualCount = Object.values(registryByTab).reduce((sum, list) => sum + list.length, 0);
  console.log(`[validate-dev3-ct] Registry total: ${actualCount} (discovery expectedCount: ${expectedCount})`);

  if (typeof expectedCount === 'number' && expectedCount !== actualCount) {
    failed = true;
    console.error(`[validate-dev3-ct] expectedCount ${expectedCount} !== registry ${actualCount}`);
  }

  if (failed) {
    console.error('[validate-dev3-ct] FAILED — run npm run discover:dev3-control-tower-reports then npm run sync:dev3-control-tower-reports');
    process.exit(1);
  }

  console.log('[validate-dev3-ct] All dev3 Control Tower reports are registered and match discovery.');
}

main();
