const fs = require('fs');
const path = require('path');

const KNOWN_REPORT_FILES = [
  'report-prod-modules.json',
  'report-control-tower.json',
  'report-dev3-modules.json',
  'report-dev3-control-tower.json'
];

const REPORT_ENV_LABELS = {
  'report-prod-modules.json': 'Production — Modules',
  'report-control-tower.json': 'Production — Control Tower',
  'report-dev3-modules.json': 'Dev3 — Modules',
  'report-dev3-control-tower.json': 'Dev3 — Control Tower'
};

function pickEnv(keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return '';
}

function collectTestsFromSuite(suite, titles = []) {
  const rows = [];
  const nextTitles = suite.title ? [...titles, suite.title] : titles;

  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      const result = test.results?.[test.results.length - 1];
      rows.push({
        name: [...nextTitles, spec.title, test.title].filter(Boolean).join(' › '),
        status: result?.status || 'unknown',
        error: result?.error?.message || ''
      });
    }
  }

  for (const child of suite.suites || []) {
    rows.push(...collectTestsFromSuite(child, nextTitles));
  }

  return rows;
}

function summarizeRows(rows) {
  const summary = { passed: 0, failed: 0, skipped: 0, flaky: 0, total: rows.length };
  for (const row of rows) {
    if (row.status === 'passed' || row.status === 'expected') summary.passed += 1;
    else if (row.status === 'skipped') summary.skipped += 1;
    else if (row.status === 'flaky') summary.flaky += 1;
    else summary.failed += 1;
  }
  return summary;
}

function listReportJsonPaths(reportDir = path.resolve(process.cwd(), 'test-results')) {
  if (!fs.existsSync(reportDir)) {
    return [];
  }

  const files = new Set();
  for (const known of KNOWN_REPORT_FILES) {
    const full = path.join(reportDir, known);
    if (fs.existsSync(full)) {
      files.add(full);
    }
  }

  for (const file of fs.readdirSync(reportDir)) {
    if (/^report.*\.json$/i.test(file)) {
      files.add(path.join(reportDir, file));
    }
  }

  return [...files].sort();
}

function loadReportJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let report;
  try {
    report = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON report "${path.basename(filePath)}": ${error.message}`);
  }
  return report;
}

function loadTestReport(reportDir) {
  const reportPaths = listReportJsonPaths(reportDir);

  if (!reportPaths.length) {
    return {
      rows: [],
      summary: { passed: 0, failed: 0, skipped: 0, flaky: 0, total: 0 },
      reportFiles: []
    };
  }

  const rows = [];
  const reportFiles = [];
  for (const reportPath of reportPaths) {
    const report = loadReportJson(reportPath);
    const fileRows = (report.suites || []).flatMap(suite => collectTestsFromSuite(suite));
    rows.push(...fileRows);
    reportFiles.push({
      fileName: path.basename(reportPath),
      report,
      summary: summarizeRows(fileRows)
    });
  }

  return {
    rows,
    summary: summarizeRows(rows),
    reportFiles
  };
}

function statusLabel(summary) {
  if (summary.total === 0) return 'NO RESULTS';
  if (summary.failed === 0 && summary.flaky === 0) return 'PASSED';
  return 'FAILED';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml({ rows, summary }) {
  const overall = statusLabel(summary);
  const runUrl =
    process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : '';

  const failedRows = rows.filter(row => !['passed', 'expected', 'skipped'].includes(row.status));
  const passedRows = rows.filter(row => ['passed', 'expected'].includes(row.status));

  const renderRows = items =>
    items
      .map(
        row =>
          `<tr><td style="padding:6px 8px;border:1px solid #ddd;">${escapeHtml(row.name)}</td><td style="padding:6px 8px;border:1px solid #ddd;">${escapeHtml(row.status)}</td></tr>`
      )
      .join('');

  const failedSection =
    failedRows.length > 0
      ? `<h3>Failed / Flaky Tests (${failedRows.length})</h3><table style="border-collapse:collapse;width:100%;">${renderRows(failedRows)}</table>`
      : '<p>All executed tests passed.</p>';

  return `<!DOCTYPE html>
<html>
<body style="font-family:Segoe UI,Arial,sans-serif;color:#222;">
  <h2>PACE Production QA Report — ${overall}</h2>
  <p><strong>Environment:</strong> ${escapeHtml(process.env.BASE_URL || 'production')}</p>
  <p><strong>Summary:</strong> Passed ${summary.passed}, Failed ${summary.failed}, Skipped ${summary.skipped}, Flaky ${summary.flaky}, Total ${summary.total}</p>
  ${runUrl ? `<p><a href="${runUrl}">View GitHub Actions run</a></p>` : ''}
  ${failedSection}
  <h3>Passed Tests (${passedRows.length})</h3>
  <table style="border-collapse:collapse;width:100%;">${renderRows(passedRows) || '<tr><td>No passed tests recorded.</td></tr>'}</table>
</body>
</html>`;
}

function buildSubject(summary) {
  const overall = statusLabel(summary);
  const prefix = pickEnv(['EMAIL_SUBJECT_PREFIX']) || '[Prod Sanity PACE QA Daily Report]';
  return `${prefix} ${overall} — ${summary.passed}/${summary.total} passed`;
}

function buildEnvironmentLabel(reportFiles) {
  if (!reportFiles.length) {
    return pickEnv(['REPORT_ENVIRONMENT_LABEL']) || 'Production and Dev3';
  }

  const labels = reportFiles
    .map(entry => REPORT_ENV_LABELS[entry.fileName] || entry.fileName)
    .filter(Boolean);

  return labels.length ? labels.join(', ') : 'Production and Dev3';
}

function buildPowerAutomatePayload({ rows, summary, reportFiles, emailHtml, recipient }) {
  const executionDate =
    pickEnv(['REPORT_EXECUTION_DATE']) ||
    new Date().toISOString().slice(0, 10);

  return {
    subject: buildSubject(summary),
    recipient,
    executionDate,
    environment: buildEnvironmentLabel(reportFiles),
    reports: reportFiles.map(entry => ({
      fileName: entry.fileName,
      label: REPORT_ENV_LABELS[entry.fileName] || entry.fileName,
      summary: entry.summary,
      report: entry.report
    })),
    emailHtml
  };
}

function redactWebhookUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.search) {
      parsed.search = '?***';
    }
    return `${parsed.origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return '[invalid-webhook-url]';
  }
}

