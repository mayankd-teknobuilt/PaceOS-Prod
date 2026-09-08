const { test } = require('../../../utils/prodModuleFixture');
const ProjectsPage = require('../../../pages/modules/projects');

test.describe('@prod-modules Projects', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new ProjectsPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
