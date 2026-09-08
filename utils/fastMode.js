/**
 * Fast mode trims artificial pauses, networkidle waits, and heavy reporters.
 * Enabled via PACE_FAST=true or automatically in headless runs (unless PW_DEBUG=true).
 */
function isFastMode() {
  if (process.env.PACE_FAST === 'true') return true;
  if (process.env.PACE_FAST === 'false') return false;
  if (process.env.PW_DEBUG === 'true') return false;
  if (process.argv.includes('--headed')) return false;
  if (process.env.PW_HEADED === 'true') return false;
  return true;
}

module.exports = { isFastMode };
