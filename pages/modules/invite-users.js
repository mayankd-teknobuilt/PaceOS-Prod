const { expect } = require('@playwright/test');
const ModuleBasePage = require('./ModuleBasePage');

class InviteUsersPage extends ModuleBasePage {
  constructor(page) {
    super(page, 'Invite Users');
  }

  async assertLoaded(targetPage = this.targetPage) {
    const shell = targetPage.locator('main, [role="main"], form, table, .MuiContainer-root, .MuiPaper-root');
    await expect(
      shell.first(),
      'Invite Users did not render application content.'
    ).toBeVisible({ timeout: 60000 });
  }
}

module.exports = InviteUsersPage;
