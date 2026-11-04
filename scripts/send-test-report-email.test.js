const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const {
  loadTestReport,
  buildPowerAutomatePayload,
  buildHtml,
  buildSubject,
  postToPowerAutomate,
  redactWebhookUrl,
  KNOWN_REPORT_FILES
} = require('../utils/qaReportEmail');

const FIXTURES = path.join(__dirname, '..', 'test', 'fixtures', 'report-email');

function minimalReport(title) {
  return {
    suites: [
      {
        title: title,
        specs: [
          {
            title: 'opens and loads',
            tests: [{ title: 'test', results: [{ status: 'passed' }] }]
          }
        ]
      }
    ]
  };
}

describe('qaReportEmail Power Automate integration', () => {
  let tempDir;

  before(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pace-qa-report-'));
    for (const fileName of KNOWN_REPORT_FILES) {
      const title = fileName.replace(/^report-/, '').replace('.json', '');
      fs.writeFileSync(
        path.join(tempDir, fileName),
        JSON.stringify(minimalReport(title)),
        'utf8'
      );
    }
  });

  after(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('loads all four JSON reports', () => {
    const loaded = loadTestReport(tempDir);
    assert.equal(loaded.reportFiles.length, 4);
    assert.equal(loaded.summary.total, 4);
    assert.equal(loaded.summary.passed, 4);
  });

  it('preserves HTML structure and subject format', () => {
    const loaded = loadTestReport(tempDir);
    const html = buildHtml(loaded);
    assert.match(html, /<h2>PACE Production QA Report/);
    assert.match(html, /Passed Tests/);
    const subject = buildSubject(loaded.summary);
    assert.match(subject, /\[Prod Sanity PACE QA Daily Report\]|PASSED|passed/);
  });

  it('builds Power Automate payload with recipient, subject, and report data', () => {
    const loaded = loadTestReport(tempDir);
    const html = buildHtml(loaded);
    const payload = buildPowerAutomatePayload({
      rows: loaded.rows,
      summary: loaded.summary,
      reportFiles: loaded.reportFiles,
      emailHtml: html,
      recipient: 'mayankd@teknobuilt.com'
    });

    assert.equal(payload.recipient, 'mayankd@teknobuilt.com');
    assert.equal(payload.reports.length, 4);
    assert.ok(payload.subject.includes('passed'));
    assert.equal(payload.emailHtml, html);
    assert.ok(payload.reports[0].report.suites);
    assert.ok(payload.reports[0].summary.passed === 1);
    assert.match(payload.environment, /Production|Dev3/);
  });

  it('throws on invalid JSON report', () => {
    const badDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pace-qa-bad-json-'));
    fs.writeFileSync(path.join(badDir, 'report-prod-modules.json'), '{not json', 'utf8');
    assert.throws(() => loadTestReport(badDir), /Invalid JSON report/);
    fs.rmSync(badDir, { recursive: true, force: true });
  });

  it('rejects missing webhook URL', async () => {
    await assert.rejects(
      () => postToPowerAutomate('', { subject: 'x' }, { fetchImpl: global.fetch }),
      /POWER_AUTOMATE_WEBHOOK_URL is missing/
    );
  });

  it('posts JSON payload to mocked HTTP endpoint', async () => {
    let receivedBody = '';
    const server = http.createServer((req, res) => {
      if (req.method === 'POST') {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
          receivedBody = Buffer.concat(chunks).toString('utf8');
          res.writeHead(202, { 'Content-Type': 'application/json' });
          res.end('{"status":"Accepted"}');
        });
        return;
      }
      res.writeHead(404);
      res.end();
    });

    await new Promise(resolve => server.listen(0, resolve));
    const { port } = server.address();
    const webhookUrl = `http://127.0.0.1:${port}/power-automate-test`;

    const loaded = loadTestReport(tempDir);
    const payload = buildPowerAutomatePayload({
      rows: loaded.rows,
      summary: loaded.summary,
      reportFiles: loaded.reportFiles,
      emailHtml: buildHtml(loaded),
      recipient: 'qa@example.com'
    });

    await postToPowerAutomate(webhookUrl, payload, {
      fetchImpl: global.fetch,
      timeoutMs: 5000,
      allowInsecure: true
    });

    const parsed = JSON.parse(receivedBody);
    assert.equal(parsed.recipient, 'qa@example.com');
    assert.equal(parsed.reports.length, 4);
    assert.ok(parsed.emailHtml.includes('PACE Production QA Report'));

    await new Promise(resolve => server.close(resolve));
  });

  it('handles HTTP 401 without leaking full webhook query string', async () => {
    const secretUrl = 'https://example.test/flows/manual/triggers/manual/run?sig=super-secret-token';
    await assert.rejects(
      () =>
        postToPowerAutomate(
          secretUrl,
          { subject: 'test' },
          {
            fetchImpl: async () => ({
              ok: false,
              status: 401,
              text: async () => 'Unauthorized'
            })
          }
        ),
      /401 Unauthorized/
    );

    const redacted = redactWebhookUrl(secretUrl);
    assert.doesNotMatch(redacted, /super-secret-token/);
    assert.match(redacted, /\?\*\*\*/);
  });

  it('handles HTTP 500 errors', async () => {
    await assert.rejects(
      () =>
        postToPowerAutomate(
          'https://example.test/hook',
          { subject: 'test' },
          {
            fetchImpl: async () => ({
              ok: false,
              status: 500,
              text: async () => 'Internal error'
            })
          }
        ),
      /HTTP 500/
    );
  });
});
