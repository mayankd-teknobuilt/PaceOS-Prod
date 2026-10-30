const AUTHENTICATED_URL = /\/(select-project|dashboard|my-work|project-list)(\/|$|\?)/i;

const LOGIN_ERROR_PATTERN =
  /invalid credential|invalid email|invalid password|incorrect password|wrong password|authentication failed|unable to login|login failed/i;

async function isLoginFormVisible(page) {
  const checks = [
    page.getByRole('textbox', { name: 'Email ID' }),
    page.getByRole('textbox', { name: 'Badge Number' }),
    page.locator('input[name="emailPhone"], input[name="email"]').first()
  ];

  for (const locator of checks) {
    if (await locator.isVisible().catch(() => false)) {
      return true;
    }
  }
  return false;
}

async function readLoginErrorMessage(page) {
  const signInRoot = page
    .getByRole('heading', { name: /Sign in/i })
    .locator('xpath=ancestor::*[contains(@class,"Mui") or @role="dialog"][1]')
    .first();

  const scoped = signInRoot.locator(
    '[role="alert"], [class*="error" i], [class*="Error" i], .MuiAlert-message, .MuiFormHelperText-root'
  );

  const count = await scoped.count().catch(() => 0);
  for (let i = 0; i < count; i++) {
    const text = (await scoped.nth(i).innerText().catch(() => '')).trim();
    if (text && LOGIN_ERROR_PATTERN.test(text)) {
      return text;
    }
  }

  return null;
}

/**
 * SPA login often does not fire a navigation event Playwright can wait on.
 * Poll URL + session, then fall back to /select-project when cookies are set.
 */
async function waitForAuthenticated(page, options = {}) {
  const timeoutMs = options.timeoutMs ?? 60000;
  const baseUrl = options.baseUrl || process.env.BASE_URL || page.url();
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const url = page.url();
    if (AUTHENTICATED_URL.test(url) && !(await isLoginFormVisible(page))) {
      return url;
    }

    const loginError = await readLoginErrorMessage(page);
    if (loginError) {
      throw new Error(`Login rejected: ${loginError}`);
    }

    await page.waitForTimeout(500);
  }

  const selectProjectUrl = new URL('/select-project', baseUrl).toString();
  await page.goto(selectProjectUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

  if (await isLoginFormVisible(page)) {
    const loginError = await readLoginErrorMessage(page);
    if (loginError) {
      throw new Error(`Login rejected: ${loginError}`);
    }
    throw new Error(
      `Login did not reach an authenticated route within ${timeoutMs}ms (last URL: ${page.url()})`
    );
  }

  if (!AUTHENTICATED_URL.test(page.url())) {
    throw new Error(`Expected authenticated URL after login, got: ${page.url()}`);
  }

  return page.url();
}

module.exports = {
  AUTHENTICATED_URL,
  isLoginFormVisible,
  waitForAuthenticated,
  readLoginErrorMessage
};
