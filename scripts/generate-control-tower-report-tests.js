const fs = require('fs');
const path = require('path');
const { categories } = require('../testdata/control-tower');
const { buildReportTestCases } = require('../utils/controlTowerParallel');
const { toSlug } = require('../utils/moduleSlug');

const reportsDir = path.resolve(__dirname, '..', 'tests', 'Control-tower-reports', 'reports');
const legacySpecsDir = path.resolve(__dirname, '..', 'tests', 'Control-tower-reports');

const LEGACY_CATEGORY_SPECS = [
  'daily-progress.spec.js',
  'project-libraries.spec.js',
  'standard-libraries.spec.js',
  'execution-overview.spec.js',
  'health-and-safety.spec.js'
];

function buildSpecFile(category, testCase) {
  const reportSlug = toSlug(testCase.reportName);

  return `const { test } = require('../../../utils/controlTowerFixture');
const { registerSingleReportTest } = require('../../../utils/controlTowerSpec');
const category = require('../../../testdata/control-tower/${category.slug}');

registerSingleReportTest(test, category, ${JSON.stringify(testCase.reportName)});
`;
}

function buildSpecPath(category, testCase) {
  return path.join(reportsDir, `${category.slug}-${toSlug(testCase.reportName)}.spec.js`);
}

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const generated = [];

for (const category of categories) {
  const cases = buildReportTestCases(category);

  for (const testCase of cases) {
    const specPath = buildSpecPath(category, testCase);
    fs.writeFileSync(specPath, buildSpecFile(category, testCase), 'utf8');
    generated.push(path.relative(path.resolve(__dirname, '..'), specPath));
  }
}

for (const legacySpec of LEGACY_CATEGORY_SPECS) {
  const legacyPath = path.join(legacySpecsDir, legacySpec);
  if (fs.existsSync(legacyPath)) {
    fs.unlinkSync(legacyPath);
  }
}

console.log(`Generated ${generated.length} Control Tower report specs in tests/Control-tower-reports/reports/`);
console.log(`Removed ${LEGACY_CATEGORY_SPECS.length} legacy category session specs.`);
