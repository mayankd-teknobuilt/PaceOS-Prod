/**
 * Expand a category into independent parallel test cases.
 *
 * setupMode:
 * - minimal  → tab (+ optional filters) only; pick report directly from combobox
 * - filters  → tab + anchor report before each filter button (Execution Overview)
 * - full     → cumulative report chain (slow; fallback only)
 */
function buildReportTestCases(category, { includeTrendViews = false } = {}) {
  const cases = [];
  const setupSteps = [];
  const setupMode = category.setupMode || 'minimal';

  if (includeTrendViews && category.prepareTrendViews?.length) {
    for (const label of category.prepareTrendViews) {
      setupSteps.push({ type: 'button', name: label, label });
    }
  }

  if (category.entry?.length) {
    setupSteps.push(...category.entry);
  }

  if (category.slug === 'daily-progress') {
    const preamble = [...setupSteps];

    for (const step of category.steps) {
      cases.push({
        id: `${category.slug}::${step.name}`,
        categorySlug: category.slug,
        categoryName: category.name,
        reportName: step.name,
        setupSteps: [...preamble],
        reportStep: step
      });
    }
    return cases;
  }

  if (setupMode === 'minimal') {
    const preamble = [...setupSteps];

    for (const step of category.steps) {
      if (step.type === 'button') {
        preamble.push(step);
        continue;
      }

      cases.push({
        id: `${category.slug}::${step.name}`,
        categorySlug: category.slug,
        categoryName: category.name,
        reportName: step.name,
        setupSteps: [...preamble],
        reportStep: step
      });
    }

    return cases;
  }

  if (setupMode === 'filters') {
    const preamble = [...setupSteps];
    let anchorReport = null;

    for (const step of category.steps) {
      if (step.type === 'button') {
        if (anchorReport) {
          preamble.push(anchorReport);
        }
        preamble.push(step);
        continue;
      }

      cases.push({
        id: `${category.slug}::${step.name}`,
        categorySlug: category.slug,
        categoryName: category.name,
        reportName: step.name,
        setupSteps: [...preamble],
        reportStep: step
      });
      anchorReport = step;
    }

    return cases;
  }

  // full — cumulative chain (legacy / fallback)
  const preamble = [...setupSteps];

  for (const step of category.steps) {
    if (step.type === 'button') {
      preamble.push(step);
      continue;
    }

    cases.push({
      id: `${category.slug}::${step.name}`,
      categorySlug: category.slug,
      categoryName: category.name,
      reportName: step.name,
      setupSteps: [...preamble],
      reportStep: step
    });
    preamble.push(step);
  }

  return cases;
}

function buildAllReportTestCases(options = {}) {
  const { categories } = require('../testdata/control-tower');
  return categories
    .filter(category => category.prodEnabled !== false)
    .flatMap(category => buildReportTestCases(category, options));
}

function splitIntoWorkerBatches(items, workerCount) {
  const batches = Array.from({ length: workerCount }, () => []);
  items.forEach((item, index) => {
    batches[index % workerCount].push(item);
  });
  return batches.filter(batch => batch.length > 0);
}

module.exports = { buildReportTestCases, buildAllReportTestCases, splitIntoWorkerBatches };
