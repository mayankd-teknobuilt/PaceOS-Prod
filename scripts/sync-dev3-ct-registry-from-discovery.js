/**
 * Update dev3-only control-tower category files from discovered-dev3-ct-reports.json
 * then regenerate per-report Playwright specs.
 */
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const discoveryPath = path.join(root, 'testdata', 'discovered-dev3-ct-reports.json');

if (!fs.existsSync(discoveryPath)) {
  console.error(`Missing ${discoveryPath}. Run: npm run discover:dev3-control-tower-reports`);
  process.exit(1);
}

const { discovered } = JSON.parse(fs.readFileSync(discoveryPath, 'utf8'));

const CATEGORY_FILES = {
  'Project Libraries': { file: 'project-libraries.js', slug: 'project-libraries' },
  'Standard Libraries': { file: 'standard-libraries.js', slug: 'standard-libraries' },
  PMS: { file: 'pms.js', slug: 'pms' },
  'Leading Indicators': { file: 'leading-indicators.js', slug: 'leading-indicators' }
};

function buildCategoryModule(tabLabel, slug, reportNames) {
  const safeName = tabLabel.replace(/'/g, "\\'");

  const reportsBlock = reportNames.map(name => `  ${JSON.stringify(name)}`).join(',\n');

  if (tabLabel === 'PMS') {
    return `module.exports = {
  slug: 'pms',
  name: 'PMS',
  prodEnabled: false,
  enabledEnvs: ['dev3'],
  setupMode: 'minimal',
  entry: [{ type: 'tab', label: 'PMS' }],
  steps: [{ type: 'report', name: 'Progress Measurement System', option: 'Progress Measurement System' }]
};
`;
  }

  return `const reports = [
${reportsBlock}
];

module.exports = {
  slug: '${slug}',
  name: '${safeName}',
  prodEnabled: false,
  enabledEnvs: ['dev3'],
  setupMode: 'minimal',
  entry: [{ type: 'tab', label: '${safeName}' }],
  steps: reports.map(option => ({ type: 'report', name: option, option }))
};
`;
}

for (const [tabLabel, meta] of Object.entries(CATEGORY_FILES)) {
  const reportNames = discovered[tabLabel] || [];
  if (!reportNames.length && tabLabel !== 'PMS') {
    console.warn(`[sync-dev3-ct] Skipping empty tab: ${tabLabel}`);
    continue;
  }

  const outPath = path.join(root, 'testdata', 'control-tower', meta.file);
  fs.writeFileSync(outPath, buildCategoryModule(tabLabel, meta.slug, reportNames), 'utf8');
  console.log(`[sync-dev3-ct] Updated ${meta.file} (${reportNames.length} reports)`);
}

execSync('node scripts/generate-control-tower-report-tests.js', { cwd: root, stdio: 'inherit' });
console.log('[sync-dev3-ct] Regenerated tests/Control-tower-reports/reports/*.spec.js');
