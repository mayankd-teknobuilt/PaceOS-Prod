const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const MyProjectNetworkPage = require('../../../pages/modules/my-project-network');

test.describe('@pace-env-prod @prod-modules My Project Network', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('My Project Network'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new MyProjectNetworkPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
