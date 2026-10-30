const BasePage = require('./BasePage');
const logger = require('../utils/logger');
const { waitForAuthenticated, isLoginFormVisible, AUTHENTICATED_URL } = require('../utils/loginSession');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.cookieConsentButton = page.getByRole('button', { name: /I understand/i });
    this.emailField = page.getByRole('textbox', { name: 'Email ID' });
    this.passwordField = page.getByRole('textbox', { name: 'Password' });
    this.loginEntryLink = page.getByRole('link', { name: 'Login' });
    this.loginSubmitButton = page.getByRole('button', { name: 'Login', exact: true });

    this.emailInput = page.locator(
      'input[name="emailPhone"], input[name="email"], input[placeholder*="Email"]'
    );
    this.passwordInput = page.locator(
      'input[name="password"], input[placeholder*="password" i]'
    );

    this.badgeTabButton = page.getByRole('button', { name: 'Badge No.' });
    this.badgeNumberInput = page.getByRole('textbox', { name: 'Badge Number' });
    this.badgePasswordInput = page.getByRole('textbox', { name: 'Password' });
  }

  getBaseUrl() {
    const configuredBaseUrl =
      this.page.context()._options.baseURL ||
      process.env.BASE_URL ||
      'https://stage-goldenpasslng.pace-os.com/';
    return configuredBaseUrl.endsWith('/') ? configuredBaseUrl : `${configuredBaseUrl}/`;
  }

  async dismissCookieIfPresent() {
    if (await this.cookieConsentButton.isVisible().catch(() => false)) {
      await this.cookieConsentButton.click({ force: true, timeout: 2000 }).catch(() => {});
    }
  }

  async isEmailLoginFormOpen() {
    if (await this.emailField.isVisible().catch(() => false)) return true;
    return this.emailInput.first().isVisible().catch(() => false);
  }

  /**
   * Dev3 / marketing home: open site → click Login link → Sign in panel with Email ID + Password.
   */
  async openLoginForm() {
    logger.info('Navigating to pace-os home page');
    const normalizedBaseUrl = this.getBaseUrl();

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.page.goto(normalizedBaseUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 45000
        });

        await this.dismissCookieIfPresent();

        if (AUTHENTICATED_URL.test(this.page.url()) && !(await isLoginFormVisible(this.page))) {
          logger.info(`Already authenticated at ${this.page.url()}`);
          return;
        }

        if (await this.isEmailLoginFormOpen()) {
          logger.info('Login form is already open');
          return;
        }

        logger.info('Clicking Login to open sign-in form');
        const entry = this.loginEntryLink.or(this.page.getByText('Login', { exact: true }).first());
        await entry.waitFor({ state: 'visible', timeout: 15000 });
        await entry.click({ force: true, timeout: 10000 });
        await this.page.waitForTimeout(300);

        await this.emailField.or(this.emailInput.first()).waitFor({ state: 'visible', timeout: 15000 });
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

  /** @deprecated use openLoginForm */
  async goto() {
    return this.openLoginForm();
  }

  async fillEmailPassword(email, password) {
    if (await this.emailField.isVisible().catch(() => false)) {
      await this.emailField.click();
      await this.emailField.fill(email);
      await this.passwordField.fill(password);
      return;
    }

    await this.emailInput.first().fill(email);
    await this.passwordInput.first().fill(password);
  }

  async clickLoginSubmit() {
    const panelSubmit = this.page
      .getByRole('heading', { name: /Sign in/i })
      .locator('..')
      .getByRole('button', { name: 'Login', exact: true })
      .first();

    if (await panelSubmit.isVisible().catch(() => false)) {
      await this.safeClick(panelSubmit);
      return;
    }

    await this.safeClick(this.loginSubmitButton.last());
  }

  async login(email, password) {
    logger.info(`Logging in as: ${email}`);

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await this.openLoginForm();
        await this.fillEmailPassword(email, password);
        await this.clickLoginSubmit();

        const landed = await waitForAuthenticated(this.page, {
          timeoutMs: 60000,
          baseUrl: this.getBaseUrl()
        });
        logger.info(`Landed on: ${landed}`);
        return;
      } catch (error) {
        if (attempt === 2) {
          throw error;
        }
        logger.warn(`Email login attempt ${attempt} failed, retrying: ${error.message}`);
      }
    }
  }

  async switchToBadgeLogin() {
    logger.info('Switching to Badge No. login tab');
    await this.badgeTabButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.badgeTabButton.click({ force: true, timeout: 5000 });
    await this.badgeNumberInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async loginWithBadge(badgeNumber, password) {
    logger.info(`Logging in with badge number: ${badgeNumber}`);

    await this.openLoginForm();
    await this.switchToBadgeLogin();

    await this.badgeNumberInput.click();
    await this.badgeNumberInput.fill(badgeNumber);
    await this.badgeNumberInput.press('Tab');
    await this.badgePasswordInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.badgePasswordInput.fill(password);

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await this.clickLoginSubmit();
        const landed = await waitForAuthenticated(this.page, {
          timeoutMs: 45000,
          baseUrl: this.getBaseUrl()
        });
        logger.info(`Landed on: ${landed}`);
        return;
      } catch (error) {
        if (attempt === 2) {
          throw error;
        }
        logger.warn(`Badge login attempt ${attempt} failed, retrying: ${error.message}`);
        await this.openLoginForm();
        await this.switchToBadgeLogin();
        await this.badgeNumberInput.fill(badgeNumber);
        await this.badgePasswordInput.fill(password);
      }
    }
  }
}

module.exports = LoginPage;
