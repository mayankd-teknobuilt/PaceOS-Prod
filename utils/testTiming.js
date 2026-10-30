/**
 * Per-case time limits. Default: 90s total with one retry (~45s per attempt).
 * Override via CASE_TIMEOUT_MS, CASE_ATTEMPT_MS, or DOWNLOAD_TIMEOUT_MS in .env.local.
 */
const REPORT_ATTEMPTS = 2;
const isDev3Ct = (process.env.PACE_ENV || process.env.PACE_TEST_ENV || '').toLowerCase() === 'dev3';
const CASE_TIMEOUT_MS = Number(process.env.CASE_TIMEOUT_MS) || (isDev3Ct ? 180000 : 90000);
const CASE_ATTEMPT_MS = Number(process.env.CASE_ATTEMPT_MS) || (isDev3Ct ? 90000 : 45000);

/** Heavy dev3 CT reports need more than the default per-attempt budget. */
const SLOW_CT_REPORTS = new Set([
  'Project L3 & L4 activity plan dates',
  'CWP/EWP Scope Matrix',
  'Project Engineering Document Deliverable Register',
  'Master Tag Register',
  'ITP Inspection Register',
  'L4 Norms Matrix'
]);

function getCaseTimeoutMs(reportName) {
  if (reportName && SLOW_CT_REPORTS.has(reportName)) {
    return Number(process.env.SLOW_CASE_TIMEOUT_MS) || (isDev3Ct ? 300000 : 180000);
  }
  return CASE_TIMEOUT_MS;
}

function getCaseAttemptMs(reportName) {
  if (reportName && SLOW_CT_REPORTS.has(reportName)) {
    return Number(process.env.SLOW_CASE_ATTEMPT_MS) || (isDev3Ct ? 150000 : 90000);
  }
  return CASE_ATTEMPT_MS;
}
const DOWNLOAD_TIMEOUT_MS = Number(process.env.DOWNLOAD_TIMEOUT_MS) || (isDev3Ct ? 45000 : 15000);
const CT_VIEW_LOAD_MS = Number(process.env.CT_VIEW_LOAD_MS) || (isDev3Ct ? 40000 : 25000);

function remainingMs(deadlineMs) {
  return Math.max(0, deadlineMs - Date.now());
}

function attemptBudgetMs(deadlineMs, attemptCapMs = CASE_ATTEMPT_MS) {
  return Math.min(attemptCapMs, remainingMs(deadlineMs));
}

module.exports = {
  REPORT_ATTEMPTS,
  CASE_TIMEOUT_MS,
  CASE_ATTEMPT_MS,
  DOWNLOAD_TIMEOUT_MS,
  CT_VIEW_LOAD_MS,
  SLOW_CT_REPORTS,
  getCaseTimeoutMs,
  getCaseAttemptMs,
  remainingMs,
  attemptBudgetMs
};
