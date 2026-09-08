/**
 * Generates PACE-QA-Test-Catalog.xlsx from testdata registries.
 * Run: npm run generate:test-catalog
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { modules } = require('../testdata/stageModules');
const { categories } = require('../testdata/control-tower');
const { buildReportTestCases } = require('../utils/controlTowerParallel');

const OUTPUT_DIR = path.resolve(__dirname, '..', 'exports');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'PACE-QA-Test-Catalog.xlsx');

const NPM_COMMANDS = [
  { command: 'npm run test:prod-modules:headed', description: 'All production dashboard modules (parallel)' },
  { command: 'npm run test:prod-modules:each', description: 'Each production module spec individually' },
  { command: 'npm run test:control-tower-reports:headed', description: 'All Control Tower report tests (parallel)' },
  { command: 'npm run test:ct:daily-progress:headed', description: 'Control Tower — Daily Progress trend views' },
  { command: 'npm run test:ct:project-libraries:headed', description: 'Control Tower — Project Libraries' },
  { command: 'npm run test:ct:standard-libraries:headed', description: 'Control Tower — Standard Libraries' },
  { command: 'npm run test:ct:execution-overview:headed', description: 'Control Tower — Execution Overview' },
  { command: 'npm run test:ct:health-and-safety:headed', description: 'Control Tower — Health And Safety' }
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function describeSetupSteps(steps) {
  if (!steps?.length) return 'Open Control Tower portfolio';
  return steps
    .map(step => {
      if (step.type === 'tab') return `Open tab: ${step.label}`;
      if (step.type === 'button') return `Click filter/button: ${step.label}`;
      if (step.type === 'report') return `Select report: ${step.name}`;
      return step.name || step.label || '';
    })
    .join(' → ');
}

function buildStageModuleRows() {
  return modules.map((module, index) => {
    const specFile = `tests/prod-modules/All Modules/${slugify(module.moduleName)}.spec.js`;
    return {
      'Test ID': `PM-${String(index + 1).padStart(3, '0')}`,
      Project: 'prod-modules',
      Category: 'Production Dashboard Modules',
      Tab: module.tabName,
      'Test Name': `${module.moduleName} — opens and loads without application errors`,
      'Spec File': specFile,
      'Test Type': 'Module navigation & load',
      Steps: `Login → Select project context → Open tab "${module.tabName}" → Open module "${module.moduleName}" → Wait for full load → Assert no errors`,
      Validation: 'Page loads; no visible HTTP/JS errors',
      Parallel: 'Yes (default 4 workers)',
      'Run Command': `npx playwright test --project=prod-modules "${specFile}"`,
      Tags: '@prod-modules'
    };
  });
}

function buildControlTowerRows() {
  const rows = [];
  let counter = 1;

  for (const category of categories) {
    const cases = buildReportTestCases(category);
    const specFile = `tests/Control-tower-reports/${category.slug}.spec.js`;
    const categoryRunCommand = `npm run test:ct:${category.slug}:headed`;

    for (const testCase of cases) {
      const isTrend = category.slug === 'daily-progress';
      rows.push({
        'Test ID': `CT-${String(counter++).padStart(3, '0')}`,
        Project: 'control-tower-reports',
        Category: category.name,
        Tab: category.entry?.[0]?.label || 'Portfolio',
        'Test Name': testCase.reportName,
        'Spec File': specFile,
        'Test Type': isTrend ? 'Trend view' : 'Report navigation & download',
        Steps: isTrend
          ? `Open Control Tower → Click "${testCase.reportName}" → Wait for load → Assert no errors`
          : `Open Control Tower → ${describeSetupSteps(testCase.setupSteps)} → Select "${testCase.reportName}" → Verify load & CSV download rule`,
        Validation: isTrend
          ? 'Trend view loads; no application errors'
          : 'Report loads; Download CSV if data present (pass if no data)',
        Parallel: 'Yes (default 4 workers)',
        'Run Command': `${categoryRunCommand} --grep "${testCase.reportName}"`,
        Tags: '@prod-modules'
      });
    }
  }

  return rows;
}

function buildSummaryRows(stageRows, controlTowerRows) {
  const ctByCategory = controlTowerRows.reduce((acc, row) => {
    acc[row.Category] = (acc[row.Category] || 0) + 1;
    return acc;
  }, {});

  return [
    { Metric: 'Generated on', Value: new Date().toISOString().slice(0, 19).replace('T', ' ') },
    { Metric: 'Framework path', Value: 'PACE-QA-Automation-prod' },
    { Metric: 'Total test cases', Value: stageRows.length + controlTowerRows.length },
    { Metric: 'Production module tests', Value: stageRows.length },
    { Metric: 'Control Tower tests', Value: controlTowerRows.length },
    ...Object.entries(ctByCategory).map(([category, count]) => ({
      Metric: `CT — ${category}`,
      Value: count
    }))
  ];
}

function autoFitColumns(rows) {
  if (!rows.length) return [];
  const keys = Object.keys(rows[0]);
  return keys.map(key => {
    const maxLen = Math.max(key.length, ...rows.map(row => String(row[key] ?? '').length));
    return { wch: Math.min(Math.max(maxLen + 2, 12), 80) };
  });
}

function writeWorkbook(stageRows, controlTowerRows, allRows) {
  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.json_to_sheet(buildSummaryRows(stageRows, controlTowerRows));
  summarySheet['!cols'] = [{ wch: 34 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  const allSheet = XLSX.utils.json_to_sheet(allRows);
  allSheet['!cols'] = autoFitColumns(allRows);
  XLSX.utils.book_append_sheet(workbook, allSheet, 'All Test Cases');

  const stageSheet = XLSX.utils.json_to_sheet(stageRows);
  stageSheet['!cols'] = autoFitColumns(stageRows);
  XLSX.utils.book_append_sheet(workbook, stageSheet, 'Production Modules');

  const ctByCategory = {};
  for (const row of controlTowerRows) {
  if (!ctByCategory[row.Category]) ctByCategory[row.Category] = [];
    ctByCategory[row.Category].push(row);
  }

  for (const [category, rows] of Object.entries(ctByCategory)) {
    const sheetName = category.slice(0, 31);
    const sheet = XLSX.utils.json_to_sheet(rows);
    sheet['!cols'] = autoFitColumns(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  }

  const commandsSheet = XLSX.utils.json_to_sheet(NPM_COMMANDS);
  commandsSheet['!cols'] = [{ wch: 48 }, { wch: 52 }];
  XLSX.utils.book_append_sheet(workbook, commandsSheet, 'Run Commands');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  XLSX.writeFile(workbook, OUTPUT_FILE);
}

function main() {
  const stageRows = buildStageModuleRows();
  const controlTowerRows = buildControlTowerRows();
  const allRows = [...stageRows, ...controlTowerRows];

  writeWorkbook(stageRows, controlTowerRows, allRows);

  console.log(`Test catalog written: ${OUTPUT_FILE}`);
  console.log(`  Production modules: ${stageRows.length}`);
  console.log(`  Control Tower: ${controlTowerRows.length}`);
  console.log(`  Total:         ${allRows.length}`);
}

main();
