const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const PortfolioManagerPage = require('../../../pages/modules/portfolio-manager');

test.describe('@pace-env-all @prod-modules Portfolio Manager', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Portfolio Manager'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new PortfolioManagerPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
