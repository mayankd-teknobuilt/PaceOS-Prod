const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const DepartmentsPage = require('../../../pages/modules/departments');

test.describe('@pace-env-all @prod-modules Departments', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Departments'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new DepartmentsPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
