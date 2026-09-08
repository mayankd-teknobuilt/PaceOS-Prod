const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { loadProdEnv } = require('../utils/loadEnv');

loadProdEnv();

const REPORT_PATH = path.resolve(process.cwd(), 'test-results', 'report.json');

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

function loadTestReport() {
  if (!fs.existsSync(REPORT_PATH)) {
    return {
      rows: [],
      summary: { passed: 0, failed: 0, skipped: 0, flaky: 0, total: 0 }
    };
  }

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  const rows = (report.suites || []).flatMap((suite) => collectTestsFromSuite(suite));
  const summary = { passed: 0, failed: 0, skipped: 0, flaky: 0, total: rows.length };

  for (const row of rows) {
    if (row.status === 'passed' || row.status === 'expected') summary.passed += 1;
    else if (row.status === 'skipped') summary.skipped += 1;
    else if (row.status === 'flaky') summary.flaky += 1;
    else summary.failed += 1;
  }

  return { rows, summary };
}

function statusLabel(summary) {
  if (summary.total === 0) return 'NO RESULTS';
  if (summary.failed === 0 && summary.flaky === 0) return 'PASSED';
  return 'FAILED';
}

function buildHtml({ rows, summary }) {
  const overall = statusLabel(summary);
  const runUrl =
    process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : '';

  const failedRows = rows.filter((row) => !['passed', 'expected', 'skipped'].includes(row.status));
  const passedRows = rows.filter((row) => ['passed', 'expected'].includes(row.status));

  const renderRows = (items) =>
    items
      .map(
        (row) =>
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendReportEmail() {
  const host = pickEnv(['SMTP_HOST', 'EMAIL_HOST']);
  const port = Number(pickEnv(['SMTP_PORT', 'EMAIL_PORT']) || 587);
  const user = pickEnv(['SMTP_USER', 'EMAIL_USER', 'SMTP_USERNAME']);
  const pass = pickEnv(['SMTP_PASSWORD', 'EMAIL_PASSWORD', 'SMTP_PASS']);
  const from = pickEnv(['EMAIL_FROM', 'SMTP_FROM']) || user;
  const to = pickEnv(['EMAIL_TO', 'REPORT_EMAIL_TO', 'NOTIFY_EMAIL_TO']);

  if (!host || !user || !pass || !to) {
    console.warn('[email] Skipping report email. Configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD, EMAIL_TO.');
    return 0;
  }

  const report = loadTestReport();
  const overall = statusLabel(report.summary);
  const prefix = pickEnv(['EMAIL_SUBJECT_PREFIX']) || '[PACE QA]';
  const subject = `${prefix} ${overall} — ${report.summary.passed}/${report.summary.total} passed`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  await transporter.sendMail({
    from,
    to: to.split(',').map((entry) => entry.trim()).filter(Boolean),
    subject,
    html: buildHtml(report)
  });

  console.log(`[email] Report sent to ${to}`);
  return 0;
}

sendReportEmail().catch((error) => {
  console.error('[email] Failed to send report:', error.message);
  process.exit(1);
});
