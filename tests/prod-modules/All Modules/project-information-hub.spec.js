const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const ProjectInformationHubPage = require('../../../pages/modules/project-information-hub');

test.describe('@pace-env-prod @prod-modules Project Information Hub', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Project Information Hub'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new ProjectInformationHubPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
