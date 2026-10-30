const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const AuditsCompliancePage = require('../../../pages/modules/audits-compliance');

test.describe('@pace-env-prod @prod-modules Audits / Compliance', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Audits / Compliance'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new AuditsCompliancePage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
