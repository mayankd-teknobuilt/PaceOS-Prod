const { test } = require('../../../utils/prodModuleFixture');
const PortfolioManagerPage = require('../../../pages/modules/portfolio-manager');

test.describe('@prod-modules Portfolio Manager', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new PortfolioManagerPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
