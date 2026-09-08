const { test } = require('../../utils/prodModuleFixture');
const StageDashboardPage = require('../../pages/StageDashboardPage');

test.describe('@prod-modules All Dashboard Modules', () => {
  test('open and validate every production module in one session', async ({ page, context, errorMonitor }) => {
    test.setTimeout(900000);
    await new StageDashboardPage(page).openEveryModule(context, errorMonitor, test);
  });
});
