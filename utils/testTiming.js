/**
 * Per-case time limits. Default: 90s total with one retry (~45s per attempt).
 * Override via CASE_TIMEOUT_MS, CASE_ATTEMPT_MS, or DOWNLOAD_TIMEOUT_MS in .env.local.
 */
const REPORT_ATTEMPTS = 2;
const isDev3Ct = (process.env.PACE_ENV || process.env.PACE_TEST_ENV || '').toLowerCase() === 'dev3';
const CASE_TIMEOUT_MS = Number(process.env.CASE_TIMEOUT_MS) || (isDev3Ct ? 120000 : 90000);
const CASE_ATTEMPT_MS = Number(process.env.CASE_ATTEMPT_MS) || (isDev3Ct ? 60000 : 45000);
const DOWNLOAD_TIMEOUT_MS = Number(process.env.DOWNLOAD_TIMEOUT_MS) || (isDev3Ct ? 45000 : 15000);
const CT_VIEW_LOAD_MS = Number(process.env.CT_VIEW_LOAD_MS) || (isDev3Ct ? 40000 : 25000);

function remainingMs(deadlineMs) {
  return Math.max(0, deadlineMs - Date.now());
}

function attemptBudgetMs(deadlineMs) {
  return Math.min(CASE_ATTEMPT_MS, remainingMs(deadlineMs));
}

module.exports = {
  REPORT_ATTEMPTS,
  CASE_TIMEOUT_MS,
  CASE_ATTEMPT_MS,
  DOWNLOAD_TIMEOUT_MS,
  CT_VIEW_LOAD_MS,
  remainingMs,
  attemptBudgetMs
};
