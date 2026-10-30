const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const ContractorActivityDefinitionPage = require('../../../pages/modules/contractor-activity-definition');

test.describe('@pace-env-dev3 @prod-modules Contractor Activity Definition', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Contractor Activity Definition'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new ContractorActivityDefinitionPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
