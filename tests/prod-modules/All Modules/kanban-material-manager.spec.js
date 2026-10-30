const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const KanbanMaterialManagerPage = require('../../../pages/modules/kanban-material-manager');

test.describe('@pace-env-dev3 @prod-modules Kanban Material Manager', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Kanban Material Manager'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new KanbanMaterialManagerPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
