const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const ContractorActivityToCrewCompositionPage = require('../../../pages/modules/contractor-activity-to-crew-composition');

test.describe('@pace-env-dev3 @prod-modules Contractor Activity To Crew Composition', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Contractor Activity To Crew Composition'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new ContractorActivityToCrewCompositionPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
