const logger = require('./logger');
const { isFastMode } = require('./fastMode');

function getStepPauseMs() {
  const configured = Number(process.env.PROD_STEP_PAUSE_MS);
  if (!Number.isNaN(configured) && configured >= 0) return configured;
  if (isFastMode()) return 0;
  return process.argv.includes('--headed') ? 1500 : 0;
}

async function pauseForVisibility(page, label) {
  const pauseMs = getStepPauseMs();
  if (pauseMs <= 0) return;
  logger.info(`Visible pause ${pauseMs}ms: ${label}`);
  await page.waitForTimeout(pauseMs);
}

module.exports = { getStepPauseMs, pauseForVisibility };
