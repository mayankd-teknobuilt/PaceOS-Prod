const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const ProjectsPage = require('../../../pages/modules/projects');

test.describe('@pace-env-all @prod-modules Projects', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Projects'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new ProjectsPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
