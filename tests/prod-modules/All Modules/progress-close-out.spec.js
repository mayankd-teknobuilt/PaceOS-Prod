const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const ProgressCloseOutPage = require('../../../pages/modules/progress-close-out');

test.describe('@pace-env-dev3 @prod-modules Progress & Close-out', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Progress & Close-out'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new ProgressCloseOutPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
