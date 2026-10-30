const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const ContractorProductivityEstimatesPage = require('../../../pages/modules/contractor-productivity-estimates');

test.describe('@pace-env-dev3 @prod-modules Contractor Productivity Estimates', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Contractor Productivity Estimates'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new ContractorProductivityEstimatesPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
