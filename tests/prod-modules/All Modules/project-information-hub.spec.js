const { test } = require('../../../utils/prodModuleFixture');
const ProjectInformationHubPage = require('../../../pages/modules/project-information-hub');

test.describe('@prod-modules Project Information Hub', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new ProjectInformationHubPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});
