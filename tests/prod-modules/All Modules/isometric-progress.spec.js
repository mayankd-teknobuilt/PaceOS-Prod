const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const IsometricProgressPage = require('../../../pages/modules/isometric-progress');

test.describe('@pace-env-prod @prod-modules Isometric Progress', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Isometric Progress'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new IsometricProgressPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
