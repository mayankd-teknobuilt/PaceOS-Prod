const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const OrganizationPage = require('../../../pages/modules/organization');

test.describe('@pace-env-all @prod-modules Organization', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Organization'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new OrganizationPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
