const BasePage = require('./BasePage');
const logger = require('../utils/logger');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.cookieConsentButton = page.getByRole('button', { name: /I understand/i });
    this.loginLink = page.getByText('Login', { exact: true }).first();

    this.emailInput = page.locator(
      'input[name="emailPhone"], input[name="email"], input[placeholder*="Email"]'
    );
    this.passwordInput = page.locator(
      'input[name="password"], input[placeholder*="password" i]'
    );
    this.loginButton = page.locator('button:has-text("Login")').last();

    // Badge login elements
    this.badgeTabButton = page.getByRole('button', { name: 'Badge No.' });
    this.badgeNumberInput = page.getByRole('textbox', { name: 'Badge Number' });
    this.badgePasswordInput = page.getByRole('textbox', { name: 'Password' });
  }

  async dismissCookieIfPresent() {
    if (await this.cookieConsentButton.isVisible().catch(() => false)) {
      await this.cookieConsentButton.click({ force: true, timeout: 2000 }).catch(() => {});
    }
  }

  /**
   * Open home and reach the login form quickly.
   * Login link is clicked within ~2s when the form is not already visible.
   */
  async goto() {
    logger.info('Navigating to pace-os home page');

    const configuredBaseUrl =
      this.page.context()._options.baseURL ||
      process.env.BASE_URL ||
      'https://stage-goldenpasslng.pace-os.com/';
    const normalizedBaseUrl = configuredBaseUrl.endsWith('/')
      ? configuredBaseUrl
      : `${configuredBaseUrl}/`;

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.page.goto(normalizedBaseUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 45000
        });

        await this.dismissCookieIfPresent();

        const formAlreadyOpen = await this.emailInput.first().isVisible().catch(() => false);
        if (!formAlreadyOpen) {
          await this.loginLink.waitFor({ state: 'visible', timeout: 8000 });
          await this.loginLink.click({ force: true, timeout: 8000 });
        }

        await this.emailInput.first().waitFor({ state: 'visible', timeout: 15000 });
        logger.info('Login form is open');
        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }

        logger.warn(`Login form open attempt ${attempt} failed, retrying: ${error.message}`);
        await this.page.waitForTimeout(2000);
      }
    }
  }

  async login(email, password) {
    logger.info(`Logging in as: ${email}`);

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await this.emailInput.first().fill(email);
        await this.passwordInput.first().fill(password);
        await this.loginButton.click({ force: true, timeout: 10000 });

        await this.page.waitForURL(/select-project|dashboard|my-work/i, { timeout: 45000 });
        await this.page.waitForLoadState('domcontentloaded');
        logger.info(`Landed on: ${this.page.url()}`);
        return;
      } catch (error) {
        if (attempt === 2) {
          throw error;
        }

        logger.warn(`Email login attempt ${attempt} failed, retrying: ${error.message}`);
        await this.goto();
      }
    }
  }

  /**
   * Switch to Badge No. login tab.
   */
  async switchToBadgeLogin() {
    logger.info('Switching to Badge No. login tab');
    await this.badgeTabButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.badgeTabButton.click({ force: true, timeout: 5000 });
    await this.badgeNumberInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Login using Badge Number + Password.
   * Assumes goto() has already been called to open the login form.
   */
  async loginWithBadge(badgeNumber, password) {
    logger.info(`Logging in with badge number: ${badgeNumber}`);

    await this.switchToBadgeLogin();

    await this.badgeNumberInput.click();
    await this.badgeNumberInput.fill(badgeNumber);
    await this.badgeNumberInput.press('Tab');

    await this.badgePasswordInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.badgePasswordInput.fill(password);

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await this.loginButton.click({ force: true, timeout: 10000 });
        await this.page.waitForURL(/select-project|dashboard|my-work/i, { timeout: 45000 });
        await this.page.waitForLoadState('domcontentloaded');
        logger.info(`Landed on: ${this.page.url()}`);
        return;
      } catch (error) {
        if (attempt === 2) {
          throw error;
        }

        logger.warn(`Badge login attempt ${attempt} failed, retrying: ${error.message}`);
        await this.goto();
        await this.switchToBadgeLogin();
        await this.badgeNumberInput.fill(badgeNumber);
        await this.badgePasswordInput.fill(password);
      }
    }
  }
}

module.exports = LoginPage;