async function postToPowerAutomate(webhookUrl, payload, options = {}) {
  const fetchImpl = options.fetchImpl || global.fetch;
  const timeoutMs = options.timeoutMs || 30000;

  if (!webhookUrl?.trim()) {
    throw new Error(
      'POWER_AUTOMATE_WEBHOOK_URL is missing. Add it as a GitHub Actions secret or in .env.local for local runs.'
    );
  }

  if (!options.allowInsecure && !/^https:\/\//i.test(webhookUrl.trim())) {
    throw new Error('POWER_AUTOMATE_WEBHOOK_URL must use HTTPS.');
  }

  let response;
  try {
    response = await fetchImpl(webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error(`Power Automate request timed out after ${timeoutMs}ms.`);
    }
    throw new Error(`Power Automate request failed: ${error.message}`);
  }

  const responseText = await response.text().catch(() => '');

  if (response.status === 401) {
    throw new Error(
      `Power Automate returned 401 Unauthorized (webhook: ${redactWebhookUrl(webhookUrl)}). Check trigger authentication.`
    );
  }

  if (response.status === 403) {
    throw new Error(
      `Power Automate returned 403 Forbidden (webhook: ${redactWebhookUrl(webhookUrl)}). Check flow permissions.`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Power Automate returned HTTP ${response.status} (webhook: ${redactWebhookUrl(webhookUrl)}). Body: ${responseText.slice(0, 500)}`
    );
  }

  console.log(
    `[email] Report submitted to Power Automate (HTTP ${response.status}). Flow accepted the payload; verify delivery in Outlook separately.`
  );

  return response;
}

async function sendReportViaPowerAutomate(options = {}) {
  const reportDir = options.reportDir || path.resolve(process.cwd(), 'test-results');
  const webhookUrl = pickEnv(['POWER_AUTOMATE_WEBHOOK_URL']);
  const recipient = pickEnv(['EMAIL_TO', 'REPORT_EMAIL_TO', 'NOTIFY_EMAIL_TO']);

  if (!recipient) {
    throw new Error('EMAIL_TO is missing. Set the report recipient address in CI variables or .env.local.');
  }

  const loaded = loadTestReport(reportDir);
  for (const entry of loaded.reportFiles) {
    console.log(`[email] Loaded report: ${entry.fileName}`);
  }

  const emailHtml = buildHtml(loaded);
  const payload = buildPowerAutomatePayload({
    rows: loaded.rows,
    summary: loaded.summary,
    reportFiles: loaded.reportFiles,
    emailHtml,
    recipient: recipient.split(',')[0].trim()
  });

  await postToPowerAutomate(webhookUrl, payload, options);
  console.log(`[email] Recipient in payload: ${recipient.split(',')[0].trim()}`);
  return 0;
}

module.exports = {
  KNOWN_REPORT_FILES,
  buildEnvironmentLabel,
  buildHtml,
  buildPowerAutomatePayload,
  buildSubject,
  loadTestReport,
  postToPowerAutomate,
  redactWebhookUrl,
  sendReportViaPowerAutomate,
  summarizeRows
};
