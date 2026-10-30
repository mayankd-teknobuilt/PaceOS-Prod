/**
 * Playwright goto that tolerates SSO redirect races (interrupted navigations).
 */
async function safeGoto(page, url, options = {}) {
  const gotoOptions = { waitUntil: 'domcontentloaded', timeout: 60000, ...options };

  for (let attempt = 1; attempt <= 3; attempt++) {
    if (page.isClosed()) {
      throw new Error(`Cannot navigate to ${url}: page is closed.`);
    }

    try {
      await page.goto(url, gotoOptions);
      return;
    } catch (error) {
      const message = error?.message || String(error);
      const recoverable =
        /interrupted|detached|Target page, context or browser has been closed/i.test(message);

      if (!recoverable || attempt === 3) {
        throw error;
      }

      await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    }
  }
}

module.exports = { safeGoto };
