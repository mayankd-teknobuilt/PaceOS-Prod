const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const UsersPage = require('../../../pages/modules/users');

test.describe('@pace-env-all @prod-modules Users', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Users'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new UsersPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
