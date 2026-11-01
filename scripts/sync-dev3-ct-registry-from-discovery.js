/**

 * Update dev3-only control-tower category files from discovered-dev3-ct-reports.json

 * then regenerate per-report Playwright specs.

 */

const path = require('path');

const fs = require('fs');

const { execSync } = require('child_process');

const { toSlug } = require('../utils/moduleSlug');

const { flattenDiscoveryTab } = require('../utils/ctManagementSections');



const root = path.resolve(__dirname, '..');

const discoveryPath = path.join(root, 'testdata', 'discovered-dev3-ct-reports.json');

const indexPath = path.join(root, 'testdata', 'control-tower', 'index.js');



const TAB_SLUG_OVERRIDES = {

  'Project Libraries': 'project-libraries',

  'Standard Libraries': 'standard-libraries',

  PMS: 'pms',

  'Leading Indicators': 'leading-indicators',

  'Lagging Indicators': 'lagging-indicators'

};



const INDICATORS_TABS = new Set(['Leading Indicators', 'Lagging Indicators']);



if (!fs.existsSync(discoveryPath)) {

  console.error(`Missing ${discoveryPath}. Run: npm run discover:dev3-control-tower-reports`);

  process.exit(1);

}



const snapshot = JSON.parse(fs.readFileSync(discoveryPath, 'utf8'));

const { discovered } = snapshot;



function slugForTab(tabLabel) {

  return TAB_SLUG_OVERRIDES[tabLabel] || toSlug(tabLabel);

}



function buildIndicatorsCategoryModule(tabLabel, slug, tabData) {

  const safeName = tabLabel.replace(/'/g, "\\'");

  const rows = flattenDiscoveryTab(tabData);

  const stepsBlock = rows

    .map(row => {

      const mgmt = row.managementTab ? `, managementTab: ${JSON.stringify(row.managementTab)}` : '';

      return `  { type: 'report', name: ${JSON.stringify(row.name)}, option: ${JSON.stringify(row.option)}${mgmt} }`;

    })

    .join(',\n');



  return `module.exports = {

  slug: '${slug}',

  name: '${safeName}',

  prodEnabled: false,

  enabledEnvs: ['dev3'],

  setupMode: 'management-sections',

  entry: [{ type: 'tab', label: '${safeName}' }],

  steps: [

${stepsBlock}

  ]

};

`;

}



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



const writtenSlugs = [];



for (const [tabLabel, tabData] of Object.entries(discovered)) {

  const slug = slugForTab(tabLabel);



  if (INDICATORS_TABS.has(tabLabel)) {

    const rows = flattenDiscoveryTab(tabData);

    if (!rows.length) {

      console.log(`[sync-dev3-ct] Skipping empty tab: ${tabLabel}`);

      continue;

    }

    writtenSlugs.push(slug);

    const outPath = path.join(root, 'testdata', 'control-tower', `${slug}.js`);

    fs.writeFileSync(outPath, buildIndicatorsCategoryModule(tabLabel, slug, tabData), 'utf8');

    console.log(`[sync-dev3-ct] Updated ${slug}.js (${rows.length} reports)`);

    continue;

  }



  const names = Array.isArray(tabData) ? tabData : [];

  if (!names.length && tabLabel !== 'PMS') {

    console.log(`[sync-dev3-ct] Skipping empty tab: ${tabLabel}`);

    continue;

  }



  writtenSlugs.push(slug);

  const outPath = path.join(root, 'testdata', 'control-tower', `${slug}.js`);

  fs.writeFileSync(outPath, buildCategoryModule(tabLabel, slug, names), 'utf8');

  console.log(`[sync-dev3-ct] Updated ${slug}.js (${names.length} reports)`);

}



function ensureLaggingInIndex() {

  const hasLagging = writtenSlugs.includes('lagging-indicators');

  let indexSource = fs.readFileSync(indexPath, 'utf8');



  if (hasLagging && !indexSource.includes("require('./lagging-indicators')")) {

    indexSource = indexSource.replace(

      "const leadingIndicators = require('./leading-indicators');",

      "const leadingIndicators = require('./leading-indicators');\nconst laggingIndicators = require('./lagging-indicators');"

    );

    indexSource = indexSource.replace(

      'leadingIndicators\n  ],',

      'leadingIndicators,\n    laggingIndicators\n  ],'

    );

    indexSource = indexSource.replace(

      'leadingIndicators\n};',

      'leadingIndicators,\n  laggingIndicators\n};'

    );

    fs.writeFileSync(indexPath, indexSource, 'utf8');

    console.log('[sync-dev3-ct] Added lagging-indicators to index.js');

  }

}



ensureLaggingInIndex();



execSync('node scripts/generate-control-tower-report-tests.js', { cwd: root, stdio: 'inherit' });

console.log('[sync-dev3-ct] Regenerated tests/Control-tower-reports/reports/*.spec.js');


