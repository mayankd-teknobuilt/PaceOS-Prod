const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const JointIntegrityManagementPage = require('../../../pages/modules/joint-integrity-management');

test.describe('@pace-env-prod @prod-modules Joint Integrity Management', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Joint Integrity Management'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new JointIntegrityManagementPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
